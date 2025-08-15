const axios = require('axios');
require('dotenv').config();

const generateTrendData = async () => {
  try {
    const baseURL = 'http://localhost:50001';
    
    // Get token
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'tester',
      password: 'tester'
    });
    const token = loginResponse.data.token;
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Reset drivers and orders before each simulation
    const resetData = async () => {
      const { pool } = require('../config/database');
      await pool.query('UPDATE drivers SET status = \'available\', current_shift_hours = 0');
      await pool.query('UPDATE orders SET status = \'pending\', assigned_driver_id = NULL, fuel_cost = 0, profit = 0, late_penalty = 0, high_value_bonus = 0, is_on_time = TRUE');
    };

    console.log('Generating trend data with multiple simulations...');
    
    const simulations = [
      { available_drivers: 2, route_start_time: '08:00', max_hours_per_driver: 8 },
      { available_drivers: 3, route_start_time: '09:00', max_hours_per_driver: 10 },
      { available_drivers: 4, route_start_time: '07:00', max_hours_per_driver: 12 },
      { available_drivers: 5, route_start_time: '10:00', max_hours_per_driver: 9 }
    ];

    for (let i = 0; i < simulations.length; i++) {
      console.log(`\nRunning simulation ${i + 1}/${simulations.length}...`);
      
      // Reset data
      await resetData();
      
      try {
        const response = await axios.post(`${baseURL}/api/simulation/run`, simulations[i], { headers });
        
        if (response.data.success) {
          const results = response.data.results;
          console.log(`✓ Simulation ${i + 1} completed:`);
          console.log(`  - Efficiency: ${results.efficiency_score}%`);
          console.log(`  - Total profit: $${results.financial_summary.overall_profit}`);
          console.log(`  - Total fuel cost: $${results.financial_summary.total_fuel_cost}`);
          console.log(`  - Orders processed: ${results.orders_assigned}`);
        } else {
          console.log(`✗ Simulation ${i + 1} failed:`, response.data.error);
        }
      } catch (err) {
        console.error(`✗ Simulation ${i + 1} error:`, err.response?.data || err.message);
      }
      
      // Wait between simulations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Trend data generation completed!');
    console.log('Dashboard should now show fuel cost vs profit and efficiency trends.');
    process.exit(0);
  } catch (error) {
    console.error('Error generating trend data:', error);
    process.exit(1);
  }
};

generateTrendData();