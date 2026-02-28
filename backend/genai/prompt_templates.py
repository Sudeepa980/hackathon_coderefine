"""
Prompt templates for Gemini AI.
All prompts enforce SHORT, summarized, bullet-point (3-5 max) responses for students.
"""


class PromptTemplates:
    """Templates for Gemini summarization only. No code generation."""

    @staticmethod
    def explain_issue(issue_type: str, context: str, line_ref: str = "") -> str:
        """Ask Gemini to explain an issue in 3-5 bullets for beginners."""
        return f"""You are a coding mentor for students. Explain this code issue briefly.

Issue type: {issue_type}
Context: {context}
{f"Line reference: {line_ref}" if line_ref else ""}

Rules:
- Reply in exactly 3 to 5 short bullet points.
- Each bullet is one line, max 15 words.
- Use simple, student-friendly language.
- Do NOT write code. Do NOT give long paragraphs.
- Output ONLY the bullet list, no intro or conclusion."""

    @staticmethod
    def summarize_optimization(optimization_type: str, code_snippet: str) -> str:
        """Ask Gemini to summarize an optimization in 3-5 bullets."""
        return f"""You are a coding mentor. Summarize this optimization for a student.

Optimization type: {optimization_type}
Relevant code: {code_snippet[:500]}

Rules:
- Reply in exactly 3 to 5 short bullet points.
- Each bullet is one line, max 15 words.
- Explain WHY it helps, not how to implement.
- Do NOT write code. Do NOT give long paragraphs.
- Output ONLY the bullet list."""

    @staticmethod
    def suggest_improvement(suggestion_type: str, context: str) -> str:
        """Ask Gemini to suggest improvement in 3-5 bullets."""
        return f"""You are a coding mentor. Give a short improvement suggestion.

Suggestion type: {suggestion_type}
Context: {context[:400]}

Rules:
- Reply in exactly 3 to 5 short bullet points.
- Each bullet is one line, max 15 words.
- Student-friendly. No code. No long text.
- Output ONLY the bullet list."""

    @staticmethod
    def explain_complexity(complexity: str, reason: str) -> str:
        """Ask Gemini to explain time complexity in 3-5 bullets."""
        return f"""You are a coding mentor. Explain this time complexity to a student.

Complexity: {complexity}
Reason: {reason}

Rules:
- Reply in exactly 3 to 5 short bullet points.
- Each bullet is one line, max 15 words.
- Simple language. No code. No long paragraphs.
- Output ONLY the bullet list."""
