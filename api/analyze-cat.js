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
      error: {
        ja: "POSTメソッドのみ使えます。",
        en: "Only POST method is allowed.",
        th: "อนุญาตเฉพาะเมธอด POST เท่านั้น"
      },
      detail: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: {
          ja: "VercelにGEMINI_API_KEYが設定されていません。",
          en: "GEMINI_API_KEY is not set on Vercel.",
          th: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บน Vercel"
        },
        detail: "GEMINI_API_KEY is missing on Vercel"
      });
    }

    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        ok: false,
        error: {
          ja: "画像データがありません。",
          en: "Image data is missing.",
          th: "ไม่มีข้อมูลรูปภาพ"
        },
        detail: "imageBase64 is required"
      });
    }

    const prompt = `
You are analyzing a cat photo for a cat emotion web app.

Return ONLY valid JSON.
No markdown.
No explanation.
No code fence.

Use exactly this JSON format:

{
  "eyes": "eyes_closed OR eyes_half_open OR eyes_soft OR eyes_staring OR unknown",
  "ears": "ears_neutral OR ears_back_soft OR ears_back_strong OR unknown",
  "paws": "paws_hanging OR paws_crossed OR paws_holding OR paws_pushing OR unknown",
  "tail": "unknown",
  "body": "sitting_normal OR lying_relaxed OR held_in_arms OR high_position OR unknown"
}

Rules:
- Return exactly one value for each group.
- If unclear, use "unknown".
- Use only the allowed keys above.
- Be conservative. If you are not sure, choose "unknown".
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

    // 429 / quota エラーを先にわかりやすく返す
    if (
      rawText.includes('"code": 429') ||
      rawText.includes("RESOURCE_EXHAUSTED") ||
      rawText.includes("Quota exceeded")
    ) {
      return res.status(429).json({
        ok: false,
        error: {
          ja: "ただいまAI判定が混み合っています。20〜60秒ほど待ってから、もう一度お試しください。",
          en: "AI analysis is currently busy. Please wait about 20 to 60 seconds and try again.",
          th: "ขณะนี้ระบบวิเคราะห์ด้วย AI กำลังใช้งานหนาแน่น กรุณารอประมาณ 20 ถึง 60 วินาที แล้วลองใหม่อีกครั้ง"
        },
        detail: "Gemini quota exceeded"
      });
    }

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        ok: false,
        error: {
          ja: "AI判定でエラーが起きました。",
          en: "AI analysis failed.",
          th: "เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI"
        },
        detail: rawText
      });
    }

    let geminiData;
    try {
      geminiData = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: {
          ja: "Geminiの返り値を読めませんでした。",
          en: "Failed to parse Gemini response.",
          th: "ไม่สามารถอ่านผลลัพธ์จาก Gemini ได้"
        },
        detail: rawText
      });
    }

    const modelText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!modelText) {
      return res.status(500).json({
        ok: false,
        error: {
          ja: "Geminiの返答が空でした。",
          en: "Gemini returned an empty response.",
          th: "Gemini ส่งคำตอบว่างกลับมา"
        },
        detail: JSON.stringify(geminiData)
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
        error: {
          ja: "Geminiの返答がJSON形式ではありませんでした。",
          en: "Gemini response was not valid JSON.",
          th: "คำตอบจาก Gemini ไม่ได้อยู่ในรูปแบบ JSON ที่ถูกต้อง"
        },
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
        error: {
          ja: "ただいまAI判定が混み合っています。20〜60秒ほど待ってから、もう一度お試しください。",
          en: "AI analysis is currently busy. Please wait about 20 to 60 seconds and try again.",
          th: "ขณะนี้ระบบวิเคราะห์ด้วย AI กำลังใช้งานหนาแน่น กรุณารอประมาณ 20 ถึง 60 วินาที แล้วลองใหม่อีกครั้ง"
        },
        detail: "Gemini quota exceeded"
      });
    }

    return res.status(500).json({
      ok: false,
      error: {
        ja: "サーバーエラーが起きました。",
        en: "A server error occurred.",
        th: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์"
      },
      detail: msg
    });
  }
};
