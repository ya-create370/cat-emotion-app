export default async function handler(req, res) {
  // CORS対応
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // プリフライト対応
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST以外は拒否
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    // ここではまず固定値を返して、通信と画面連携だけ確認する
    return res.status(200).json({
      features: {
        ears: "forward",
        eyes: "soft",
        pupils: "large",
        tail: "up",
        body: "relaxed"
      },
      confidence: 80,
      summary_ja: "テスト応答です",
      summary_en: "Test response",
      summary_th: "ผลลัพธ์ทดสอบ"
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
