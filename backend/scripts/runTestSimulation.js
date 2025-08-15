const axios = require('axios');
require('dotenv').config();

const runTestSimulations = async () => {
  try {
    const baseURL = process.env.BASE_URL || 'http://localhost:50001';
    
    console.log('Running test simulations to generate trend data...');
    
    // Run multiple simulations with different parameters
    const simulations = [
      { available_drivers: 5, route_start_time: '08:00', max_hours_per_driver: 8 },
      { available_drivers: 6, route_start_time: '09:00', max_hours_per_driver: 10 },
      { available_drivers: 4, route_start_time: '07:00', max_hours_per_driver: 12 },
      { available_drivers: 7, route_start_time: '10:00', max_hours_per_driver: 9 },
      { available_drivers: 5, route_start_time: '08:30', max_hours_per_driver: 11 }
    ];

    // First get a demo user token for authentication
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        username: 'tester',
        password: 'tester'
      });
      token = loginResponse.data.token;
      console.log('Authenticated successfully');
    } catch (err) {
      console.error('Authentication failed:', err.response?.data || err.message);
      return;
    }

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    for (let i = 0; i < simulations.length; i++) {
      const simulation = simulations[i];
      console.log(`\nRunning simulation ${i + 1}/${simulations.length}...`);
      
      try {
        const response = await axios.post(`${baseURL}/api/simulation/run`, simulation, { headers });
        
        if (response.data.success) {
          console.log(`✓ Simulation ${i + 1} completed successfully`);
          console.log(`  - Orders processed: ${response.data.results.orders_assigned}`);
          console.log(`  - Efficiency: ${response.data.results.efficiency_score}%`);
          console.log(`  - Total profit: $${response.data.results.financial_summary.overall_profit}`);
          console.log(`  - Total fuel cost: $${response.data.results.financial_summary.total_fuel_cost}`);
        } else {
          console.log(`✗ Simulation ${i + 1} failed:`, response.data.error);
        }
      } catch (err) {
        console.error(`✗ Simulation ${i + 1} error:`, err.response?.data || err.message);
      }
      
      // Wait a bit between simulations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\nTest simulations completed! The dashboard trends should now show data.');
    process.exit(0);
  } catch (error) {
    console.error('Error running test simulations:', error);
    process.exit(1);
  }
};

runTestSimulations();