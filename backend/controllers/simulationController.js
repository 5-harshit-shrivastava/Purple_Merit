const { pool } = require('../config/database');

// Purple Merit Company Rules Implementation
class PurpleMeritRules {
  
  // Rule 4: Fuel Cost Calculation
  static calculateFuelCost(distanceKm, trafficLevel) {
    const baseCost = 5; // ₹5/km
    const highTrafficSurcharge = 2; // +₹2/km for high traffic
    
    let fuelCost = distanceKm * baseCost;
    
    if (trafficLevel === 'High') {
      fuelCost += distanceKm * highTrafficSurcharge;
    }
    
    return parseFloat(fuelCost.toFixed(2));
  }

  // Rule 1: Late Delivery Penalty
  static calculateLatePenalty(actualTime, baseTime) {
    const allowedDelay = 10; // 10 minutes grace period
    const penalty = 50; // ₹50 penalty
    
    if (actualTime > (baseTime + allowedDelay)) {
      return penalty;
    }
    
    return 0;
  }

  // Rule 3: High-Value Bonus
  static calculateHighValueBonus(orderValue, isOnTime) {
    const highValueThreshold = 1000; // ₹1000
    const bonusPercentage = 0.10; // 10%
    
    if (orderValue > highValueThreshold && isOnTime) {
      return parseFloat((orderValue * bonusPercentage).toFixed(2));
    }
    
    return 0;
  }

  // Rule 2: Driver Fatigue Rule
  static applyFatigueRule(baseTime, driverWorkedMoreThan8Hours) {
    if (driverWorkedMoreThan8Hours) {
      return baseTime * 1.3; // 30% slower delivery
    }
    return baseTime;
  }

  // Rule 5: Overall Profit Calculation
  static calculateOrderProfit(orderValue, bonus, penalty, fuelCost) {
    const value = parseFloat(orderValue) || 0;
    const bonusAmount = parseFloat(bonus) || 0;
    const penaltyAmount = parseFloat(penalty) || 0;
    const fuel = parseFloat(fuelCost) || 0;
    
    return parseFloat((value + bonusAmount - penaltyAmount - fuel).toFixed(2));
  }

  // Rule 6: Efficiency Score
  static calculateEfficiencyScore(onTimeDeliveries, totalDeliveries) {
    if (totalDeliveries === 0) return 0;
    return parseFloat(((onTimeDeliveries / totalDeliveries) * 100).toFixed(2));
  }
}

// Driver allocation algorithm
const allocateDriversToOrders = async (availableDrivers, maxHoursPerDriver) => {
  try {
    // Get available drivers (not exceeding max hours)
    const driversResult = await pool.query(`
      SELECT * FROM drivers 
      WHERE status = 'available' 
      AND current_shift_hours < $1
      ORDER BY past_7_day_work_hours ASC, current_shift_hours ASC
      LIMIT $2
    `, [maxHoursPerDriver, availableDrivers]);

    // Get pending orders
    const ordersResult = await pool.query(`
      SELECT o.*, r.distance_km, r.traffic_level, r.base_time_minutes
      FROM orders o
      JOIN routes r ON o.assigned_route = r.route_id
      WHERE o.status = 'pending'
      ORDER BY o.value_rs DESC, o.delivery_timestamp ASC
    `);

    const drivers = driversResult.rows;
    const orders = ordersResult.rows;

    if (drivers.length === 0) {
      throw new Error('No available drivers found');
    }

    if (orders.length === 0) {
      throw new Error('No pending orders found');
    }

    // Allocate orders to drivers using round-robin with capacity check
    const allocations = [];
    const driverWorkload = drivers.map(driver => ({
      ...driver,
      assignedOrders: [],
      totalHours: parseFloat(driver.current_shift_hours),
      fatigued: parseFloat(driver.past_7_day_work_hours) > 56 // 8 hours * 7 days
    }));

    let driverIndex = 0;

    for (const order of orders) {
      let orderAssigned = false;
      let attempts = 0;

      // Try to assign order to a driver
      while (!orderAssigned && attempts < drivers.length) {
        const driver = driverWorkload[driverIndex];
        const estimatedTime = PurpleMeritRules.applyFatigueRule(
          order.base_time_minutes, 
          driver.fatigued
        );
        const estimatedHours = estimatedTime / 60;

        // Check if driver can take this order without exceeding max hours
        if (driver.totalHours + estimatedHours <= maxHoursPerDriver) {
          driver.assignedOrders.push({
            ...order,
            estimatedDeliveryTime: estimatedTime,
            fatigueApplied: driver.fatigued
          });
          driver.totalHours += estimatedHours;
          orderAssigned = true;

          allocations.push({
            orderId: order.order_id,
            driverId: driver.id,
            driverName: driver.name,
            estimatedTime: estimatedTime,
            fatigueApplied: driver.fatigued
          });
        }

        driverIndex = (driverIndex + 1) % drivers.length;
        attempts++;
      }

      if (!orderAssigned) {
        console.warn(`Could not assign order ${order.order_id} - all drivers at capacity`);
      }
    }

    return { allocations, driverWorkload };
  } catch (error) {
    console.error('Error in driver allocation:', error);
    throw error;
  }
};

