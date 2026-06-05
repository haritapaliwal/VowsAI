import React, { useState } from 'react';
import { Heart, Lock, User, AlertCircle, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('vows_token', data.token);
        localStorage.setItem('vows_matchmaker', JSON.stringify(data.matchmaker));
        onLoginSuccess(data.matchmaker);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Cannot connect to matchmaking server. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Graphic elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gold-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass-panel-luxury p-8 rounded-3xl shadow-luxury relative overflow-hidden animate-scale-in">
        {/* Decorative Ring Pattern */}
        <div className="absolute -top-16 -right-16 w-32 h-32 border border-gold-300 rounded-full opacity-20"></div>
        <div className="absolute -top-8 -right-8 w-24 h-24 border border-brand-300 rounded-full opacity-20"></div>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-500 to-gold-400 rounded-2xl shadow-md mb-4 text-white">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif gold-gradient-text tracking-wide">VowsAI</h1>
          <p className="text-luxury-gray text-sm mt-1 font-medium">Bespoke Indian Matchmaking Dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-brand-50 border border-brand-100 text-brand-700 text-xs rounded-xl flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-brand-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
              Matchmaker Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gray">
                <User className="w-4 h-4 text-luxury-gray/70" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-luxury-lightgray rounded-xl text-sm transition-all focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/5 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gray">
                <Lock className="w-4 h-4 text-luxury-gray/70" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-luxury-lightgray rounded-xl text-sm transition-all focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/5 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-gold-500 hover:from-brand-500 hover:to-gold-600 text-white rounded-xl text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Access Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-luxury-lightgray/60 text-center">
          <p className="text-xs text-luxury-gray font-medium">
            Demo credentials: <code className="bg-luxury-lightgray/50 px-2 py-1 rounded text-brand-600 font-mono">admin</code> / <code className="bg-luxury-lightgray/50 px-2 py-1 rounded text-brand-600 font-mono">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
