const { pool } = require('../config/database');

// Get all routes
const getRoutes = async (req, res) => {
  try {
    const { traffic_level } = req.query;
    let query = 'SELECT * FROM routes';
    const params = [];

    if (traffic_level) {
      query += ' WHERE traffic_level = $1';
      params.push(traffic_level);
    }

    query += ' ORDER BY route_id';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch routes'
    });
  }
};

// Get route by ID
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route ID'
      });
    }

    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route'
    });
  }
};

// Get route by route_id
const getRouteByRouteId = async (req, res) => {
  try {
    const { route_id } = req.params;

    const result = await pool.query('SELECT * FROM routes WHERE route_id = $1', [route_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route'
    });
  }
};

// Create new route
const createRoute = async (req, res) => {
  try {
    const { route_id, distance_km, traffic_level, base_time_minutes } = req.body;

    const result = await pool.query(
      'INSERT INTO routes (route_id, distance_km, traffic_level, base_time_minutes) VALUES ($1, $2, $3, $4) RETURNING *',
      [route_id, distance_km, traffic_level, base_time_minutes]
    );

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating route:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Route with this route_id already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create route'
    });
  }
};

// Update route
const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route ID'
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE routes SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update route'
    });
  }
};

// Delete route
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route ID'
      });
    }

    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete route'
    });
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  getRouteByRouteId,
  createRoute,
  updateRoute,
  deleteRoute
};