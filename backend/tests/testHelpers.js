// Purple Merit Company Rules Implementation (for testing)
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
    return parseFloat((orderValue + bonus - penalty - fuelCost).toFixed(2));
  }

  // Rule 6: Efficiency Score
  static calculateEfficiencyScore(onTimeDeliveries, totalDeliveries) {
    if (totalDeliveries === 0) return 0;
    return parseFloat(((onTimeDeliveries / totalDeliveries) * 100).toFixed(2));
  }
}

// Validation helper
const validateSimulationInput = (availableDrivers, routeStartTime, maxHoursPerDriver) => {
  if (availableDrivers <= 0) {
    return {
      isValid: false,
      error: 'Available drivers must be greater than 0'
    };
  }

  if (maxHoursPerDriver <= 0 || maxHoursPerDriver > 24) {
    return {
      isValid: false,
      error: 'Max hours per driver must be between 1 and 24'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

module.exports = {
  PurpleMeritRules,
  validateSimulationInput
};