(function () {
  "use strict";

  const API_BASE = ""; // same origin when served from backend
  const codeEl = document.getElementById("code");
  const languageEl = document.getElementById("language");
  const analyzeBtn = document.getElementById("analyze");
  const lineNumbersEl = document.getElementById("line-numbers");
  const resultsSection = document.getElementById("results-section");
  const complexityBar = document.getElementById("complexity-bar");
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  const listStatic = document.getElementById("list-static");
  const listLogic = document.getElementById("list-logic");
  const listComplexity = document.getElementById("list-complexity");
  const listOptimizations = document.getElementById("list-optimizations");

  function updateLineNumbers() {
    const lines = codeEl.value.split("\n").length;
    lineNumbersEl.textContent = Array.from({ length: Math.max(1, lines) }, (_, i) => i + 1).join("\n");
  }

  codeEl.addEventListener("input", updateLineNumbers);
  codeEl.addEventListener("scroll", function () {
    lineNumbersEl.scrollTop = codeEl.scrollTop;
  });
  updateLineNumbers();

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");
      tabs.forEach(function (t) {
        t.classList.toggle("active", t.getAttribute("data-tab") === targetTab);
      });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.id === "panel-" + targetTab);
      });
    });
  });

  function renderIssues(list, items, category) {
    list.innerHTML = "";
    if (!items || items.length === 0) {
      list.innerHTML = "<li class='empty'>No issues found.</li>";
      return;
    }
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.className = category;
      let html = "<span class='line'>Line " + (item.line || "?") + "</span>";
      html += "<div class='message'>" + escapeHtml(item.message || "") + "</div>";
      if (item.snippet) html += "<div class='snippet'>" + escapeHtml(item.snippet) + "</div>";
      if (item.ai_summary) html += "<div class='ai-summary'>" + escapeHtml(item.ai_summary) + "</div>";
      if (item.complexity) html += "<div class='snippet'>Complexity: " + escapeHtml(item.complexity) + "</div>";
      li.innerHTML = html;
      list.appendChild(li);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  analyzeBtn.addEventListener("click", function () {
    const code = codeEl.value.trim();
    const language = languageEl.value;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing…";

    fetch(API_BASE + "/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, language: language }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(function (data) {
        resultsSection.hidden = false;
        complexityBar.innerHTML = "Estimated time complexity: <strong>" + escapeHtml(data.estimated_complexity || "—") + "</strong>";
        renderIssues(listStatic, data.static_issues, "static");
        renderIssues(listLogic, data.logic_issues, "logic");
        renderIssues(listComplexity, data.complexity_issues, "complexity");
        renderIssues(listOptimizations, data.optimizations, "optimization");
      })
      .catch(function (err) {
        complexityBar.textContent = "Error: " + err.message + ". Is the backend running?";
        listStatic.innerHTML = "<li class='error'>Request failed. Start the backend with: uvicorn main:app --reload (from backend folder).</li>";
        listLogic.innerHTML = "";
        listComplexity.innerHTML = "";
        listOptimizations.innerHTML = "";
        resultsSection.hidden = false;
      })
      .finally(function () {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze";
      });
  });
})();
