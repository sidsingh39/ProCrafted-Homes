// api/ai.js (Vercel serverless function)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // Basic rate-limit (in-memory) — light protection
    // For production use a proper store like Redis; this is just minimal
    if (!global.__aiRate) global.__aiRate = {};
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const bucket = global.__aiRate[ip] || { last: 0, count: 0 };
    if (now - bucket.last < 1000) bucket.count++;
    else bucket.count = 1;
    bucket.last = now;
    global.__aiRate[ip] = bucket;
    if (bucket.count > 8) return res.status(429).json({ error: "Too many requests, slow down." });

    // Build messages for chat completion
    const messages = [
      { role: "system", content: "You are ProCrafted AI, an expert construction consultant. Answer concisely and helpfully." },
      { role: "user", content: message }
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 250,
        temperature: 0.7,
        n: 1
      })
    });

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error("OpenAI error:", txt);
      return res.status(500).json({ error: "OpenAI error" });
    }

    const j = await openaiRes.json();
    const reply = j.choices?.[0]?.message?.content?.trim() || "No response";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
