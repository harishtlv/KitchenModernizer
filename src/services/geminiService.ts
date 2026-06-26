/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { logToCLI } from "./logger";

// Support multiple API keys separated by commas
const API_KEYS = (process.env.GEMINI_API_KEY || "").split(",").map(key => key.trim()).filter(key => key !== "");

export interface GenerationResult {
  imageUrl: string;
  description: string;
}

export const KITCHEN_STYLES = [
  { id: 'minimalist', name: 'Minimalist', description: 'Clean lines, neutral palette, and clutter-free surfaces.' },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Light woods, bright whites, and functional elegance.' },
  { id: 'industrial', name: 'Industrial', description: 'Exposed brick, dark metals, and raw textures.' },
  { id: 'modern-farmhouse', name: 'Modern Farmhouse', description: 'Rustic charm meets contemporary sleekness.' },
  { id: 'mid-century', name: 'Mid-Century Modern', description: 'Organic shapes, bold colors, and retro-futuristic vibes.' },
  { id: 'luxury-contemporary', name: 'Luxury Contemporary', description: 'High-end materials, marble accents, and dramatic lighting.' },
];

export async function generateKitchenInspiration(
  base64Image: string,
  mimeType: string,
  style: string
): Promise<GenerationResult> {
  const model = "gemini-2.5-flash-image";
  const styleInfo = KITCHEN_STYLES.find(s => s.id === style) || KITCHEN_STYLES[0];
  const prompt = `Transform this kitchen into a ${styleInfo.name} style. ${styleInfo.description} 
  Maintain the basic layout and structure of the room but replace the cabinets, countertops, flooring, and lighting with high-end modern versions of the ${styleInfo.name} aesthetic. 
  The result should be a photorealistic interior design visualization.`;

  if (API_KEYS.length === 0) {
    throw new Error("No Gemini API keys found. Please set GEMINI_API_KEY in your environment.");
  }

  await logToCLI('INFO', 'Starting kitchen generation', { style, model, availableKeys: API_KEYS.length });

  // Try each API key until one works
  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[i];
    const ai = new GoogleGenAI({ apiKey: currentKey });
    
    await logToCLI('INFO', `Attempting generation with API key ${i + 1}/${API_KEYS.length}`);

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      await logToCLI('INFO', `Received response from Gemini API using key ${i + 1}`);

      let imageUrl = "";
      let description = "";

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          description += part.text;
        }
      }

      if (!imageUrl) {
        await logToCLI('WARN', 'No image part found in response');
        throw new Error("No image was generated. Please try again.");
      }

      return {
        imageUrl,
        description: description || `A beautiful ${styleInfo.name} kitchen reimagined from your photo.`
      };
    } catch (error: any) {
      const isLastKey = i === API_KEYS.length - 1;
      await logToCLI('ERROR', `Gemini API Error with key ${i + 1}`, {
        message: error.message,
        retryAvailable: !isLastKey
      });

      if (isLastKey) {
        throw new Error(`All ${API_KEYS.length} API keys failed. Last error: ${error.message}`);
      }
      
      // Continue to next key in the loop
      continue;
    }
  }

  throw new Error("Unexpected error: Failed to generate inspiration with any available API key.");
}
