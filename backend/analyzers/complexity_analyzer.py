"""
Time complexity estimation: O(n), O(n^2), etc.
Loop and recursion analysis; performance bottleneck highlighting.
"""

import ast
import re
from typing import List, Dict, Any, Tuple


class ComplexityAnalyzer:
    """Estimates time complexity and highlights bottlenecks."""

    def __init__(self, language: str):
        self.language = language.lower()
        self.issues: List[Dict[str, Any]] = []
        self.estimated_complexity: str = "O(1)"

    def analyze(self, source: str) -> Tuple[List[Dict[str, Any]], str]:
        """Returns (list of complexity-related issues, overall complexity string)."""
        self.issues = []
        self.estimated_complexity = "O(1)"
        if self.language == "python":
            self._analyze_python(source)
        else:
            self._analyze_c(source)
        return self.issues, self.estimated_complexity

    def _add(self, line: int, issue_type: str, message: str, complexity: str, snippet: str = ""):
        self.issues.append({
            "line": line,
            "type": issue_type,
            "message": message,
            "complexity": complexity,
            "snippet": snippet or "",
            "category": "complexity",
        })

    def _analyze_python(self, source: str) -> None:
        try:
            tree = ast.parse(source)
        except SyntaxError:
            return
        lines = source.splitlines()
        has_recursion = False
        max_depth = 0

        def depth_of(node: ast.AST, d: int) -> int:
            if isinstance(node, (ast.For, ast.While)):
                inner = d + 1
                for child in ast.iter_child_nodes(node):
                    inner = max(inner, depth_of(child, d + 1))
                return inner
            out = d
            for child in ast.iter_child_nodes(node):
                out = max(out, depth_of(child, d))
            return out

        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                depth = depth_of(node, 1)
                max_depth = max(max_depth, depth)
                if depth == 1:
                    self._add(node.lineno, "loop", "Single loop typically O(n).", "O(n)", _line(lines, node.lineno))
                elif depth == 2:
                    self._add(node.lineno, "nested_loop", "Nested loop can be O(n²) or O(n*m).", "O(n²)", _line(lines, node.lineno))
                else:
                    self._add(node.lineno, "deep_loop", "Deep nesting may cause high time complexity.", "O(n³)+", _line(lines, node.lineno))
            if isinstance(node, ast.Call) and isinstance(getattr(node.func, "id", None), str):
                if node.func.id in ("sorted", "min", "max", "sum"):
                    self._add(node.lineno, "builtin_loop", "Built-in may add O(n) per call.", "O(n)", _line(lines, node.lineno))
            if isinstance(node, ast.Call):
                f = node.func
                if isinstance(f, ast.Name) and f.id and _calls_self(tree, f.id):
                    has_recursion = True
                    self._add(node.lineno, "recursion", "Recursion: check base case and depth.", "O(recursion depth)", _line(lines, node.lineno))

        if max_depth >= 3 or has_recursion:
            self.estimated_complexity = "O(n³) or higher / recursion"
        elif max_depth == 2:
            self.estimated_complexity = "O(n²)"
        elif max_depth == 1:
            self.estimated_complexity = "O(n)"
        else:
            self.estimated_complexity = "O(1)"

    def _analyze_c(self, source: str) -> None:
        lines = source.splitlines()
        depth = 0
        for i, line in enumerate(lines, 1):
            if re.match(r"\s*(for|while)\s*\(", line):
                depth += 1
                if depth == 1:
                    self._add(i, "loop", "Single loop typically O(n).", "O(n)", line.strip())
                elif depth == 2:
                    self._add(i, "nested_loop", "Nested loop can be O(n²).", "O(n²)", line.strip())
                elif depth >= 3:
                    self._add(i, "deep_loop", "Deep nesting may cause high complexity.", "O(n³)+", line.strip())
            if re.match(r"\s*}", line):
                depth = max(0, depth - 1)
        self.estimated_complexity = "O(n²)" if depth >= 2 else ("O(n)" if depth >= 1 else "O(1)")


def _line(lines: List[str], lineno: int) -> str:
    if 1 <= lineno <= len(lines):
        return lines[lineno - 1].strip()
    return ""


def _calls_self(tree: ast.AST, func_name: str) -> bool:
    """Check if function named func_name is defined and calls itself."""
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == func_name:
            for n in ast.walk(node):
                if isinstance(n, ast.Call) and isinstance(getattr(n.func, "id", None), str) and n.func.id == func_name:
                    return True
    return False
