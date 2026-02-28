"""
Optimization and suggestion engine: rule-based detection plus Gemini for
short explanations. Merges rule-based results with AI summaries (3-5 bullets).
"""

from typing import List, Dict, Any, Optional
import ast
import re

# Optional Gemini for summaries (works when run from backend or project root)
try:
    from genai.gemini_client import GeminiClient
except ImportError:
    try:
        from backend.genai.gemini_client import GeminiClient
    except ImportError:
        GeminiClient = None


class OptimizationEngine:
    """Rule-based optimization detection; uses Gemini only for short explanations."""

    def __init__(self, language: str, use_gemini: bool = True):
        self.language = language.lower()
        self.gemini = GeminiClient() if (use_gemini and GeminiClient) else None
        self.suggestions: List[Dict[str, Any]] = []

    def analyze(self, source: str, static_issues: List[Dict], logic_issues: List[Dict], complexity_issues: List[Dict]) -> List[Dict[str, Any]]:
        """Build optimization suggestions from issues; add Gemini summary when available."""
        self.suggestions = []
        if self.language == "python":
            self._rules_python(source, static_issues, logic_issues, complexity_issues)
        else:
            self._rules_c(source, static_issues, logic_issues, complexity_issues)
        return self.suggestions

    def _add(self, line: int, opt_type: str, message: str, snippet: str = "", ai_summary: Optional[str] = None):
        self.suggestions.append({
            "line": line,
            "type": opt_type,
            "message": message,
            "snippet": snippet or "",
            "ai_summary": ai_summary,
            "category": "optimization",
        })

    def _gemini_explain(self, issue_type: str, context: str, line_ref: str = "") -> Optional[str]:
        if not self.gemini:
            return None
        return self.gemini.explain_issue(issue_type, context, line_ref)

    def _gemini_summarize_opt(self, opt_type: str, code: str) -> Optional[str]:
        if not self.gemini:
            return None
        return self.gemini.summarize_optimization(opt_type, code)

    def _rules_python(self, source: str, static: List, logic: List, complexity: List) -> None:
        lines = source.splitlines()
        # Map issues to optimizations and ask Gemini for short explanation
        for iss in static:
            if iss.get("type") == "unused_variable":
                ctx = iss.get("message", "") + " " + iss.get("snippet", "")
                summary = self._gemini_explain("unused variable", ctx, f"Line {iss['line']}")
                self._add(iss["line"], "remove_unused", "Remove unused variable to reduce clutter.", iss.get("snippet", ""), summary)
            elif iss.get("type") == "bad_practice":
                ctx = iss.get("message", "") + " " + iss.get("snippet", "")
                summary = self._gemini_explain("bad practice", ctx, f"Line {iss['line']}")
                self._add(iss["line"], "style_fix", iss["message"], iss.get("snippet", ""), summary)
        for iss in logic:
            if iss.get("type") == "nested_loop":
                snippet = iss.get("snippet", "") or _get_line(lines, iss["line"])
                summary = self._gemini_summarize_opt("nested loop optimization", snippet)
                self._add(iss["line"], "flatten_loop", "Consider flattening or early exit.", snippet, summary)
            elif iss.get("type") == "unreachable_code":
                summary = self._gemini_explain("unreachable code", iss.get("message", ""), f"Line {iss['line']}")
                self._add(iss["line"], "remove_dead_code", "Remove unreachable code.", iss.get("snippet", ""), summary)
        for iss in complexity:
            if iss.get("type") in ("nested_loop", "deep_loop"):
                snippet = iss.get("snippet", "") or _get_line(lines, iss["line"])
                summary = self._gemini_summarize_opt("time complexity", snippet)
                self._add(iss["line"], "complexity", f"Complexity: {iss.get('complexity', '')}. Consider better algorithm.", snippet, summary)

        # Rule-based: repeated computation in loop (len inside for)
        seen_len_lines = set()
        try:
            tree = ast.parse(source)
            for node in ast.walk(tree):
                if isinstance(node, ast.For):
                    for n in ast.walk(node):
                        if isinstance(n, ast.Call) and isinstance(getattr(n.func, "id", None), str):
                            if n.func.id == "len" and isinstance(n.args[0], ast.Name) and n.lineno not in seen_len_lines:
                                seen_len_lines.add(n.lineno)
                                self._add(n.lineno, "cache_len", "Move len() outside loop if iterable size is constant.", _get_line(lines, n.lineno), self._gemini_summarize_opt("cache length in loop", _get_line(lines, n.lineno)))
                                break
        except SyntaxError:
            pass

    def _rules_c(self, source: str, static: List, logic: List, complexity: List) -> None:
        lines = source.splitlines()
        for iss in static:
            if iss.get("type") == "unused_variable":
                ctx = iss.get("message", "") + " " + iss.get("snippet", "")
                summary = self._gemini_explain("unused variable in C", ctx, f"Line {iss['line']}")
                self._add(iss["line"], "remove_unused", "Remove unused variable.", iss.get("snippet", ""), summary)
        for iss in logic + complexity:
            if "nested" in iss.get("type", "") or "loop" in iss.get("type", ""):
                snippet = iss.get("snippet", "") or _get_line(lines, iss["line"])
                summary = self._gemini_summarize_opt("loop optimization in C", snippet)
                self._add(iss["line"], "loop_optimization", iss.get("message", "Consider optimizing loop."), snippet, summary)


def _get_line(lines: List[str], lineno: int) -> str:
    if 1 <= lineno <= len(lines):
        return lines[lineno - 1].strip()
    return ""
