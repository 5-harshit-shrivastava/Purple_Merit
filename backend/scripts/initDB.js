const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    
    await pool.query(schemaSQL);
    console.log('Database schema initialized successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();