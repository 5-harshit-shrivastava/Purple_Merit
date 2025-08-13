import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  DollarSign,
  Target,
  Clock,
  Fuel,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import apiService from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProfit: 0,
    efficiencyScore: 0,
    onTimeDeliveries: 0,
    lateDeliveries: 0,
    totalFuelCost: 0,
    recentSimulations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      
      // Check if this is demo mode
      const isDemoMode = token === 'demo-token-for-testing';
      
      if (isDemoMode) {
        console.log('Demo mode detected, using mock data');
        // Provide realistic demo data
        const mockSimulations = [
          {
            id: 1,
            overall_profit: 45780,
            efficiency_score: 87,
            on_time_deliveries: 23,
            total_orders: 28,
            total_fuel_cost: 12340,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            overall_profit: 42150,
            efficiency_score: 82,
            on_time_deliveries: 19,
            total_orders: 25,
            total_fuel_cost: 11800,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            overall_profit: 38900,
            efficiency_score: 78,
            on_time_deliveries: 17,
            total_orders: 22,
            total_fuel_cost: 10950,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        const latestSimulation = mockSimulations[0];
        
        setDashboardData({
          totalProfit: latestSimulation.overall_profit,
          efficiencyScore: latestSimulation.efficiency_score,
          onTimeDeliveries: latestSimulation.on_time_deliveries,
          lateDeliveries: latestSimulation.total_orders - latestSimulation.on_time_deliveries,
          totalFuelCost: latestSimulation.total_fuel_cost,
          recentSimulations: mockSimulations
        });
        
        setLoading(false);
        return;
      }
      
      // Real API call for authenticated users
      console.log('Making real API call for authenticated user');
      const historyResponse = await apiService.getSimulationHistory();
      console.log('Simulation history response:', historyResponse);
      
      if (historyResponse.success && historyResponse.data && historyResponse.data.length > 0) {
        const recentSimulations = historyResponse.data;
        const latestSimulation = recentSimulations[0];
        
        console.log('Latest simulation data:', latestSimulation);
        
        setDashboardData({
          totalProfit: latestSimulation.overall_profit || 0,
          efficiencyScore: latestSimulation.efficiency_score || 0,
          onTimeDeliveries: latestSimulation.on_time_deliveries || 0,
          lateDeliveries: (latestSimulation.total_orders || 0) - (latestSimulation.on_time_deliveries || 0),
          totalFuelCost: latestSimulation.total_fuel_cost || 0,
          recentSimulations: recentSimulations.slice(0, 7) // Last 7 simulations
        });
      } else {
        console.log('No simulation data available, using default values');
        // Set default values if no simulations exist
        setDashboardData({
          totalProfit: 0,
          efficiencyScore: 0,
          onTimeDeliveries: 0,
          lateDeliveries: 0,
          totalFuelCost: 0,
          recentSimulations: []
        });
        
        if (!historyResponse.success) {
          setError(`API Error: ${historyResponse.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deliveryData = [
    {
      name: 'On Time',
      value: dashboardData.onTimeDeliveries,
      color: '#10B981'
    },
    {
      name: 'Late',
      value: dashboardData.lateDeliveries,
      color: '#EF4444'
    }
  ];

  const fuelCostData = dashboardData.recentSimulations.map((sim, index) => ({
    name: `Sim ${index + 1}`,
    fuelCost: sim.total_fuel_cost || 0,
    profit: sim.overall_profit || 0
  }));

  const profitTrendData = dashboardData.recentSimulations.map((sim, index) => ({
    name: `Simulation ${index + 1}`,
    profit: sim.overall_profit || 0,
    efficiency: sim.efficiency_score || 0
  }));

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
    const getColorClasses = (color) => {
      switch (color) {
        case 'green':
          return {
            text: 'text-green-400',
            bg: 'bg-green-600',
            icon: 'text-white'
          };
        case 'blue':
          return {
            text: 'text-blue-400',
            bg: 'bg-blue-600',
            icon: 'text-white'
          };
        case 'orange':
          return {
            text: 'text-orange-400',
            bg: 'bg-orange-600',
            icon: 'text-white'
          };
        default:
          return {
            text: 'text-blue-400',
            bg: 'bg-blue-600',
            icon: 'text-white'
          };
      }
    };

    const colorClasses = getColorClasses(color);

    return (
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className={`text-2xl font-bold ${colorClasses.text}`}>
              {typeof value === 'number' ? 
                (title.includes('₹') || title.includes('Profit') ? `₹${value.toLocaleString()}` : 
                 title.includes('%') || title.includes('Score') ? `${value}%` : 
                 value.toLocaleString()) 
                : value}
            </p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses.bg}`}>
            <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Profit"
          value={dashboardData.totalProfit}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Efficiency Score"
          value={dashboardData.efficiencyScore}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="On-Time Deliveries"
          value={dashboardData.onTimeDeliveries}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Total Fuel Cost"
          value={dashboardData.totalFuelCost}
          icon={Fuel}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* On-time vs Late Deliveries Chart */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Delivery Performance</h3>
          {deliveryData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No delivery data available. Run a simulation first.
            </div>
          )}
        </div>

        {/* Fuel Cost Breakdown Chart */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Fuel Cost vs Profit</h3>
          {fuelCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fuelCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="name" tick={{ fill: '#D1D5DB' }} />
                <YAxis tick={{ fill: '#D1D5DB' }} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, '']}
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="fuelCost" fill="#F59E0B" name="Fuel Cost" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No simulation data available. Run a simulation first.
            </div>
          )}
        </div>
      </div>

      {/* Profit Trend Chart */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Profit & Efficiency Trend</h3>
        {profitTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={profitTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" tick={{ fill: '#D1D5DB' }} />
              <YAxis yAxisId="left" tick={{ fill: '#D1D5DB' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#D1D5DB' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={2}
                name="Profit (₹)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Efficiency (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            No trend data available. Run multiple simulations to see trends.
          </div>
        )}
      </div>

      {/* Recent Simulations */}
      {dashboardData.recentSimulations.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Simulations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {dashboardData.recentSimulations.map((sim, index) => (
                  <tr key={index} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(sim.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {sim.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                      {sim.efficiency_score || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                      ₹{(sim.overall_profit || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;