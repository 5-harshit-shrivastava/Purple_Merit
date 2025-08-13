const express = require('express');
const router = express.Router();
const { runSimulation, getSimulationHistory } = require('../controllers/simulationController');
const { validateRequest, schemas } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

// POST /api/simulation/run - Run simulation (protected)
router.post('/run', authMiddleware, validateRequest(schemas.simulation), runSimulation);

// GET /api/simulation/history - Get simulation history (protected)
router.get('/history', authMiddleware, getSimulationHistory);

module.exports = router;