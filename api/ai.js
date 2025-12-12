export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ error: "No message provided" });

    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY)
      return res.status(500).json({ error: "Missing GOOGLE_API_KEY" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("Gemini error:", data);
      return res.status(502).json({
        error: "Gemini API request failed",
        details: data
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    return res.json({
      reply: reply.trim(),
      model: "gemini-1.5-flash"
    });

  } catch (err) {
    console.error("Server error in /api/ai:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
