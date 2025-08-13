import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DemoLogin = () => {
  const { setUser, setIsAuthenticated } = useAuth();

  const handleDemoLogin = () => {
    // Simulate a successful login for demo purposes
    const demoUser = {
      id: 1,
      username: 'demo_manager',
      email: 'demo@purplemerit.com',
      role: 'manager'
    };
    
    // Set demo token
    localStorage.setItem('authToken', 'demo-token-for-testing');
    localStorage.setItem('user', JSON.stringify(demoUser));
    
    setUser(demoUser);
    setIsAuthenticated(true);
  };

  return (
    <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-medium text-blue-900 mb-2">Demo Mode</h3>
      <p className="text-sm text-blue-700 mb-3">
        Skip authentication and explore the dashboard with demo data
      </p>
      <button
        onClick={handleDemoLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Enter Demo Mode
      </button>
    </div>
  );
};

export default DemoLogin;