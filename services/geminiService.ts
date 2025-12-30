
import { GoogleGenAI, Type } from "@google/genai";
import { Finding } from "../types";

export const analyzeFindings = async (findings: Finding[]) => {
  if (findings.length === 0) return "No findings to analyze.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following security findings from an automated penetration testing tool (Pentest-Pro).
    Provide a concise "Executive Summary" and a "Remediation Priority Strategy".
    
    Findings:
    ${JSON.stringify(findings, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    return response.text || "Failed to generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating AI analysis. Please ensure your findings are within valid context limits.";
  }
};
