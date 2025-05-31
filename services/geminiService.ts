
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API_KEY is set in your environment. For this frontend example,
// this would typically be handled by a backend proxy or a secure function.
// Directly embedding API keys in frontend code is NOT recommended for production.
// For this exercise, we assume process.env.API_KEY is available if this code were run in a Node.js context
// or a similar environment variable setup for a build process.
const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("Gemini API key not found. Gemini features will be disabled. Please set REACT_APP_GEMINI_API_KEY.");
}

const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17'; // General Text Tasks

/**
 * Summarizes a given text using the Gemini API.
 * @param textToSummarize The text to be summarized.
 * @returns A promise that resolves to the summarized text.
 */
export const summarizeText = async (textToSummarize: string): Promise<string> => {
  if (!ai) {
    return "Gemini API not initialized. Summary unavailable.";
  }

  if (!textToSummarize.trim()) {
    return "No text provided for summary.";
  }

  try {
    const prompt = `Please summarize the following text concisely for a cybersecurity analyst: \n\n"${textToSummarize}"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
            temperature: 0.3, // For more factual summaries
            topK: 32,
            topP: 0.9,
        }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for summarization:", error);
    // Consider more specific error handling based on GoogleGenAIError if needed
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
    return "Gemini API not initialized. Cannot generate text.";
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: promptString,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for text generation:", error);
    return "Failed to generate text due to an API error.";
  }
};

// Placeholder for future functions, e.g., image analysis if needed
// export const analyzeImageWithPrompt = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => { ... }

// Note: Actual image generation ('imagen-3.0-generate-002') is not included here as it's a different endpoint
// and typically involves handling image data directly, which might be more complex for this dashboard's initial scope.
