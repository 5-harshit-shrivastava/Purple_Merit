const { pool } = require('../config/database');
require('dotenv').config();

const addTestData = async () => {
  try {
    console.log('Adding test data to database...');

    // Clear existing data
    await pool.query('DELETE FROM simulation_results');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM routes');  
    await pool.query('DELETE FROM drivers');

    // Routes data
    const routesData = [
      [1, '1', 25, 'High', 125],
      [2, '2', 12, 'High', 48],
      [3, '3', 6, 'Low', 18],
      [4, '4', 15, 'Medium', 60],
      [5, '5', 7, 'Low', 35],
      [6, '6', 15, 'Low', 75],
      [7, '7', 20, 'Medium', 100],
      [8, '8', 19, 'Low', 76],
      [9, '9', 9, 'Low', 45],
      [10, '10', 22, 'High', 88]
    ];

    // Insert routes
    for (const route of routesData) {
      await pool.query(
        'INSERT INTO routes (id, route_id, distance_km, traffic_level, base_time_minutes) VALUES ($1, $2, $3, $4, $5)',
        route
      );
    }
    console.log('Routes added successfully');

    // Drivers data - calculate past_7_day_work_hours from the pipe-separated values
    const driversData = [
      ['Amit', 6, '6|8|7|7|7|6|10'],
      ['Priya', 6, '10|9|6|6|6|7|7'],
      ['Rohit', 10, '10|6|10|7|10|9|7'],
      ['Neha', 9, '10|8|6|7|9|8|8'],
      ['Karan', 7, '7|8|6|6|9|6|8'],
      ['Sneha', 8, '10|8|6|9|10|6|9'],
      ['Vikram', 6, '10|8|10|8|10|7|6'],
      ['Anjali', 6, '7|8|6|7|6|9|8'],
      ['Manoj', 9, '8|7|8|8|7|8|6'],
      ['Pooja', 10, '7|10|7|7|9|9|8']
    ];

    // Insert drivers
    for (const [name, shiftHours, pastWeekHours] of driversData) {
      const totalHours = pastWeekHours.split('|').reduce((sum, hours) => sum + parseInt(hours), 0);
      await pool.query(
        'INSERT INTO drivers (name, current_shift_hours, past_7_day_work_hours) VALUES ($1, $2, $3)',
        [name, shiftHours, totalHours]
      );
    }
    console.log('Drivers added successfully');

    // Orders data
    const ordersData = [
      [1, '1', 2594, '7', '02:07'],
      [2, '2', 1835, '6', '01:19'],
      [3, '3', 766, '9', '01:06'],
      [4, '4', 572, '1', '02:02'],
      [5, '5', 826, '3', '00:35'],
      [6, '6', 2642, '2', '01:02'],
      [7, '7', 1763, '10', '01:47'],
      [8, '8', 2367, '5', '01:00'],
      [9, '9', 247, '2', '01:12'],
      [10, '10', 1292, '6', '01:12'],
      [11, '11', 1402, '7', '01:40'],
      [12, '12', 2058, '1', '02:11'],
      [13, '13', 2250, '3', '00:40'],
      [14, '14', 635, '5', '01:05'],
      [15, '15', 2279, '10', '01:30'],
      [16, '16', 826, '6', '01:15'],
      [17, '17', 2409, '9', '00:35'],
      [18, '18', 2653, '6', '01:36'],
      [19, '19', 279, '2', '01:01'],
      [20, '20', 1459, '4', '00:53'],
      [21, '21', 1186, '10', '01:23'],
      [22, '22', 550, '8', '01:10'],
      [23, '23', 2381, '3', '00:16'],
      [24, '24', 2902, '8', '01:41'],
      [25, '25', 876, '5', '00:58'],
      [26, '26', 2684, '7', '01:43'],
      [27, '27', 2408, '4', '01:09'],
      [28, '28', 1834, '6', '01:33'],
      [29, '29', 2319, '8', '01:13'],
      [30, '30', 1215, '4', '00:54'],
      [31, '31', 1584, '1', '02:32'],
      [32, '32', 2468, '4', '01:27'],
      [33, '33', 1102, '1', '01:59'],
      [34, '34', 2784, '1', '02:09'],
      [35, '35', 476, '1', '02:16'],
      [36, '36', 490, '9', '00:50'],
      [37, '37', 1340, '8', '01:19'],
      [38, '38', 2408, '3', '00:44'],
      [39, '39', 2560, '8', '01:21'],
      [40, '40', 2137, '7', '01:42'],
      [41, '41', 586, '2', '01:05'],
      [42, '42', 1651, '7', '01:56'],
      [43, '43', 2112, '1', '02:01'],
      [44, '44', 448, '7', '01:51'],
      [45, '45', 647, '4', '01:02'],
      [46, '46', 979, '9', '01:03'],
      [47, '47', 774, '7', '01:41'],
      [48, '48', 1340, '8', '01:21'],
      [49, '49', 508, '8', '01:41'],
      [50, '50', 601, '1', '02:29']
    ];

    // Insert orders
    for (const [id, orderId, value, routeId, deliveryTime] of ordersData) {
      await pool.query(
        'INSERT INTO orders (id, order_id, value_rs, assigned_route) VALUES ($1, $2, $3, $4)',
        [id, orderId, value, routeId]
      );
    }
    console.log('Orders added successfully');

    console.log('\nTest data added successfully!');
    console.log('- 10 routes added');
    console.log('- 10 drivers added');
    console.log('- 50 orders added');

    process.exit(0);
  } catch (error) {
    console.error('Error adding test data:', error);
    process.exit(1);
  }
};

addTestData();