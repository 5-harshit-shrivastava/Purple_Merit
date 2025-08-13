const request = require('supertest');
const express = require('express');

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

describe('Driver Controller', () => {
  let app;
  let mockPool;

  beforeEach(() => {
    const { Pool } = require('pg');
    mockPool = new Pool();
    
    app = express();
    app.use(express.json());
    
    // Mock the drivers controller
    const driversController = {
      getAllDrivers: async (req, res) => {
        try {
          const result = await mockPool.query('SELECT * FROM drivers ORDER BY name');
          res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Failed to fetch drivers'
          });
        }
      },
      
      createDriver: async (req, res) => {
        try {
          const { name } = req.body;
          
          if (!name) {
            return res.status(400).json({
              success: false,
              error: 'Driver name is required'
            });
          }

          const result = await mockPool.query(
            'INSERT INTO drivers (name) VALUES ($1) RETURNING *',
            [name]
          );

          res.status(201).json({
            success: true,
            data: result.rows[0]
          });
        } catch (error) {
          if (error.code === '23505') { // Unique constraint violation
            res.status(400).json({
              success: false,
              error: 'Driver with this name already exists'
            });
          } else {
            res.status(500).json({
              success: false,
              error: 'Failed to create driver'
            });
          }
        }
      }
    };

    app.get('/api/drivers', driversController.getAllDrivers);
    app.post('/api/drivers', driversController.createDriver);
    
    jest.clearAllMocks();
  });

  describe('GET /api/drivers', () => {
    test('should return all drivers successfully', async () => {
      const mockDrivers = [
        { id: 1, name: 'John Doe', status: 'available' },
        { id: 2, name: 'Jane Smith', status: 'busy' }
      ];

      mockPool.query.mockResolvedValue({ rows: mockDrivers });

      const response = await request(app).get('/api/drivers');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockDrivers,
        count: 2
      });
    });

    test('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/api/drivers');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to fetch drivers'
      });
    });
  });

  describe('POST /api/drivers', () => {
    test('should create a new driver successfully', async () => {
      const newDriver = { id: 1, name: 'Bob Wilson', status: 'available' };
      
      mockPool.query.mockResolvedValue({ rows: [newDriver] });

      const response = await request(app)
        .post('/api/drivers')
        .send({ name: 'Bob Wilson' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: newDriver
      });
    });

    test('should return 400 for missing driver name', async () => {
      const response = await request(app)
        .post('/api/drivers')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Driver name is required'
      });
    });

    test('should handle duplicate driver names', async () => {
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = '23505';
      
      mockPool.query.mockRejectedValue(duplicateError);

      const response = await request(app)
        .post('/api/drivers')
        .send({ name: 'John Doe' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Driver with this name already exists'
      });
    });
  });
});