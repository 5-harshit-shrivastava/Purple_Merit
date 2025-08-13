const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const routeRoutes = require('./routes/routes');
const orderRoutes = require('./routes/orders');
const simulationRoutes = require('./routes/simulation');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Purple Merit Technologies API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Purple Merit Technologies Logistics API',
    endpoints: {
      health: 'GET /api/health',
      drivers: {
        getAll: 'GET /api/drivers',
        getById: 'GET /api/drivers/:id',
        create: 'POST /api/drivers',
        update: 'PUT /api/drivers/:id',
        delete: 'DELETE /api/drivers/:id'
      },
      routes: {
        getAll: 'GET /api/routes',
        getById: 'GET /api/routes/:id',
        getByRouteId: 'GET /api/routes/route/:route_id',
        create: 'POST /api/routes',
        update: 'PUT /api/routes/:id',
        delete: 'DELETE /api/routes/:id'
      },
      orders: {
        getAll: 'GET /api/orders',
        getById: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        update: 'PUT /api/orders/:id',
        delete: 'DELETE /api/orders/:id'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      simulation: {
        run: 'POST /api/simulation/run',
        history: 'GET /api/simulation/history'
      },
      data: {
        loadInitial: 'POST /api/data/load-initial',
        uploadCSV: 'POST /api/data/upload-csv',
        loadJSON: 'POST /api/data/load-json',
        stats: 'GET /api/data/stats'
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/data', dataRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Purple Merit Technologies API Server running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💓 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();