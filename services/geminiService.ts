
import { GoogleGenAI } from "@google/genai";
import { Finding } from "../types";

export const analyzeFindings = async (findings: Finding[]) => {
  if (findings.length === 0) return "Intelligence Core: Awaiting telemetry data for correlation analysis.";

  // @ts-ignore - Using process.env.API_KEY as per GenAI instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Context: Red Team Engagement Analysis.
    Data Pool: Multi-phase security audit (Recon, Enumeration, Exploitation, Cloud).
    
    Source Tools Integrated:
    - Infrastructure: Amass, Masscan, Nmap-NSE
    - Vulnerability: Nuclei, Sqlmap, Nikto
    - Secrets: Gitleaks
    - Cloud: Kube-Hunter, Checkov

    Findings Dataset:
    ${JSON.stringify(findings.map(f => ({
      title: f.title,
      tool: f.tool,
      target: f.target,
      severity: f.severity,
      desc: f.description
    })), null, 2)}

    Required Intelligence Output:
    1. EXPLOIT CHAINING: Describe how an attacker can leverage low-severity recon data (like subdomains) combined with discovered vulnerabilities (like SQLi) to reach a critical asset (like the K8s cluster).
    2. BLAST RADIUS: Estimate the potential impact of the most critical finding.
    3. REMEDIATION PRIORITY: Identify the 'Golden Fix'—the one change that provides the highest security ROI.
    4. ATTACKER PERSPECTIVE: How would a professional adversary view this infrastructure based on these findings?
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 15000 }
      },
    });

    return response.text || "Intelligence Core: Unable to synthesize attack chains from current data.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Intelligence Core unavailable. Check API credentials or network availability.";
  }
};