// Run simulation
const runSimulation = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { available_drivers, route_start_time, max_hours_per_driver } = req.body;

    // Validation
    if (available_drivers <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Available drivers must be greater than 0'
      });
    }

    if (max_hours_per_driver <= 0 || max_hours_per_driver > 24) {
      return res.status(400).json({
        success: false,
        error: 'Max hours per driver must be between 1 and 24'
      });
    }

    // Check if we have enough drivers
    const driverCountResult = await pool.query(
      'SELECT COUNT(*) FROM drivers WHERE status = \'available\''
    );
    const totalAvailableDrivers = parseInt(driverCountResult.rows[0].count);

    if (available_drivers > totalAvailableDrivers) {
      return res.status(400).json({
        success: false,
        error: `Only ${totalAvailableDrivers} drivers are available, but ${available_drivers} were requested`
      });
    }

    await client.query('BEGIN');

    // Allocate drivers to orders
    const { allocations, driverWorkload } = await allocateDriversToOrders(
      available_drivers, 
      max_hours_per_driver
    );

    // Calculate KPIs for each order
    let totalOrders = 0;
    let onTimeDeliveries = 0;
    let totalPenalties = 0;
    let totalBonuses = 0;
    let totalFuelCost = 0;
    let overallProfit = 0;

    const processedOrders = [];

    for (const allocation of allocations) {
      const driver = driverWorkload.find(d => d.id === allocation.driverId);
      const order = driver.assignedOrders.find(o => o.order_id === allocation.orderId);

      // Calculate delivery time (simulate actual delivery)
      const actualDeliveryTime = allocation.estimatedTime + (Math.random() * 20 - 10); // ±10 minutes variance
      const isOnTime = actualDeliveryTime <= (order.base_time_minutes + 10);

      // Apply Purple Merit rules
      const fuelCost = PurpleMeritRules.calculateFuelCost(order.distance_km, order.traffic_level);
      const latePenalty = PurpleMeritRules.calculateLatePenalty(actualDeliveryTime, order.base_time_minutes);
      const highValueBonus = PurpleMeritRules.calculateHighValueBonus(order.value_rs, isOnTime);
      const orderProfit = PurpleMeritRules.calculateOrderProfit(
        order.value_rs, 
        highValueBonus, 
        latePenalty, 
        fuelCost
      );

      // Update order in database
      await client.query(`
        UPDATE orders SET 
          assigned_driver_id = $1,
          status = 'assigned',
          late_penalty = $2,
          high_value_bonus = $3,
          fuel_cost = $4,
          profit = $5,
          is_on_time = $6,
          actual_delivery_time = NOW() + INTERVAL '${Math.round(actualDeliveryTime)} minutes',
          updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $7
      `, [
        allocation.driverId,
        latePenalty,
        highValueBonus,
        fuelCost,
        orderProfit,
        isOnTime,
        allocation.orderId
      ]);

      // Update driver hours
      await client.query(`
        UPDATE drivers SET 
          current_shift_hours = current_shift_hours + $1,
          status = 'busy',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [allocation.estimatedTime / 60, allocation.driverId]);

      // Accumulate totals
      totalOrders++;
      if (isOnTime) onTimeDeliveries++;
      totalPenalties += latePenalty;
      totalBonuses += highValueBonus;
      totalFuelCost += fuelCost;
      overallProfit += orderProfit;

      processedOrders.push({
        order_id: allocation.orderId,
        driver_name: allocation.driverName,
        value_rs: order.value_rs,
        fuel_cost: fuelCost,
        late_penalty: latePenalty,
        high_value_bonus: highValueBonus,
        profit: orderProfit,
        is_on_time: isOnTime,
        estimated_time: allocation.estimatedTime,
        actual_time: actualDeliveryTime,
        fatigue_applied: allocation.fatigueApplied
      });
    }

    // Calculate efficiency score
    const efficiencyScore = PurpleMeritRules.calculateEfficiencyScore(onTimeDeliveries, totalOrders);

    // Save simulation result
    const simulationResult = await client.query(`
      INSERT INTO simulation_results (
        available_drivers, route_start_time, max_hours_per_driver,
        total_orders, on_time_deliveries, total_penalties, total_bonuses,
        total_fuel_cost, overall_profit, efficiency_score, simulation_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [
      available_drivers,
      route_start_time,
      max_hours_per_driver,
      totalOrders,
      onTimeDeliveries,
      totalPenalties,
      totalBonuses,
      totalFuelCost,
      overallProfit,
      efficiencyScore,
      JSON.stringify({
        allocations,
        processed_orders: processedOrders,
        driver_workload: driverWorkload.map(d => ({
          id: d.id,
          name: d.name,
          assigned_orders_count: d.assignedOrders.length,
          total_hours_after_simulation: Number(d.totalHours).toFixed(2),
          was_fatigued: d.fatigued
        }))
      })
    ]);

    await client.query('COMMIT');

    // Return simulation results
    res.status(200).json({
      success: true,
      message: 'Simulation completed successfully',
      simulation_id: simulationResult.rows[0].id,
      results: {
        total_orders: totalOrders,
        orders_assigned: allocations.length,
        on_time_deliveries: onTimeDeliveries,
        efficiency_score: efficiencyScore,
        financial_summary: {
          total_penalties: parseFloat(totalPenalties.toFixed(2)),
          total_bonuses: parseFloat(totalBonuses.toFixed(2)),
          total_fuel_cost: parseFloat(totalFuelCost.toFixed(2)),
          overall_profit: parseFloat(overallProfit.toFixed(2))
        },
        driver_utilization: driverWorkload.map(d => ({
          driver_id: d.id,
          driver_name: d.name,
          orders_assigned: d.assignedOrders.length,
          hours_utilized: parseFloat(Number(d.totalHours).toFixed(2)),
          utilization_percentage: parseFloat(((Number(d.totalHours) / max_hours_per_driver) * 100).toFixed(2)),
          was_fatigued: d.fatigued
        })),
        processed_orders: processedOrders
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Simulation error:', error);
    
    if (error.message.includes('No available drivers') || error.message.includes('No pending orders')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Simulation failed',
      details: error.message
    });
  } finally {
    client.release();
  }
};

// Get simulation history
const getSimulationHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await pool.query(`
      SELECT * FROM simulation_results 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching simulation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch simulation history'
    });
  }
};

module.exports = {
  runSimulation,
  getSimulationHistory
};