
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
    Act as a professional guest experience consultant for a luxury hotel group. 
    A guest has provided the following raw verbal feedback after staying at "${info.hotelName}" for ${info.nightsStay} night(s). 
    
    Raw Feedback: "${rawTranscript}"
    
    Task: 
    Rewrite this feedback into a polished, humanized, and naturally toned guest review. 
    It should sound warm, authentic, and sophisticated. 
    Maintain the core sentiment of the guest (whether positive, constructive, or mixed).
    Do not include any placeholders like [Guest Name] if they weren't provided.
    The final output should be a single paragraph review, ready to be sent to management or posted as a testimonial.
    
    Output only the refined review text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    if (!response || !response.text) {
      throw new Error("The AI returned an empty response. This might be due to content safety filters.");
    }

    return response.text.trim();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Handle specific Gemini API error patterns
    const errorMessage = error.message || "";
    if (errorMessage.includes("403")) {
      throw new Error("Access denied (403). Please verify your API key permissions and project settings.");
    } else if (errorMessage.includes("429")) {
      throw new Error("Rate limit exceeded (429). You are sending too many requests. Please wait a moment.");
    } else if (errorMessage.includes("500") || errorMessage.includes("503")) {
      throw new Error("Gemini server is currently overloaded or down (5xx). Please try again in a few minutes.");
    } else if (errorMessage.includes("quota")) {
      throw new Error("API quota exceeded. Please check your billing or usage limits.");
    }
    
    throw new Error(`AI Service Error: ${errorMessage || "An unexpected error occurred while processing your feedback."}`);
  }
};
