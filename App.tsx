
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'login' | 'signup' | 'dashboard'>('home');

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={currentUser}
        onLoginClick={() => setView('login')}
        onSignupClick={() => setView('signup')}
        onLogout={handleLogout}
        onGoHome={() => setView(currentUser ? 'dashboard' : 'home')}
      />

      <main className="flex-1">
        {view === 'home' && (
          <Hero onGetStarted={() => setView(currentUser ? 'dashboard' : 'signup')} />
        )}

        {(view === 'login' || view === 'signup') && (
          <Auth 
            mode={view as 'login' | 'signup'} 
            onSuccess={handleAuthSuccess}
            onSwitchMode={() => setView(view === 'login' ? 'signup' : 'login')}
          />
        )}

        {view === 'dashboard' && currentUser && (
          <Dashboard />
        )}
      </main>

      <footer className="py-12 px-6 border-t border-slate-800 glass text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-200">CodeRefine.ai</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 CodeRefine AI Engine. Built for GenAI Hackathon.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
