// api/generate.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const { userQuery, systemPrompt = "" } = req.body || {};
    if (!userQuery || typeof userQuery !== "string") {
      return res.status(400).json({ error: "missing_user_query" });
    }

    const apiKey = process.env.GEMINI_API_KEY; // la pondrás en Vercel (paso 3)
    if (!apiKey) return res.status(500).json({ error: "missing_api_key_server" });

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" +
      apiKey;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ google_search: {} }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "upstream_error", details: text });
    }

    const json = await r.json();
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "proxy_error", message: String(e) });
  }
}
