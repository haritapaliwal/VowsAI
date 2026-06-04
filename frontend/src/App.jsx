import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [matchmaker, setMatchmaker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('vows_token');
    const savedMatchmaker = localStorage.getItem('vows_matchmaker');

    if (token && savedMatchmaker) {
      try {
        setMatchmaker(JSON.parse(savedMatchmaker));
      } catch (e) {
        console.error('Error parsing saved matchmaker session', e);
        localStorage.removeItem('vows_token');
        localStorage.removeItem('vows_matchmaker');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (matchmakerData) => {
    setMatchmaker(matchmakerData);
  };

  const handleLogout = () => {
    setMatchmaker(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-cream text-luxury-gray text-sm font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading VowsAI portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased text-luxury-dark selection:bg-brand-100 selection:text-brand-900">
      {matchmaker ? (
        <Dashboard matchmaker={matchmaker} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
