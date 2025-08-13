const express = require('express');
const router = express.Router();
const { 
  loadInitialData, 
  uploadCSV, 
  loadJSONData, 
  getDataStats 
} = require('../controllers/dataController');

// POST /api/data/load-initial - Load initial data from CSV files
router.post('/load-initial', loadInitialData);

// POST /api/data/upload-csv - Upload and load CSV file
router.post('/upload-csv', uploadCSV);

// POST /api/data/load-json - Load JSON data
router.post('/load-json', loadJSONData);

// GET /api/data/stats - Get data statistics
router.get('/stats', getDataStats);

module.exports = router;