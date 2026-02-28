"""
Gemini API client for short, summarized explanations only.
Used for: explaining issues, summarizing optimizations, suggesting improvements.
NOT used for: code generation, full analysis, or long explanations.
"""

import os
from typing import Optional

# Lazy import to avoid failure if key not set
_gemini_model = None


def _get_model():
    """Lazy-load Gemini model."""
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            api_key = os.environ.get("GEMINI_API_KEY", "")
            if not api_key:
                return None
            genai.configure(api_key=api_key)
            _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception:
            return None
    return _gemini_model


def get_concise_explanation(prompt: str, max_bullets: int = 5) -> Optional[str]:
    """
    Call Gemini for a short, bullet-point response only.
    Returns None if API key missing or on error (caller can use fallback).
    """
    model = _get_model()
    if not model:
        return None
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 150,
                "temperature": 0.3,
            },
        )
        if response and response.text:
            text = response.text.strip()
            # Enforce bullet format; take first N lines if more
            lines = [l.strip() for l in text.split("\n") if l.strip()][:max_bullets]
            return "\n".join(lines) if lines else text
        return None
    except Exception:
        return None


class GeminiClient:
    """Client for Gemini summarization only. All responses are short bullet lists."""

    def __init__(self):
        from .prompt_templates import PromptTemplates
        self.templates = PromptTemplates()

    def explain_issue(self, issue_type: str, context: str, line_ref: str = "") -> Optional[str]:
        prompt = self.templates.explain_issue(issue_type, context, line_ref)
        return get_concise_explanation(prompt)

    def summarize_optimization(self, optimization_type: str, code_snippet: str) -> Optional[str]:
        prompt = self.templates.summarize_optimization(optimization_type, code_snippet)
        return get_concise_explanation(prompt)

    def suggest_improvement(self, suggestion_type: str, context: str) -> Optional[str]:
        prompt = self.templates.suggest_improvement(suggestion_type, context)
        return get_concise_explanation(prompt)

    def explain_complexity(self, complexity: str, reason: str) -> Optional[str]:
        prompt = self.templates.explain_complexity(complexity, reason)
        return get_concise_explanation(prompt)
