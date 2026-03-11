/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
    throw new Error("No image was generated. Please try again.");
  }

  return {
    imageUrl,
    description: description || `A beautiful ${styleInfo.name} kitchen reimagined from your photo.`
  };
}
