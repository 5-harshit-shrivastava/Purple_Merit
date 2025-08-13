const express = require('express');
const router = express.Router();
const { 
  getDrivers, 
  getDriverById, 
  createDriver, 
  updateDriver, 
  deleteDriver 
} = require('../controllers/driverController');
const { validateRequest, schemas } = require('../middleware/validation');

// GET /api/drivers - Get all drivers
router.get('/', getDrivers);

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', getDriverById);

// POST /api/drivers - Create new driver
router.post('/', validateRequest(schemas.driver), createDriver);

// PUT /api/drivers/:id - Update driver
router.put('/:id', validateRequest(schemas.updateDriver), updateDriver);

// DELETE /api/drivers/:id - Delete driver
router.delete('/:id', deleteDriver);

module.exports = router;