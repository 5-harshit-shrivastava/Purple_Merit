const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { pool } = require('../config/database');

class DataLoader {
  static async loadCSVData(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  static async loadDriversFromCSV(filePath = path.join(__dirname, '../data/drivers.csv')) {
    try {
      const driversData = await this.loadCSVData(filePath);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const driver of driversData) {
          await client.query(`
            INSERT INTO drivers (name, current_shift_hours, past_7_day_work_hours)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO UPDATE SET
              current_shift_hours = EXCLUDED.current_shift_hours,
              past_7_day_work_hours = EXCLUDED.past_7_day_work_hours,
              updated_at = CURRENT_TIMESTAMP
          `, [
            driver.name.trim(),
            parseFloat(driver.current_shift_hours),
            parseFloat(driver.past_7_day_work_hours)
          ]);
        }
        
        await client.query('COMMIT');
        console.log(`Successfully loaded ${driversData.length} drivers`);
        return driversData.length;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error loading drivers from CSV:', error);
      throw error;
    }
  }

  static async loadRoutesFromCSV(filePath = path.join(__dirname, '../data/routes.csv')) {
    try {
      const routesData = await this.loadCSVData(filePath);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const route of routesData) {
          await client.query(`
            INSERT INTO routes (route_id, distance_km, traffic_level, base_time_minutes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (route_id) DO UPDATE SET
              distance_km = EXCLUDED.distance_km,
              traffic_level = EXCLUDED.traffic_level,
              base_time_minutes = EXCLUDED.base_time_minutes,
              updated_at = CURRENT_TIMESTAMP
          `, [
            route.route_id.trim(),
            parseFloat(route.distance_km),
            route.traffic_level.trim(),
            parseInt(route.base_time_minutes)
          ]);
        }
        
        await client.query('COMMIT');
        console.log(`Successfully loaded ${routesData.length} routes`);
        return routesData.length;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error loading routes from CSV:', error);
      throw error;
    }
  }

  static async loadOrdersFromCSV(filePath = path.join(__dirname, '../data/orders.csv')) {
    try {
      const ordersData = await this.loadCSVData(filePath);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const order of ordersData) {
          await client.query(`
            INSERT INTO orders (order_id, value_rs, assigned_route, delivery_timestamp)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (order_id) DO UPDATE SET
              value_rs = EXCLUDED.value_rs,
              assigned_route = EXCLUDED.assigned_route,
              delivery_timestamp = EXCLUDED.delivery_timestamp,
              updated_at = CURRENT_TIMESTAMP
          `, [
            order.order_id.trim(),
            parseFloat(order.value_rs),
            order.assigned_route.trim(),
            new Date(order.delivery_timestamp)
          ]);
        }
        
        await client.query('COMMIT');
        console.log(`Successfully loaded ${ordersData.length} orders`);
        return ordersData.length;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error loading orders from CSV:', error);
      throw error;
    }
  }

  static async loadAllData() {
    try {
      console.log('Loading all data from CSV files...');
      const driversCount = await this.loadDriversFromCSV();
      const routesCount = await this.loadRoutesFromCSV();
      const ordersCount = await this.loadOrdersFromCSV();
      
      return {
        driversLoaded: driversCount,
        routesLoaded: routesCount,
        ordersLoaded: ordersCount
      };
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }

  static async loadJSONData(jsonData, dataType) {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        switch (dataType.toLowerCase()) {
          case 'drivers':
            for (const driver of jsonData) {
              await client.query(`
                INSERT INTO drivers (name, current_shift_hours, past_7_day_work_hours)
                VALUES ($1, $2, $3)
                ON CONFLICT (name) DO UPDATE SET
                  current_shift_hours = EXCLUDED.current_shift_hours,
                  past_7_day_work_hours = EXCLUDED.past_7_day_work_hours,
                  updated_at = CURRENT_TIMESTAMP
              `, [driver.name, driver.current_shift_hours, driver.past_7_day_work_hours]);
            }
            break;
            
          case 'routes':
            for (const route of jsonData) {
              await client.query(`
                INSERT INTO routes (route_id, distance_km, traffic_level, base_time_minutes)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (route_id) DO UPDATE SET
                  distance_km = EXCLUDED.distance_km,
                  traffic_level = EXCLUDED.traffic_level,
                  base_time_minutes = EXCLUDED.base_time_minutes,
                  updated_at = CURRENT_TIMESTAMP
              `, [route.route_id, route.distance_km, route.traffic_level, route.base_time_minutes]);
            }
            break;
            
          case 'orders':
            for (const order of jsonData) {
              await client.query(`
                INSERT INTO orders (order_id, value_rs, assigned_route, delivery_timestamp)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (order_id) DO UPDATE SET
                  value_rs = EXCLUDED.value_rs,
                  assigned_route = EXCLUDED.assigned_route,
                  delivery_timestamp = EXCLUDED.delivery_timestamp,
                  updated_at = CURRENT_TIMESTAMP
              `, [order.order_id, order.value_rs, order.assigned_route, new Date(order.delivery_timestamp)]);
            }
            break;
            
          default:
            throw new Error(`Invalid data type: ${dataType}`);
        }
        
        await client.query('COMMIT');
        return jsonData.length;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error loading JSON data for ${dataType}:`, error);
      throw error;
    }
  }
}

module.exports = DataLoader;