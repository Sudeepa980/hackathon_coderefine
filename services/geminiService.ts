import { GoogleGenAI, Type } from "@google/genai";
import { CodeAnalysisResult, Language } from "../types";

function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set. Please check your .env file.");
  }
  
  return new GoogleGenAI({
    apiKey: apiKey
  });
}

export async function listAvailableModels(): Promise<void> {
  const ai = getAI();
  try {
    const models = await ai.models.list();
    console.log("Available models:", models);
  } catch (error) {
    console.error("Failed to list models:", error);
  }
}

export async function analyzeCode(
  code: string,
  language: Language,
  instructions: string[]
): Promise<CodeAnalysisResult> {
  const ai = getAI();

  const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze the following ${language} code and return a JSON response with these fields:
- optimizedCode: improved version of the code
- bugFixes: array of bugs found
- performanceImprovements: array of improvements
- securityVulnerabilities: array of {severity, issue, fix}
- timeComplexity: {original, optimized, explanation}
- spaceComplexity: {original, optimized, explanation}
- suggestions: array of suggestions
- eli5: explain like i'm 5 explanation
- diffStats: {linesAdded, linesRemoved, complexityScore}
- alternatives: array of {approach, pros, cons}

Requirements: ${instructions.join(", ")}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON, no other text.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text);
}
