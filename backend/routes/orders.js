const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} = require('../controllers/orderController');
const { validateRequest, schemas } = require('../middleware/validation');

// GET /api/orders - Get all orders
router.get('/', getOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders - Create new order
router.post('/', validateRequest(schemas.order), createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', validateRequest(schemas.updateOrder), updateOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', deleteOrder);

module.exports = router;