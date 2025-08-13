const { pool } = require('../config/database');

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM drivers';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY id';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers'
    });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid driver ID'
      });
    }

    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver'
    });
  }
};

// Create new driver
const createDriver = async (req, res) => {
  try {
    const { name, current_shift_hours = 0, past_7_day_work_hours = 0, status = 'available' } = req.body;

    const result = await pool.query(
      'INSERT INTO drivers (name, current_shift_hours, past_7_day_work_hours, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, current_shift_hours, past_7_day_work_hours, status]
    );

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Driver with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create driver'
    });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid driver ID'
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
      `UPDATE drivers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update driver'
    });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid driver ID'
      });
    }

    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete driver'
    });
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};