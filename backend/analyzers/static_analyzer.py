"""
Static code analysis: syntax errors, unused variables, bad practices, formatting.
Uses AST for Python; rule-based + optional parser for C.
"""

import ast
import re
from typing import List, Dict, Any, Optional

# C syntax check via parser is optional (pycparser often fails on #include / preprocessor)
HAS_PYCPARSER = False


class StaticAnalyzer:
    """Performs static analysis on Python and C code."""

    def __init__(self, language: str):
        self.language = language.lower()
        self.issues: List[Dict[str, Any]] = []

    def analyze(self, source: str) -> List[Dict[str, Any]]:
        """Run static analysis. Returns list of issues with line, type, message."""
        self.issues = []
        if self.language == "python":
            self._analyze_python(source)
        else:
            self._analyze_c(source)
        return self.issues

    def _add(self, line: int, issue_type: str, message: str, snippet: str = ""):
        self.issues.append({
            "line": line,
            "type": issue_type,
            "message": message,
            "snippet": snippet or "",
            "category": "static",
        })

    def _analyze_python(self, source: str) -> None:
        """Python: AST-based syntax, unused vars, and style checks."""
        lines = source.splitlines()
        # Syntax
        try:
            tree = ast.parse(source)
        except SyntaxError as e:
            self._add(e.lineno or 1, "syntax_error", str(e.msg), lines[e.lineno - 1].strip() if e.lineno else "")
            return
        # Unused variables: collect assignments and deletions, then find uses
        assigned = set()
        used = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Name):
                if isinstance(getattr(node, "ctx", None), ast.Store):
                    assigned.add(node.id)
                elif isinstance(getattr(node, "ctx", None), ast.Load):
                    used.add(node.id)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for a in node.args.args:
                    assigned.add(a.arg)
                for e in node.args.defaults:
                    for n in ast.walk(e):
                        if isinstance(n, ast.Name):
                            used.add(n.id)
        unused = assigned - used - {"_", "__builtins__"}
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(getattr(node, "ctx", None), ast.Store):
                if node.id in unused:
                    self._add(node.lineno, "unused_variable", f"Variable '{node.id}' is assigned but never used.", _line(lines, node.lineno))
        # Bad practices: == None, len(x)==0, etc.
        for node in ast.walk(tree):
            if isinstance(node, ast.Compare) and len(node.ops) == 1:
                if isinstance(node.ops[0], ast.Eq):
                    if _is_none(node.comparators[0]):
                        self._add(node.lineno, "bad_practice", "Use 'is None' instead of '== None'.", _line(lines, node.lineno))
                    if _is_const_zero(node.comparators[0]) and _is_len_call(node.left):
                        self._add(node.lineno, "bad_practice", "Use 'if not seq:' instead of 'if len(seq)==0'.", _line(lines, node.lineno))
        # Formatting: line length
        for i, line in enumerate(lines, 1):
            if len(line) > 100:
                self._add(i, "formatting", "Line exceeds 100 characters.", line[:80] + "...")

    def _analyze_c(self, source: str) -> None:
        """C: syntax (via parser or heuristic), unused vars, formatting."""
        lines = source.splitlines()
        if HAS_PYCPARSER:
            try:
                parser = c_parser.CParser()
                parser.parse(source)
            except Exception as e:
                self._add(1, "syntax_error", f"C parse error: {str(e)[:80]}", "")
        # Unused variables: simple regex for declarations and usage
        decl_pattern = re.compile(r"\b(int|float|double|char|short|long|void)\s*(\*?\s*)(\w+)\s*[;=,]")
        for i, line in enumerate(lines, 1):
            for m in decl_pattern.finditer(line):
                var = m.group(3)
                if var in ("return", "if", "for", "while", "switch"):
                    continue
                # Count occurrences of var as identifier (not in declaration)
                rest = source.replace(line, " ", 1)  # exclude declaration line once
                use_count = len(re.findall(r"\b" + re.escape(var) + r"\b", rest))
                if use_count <= 1:  # only declaration
                    self._add(i, "unused_variable", f"Variable '{var}' may be unused.", line.strip())
        # Formatting
        for i, line in enumerate(lines, 1):
            if len(line) > 100:
                self._add(i, "formatting", "Line exceeds 100 characters.", line[:80] + "...")


def _line(lines: List[str], lineno: int) -> str:
    if 1 <= lineno <= len(lines):
        return lines[lineno - 1].strip()
    return ""


def _is_none(node: ast.AST) -> bool:
    return isinstance(node, ast.Constant) and node.value is None


def _is_const_zero(node: ast.AST) -> bool:
    return isinstance(node, ast.Constant) and node.value == 0


def _is_len_call(node: ast.AST) -> bool:
    return isinstance(node, ast.Call) and isinstance(getattr(node, "func", None), ast.Name) and getattr(node.func, "id", "") == "len"
