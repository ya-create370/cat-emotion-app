module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "GEMINI_API_KEY is missing on Vercel"
      });
    }

    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        ok: false,
        error: "imageBase64 is required"
      });
    }

    const prompt = `
You are analyzing a cat photo for a cat emotion web app.

Look at the cat and return ONLY valid JSON.
No markdown.
No explanation.
No code fence.

Use exactly this format:

{
  "eyes": "eyes_closed OR eyes_half_open OR eyes_soft OR eyes_staring OR unknown",
  "ears": "ears_neutral OR ears_back_soft OR ears_back_strong OR unknown",
  "paws": "paws_hanging OR paws_crossed OR paws_holding OR paws_pushing OR unknown",
  "tail": "unknown",
  "body": "sitting_normal OR lying_relaxed OR held_in_arms OR high_position OR unknown"
}

Rules:
- Return only one value for each group.
- If unclear, use "unknown".
- Do not invent keys outside the allowed list.
`.trim();

    const apiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 300
          }
        })
      }
    );

    const rawText = await apiResponse.text();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        ok: false,
        error: "Gemini API request failed",
        detail: rawText
      });
    }

    let geminiData;
    try {
      geminiData = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "Failed to parse Gemini response",
        detail: rawText
      });
    }

    const modelText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!modelText) {
      return res.status(500).json({
        ok: false,
        error: "Gemini returned empty text",
        detail: geminiData
      });
    }

    let cleaned = modelText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "Gemini text was not valid JSON",
        detail: cleaned
      });
    }

    return res.status(200).json({
      ok: true,
      eyes: parsed.eyes || "unknown",
      ears: parsed.ears || "unknown",
      paws: parsed.paws || "unknown",
      tail: parsed.tail || "unknown",
      body: parsed.body || "unknown"
    });
  } catch (error) {
    const msg = error.message || "Internal server error";

    if (
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("Quota exceeded")
    ) {
      return res.status(429).json({
        ok: false,
        error: "Gemini無料枠の上限に達しました。20〜60秒ほど待ってから、もう一度試してください。"
      });
    }

    return res.status(500).json({
      ok: false,
      error: msg
    });
  }
};
