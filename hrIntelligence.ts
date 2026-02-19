
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { Employee, SalaryResearchResult, AIProvider } from "./types";

/**
 * CORE HR INTELLIGENCE SERVICE
 * Handles communication with both Advanced Cloud Nodes and Local Mistral Nodes.
 */

// Configuration State
let localEndpoint = localStorage.getItem('localUrl') || "http://localhost:11434/v1";
let localModel = localStorage.getItem('localModel') || "mistral:14b"; 
let currentProvider: AIProvider = localStorage.getItem('ai_provider') as AIProvider || AIProvider.LOCAL;

/**
 * Helper to extract JSON from potentially messy LLM output
 */
const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (inner) {
        console.error("Malformed JSON block:", match[0]);
      }
    }
    throw new Error("The AI response did not contain valid JSON data.");
  }
};

export const setAIProvider = (provider: AIProvider) => {
  currentProvider = provider;
  localStorage.setItem('ai_provider', provider);
};

export const setLocalConfig = (endpoint: string, model: string) => {
  localEndpoint = endpoint;
  localModel = model;
  localStorage.setItem('localUrl', endpoint);
  localStorage.setItem('localModel', model);
};

export const getAIClient = () => {
  // Always use the process.env.API_KEY directly for initialization following the SDK rules.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * CORE LOCAL ENGINE
 * Communicates with local Mistral/Ollama node
 */
export const localAIRequest = async (prompt: string, isJson: boolean = false) => {
  try {
    const response = await fetch(`${localEndpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: localModel,
        messages: [
          { 
            role: "system", 
            content: `You are a world-class HR Intelligence AI for Deriv UAE. Specialized in Trading, Software, and Creative sectors. ${isJson ? "Always respond in strictly valid JSON." : ""}` 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        ...(isJson && { response_format: { type: "json_object" } })
      }),
    });
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Local Node error (${response.status}): ${err}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Local Node Failure:", error);
    throw new Error(`Intelligence Node unreachable at ${localEndpoint}. Verify service is active.`);
  }
};

/**
 * FEATURE: SENTIMENT ANALYSIS
 */
export const analyzeSentiment = async (feedback: string) => {
  const prompt = `Analyze this employee feedback for a trading technology firm: "${feedback}". Rate happiness from 0 to 100 as an integer. Output JSON: { "sentiment": number, "concerns": string[], "action": string, "wellness": string[] }`;

  if (currentProvider === AIProvider.LOCAL) {
    const text = await localAIRequest(prompt, true);
    return extractJson(text);
  }

  const res = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return extractJson(res.text || "{}");
};

/**
 * FEATURE: CONTRACT GENERATION
 */
export const generateContract = async (data: {
  name: string;
  role: string;
  salary: string;
  nationality: string;
  signatoryName: string;
  signatoryRole: string;
  idType: string;
  idValue: string;
}) => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const formattedDate = today.replace(/(\d+)\s(\w+)\s(\d+)/, '$1 $2, $3');

  const prompt = `Generate a formal UAE Employment Contract for a role at Deriv UAE. 
  Contract Date: ${formattedDate}.
  Company: Deriv Technologies LLC. 
  Employee: ${data.name} (${data.nationality}). 
  Identification: ${data.idType} ${data.idValue}.
  Position: ${data.role}. 
  Salary: ${data.salary} AED/mo. 
  Signatory: ${data.signatoryName} (${data.signatoryRole}). 
  Include specific clauses for Proprietary Trading IP and UAE labor law. 
  Use Markdown.`;

  if (currentProvider === AIProvider.LOCAL) {
    return await localAIRequest(prompt);
  }

  const res = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return res.text;
};

/**
 * FEATURE: BURNOUT DETECTION
 */
export const analyzeBurnout = async (employee: Employee) => {
  const prompt = `Perform burnout diagnostics for this trading platform employee: ${JSON.stringify(employee.metrics)}. Output JSON: { "score": number, "level": "Low"|"Medium"|"High"|"Critical", "signals": string[], "actions": string[], "summary": string }`;
  
  if (currentProvider === AIProvider.LOCAL) {
    const text = await localAIRequest(prompt, true);
    return extractJson(text);
  }

  const res = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return extractJson(res.text || "{}");
};

/**
 * FEATURE: HIDDEN TALENT IDENTIFICATION
 */
export const analyzeTalent = async (employee: Employee) => {
  const prompt = `Analyze peer signals and performance for leadership potential in trading tech: ${JSON.stringify(employee)}. Output JSON: { "is_hidden_talent": boolean, "confidence": number, "evidence": string[], "recommendation": string }`;
  
  if (currentProvider === AIProvider.LOCAL) {
    const text = await localAIRequest(prompt, true);
    return extractJson(text);
  }

  const res = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return extractJson(res.text || "{}");
};

/**
 * FEATURE: CAREER ROADMAP
 */
export const generateCareerPath = async (employee: Employee) => {
  const prompt = `Create a 12-month career roadmap for ${employee.name} at a major trading firm. They are a ${employee.role}. Focus on skills in AI, Algorithmic Trading, or UX as appropriate. Output JSON: { "trajectory": string, "milestones": [{ "month": string, "goal": string, "skill": string }], "certifications": string[] }`;
  
  if (currentProvider === AIProvider.LOCAL) {
    const text = await localAIRequest(prompt, true);
    return extractJson(text);
  }

  const res = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return extractJson(res.text || "{}");
};

/**
 * FEATURE: SALARY RESEARCH
 */
export const researchSalary = async (role: string): Promise<SalaryResearchResult> => {
  const prompt = `Provide a short, precise salary range for '${role}' in the UAE fintech/trading sector (2024). Include subtle variations based on profile seniority and market standards (do not explicitly mention nationality). Just return the range and a single sentence of context.`;

  if (currentProvider === AIProvider.LOCAL) {
    const text = await localAIRequest(prompt);
    return { range: text || "Information unavailable locally.", sources: [], insight: "Calculated via Local Node." };
  }

  const response = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks.filter((c: any) => c.web).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
  return { range: response.text || "N/A", sources, insight: "Verified via Search Grounding." };
};

export const generateJD = async (role: string) => {
  const prompt = `Draft a high-standard Job Description for '${role}' at Deriv Technologies. Focus on technical excellence in trading systems. Use Markdown.`;
  return currentProvider === AIProvider.LOCAL 
    ? await localAIRequest(prompt) 
    : (await getAIClient().models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt })).text;
};

// AUDIO HELPERS
export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}
export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}
export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}
