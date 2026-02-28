"""
CodeRefine API: AI-powered code review and optimization for C and Python.
Uses rule-based + AST analysis; Gemini only for short, summarized explanations.
"""

import os
from pathlib import Path as _Path
_env_file = _Path(__file__).resolve().parent / ".env"
if _env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(_env_file)
    except ImportError:
        pass
import json
import sqlite3
import uuid
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from analyzers.static_analyzer import StaticAnalyzer
from analyzers.logic_analyzer import LogicAnalyzer
from analyzers.complexity_analyzer import ComplexityAnalyzer
from analyzers.optimization_engine import OptimizationEngine

# Optional Gemini (set GEMINI_API_KEY in env)
try:
    from genai.gemini_client import GeminiClient
except ImportError:
    GeminiClient = None

app = FastAPI(
    title="CodeRefine",
    description="AI-powered code review and optimization for C and Python",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Paths ---
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"
DATA_DIR = PROJECT_DIR / "database"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "history.db"
HISTORY_JSON = DATA_DIR / "history.json"


def get_db():
    """Create or connect to SQLite DB for history."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            language TEXT NOT NULL,
            code_preview TEXT,
            created_at TEXT NOT NULL,
            report TEXT
        )
    """)
    conn.commit()
    return conn


class AnalyzeRequest(BaseModel):
    code: str
    language: str  # "python" | "c"


class AnalyzeResponse(BaseModel):
    static_issues: list
    logic_issues: list
    complexity_issues: list
    estimated_complexity: str
    optimizations: list
    report_id: Optional[str] = None


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    """Run full analysis: static, logic, complexity, optimization. Gemini adds short summaries only."""
    lang = request.language.strip().lower()
    if lang not in ("python", "c"):
        raise HTTPException(status_code=400, detail="language must be 'python' or 'c'")
    code = request.code or ""

    static_analyzer = StaticAnalyzer(lang)
    logic_analyzer = LogicAnalyzer(lang)
    complexity_analyzer = ComplexityAnalyzer(lang)
    opt_engine = OptimizationEngine(lang, use_gemini=bool(os.environ.get("GEMINI_API_KEY")))

    static_issues = static_analyzer.analyze(code)
    logic_issues = logic_analyzer.analyze(code)
    complexity_issues, estimated_complexity = complexity_analyzer.analyze(code)
    optimizations = opt_engine.analyze(code, static_issues, logic_issues, complexity_issues)

    report = {
        "static_issues": static_issues,
        "logic_issues": logic_issues,
        "complexity_issues": complexity_issues,
        "estimated_complexity": estimated_complexity,
        "optimizations": optimizations,
    }
    report_id = str(uuid.uuid4())
    try:
        conn = get_db()
        preview = (code[:200] + "...") if len(code) > 200 else code
        conn.cursor().execute(
            "INSERT INTO history (id, language, code_preview, created_at, report) VALUES (?, ?, ?, ?, ?)",
            (report_id, lang, preview, datetime.utcnow().isoformat(), json.dumps(report)),
        )
        conn.commit()
        conn.close()
    except Exception:
        # Fallback to JSON file if SQLite fails
        try:
            data = []
            if HISTORY_JSON.exists():
                data = json.loads(HISTORY_JSON.read_text(encoding="utf-8"))
            data.append({
                "id": report_id,
                "language": lang,
                "code_preview": (code[:200] + "...") if len(code) > 200 else code,
                "created_at": datetime.utcnow().isoformat(),
                "report": report,
            })
            HISTORY_JSON.write_text(json.dumps(data[-100:], indent=2), encoding="utf-8")
        except Exception:
            report_id = None

    return AnalyzeResponse(
        static_issues=static_issues,
        logic_issues=logic_issues,
        complexity_issues=complexity_issues,
        estimated_complexity=estimated_complexity,
        optimizations=optimizations,
        report_id=report_id,
    )


@app.get("/api/history")
def history(limit: int = 20):
    """Return recent analysis history (from SQLite or JSON)."""
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, language, code_preview, created_at FROM history ORDER BY created_at DESC LIMIT ?",
            (limit,),
        )
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception:
        if HISTORY_JSON.exists():
            data = json.loads(HISTORY_JSON.read_text(encoding="utf-8"))
            return [{"id": r["id"], "language": r["language"], "code_preview": r.get("code_preview", ""), "created_at": r["created_at"]} for r in data[-limit:]]
        return []


@app.get("/api/history/{report_id}")
def get_report(report_id: str):
    """Fetch one report by id."""
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT report FROM history WHERE id = ?", (report_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            return json.loads(row["report"])
    except Exception:
        pass
    if HISTORY_JSON.exists():
        data = json.loads(HISTORY_JSON.read_text(encoding="utf-8"))
        for r in data:
            if r.get("id") == report_id:
                return r.get("report", {})
    raise HTTPException(status_code=404, detail="Report not found")


@app.get("/health")
def health():
    """API health check."""
    return {"app": "CodeRefine", "docs": "/docs", "health": "ok"}


# Serve frontend at root: "/" → index.html, "/style.css", "/script.js" from frontend/
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def index():
        raise HTTPException(status_code=404, detail="Frontend folder not found.")
