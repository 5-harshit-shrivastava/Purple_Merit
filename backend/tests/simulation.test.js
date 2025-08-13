const { PurpleMeritRules } = require('./testHelpers');

describe('Purple Merit Rules', () => {
  describe('calculateFuelCost', () => {
    test('should calculate base fuel cost correctly', () => {
      const result = PurpleMeritRules.calculateFuelCost(10, 'Low');
      expect(result).toBe(50); // 10km * ₹5/km
    });

    test('should add high traffic surcharge', () => {
      const result = PurpleMeritRules.calculateFuelCost(10, 'High');
      expect(result).toBe(70); // 10km * (₹5 + ₹2)/km
    });

    test('should handle medium traffic without surcharge', () => {
      const result = PurpleMeritRules.calculateFuelCost(5, 'Medium');
      expect(result).toBe(25); // 5km * ₹5/km
    });
  });

  describe('calculateLatePenalty', () => {
    test('should return 0 for on-time delivery', () => {
      const result = PurpleMeritRules.calculateLatePenalty(30, 30);
      expect(result).toBe(0);
    });

    test('should return 0 for delivery within grace period', () => {
      const result = PurpleMeritRules.calculateLatePenalty(35, 30); // 5 minutes late (within 10 minute grace)
      expect(result).toBe(0);
    });

    test('should return penalty for late delivery', () => {
      const result = PurpleMeritRules.calculateLatePenalty(45, 30); // 15 minutes late (beyond grace period)
      expect(result).toBe(50);
    });
  });

  describe('calculateHighValueBonus', () => {
    test('should return bonus for high-value on-time order', () => {
      const result = PurpleMeritRules.calculateHighValueBonus(1500, true);
      expect(result).toBe(150); // 10% of ₹1500
    });

    test('should return 0 for high-value late order', () => {
      const result = PurpleMeritRules.calculateHighValueBonus(1500, false);
      expect(result).toBe(0);
    });

    test('should return 0 for low-value order', () => {
      const result = PurpleMeritRules.calculateHighValueBonus(800, true);
      expect(result).toBe(0);
    });
  });

  describe('applyFatigueRule', () => {
    test('should apply 30% penalty for fatigued driver', () => {
      const result = PurpleMeritRules.applyFatigueRule(60, true);
      expect(result).toBe(78); // 60 * 1.3
    });

    test('should not apply penalty for non-fatigued driver', () => {
      const result = PurpleMeritRules.applyFatigueRule(60, false);
      expect(result).toBe(60);
    });
  });

  describe('calculateOrderProfit', () => {
    test('should calculate profit correctly', () => {
      const result = PurpleMeritRules.calculateOrderProfit(1000, 100, 50, 30);
      expect(result).toBe(1020); // 1000 + 100 - 50 - 30
    });

    test('should handle negative profit', () => {
      const result = PurpleMeritRules.calculateOrderProfit(100, 0, 50, 80);
      expect(result).toBe(-30); // 100 + 0 - 50 - 80
    });
  });

  describe('calculateEfficiencyScore', () => {
    test('should calculate efficiency score correctly', () => {
      const result = PurpleMeritRules.calculateEfficiencyScore(8, 10);
      expect(result).toBe(80);
    });

    test('should return 0 for no deliveries', () => {
      const result = PurpleMeritRules.calculateEfficiencyScore(0, 0);
      expect(result).toBe(0);
    });

    test('should handle perfect efficiency', () => {
      const result = PurpleMeritRules.calculateEfficiencyScore(10, 10);
      expect(result).toBe(100);
    });
  });
});

describe('Simulation Controller', () => {
  let mockReq, mockRes, mockClient;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1 },
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('runSimulation validation', () => {
    test('should validate available drivers > 0', () => {
      const { validateSimulationInput } = require('./testHelpers');
      
      const result = validateSimulationInput(0, '09:00', 8);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Available drivers must be greater than 0');
    });

    test('should validate max hours per driver range', () => {
      const { validateSimulationInput } = require('./testHelpers');
      
      const result1 = validateSimulationInput(5, '09:00', 0);
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Max hours per driver must be between 1 and 24');

      const result2 = validateSimulationInput(5, '09:00', 25);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Max hours per driver must be between 1 and 24');
    });

    test('should pass validation with valid inputs', () => {
      const { validateSimulationInput } = require('./testHelpers');
      
      const result = validateSimulationInput(5, '09:00', 8);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});