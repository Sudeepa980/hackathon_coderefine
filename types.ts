
export type Language = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java' | 'go' | 'rust';

export interface CodeAnalysisResult {
  optimizedCode: string;
  bugFixes: string[];
  performanceImprovements: string[];
  securityVulnerabilities: {
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    issue: string;
    fix: string;
  }[];
  timeComplexity: {
    original: string;
    optimized: string;
    explanation: string;
  };
  spaceComplexity: {
    original: string;
    optimized: string;
    explanation: string;
  };
  suggestions: string[];
  eli5: string;
  diffStats: {
    linesAdded: number;
    linesRemoved: number;
    complexityScore: number;
  };
  alternatives: {
    approach: string;
    pros: string;
    cons: string;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export enum AnalysisOption {
  FIX_BUGS = 'Fix Bugs',
  OPTIMIZE = 'Optimize Code',
  EXPLAIN_DIFF = 'Explain Diff',
  SUGGESTIONS = 'Suggestions',
  TIME_COMPLEXITY = 'Time Complexity',
  SPACE_COMPLEXITY = 'Space Complexity',
  SECURITY = 'Security',
  ALTERNATIVES = 'Different Approaches',
  ELI5 = 'Explain Like I\'m 5',
  ALL = 'Select ALL'
}
