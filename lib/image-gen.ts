import { GoogleGenAI } from "@google/genai";

export async function generateGameImages() {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  
  const prompts = [
    {
      id: 'osrs',
      prompt: "A high-quality, epic medieval fantasy landscape for Old School RuneScape (OSRS). In the background, a majestic stone castle sits atop a lush green hill under a bright, sunny sky with fluffy white clouds. In the foreground, a stone path leads through an ancient stone archway. To the right, a heroic warrior in ornate golden plate armor stands holding a glowing shield and a sword. To the left, ancient stone pillars are etched with glowing blue magical runes. The style is cinematic, vibrant, and detailed, capturing the essence of a classic adventure."
    },
    {
      id: 'rs3',
      prompt: "A high-quality, dark and immersive modern fantasy landscape for RuneScape 3. The scene is set at night under a large, glowing full moon and a starry sky. In the far distance, a dark, gothic castle looms on a mountain. In the foreground, a mysterious hooded figure in dark robes stands by an ancient stone structure, holding a swirling blue magical orb. A large, iconic fiery orange '3' symbol glows intensely in the center of the scene. The atmosphere is cinematic, moody, and filled with magical energy, with glowing blue runes on stone pillars."
    },
    {
      id: 'rsps',
      prompt: "A high-quality, dramatic fantasy landscape for RuneScape Private Servers (RSPS). The sky is a fiery sunset with deep oranges, purples, and reds. A large, menacing red dragon flies across the sky, breathing a stream of fire. In the background, a dark castle is perched on a rocky cliff. In the foreground, a rugged stone path leads toward an ancient, crumbling stone archway. Stone steps and pillars are decorated with glowing blue magical crystals and runes. The style is epic, cinematic, and intense."
    }
  ];

  const results: Record<string, string> = {};

  for (const item of prompts) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: item.prompt }],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        results[item.id] = `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  return results;
}
