import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCricketInsights(stats: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these cricket batting stats and provide 3 concise, professional coaching insights:
      Total Deliveries: ${stats.totalDeliveries}
      Average Speed: ${stats.avgSpeed} km/h
      Top Speed: ${stats.topSpeed} km/h
      Weakness: ${stats.weakness}
      
      Format as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating insights:", error);
    return stats.insights; // Fallback to mock insights
  }
}
