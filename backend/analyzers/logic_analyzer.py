"""
Logic and pattern analysis: unnecessary nested loops, redundant computations,
unreachable code, beginner mistakes. AST-based for Python; pattern-based for C.
"""

import ast
import re
from typing import List, Dict, Any


class LogicAnalyzer:
    """Detects logic issues and common beginner mistakes."""

    def __init__(self, language: str):
        self.language = language.lower()
        self.issues: List[Dict[str, Any]] = []

    def analyze(self, source: str) -> List[Dict[str, Any]]:
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
            "category": "logic",
        })

    def _analyze_python(self, source: str) -> None:
        try:
            tree = ast.parse(source)
        except SyntaxError:
            return
        lines = source.splitlines()

        # Unreachable code after return/raise/break/continue
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                self._check_unreachable(node, lines)
            if isinstance(node, ast.For):
                self._check_nested_loops(node, lines)

        # Redundant: e.g. x == True -> use x
        for node in ast.walk(tree):
            if isinstance(node, ast.Compare) and len(node.ops) == 1:
                if isinstance(node.ops[0], ast.Eq):
                    if _is_true_false(node.comparators[0]):
                        self._add(node.lineno, "redundant_computation", "Compare to True/False; use the expression directly.", _line(lines, node.lineno))

    def _check_unreachable(self, func: ast.FunctionDef, lines: List[str]) -> None:
        for i, stmt in enumerate(func.body):
            if isinstance(stmt, (ast.Return, ast.Raise)) and i < len(func.body) - 1:
                next_stmt = func.body[i + 1]
                self._add(next_stmt.lineno, "unreachable_code", "Code after return/raise is unreachable.", _line(lines, next_stmt.lineno))
            if isinstance(stmt, (ast.Break, ast.Continue)) and i < len(func.body) - 1:
                next_stmt = func.body[i + 1]
                self._add(next_stmt.lineno, "unreachable_code", "Code after break/continue is unreachable.", _line(lines, next_stmt.lineno))

    def _check_nested_loops(self, node: ast.For, lines: List[str]) -> None:
        for child in ast.walk(node):
            if isinstance(child, ast.For) and child != node:
                self._add(child.lineno, "nested_loop", "Consider flattening or early exit to avoid deep nesting.", _line(lines, child.lineno))
                break

    def _analyze_c(self, source: str) -> None:
        lines = source.splitlines()
        # Unreachable after return
        for i, line in enumerate(lines, 1):
            if re.search(r"\breturn\s*[^;]*;", line) and i < len(lines):
                next_line = lines[i].strip()
                if next_line and not next_line.startswith("}"):
                    self._add(i + 1, "unreachable_code", "Code after return may be unreachable.", next_line)
        # Nested for/while
        depth = 0
        for i, line in enumerate(lines, 1):
            if re.match(r"\s*(for|while)\s*\(", line):
                depth += 1
                if depth >= 3:
                    self._add(i, "nested_loop", "Deep nesting; consider simplifying.", line.strip())
            if re.match(r"\s*}", line):
                depth = max(0, depth - 1)


def _line(lines: List[str], lineno: int) -> str:
    if 1 <= lineno <= len(lines):
        return lines[lineno - 1].strip()
    return ""


def _is_true_false(node: ast.AST) -> bool:
    return isinstance(node, ast.Constant) and node.value in (True, False)
