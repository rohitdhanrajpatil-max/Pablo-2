
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
    Act as a professional hospitality editor for "${info.hotelName}". 
    The guest stayed for ${info.nightsStay} night(s) and provided feedback in their native language.
    
    RAW GUEST INPUT (MAY BE IN ANY LANGUAGE): "${rawTranscript}"
    
    YOUR MISSION:
    1. TRANSLATE: If the input is not in English, translate it accurately to English.
    2. HUMANIZE: Rewrite the translated feedback into a natural, "typed-on-a-phone" English review.
    
    STRICT "ANTI-AI" STYLE RULES FOR THE ENGLISH OUTPUT:
    - NO "AI STRUCTURE": Do not use formal intros like "My stay was..." or formal conclusions.
    - NO CORPORATE TRANSITIONS: Ban "Moreover," "Furthermore," "In summary," or "Additionally."
    - NO AI CLICHÉS: Ban "nestled," "hidden gem," "impeccable," "a testament to," or "seamless."
    - USE CASUAL PHRASING: Use "Actually," "Honestly," "The best bit was," "Bit of a letdown that," "Heads up for others."
    - REAL-WORLD GRAMMAR: Use contractions (it's, wasn't, we'll). It's okay to use fragments or start sentences with "And" or "But".
    - VARY THE FLOW: Mix short punchy observations with one slightly longer, conversational thought.
    - PRESERVE DETAILS: Keep any specific names of staff, food, or room numbers mentioned.
    
    THE FINAL VIBE: 
    It should look like a 4 or 5-star Google Maps or TripAdvisor review written by a real traveler on the move. Impulsive, honest, and completely devoid of "GPT-speak".
    
    Output ONLY the final English review text. No translation notes. No quotes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.85,
        topP: 0.95,
      },
    });

    if (!response || !response.text) {
      throw new Error("The AI returned an empty response. This might be due to content safety filters.");
    }

    let result = response.text.trim();
    
    // Clean up common AI prefixes if they slip through
    result = result.replace(/^(Here is a humanized version: |Review: |"|')/i, '');
    result = result.replace(/("|')$/, '');
    
    return result;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    const errorMessage = error.message || "";
    if (errorMessage.includes("403")) {
      throw new Error("Access denied (403). Please verify your API key permissions.");
    } else if (errorMessage.includes("429")) {
      throw new Error("Rate limit exceeded (429). Please wait a moment.");
    }
    
    throw new Error(`AI Service Error: ${errorMessage || "An unexpected error occurred."}`);
  }
};
