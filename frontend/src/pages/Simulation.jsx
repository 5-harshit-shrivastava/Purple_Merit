import React, { useState, useEffect } from 'react';
import { Play, Clock, Users, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../services/api';

const Simulation = () => {
  const [formData, setFormData] = useState({
    available_drivers: 5,
    route_start_time: '09:00',
    max_hours_per_driver: 8
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await apiService.getDrivers();
      if (response.success) {
        setDrivers(response.data);
        // Set max available drivers based on actual driver count
        const availableCount = response.data.filter(d => d.status === 'available').length;
        setFormData(prev => ({
          ...prev,
          available_drivers: Math.min(prev.available_drivers, availableCount)
        }));
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.runSimulation(formData);
      if (response.success) {
        setResults(response.results);
      } else {
        setError(response.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      setError(error.response?.data?.error || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'available_drivers' || name === 'max_hours_per_driver' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const availableDriversCount = drivers.filter(d => d.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure and run delivery simulations to optimize operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="available_drivers" className="block text-sm font-medium text-gray-700">
                  Available Drivers
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="available_drivers"
                    name="available_drivers"
                    min="1"
                    max={availableDriversCount}
                    value={formData.available_drivers}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Max available: {availableDriversCount} drivers
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="route_start_time" className="block text-sm font-medium text-gray-700">
                  Route Start Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="route_start_time"
                    name="route_start_time"
                    value={formData.route_start_time}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="max_hours_per_driver" className="block text-sm font-medium text-gray-700">
                  Max Hours per Driver
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="max_hours_per_driver"
                    name="max_hours_per_driver"
                    min="1"
                    max="24"
                    value={formData.max_hours_per_driver}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Hours (1-24)
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || availableDriversCount === 0}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {results ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-md">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-lg font-semibold text-gray-900">{results.total_orders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Assigned</p>
                      <p className="text-lg font-semibold text-gray-900">{results.orders_assigned}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-md">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">On Time</p>
                      <p className="text-lg font-semibold text-gray-900">{results.on_time_deliveries}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-md">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Efficiency</p>
                      <p className="text-lg font-semibold text-gray-900">{results.efficiency_score}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{results.financial_summary.overall_profit.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Profit</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{results.financial_summary.total_bonuses.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Bonuses</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      ₹{results.financial_summary.total_penalties.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Penalties</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{results.financial_summary.total_fuel_cost.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Fuel Cost</p>
                  </div>
                </div>
              </div>

              {/* Driver Utilization */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Utilization</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.driver_utilization.map((driver, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {driver.driver_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {driver.orders_assigned}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {driver.hours_utilized}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(driver.utilization_percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span>{driver.utilization_percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {driver.was_fatigued ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Fatigued
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <Play className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No simulation results</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Run a simulation to see results and analytics here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;