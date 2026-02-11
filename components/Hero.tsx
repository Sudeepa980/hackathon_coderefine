
import React from 'react';
import { ArrowRight, Zap, Shield, Search, Cpu, Code } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative pt-20 pb-32 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-300">New: Now powered by Llama 3.3 70B & Gemini 3 Pro</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Refine Your Code with <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Intelligent Automation
          </span>
        </h1>

        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          The ultimate GenAI-powered code review engine. Detect bugs, optimize performance, 
          and ensure secure coding practices in seconds. Stop debugging, start shipping.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <button 
            onClick={onGetStarted}
            className="group bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-xl font-bold text-lg text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all">
            View Sample Review
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="glass p-8 rounded-2xl hover:border-indigo-500/50 transition-colors">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Search className="text-indigo-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Deep Analysis</h3>
            <p className="text-slate-400">Identifies complex logic errors and edge cases that standard linters miss.</p>
          </div>

          <div className="glass p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
            <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Cpu className="text-purple-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Optimization</h3>
            <p className="text-slate-400">Rewrites your code for maximum performance and readability using best practices.</p>
          </div>

          <div className="glass p-8 rounded-2xl hover:border-emerald-500/50 transition-colors">
            <div className="bg-emerald-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Security First</h3>
            <p className="text-slate-400">Scans for OWASP vulnerabilities and provides secure coding alternatives automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
