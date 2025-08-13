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
    <div className="mt-6 p-6 border border-gray-600 bg-gray-800 rounded-xl shadow-lg">
      <h3 className="text-lg font-medium text-white mb-2">Demo Mode</h3>
      <p className="text-sm text-gray-300 mb-4">
        Skip authentication and explore the dashboard with demo data
      </p>
      <button
        onClick={handleDemoLogin}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        Enter Demo Mode
      </button>
    </div>
  );
};

export default DemoLogin;