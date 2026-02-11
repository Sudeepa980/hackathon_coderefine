
import React from 'react';
import { Terminal, Github, User, LogOut } from 'lucide-react';

interface NavbarProps {
  user: any | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onSignupClick, onLogout, onGoHome }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onGoHome}
      >
        <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
          <Terminal className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          CodeRefine<span className="text-indigo-500">.ai</span>
        </span>
      </div>

      <div className="flex items-center gap-6">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
          <Github className="w-5 h-5" />
        </a>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 p-2 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={onSignupClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
