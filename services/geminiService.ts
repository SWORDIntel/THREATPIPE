
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// As per Google GenAI guidelines, the API key is obtained exclusively from process.env.API_KEY.
// It's assumed this variable is pre-configured and accessible.
// This implies 'process' and 'process.env' should exist in the execution environment.

let ai: GoogleGenAI | null = null;
let geminiInitializationError: string | null = null;

if (typeof process !== 'undefined' && process.env) {
    const apiKeyFromEnv = process.env.API_KEY; // Use a variable for clarity and strictness
    if (apiKeyFromEnv) {
        try {
            // Directly use the retrieved API key, which must be process.env.API_KEY
            ai = new GoogleGenAI({ apiKey: apiKeyFromEnv });
        } catch (e) {
            console.error("Error initializing GoogleGenAI:", e);
            geminiInitializationError = "Failed to initialize Gemini API client";
            if (e instanceof Error) {
                geminiInitializationError += `: ${e.message}`;
            }
        }
    } else {
        geminiInitializationError = "Gemini API key (process.env.API_KEY) is not set. Gemini features will be disabled.";
    }
} else {
    geminiInitializationError = "'process.env' is not available in this environment. Gemini API key cannot be accessed. Gemini features will be disabled.";
}

if (geminiInitializationError && !ai) { // Log warning if initialization failed
    console.warn(geminiInitializationError);
}

const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

/**
 * Summarizes a given text using the Gemini API.
 * @param textToSummarize The text to be summarized.
 * @returns A promise that resolves to the summarized text.
 */
export const summarizeText = async (textToSummarize: string): Promise<string> => {
  if (!ai) {
    return geminiInitializationError || "Gemini API not initialized. Summary unavailable.";
  }

  if (!textToSummarize.trim()) {
    return "No text provided for summary.";
  }

  try {
    const prompt = `Please summarize the following text concisely for a cybersecurity analyst: \n\n"${textToSummarize}"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
            temperature: 0.3, 
            topK: 32,
            topP: 0.9,
        }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for summarization:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        return "Gemini API key is invalid. Summary unavailable.";
    }
    return "Failed to generate summary due to an API error.";
  }
};

/**
 * Example function to generate creative text or answer questions.
 * @param promptString The prompt for the model.
 * @returns A promise that resolves to the model's response.
 */
export const generateTextFromPrompt = async (promptString: string): Promise<string> => {
  if (!ai) {
    return geminiInitializationError || "Gemini API not initialized. Cannot generate text.";
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: promptString,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for text generation:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        return "Gemini API key is invalid. Text generation unavailable.";
    }
    return "Failed to generate text due to an API error.";
  }
};

// Placeholder for future functions, like image analysis if needed
// export const analyzeImageWithPrompt = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => { ... }