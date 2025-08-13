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
      const historyResponse = await apiService.getSimulationHistory(10);
      
      if (historyResponse.success && historyResponse.data.length > 0) {
        const recentSimulations = historyResponse.data;
        const latestSimulation = recentSimulations[0];
        
        setDashboardData({
          totalProfit: latestSimulation.overall_profit || 0,
          efficiencyScore: latestSimulation.efficiency_score || 0,
          onTimeDeliveries: latestSimulation.on_time_deliveries || 0,
          lateDeliveries: (latestSimulation.total_orders || 0) - (latestSimulation.on_time_deliveries || 0),
          totalFuelCost: latestSimulation.total_fuel_cost || 0,
          recentSimulations: recentSimulations.slice(0, 7) // Last 7 simulations
        });
      } else {
        // Set default values if no simulations exist
        setDashboardData({
          totalProfit: 0,
          efficiencyScore: 0,
          onTimeDeliveries: 0,
          lateDeliveries: 0,
          totalFuelCost: 0,
          recentSimulations: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
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

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'purple' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>
            {typeof value === 'number' ? 
              (title.includes('₹') || title.includes('Profit') ? `₹${value.toLocaleString()}` : 
               title.includes('%') || title.includes('Score') ? `${value}%` : 
               value.toLocaleString()) 
              : value}
          </p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-time vs Late Deliveries Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
          {deliveryData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No delivery data available. Run a simulation first.
            </div>
          )}
        </div>

        {/* Fuel Cost Breakdown Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Cost vs Profit</h3>
          {fuelCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, '']} />
                <Bar dataKey="fuelCost" fill="#F59E0B" name="Fuel Cost" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No simulation data available. Run a simulation first.
            </div>
          )}
        </div>
      </div>

      {/* Profit Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Efficiency Trend</h3>
        {profitTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
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
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data available. Run multiple simulations to see trends.
          </div>
        )}
      </div>

      {/* Recent Simulations */}
      {dashboardData.recentSimulations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Simulations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentSimulations.map((sim, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sim.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sim.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sim.efficiency_score || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
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