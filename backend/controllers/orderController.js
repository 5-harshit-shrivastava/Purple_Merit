const { pool } = require('../config/database');

// Get all orders
const getOrders = async (req, res) => {
  try {
    const { status, assigned_route } = req.query;
    let query = `
      SELECT o.*, r.distance_km, r.traffic_level, r.base_time_minutes,
             d.name as driver_name
      FROM orders o
      LEFT JOIN routes r ON o.assigned_route = r.route_id
      LEFT JOIN drivers d ON o.assigned_driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (assigned_route) {
      paramCount++;
      query += ` AND o.assigned_route = $${paramCount}`;
      params.push(assigned_route);
    }

    query += ' ORDER BY o.id';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    const result = await pool.query(`
      SELECT o.*, r.distance_km, r.traffic_level, r.base_time_minutes,
             d.name as driver_name
      FROM orders o
      LEFT JOIN routes r ON o.assigned_route = r.route_id
      LEFT JOIN drivers d ON o.assigned_driver_id = d.id
      WHERE o.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { order_id, value_rs, assigned_route, delivery_timestamp } = req.body;

    // Check if route exists
    const routeCheck = await pool.query('SELECT route_id FROM routes WHERE route_id = $1', [assigned_route]);
    if (routeCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route ID - route does not exist'
      });
    }

    const result = await pool.query(
      'INSERT INTO orders (order_id, value_rs, assigned_route, delivery_timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, value_rs, assigned_route, delivery_timestamp]
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Order with this order_id already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    // Check if route exists if assigned_route is being updated
    if (updates.assigned_route) {
      const routeCheck = await pool.query('SELECT route_id FROM routes WHERE route_id = $1', [updates.assigned_route]);
      if (routeCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid route ID - route does not exist'
        });
      }
    }

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order'
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};