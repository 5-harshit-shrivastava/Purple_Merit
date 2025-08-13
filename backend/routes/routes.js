const express = require('express');
const router = express.Router();
const { 
  getRoutes, 
  getRouteById, 
  getRouteByRouteId,
  createRoute, 
  updateRoute, 
  deleteRoute 
} = require('../controllers/routeController');
const { validateRequest, schemas } = require('../middleware/validation');

// GET /api/routes - Get all routes
router.get('/', getRoutes);

// GET /api/routes/:id - Get route by ID
router.get('/:id', getRouteById);

// GET /api/routes/route/:route_id - Get route by route_id
router.get('/route/:route_id', getRouteByRouteId);

// POST /api/routes - Create new route
router.post('/', validateRequest(schemas.route), createRoute);

// PUT /api/routes/:id - Update route
router.put('/:id', validateRequest(schemas.updateRoute), updateRoute);

// DELETE /api/routes/:id - Delete route
router.delete('/:id', deleteRoute);

module.exports = router;