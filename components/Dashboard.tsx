
import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, Play, Bug, Zap, List, Clock, Maximize, ShieldAlert, 
  Lightbulb, Brain, Layers, BarChart3, Loader2, RefreshCcw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Language, AnalysisOption, CodeAnalysisResult } from '../types';
import { analyzeCode } from '../services/geminiService';
import { generateDiff, removeComments, generateDiffExplanation } from '../utils/diffUtils';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const ANALYSIS_CARDS = [
  { id: AnalysisOption.FIX_BUGS, icon: Bug, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: AnalysisOption.OPTIMIZE, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: AnalysisOption.EXPLAIN_DIFF, icon: Layers, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: AnalysisOption.SUGGESTIONS, icon: List, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: AnalysisOption.TIME_COMPLEXITY, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: AnalysisOption.SPACE_COMPLEXITY, icon: Maximize, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: AnalysisOption.SECURITY, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: AnalysisOption.ALTERNATIVES, icon: Lightbulb, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: AnalysisOption.ELI5, icon: Brain, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: AnalysisOption.ALL, icon: BarChart3, color: 'text-white', bg: 'bg-indigo-600' },
];

const Dashboard: React.FC = () => {
  const [language, setLanguage] = useState<Language>('javascript');
  const [inputCode, setInputCode] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<AnalysisOption[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);

  const toggleOption = (option: AnalysisOption) => {
    if (option === AnalysisOption.ALL) {
      if (selectedOptions.length === ANALYSIS_CARDS.length - 1) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions(ANALYSIS_CARDS.filter(c => c.id !== AnalysisOption.ALL).map(c => c.id as AnalysisOption));
      }
      return;
    }

    setSelectedOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleRunAnalysis = async () => {
    if (!inputCode.trim()) return;
    setIsAnalyzing(true);
    try {
      const report = await analyzeCode(inputCode, language, selectedOptions);
      setResult(report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Analysis failed", error);
      alert(`Failed to analyze code: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = result ? [
    { name: 'Lines In', value: inputCode.split('\n').length },
    { name: 'Lines Out', value: result.optimizedCode.split('\n').length },
    { name: 'Complexity', value: result.diffStats.complexityScore },
  ] : [];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Code Analysis Dashboard</h1>
          <p className="text-slate-400">Paste your code and select the refinements you need.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === lang.value 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Left Panel - Input */}
        <div className="flex flex-col h-[600px] glass rounded-2xl overflow-hidden border-slate-800">
          <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Input Source</span>
            <button 
              onClick={() => setInputCode('')}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`// Paste your ${language} code here...`}
            className="flex-1 bg-transparent p-6 code-font text-sm leading-relaxed resize-none focus:outline-none placeholder-slate-600"
          />
        </div>

        {/* Right Panel - Output */}
        <div className="flex flex-col h-[600px] glass rounded-2xl overflow-hidden border-slate-800 relative">
          <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Optimized Code</span>
              {result && (
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="text-emerald-400">+{result.diffStats.linesAdded} lines</span>
                  <span className="text-rose-400">-{result.diffStats.linesRemoved} lines</span>
                </div>
              )}
            </div>
            {result && (
              <button 
                onClick={() => handleCopy(result.optimizedCode)}
                className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 text-xs font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto bg-[#0d1117] p-6 code-font text-sm leading-relaxed">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="animate-pulse">Analyzing logic & security patterns...</p>
              </div>
            ) : result ? (
              <pre className="text-slate-300 whitespace-pre-wrap break-words">
                {generateDiff(inputCode, removeComments(result.optimizedCode, language)).map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.type === 'added'
                        ? 'bg-green-950/40 text-green-300'
                        : line.type === 'removed'
                        ? 'bg-red-950/40 text-red-300'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="inline-block w-8 text-right pr-2">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    {line.content}
                  </div>
                ))}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Refined code will appear here after analysis
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {ANALYSIS_CARDS.map(card => (
          <button
            key={card.id}
            onClick={() => toggleOption(card.id as AnalysisOption)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all active:scale-95 group ${
              selectedOptions.includes(card.id as AnalysisOption) || (card.id === AnalysisOption.ALL && selectedOptions.length === ANALYSIS_CARDS.length - 1)
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'glass border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`p-3 rounded-xl mb-3 ${card.bg} group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-6 h-6 ${card.color} ${
                (selectedOptions.includes(card.id as AnalysisOption) || card.id === AnalysisOption.ALL) ? 'text-white' : ''
              }`} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-center">{card.id}</span>
          </button>
        ))}
      </div>

      {/* Action Button */}
      <div className="flex justify-center mb-16">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || !inputCode.trim() || selectedOptions.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-indigo-600/30 flex items-center gap-3 transition-all active:scale-95"
        >
          {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
          {isAnalyzing ? 'Refining Code...' : 'Execute Analysis'}
        </button>
      </div>

      {/* Detailed Analysis Reports */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Bug Fixes Section */}
          {selectedOptions.includes(AnalysisOption.FIX_BUGS) && (
            <div className="glass p-8 rounded-3xl border-rose-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                  <Bug className="w-5 h-5" /> Bug Fixes
                </h3>
                {result.bugFixes.length > 0 ? (
                  <button
                    onClick={() => setShowBugModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    View {result.bugFixes.length} Error{result.bugFixes.length !== 1 ? 's' : ''}
                  </button>
                ) : null}
              </div>
              {result.bugFixes.length > 0 ? (
                <p className="text-sm text-slate-300">
                  Found <span className="font-bold text-rose-400">{result.bugFixes.length}</span> bug{result.bugFixes.length !== 1 ? 's' : ''} that need{result.bugFixes.length !== 1 ? '' : 's'} fixing.
                </p>
              ) : (
                <div className="p-6 bg-emerald-950/30 border border-emerald-600/30 rounded-2xl">
                  <p className="text-emerald-300 font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5" /> No errors detected. Your code looks clean!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bug Modal */}
          {showBugModal && result.bugFixes.length > 0 && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl">
                <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-900 flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-rose-400">
                    <Bug className="w-6 h-6" /> Bugs Found ({result.bugFixes.length})
                  </h2>
                  <button
                    onClick={() => setShowBugModal(false)}
                    className="text-slate-400 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {result.bugFixes.map((bug, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-rose-600/30">
                      <div className="flex items-start gap-3">
                        <div className="bg-rose-600/30 rounded-full p-2 flex-shrink-0">
                          <Bug className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-rose-300 mb-1">Bug #{idx + 1}</div>
                          <p className="text-sm text-slate-300 leading-relaxed">{bug}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedOptions.includes(AnalysisOption.OPTIMIZE) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stats Chart */}
            <div className="glass p-8 rounded-3xl col-span-1 border-slate-800">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Metrics Visualization
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#818cf8' : index === 1 ? '#34d399' : '#f87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complexity Table */}
            {(selectedOptions.includes(AnalysisOption.TIME_COMPLEXITY) || selectedOptions.includes(AnalysisOption.SPACE_COMPLEXITY)) && (
            <div className="glass p-8 rounded-3xl col-span-1 md:col-span-2 border-slate-800">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" /> Complexity Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">Time Complexity</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-rose-400 line-through text-sm">{result.timeComplexity.original}</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className="text-emerald-400 font-bold">{result.timeComplexity.optimized}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.timeComplexity.explanation}</p>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">Space Complexity</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-rose-400 line-through text-sm">{result.spaceComplexity.original}</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className="text-emerald-400 font-bold">{result.spaceComplexity.optimized}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.spaceComplexity.explanation}</p>
                </div>
              </div>
            </div>
            )}
          </div>
          )}

          {selectedOptions.includes(AnalysisOption.SECURITY) && (
          <div className="glass p-8 rounded-3xl border-rose-500/20">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" /> Security Vulnerabilities
            </h3>
              <div className="space-y-4">
                {result.securityVulnerabilities.length > 0 ? result.securityVulnerabilities.map((vuln, i) => (
                  <div key={i} className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500 text-white uppercase">{vuln.severity}</span>
                    </div>
                    <div className="text-sm font-semibold mb-2">{vuln.issue}</div>
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <span className="text-indigo-400 font-bold">Fix:</span> {vuln.fix}
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 p-4 rounded-2xl border border-emerald-400/20">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold text-sm">No critical security issues found!</span>
                  </div>
                )}
            </div>
          </div>
          )}

          {(selectedOptions.includes(AnalysisOption.SUGGESTIONS) || selectedOptions.includes(AnalysisOption.ELI5)) && (
          <div className="space-y-8">
            {selectedOptions.includes(AnalysisOption.SUGGESTIONS) && (
            <div className="glass p-8 rounded-3xl border-emerald-500/20">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <Lightbulb className="w-5 h-5" /> Smart Suggestions
              </h3>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedOptions.includes(AnalysisOption.ELI5) && (
            <div className="glass p-8 rounded-3xl border-pink-500/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-pink-400">
                <Brain className="w-5 h-5" /> ELI5: Simple Summary
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{result.eli5}"</p>
            </div>
            )}
          </div>
          )}

          {selectedOptions.includes(AnalysisOption.ALTERNATIVES) && (
          <div className="glass p-8 rounded-3xl border-indigo-500/20">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-indigo-400">
              <Layers className="w-5 h-5" /> Different Approaches to Solve
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.alternatives.map((alt, i) => (
                <div key={i} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                  <h4 className="font-bold mb-4 text-indigo-300 underline underline-offset-4">{alt.approach}</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-1">PROS</div>
                      <div className="text-xs text-slate-400">{alt.pros}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter mb-1">CONS</div>
                      <div className="text-xs text-slate-400">{alt.cons}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>          )}

          {selectedOptions.includes(AnalysisOption.EXPLAIN_DIFF) && (
          <div className="glass p-8 rounded-3xl border-indigo-500/20">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-indigo-400">
              <Layers className="w-5 h-5" /> Comparison: What Changed & Why
            </h3>
            {(() => {
              const comparison = generateDiffExplanation(inputCode, removeComments(result.optimizedCode, language));
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Brute Force / Original */}
                  <div className="bg-rose-950/30 border-2 border-rose-600/40 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-rose-300 mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 bg-rose-600/40 rounded-full flex items-center justify-center text-sm">✗</span>
                      {comparison.bruteForceName}
                    </h4>
                    <div className="space-y-4">
                      {comparison.bruteForcePoints.map((point, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="text-rose-400 text-xl font-bold flex-shrink-0">•</div>
                          <p className="text-rose-200 text-sm leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optimized Solution */}
                  <div className="bg-emerald-950/30 border-2 border-emerald-600/40 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-emerald-300 mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 bg-emerald-600/40 rounded-full flex items-center justify-center text-sm">✓</span>
                      {comparison.optimizedName}
                    </h4>
                    <div className="space-y-4">
                      {comparison.optimizedPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="text-emerald-400 text-xl font-bold flex-shrink-0">👉</div>
                          <p className="text-emerald-200 text-sm leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          )}        </div>
      )}
    </div>
  );
};

export default Dashboard;

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
