export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing on Vercel" });
    }

    let GoogleGenAI;
    try {
      const mod = await import("@google/genai");
      GoogleGenAI = mod.GoogleGenAI;
    } catch (e) {
      return res.status(500).json({
        error: "Package @google/genai is not installed",
        detail: e.message
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert in cat body-language observation.
Analyze the cat in the image and estimate visible behavioral features.

Return only JSON.

{
  "features": {
    "ears": "forward|sideways|back|flat|unknown",
    "eyes": "soft|wide|half_closed|staring|unknown",
    "pupils": "normal|large|small|unknown",
    "tail": "up|down|tucked|puffed|relaxed|unknown",
    "body": "relaxed|low|tense|arched|unknown",
    "fur": "normal|puffed|unknown",
    "mouth": "closed|open|hissing|unknown"
  },
  "confidence": 0,
  "summary_ja": "",
  "summary_en": "",
  "summary_th": ""
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

    const text = response.text;
    const json = JSON.parse(text);

    return res.status(200).json(json);

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
