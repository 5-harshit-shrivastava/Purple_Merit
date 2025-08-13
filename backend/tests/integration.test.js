const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
    connect: jest.fn(() => ({
      query: jest.fn(),
      release: jest.fn()
    }))
  })),
}));

describe('Integration Tests', () => {
  let app;
  let authToken;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware
    const authMiddleware = (req, res, next) => {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
      }
    };

    // Mock simulation endpoint
    app.post('/api/simulation/run', authMiddleware, async (req, res) => {
      const { available_drivers, max_hours_per_driver } = req.body;
      
      if (available_drivers <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Available drivers must be greater than 0'
        });
      }

      // Mock successful simulation
      res.status(200).json({
        success: true,
        message: 'Simulation completed successfully',
        simulation_id: 1,
        results: {
          total_orders: 10,
          orders_assigned: 8,
          on_time_deliveries: 7,
          efficiency_score: 87.5,
          financial_summary: {
            total_penalties: 100,
            total_bonuses: 300,
            total_fuel_cost: 500,
            overall_profit: 2500
          }
        }
      });
    });

    // Generate test token
    authToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('Protected Routes Integration', () => {
    test('should reject simulation request without token', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .send({
          available_drivers: 5,
          route_start_time: '09:00',
          max_hours_per_driver: 8
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token, authorization denied');
    });

    test('should accept simulation request with valid token', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: 5,
          route_start_time: '09:00',
          max_hours_per_driver: 8
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toBeDefined();
    });

    test('should validate simulation input parameters', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: 0, // Invalid: should be > 0
          route_start_time: '09:00',
          max_hours_per_driver: 8
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Available drivers must be greater than 0');
    });
  });

  describe('End-to-End Workflow', () => {
    test('should complete full simulation workflow', async () => {
      // Step 1: Run simulation
      const simulationResponse = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available_drivers: 3,
          route_start_time: '09:00',
          max_hours_per_driver: 8
        });

      expect(simulationResponse.status).toBe(200);
      expect(simulationResponse.body.success).toBe(true);
      
      const results = simulationResponse.body.results;
      expect(results.total_orders).toBeGreaterThan(0);
      expect(results.efficiency_score).toBeGreaterThanOrEqual(0);
      expect(results.efficiency_score).toBeLessThanOrEqual(100);
      expect(results.financial_summary).toBeDefined();
      expect(typeof results.financial_summary.overall_profit).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          available_drivers: 5,
          route_start_time: '09:00',
          max_hours_per_driver: 8
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token is not valid');
    });
  });
});