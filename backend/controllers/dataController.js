const DataLoader = require('../services/dataLoader');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'), false);
    }
  }
});

// Load initial data from default CSV files
const loadInitialData = async (req, res) => {
  try {
    const result = await DataLoader.loadAllData();
    
    res.json({
      success: true,
      message: 'Initial data loaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error loading initial data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load initial data',
      details: error.message
    });
  }
};

// Upload and load CSV file
const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { dataType } = req.body;
    
    if (!dataType || !['drivers', 'routes', 'orders'].includes(dataType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing dataType. Must be one of: drivers, routes, orders'
      });
    }

    let loadedCount;
    const filePath = req.file.path;

    switch (dataType) {
      case 'drivers':
        loadedCount = await DataLoader.loadDriversFromCSV(filePath);
        break;
      case 'routes':
        loadedCount = await DataLoader.loadRoutesFromCSV(filePath);
        break;
      case 'orders':
        loadedCount = await DataLoader.loadOrdersFromCSV(filePath);
        break;
    }

    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Successfully loaded ${loadedCount} ${dataType} records`,
      recordsLoaded: loadedCount
    });

  } catch (error) {
    console.error('Error uploading CSV:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process uploaded file',
      details: error.message
    });
  }
};

// Load JSON data
const loadJSONData = async (req, res) => {
  try {
    const { dataType, data } = req.body;

    if (!dataType || !['drivers', 'routes', 'orders'].includes(dataType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing dataType. Must be one of: drivers, routes, orders'
      });
    }

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Data must be an array'
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Data array cannot be empty'
      });
    }

    const loadedCount = await DataLoader.loadJSONData(data, dataType);

    res.json({
      success: true,
      message: `Successfully loaded ${loadedCount} ${dataType} records`,
      recordsLoaded: loadedCount
    });

  } catch (error) {
    console.error('Error loading JSON data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load JSON data',
      details: error.message
    });
  }
};

// Get data statistics
const getDataStats = async (req, res) => {
  try {
    const { pool } = require('../config/database');
    
    const [driversResult, routesResult, ordersResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count, status FROM drivers GROUP BY status'),
      pool.query('SELECT COUNT(*) as count, traffic_level FROM routes GROUP BY traffic_level'),
      pool.query('SELECT COUNT(*) as count, status FROM orders GROUP BY status')
    ]);

    const stats = {
      drivers: {
        total: driversResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        by_status: driversResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {})
      },
      routes: {
        total: routesResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        by_traffic_level: routesResult.rows.reduce((acc, row) => {
          acc[row.traffic_level] = parseInt(row.count);
          return acc;
        }, {})
      },
      orders: {
        total: ordersResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        by_status: ordersResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {})
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching data stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data statistics'
    });
  }
};

module.exports = {
  loadInitialData,
  uploadCSV: [upload.single('file'), uploadCSV],
  loadJSONData,
  getDataStats
};