
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
  onSuccess: (user: any) => void;
  onSwitchMode: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating API call to Node/Express/MongoDB
    setTimeout(() => {
      onSuccess({
        id: '1',
        email,
        name: mode === 'signup' ? name : email.split('@')[0],
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass w-full max-w-md p-10 rounded-3xl border-slate-800 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-center mb-10">
          {mode === 'login' ? 'Continue your refining journey' : 'Join the elite code refinement community'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e293b] px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button className="w-full glass hover:bg-slate-800 text-slate-300 font-semibold py-3.5 rounded-xl border-slate-700 transition-all flex items-center justify-center gap-3">
            <Github className="w-5 h-5" />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-slate-400">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={onSwitchMode}
            className="text-indigo-400 font-bold hover:text-indigo-300"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
