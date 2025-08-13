import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch('https://purple-merit.onrender.com/api/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('✅ Backend Connected Successfully');
        setError(null);
      } else {
        setBackendStatus('❌ Backend Connection Failed');
        setError(`HTTP ${response.status}`);
      }
    } catch (err) {
      setBackendStatus('❌ Cannot Reach Backend');
      setError(err.message);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium text-gray-900 mb-2">Backend Connection Status</h3>
      <p className={`text-sm ${backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
        {backendStatus}
      </p>
      {error && (
        <p className="text-xs text-red-500 mt-1">Error: {error}</p>
      )}
      <button 
        onClick={testConnection}
        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default ConnectionTest;