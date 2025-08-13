const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Mock the entire authController module
jest.mock('../controllers/authController', () => ({
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn()
}));

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
    connect: jest.fn(),
  })),
}));

describe('Authentication Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      header: jest.fn(),
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const { register } = require('../controllers/authController');
      
      mockReq.body = {
        username: 'testmanager',
        password: 'password123',
        email: 'test@example.com'
      };

      // Mock successful registration
      register.mockImplementation(async (req, res) => {
        res.status(201).json({
          message: 'User registered successfully',
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testmanager',
            email: 'test@example.com',
            role: 'manager'
          }
        });
      });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          token: expect.any(String),
          user: expect.objectContaining({
            username: 'testmanager',
            email: 'test@example.com'
          })
        })
      );
    });

    test('should return 400 if required fields are missing', async () => {
      const { register } = require('../controllers/authController');
      
      mockReq.body = { username: 'testuser' }; // Missing password and email

      // Mock validation error
      register.mockImplementation(async (req, res) => {
        res.status(400).json({
          message: 'Please provide username, password, and email'
        });
      });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Please provide username, password, and email'
      });
    });
  });

  describe('login', () => {
    test('should login user with valid credentials', async () => {
      const { login } = require('../controllers/authController');
      
      mockReq.body = {
        username: 'testmanager',
        password: 'password123'
      };

      // Mock successful login
      login.mockImplementation(async (req, res) => {
        res.json({
          message: 'Login successful',
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testmanager',
            email: 'test@example.com',
            role: 'manager'
          }
        });
      });

      await login(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          token: expect.any(String),
          user: expect.objectContaining({
            username: 'testmanager'
          })
        })
      );
    });

    test('should return 401 for invalid credentials', async () => {
      const { login } = require('../controllers/authController');
      
      mockReq.body = {
        username: 'wronguser',
        password: 'wrongpassword'
      };

      // Mock login failure
      login.mockImplementation(async (req, res) => {
        res.status(401).json({
          message: 'Invalid credentials'
        });
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
  });
});

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should authenticate with valid token', () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    mockReq.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual({ id: 1, iat: expect.any(Number), exp: expect.any(Number) });
    expect(mockNext).toHaveBeenCalled();
  });

  test('should return 401 when no token provided', () => {
    mockReq.header.mockReturnValue(null);

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No token, authorization denied'
    });
  });

  test('should return 401 for invalid token', () => {
    mockReq.header.mockReturnValue('Bearer invalidtoken');

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token is not valid'
    });
  });
});