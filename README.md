# CodeRefine

AI-powered automated code review and optimization for **C** and **Python**. Acts as a virtual coding mentor for students.

- **Static analysis**: syntax errors, unused variables, bad practices, formatting
- **Logic analysis**: nested loops, redundant computations, unreachable code
- **Complexity estimation**: time complexity (O(n), O(n²), etc.), loop/recursion hints
- **Optimization suggestions**: rule-based detection + **Google Gemini** for short, summarized explanations (3–5 bullets, student-friendly)

## Tech stack

- **Backend**: Python, FastAPI, AST (Python) / pattern-based (C), rule-based analyzers, Gemini API
- **Frontend**: HTML, CSS, JavaScript (code editor + result panels)
- **Data**: SQLite (with JSON fallback) for analysis history

## Setup

### 1. Backend

```bash
cd CodeRefine/backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 2. Gemini API (optional but recommended)

Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey), then:

```bash
set GEMINI_API_KEY=your_key_here   # Windows
# export GEMINI_API_KEY=your_key_here  # macOS/Linux
```

If not set, analysis still runs; only the short AI explanation bullets are skipped.

### 3. Run backend

```bash
cd CodeRefine/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend

Open `CodeRefine/frontend/index.html` in a browser, or serve the folder with any static server (e.g. `python -m http.server 8080` from `frontend`). The app calls `http://127.0.0.1:8000` by default.

## Project structure

```
CodeRefine/
  backend/
    analyzers/       # static, logic, complexity, optimization (rule-based + AST)
    genai/           # Gemini client and prompt templates (summaries only)
    main.py          # FastAPI app and history
    requirements.txt
  frontend/
    index.html
    style.css
    script.js
  database/          # history.db (SQLite) or history.json
```

## API

- `POST /api/analyze` – body: `{ "code": "...", "language": "python" | "c" }` → full report
- `GET /api/history` – list recent analyses
- `GET /api/history/{id}` – get one report by id

## Rules

- **Gemini** is used only for short, bullet-point explanations (no long paragraphs, no full code generation).
- **Core analysis** is rule-based and AST-based; AI only enriches with student-friendly summaries.
