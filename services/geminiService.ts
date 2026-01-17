
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
    Act as a helpful assistant that turns a guest's spoken feedback into a natural-sounding, typed review for "${info.hotelName}". The guest stayed for ${info.nightsStay} night(s).
    
    Raw Verbal Notes: "${rawTranscript}"
    
    Task: 
    Rewrite this into a short, authentic review that looks like it was typed by a real person on their phone.
    
    STRICT "ANTI-AI" RULES:
    1. NO "AI STRUCTURE": Avoid the "intro-body-conclusion" sandwich. Do not start with "I recently stayed..." and end with "I highly recommend...".
    2. NO AI TRANSITIONS: Ban words like "Additionally," "Furthermore," "Moreover," "Overall," or "In conclusion."
    3. NO CLICHÉS: Ban "nestled," "hidden gem," "impeccable," "a testament to," "seamless," or "delightful."
    4. USE "PHONE-STYLE" PHRASING: Use "Actually," "Anyway," "The best part was," "Bit of a shame that," "Just a heads up."
    5. CASUAL GRAMMAR: Use contractions (it's, didn't, we'll). It's okay to start a sentence with "And" or "But" to keep it conversational.
    6. VARY SENTENCE FLOW: Mix short punchy thoughts with one longer, rambling thought. Real people don't write perfectly balanced sentences.
    7. SPECIFICITY: If the guest mentioned a specific staff name, room number, or food item, make sure it stays.
    8. NO WRAPPING QUOTES: Do not put the review in quotation marks.
    
    THE VIBE: 
    Think of a text message to a friend or a quick 4-star Google Maps review written while waiting for an Uber. It should feel slightly impulsive and very genuine.
    
    Output ONLY the review text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.85, // Slightly higher for more "human" variation
        topP: 0.95,
      },
    });

    if (!response || !response.text) {
      throw new Error("The AI returned an empty response. This might be due to content safety filters.");
    }

    // Double-check for any AI artifacts
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
    } else if (errorMessage.includes("500") || errorMessage.includes("503")) {
      throw new Error("Gemini server is currently busy. Please try again.");
    }
    
    throw new Error(`AI Service Error: ${errorMessage || "An unexpected error occurred."}`);
  }
};
