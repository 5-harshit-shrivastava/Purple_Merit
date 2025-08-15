const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config();

const addDemoUser = async () => {
  try {
    console.log('Adding demo user...');
    
    // Demo user data
    const username = 'tester';
    const email = 'tester@.com';
    const password = 'tester';
    const role = 'manager';
    
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2', 
      [username, email]
    );
    
    if (userExists.rows.length > 0) {
      console.log('Demo user already exists!');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert demo user
    const result = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, hashedPassword, email, role]
    );
    
    console.log('Demo user added successfully:');
    console.log('Username:', result.rows[0].username);
    console.log('Email:', result.rows[0].email);
    console.log('Role:', result.rows[0].role);
    console.log('\nLogin credentials:');
    console.log('Username: tester');
    console.log('Password: tester');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding demo user:', error);
    process.exit(1);
  }
};

addDemoUser();