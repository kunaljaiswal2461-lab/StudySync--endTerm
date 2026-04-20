import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { BookOpen, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(`/${window.location.search}`);
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-active/20 rounded-full  animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-focus/20 rounded-full  animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="max-w-md w-full space-y-8 bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem]  border border-white/5 relative z-10">
        <div className="text-center">
          <div className="w-20 h-20 bg-active/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-active/20 rotate-12 hover:rotate-0 transition-transform duration-500">
            <BookOpen className="h-10 w-10 text-active" />
          </div>
          <h2 className="mt-6 text-4xl font-black text-white tracking-tight uppercase">Welcome Back</h2>
          <p className="mt-2 text-slate-400 font-medium">Continue your journey into deep focus.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                className="input-field pl-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-active hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-active disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-active hover:text-teal-400">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
