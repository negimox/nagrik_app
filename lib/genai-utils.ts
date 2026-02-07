/**
 * Utility functions for handling Google Gen AI interactions
 */

import { GoogleGenAI } from "@google/genai";

// Create and export the AI client - will be initialized when imported
export const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

/**
 * Load an image from a URL or File and return it as an HTMLImageElement
 */
export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    if (typeof src === "string") {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }

    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

/**
 * Interface for detected objects with enhanced properties
 */
export interface EnhancedDetectedObject {
  name: string;
  confidence: number;
  condition?: string;
  description?: string;
  severity?: "Low" | "Medium" | "High";
}

/**
 * Process an image with Gemini AI to detect objects
 */
export async function detectObjectsInImage(
  imageFile: File,
  temperature = 0.2
): Promise<EnhancedDetectedObject[]> {
  try {
    // Max width/height to use for image processing
    const maxSize = 640;

    // Create a canvas to process the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Load the image
    const image = await loadImage(imageFile);

    // Scale down the image if needed
    const scale = Math.min(maxSize / image.width, maxSize / image.height);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    // Draw the scaled image on the canvas
    ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL("image/png");
    const base64Data = dataURL.replace("data:image/png;base64,", "");

    // This matches how Prompt.tsx calls the API
    const response = await genAI.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/png",
              },
            },
            {
              text: 'Analyze this image and identify infrastructure or civic issues (like potholes, broken streetlights, garbage, damaged facilities). For each issue detected, return a JSON array with objects containing: 1) "name" (what the object is), 2) "confidence" (number between 0-100), 3) "condition" (describe the condition - e.g. "broken", "damaged", "overflowing"), 4) "description" (2-3 sentence detailed description of the issue), and 5) "severity" (must be exactly "Low", "Medium", or "High" based on danger level and urgency). Example: [{"name": "streetlight", "confidence": 95.2, "condition": "broken", "description": "The streetlight pole is damaged and leaning to one side. The light fixture appears to be non-functional and poses a potential hazard.", "severity": "High"}, {"name": "road", "confidence": 99.0, "condition": "good", "description": "The road surface appears to be in acceptable condition with no major damage visible.", "severity": "Low"}]',
            },
          ],
        },
      ],
      config: {
        temperature,
      },
    });

    // Extract the text response - matches how Prompt.tsx extracts response
    let responseText = response.text || "";
    console.log("Raw response:", responseText);

    // Extract JSON from response if needed
    if (responseText.includes("```json")) {
      responseText = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      responseText = responseText.split("```")[1].split("```")[0].trim();
    }

    console.log("Extracted JSON:", responseText);

    // Parse the response
    const detectedObjects = JSON.parse(responseText);
    return detectedObjects;
  } catch (error) {
    console.error("Error detecting objects in image:", error);
    // Return some fallback for error cases
    return [
      {
        name: "image processing error",
        confidence: 100,
        condition: "error",
        description:
          "There was an error processing this image with AI. Please try again or upload a clearer image.",
        severity: "Medium",
      },
      {
        name: "please try again",
        confidence: 100,
        condition: "error",
        description:
          "The AI service encountered an issue analyzing this image. Try a different image or try again later.",
        severity: "Low",
      },
    ];
  }
}
