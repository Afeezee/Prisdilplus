'use client';

import { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage for authentication
    const auth = sessionStorage.getItem('prisdilplus_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('prisdilplus_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('prisdilplus_admin_auth');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}