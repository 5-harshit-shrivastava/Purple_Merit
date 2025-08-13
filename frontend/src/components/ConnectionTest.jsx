import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setBackendStatus('Testing...');
      setError(null);
      
      console.log('Testing connection to backend API...');
      
      // Use the API service for consistency
      const response = await apiService.healthCheck();
      
      setBackendStatus('✅ Backend Connected Successfully');
      setError(null);
      console.log('Backend response:', response);
    } catch (err) {
      console.error('Connection error:', err);
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setBackendStatus('❌ Connection Timeout');
        setError('Request timed out');
      } else if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        setBackendStatus('❌ CORS or Network Error');
        setError('Cannot reach backend - check if backend is running');
      } else {
        setBackendStatus('❌ Cannot Reach Backend');
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div className="mt-4 p-6 border border-gray-600 rounded-xl bg-gray-800 shadow-lg">
      <h3 className="font-medium text-white mb-3">Backend Connection Status</h3>
      <p className={`text-sm font-medium ${backendStatus.includes('✅') ? 'text-green-400' : backendStatus.includes('Testing') ? 'text-yellow-400' : 'text-red-400'}`}>
        {backendStatus}
      </p>
      {error && (
        <p className="text-xs text-red-300 mt-2 bg-red-900 bg-opacity-30 p-2 rounded">Error: {error}</p>
      )}
      <div className="mt-3 text-xs text-gray-400">
        API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
      </div>
      <button 
        onClick={testConnection}
        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
      >
        Test Again
      </button>
    </div>
  );
};

export default ConnectionTest;