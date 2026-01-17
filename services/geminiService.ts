
import { GoogleGenAI } from "@google/genai";
import { GuestInfo } from "../types";

export const generateHumanizedFeedback = async (
  rawTranscript: string,
  info: GuestInfo
): Promise<string> => {
  // Check network connectivity first
  if (!window.navigator.onLine) {
    throw new Error("No internet connection detected. Please check your network and try again.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a helpful assistant that helps hotel guests write honest, natural-sounding reviews based on their verbal feedback.
    
    Context:
    Hotel: "${info.hotelName}"
    Stay Duration: ${info.nightsStay} night(s)
    Guest's Raw Notes: "${rawTranscript}"
    
    Task:
    Rewrite the raw notes into a single paragraph that sounds exactly like a real person wrote it on Google Maps or TripAdvisor.
    
    CRITICAL RULES for a "Human" feel:
    1. DO NOT use AI-clichés like "nestled in," "impeccable service," "a testament to," "truly unforgettable," or "delightful stay."
    2. Use first-person ("I had," "We stayed").
    3. Keep the tone conversational. Use contractions (it's, didn't, we're).
    4. Vary sentence length. Some should be short and punchy.
    5. Be specific. If the guest mentioned a specific detail (like the coffee or the bed), keep that detail.
    6. Don't make it too perfect. Real people don't use perfectly balanced three-part adjectives in every sentence.
    7. If the guest had a complaint, keep the honest tone without being overly dramatic.
    
    GOAL: If a manager read this, they should believe a real guest typed it on their phone.
    
    Output ONLY the refined review text. No introductions or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8, // Slightly higher temperature for more varied, natural phrasing
        topP: 0.95,
      },
    });

    if (!response || !response.text) {
      throw new Error("The AI returned an empty response. This might be due to content safety filters.");
    }

    return response.text.trim().replace(/^"(.*)"$/, '$1'); // Remove wrapping quotes if AI adds them
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    const errorMessage = error.message || "";
    if (errorMessage.includes("403")) {
      throw new Error("Access denied (403). Please verify your API key permissions.");
    } else if (errorMessage.includes("429")) {
      throw new Error("Rate limit exceeded (429). Please wait a moment.");
    } else if (errorMessage.includes("500") || errorMessage.includes("503")) {
      throw new Error("Gemini server is currently busy. Please try again.");
    }
    
    throw new Error(`AI Service Error: ${errorMessage || "An unexpected error occurred."}`);
  }
};
