export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const prompt = `
You are analyzing a cat photo for a cat emotion app.

Choose only from the allowed keys below.
If a feature is not visible, return "unknown".

Allowed values:
eyes: slow_blink, eyes_wide, eyes_narrow, pupils_large, unknown
ears: ears_forward, ears_side, ears_back, unknown
front_paws: kneading, paw_tense, paw_lift, ghost_pose, face_cover, paw_cross, paw_touch_face, paw_push, claws_out, hands_up, grab_hold, unknown
tail: tail_up, tail_tip_move, tail_fast, tail_tucked, unknown
body: loaf, body_low, belly_up, stretch, unknown

Return JSON only:
{
  "eyes": "",
  "ears": "",
  "front_paws": "",
  "tail": "",
  "body": ""
}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
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
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      detail: error.message
    });
  }
}
