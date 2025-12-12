export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const HF_KEY = process.env.HF_API_KEY;
    if (!HF_KEY) {
      return res.status(500).json({ error: "Missing HF_API_KEY" });
    }

    // Free, high-quality lightweight model
    const model = "meta-llama/Llama-3.2-3B-Instruct";

    const r = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are ProCrafted AI, a helpful construction assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await r.json();

    if (!r.ok || data.error) {
      console.error("HF Router Error:", data);
      return res.status(502).json({
        error: data.error || "HF Router returned an error",
        details: data
      });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply generated.";

    return res.json({
      reply: reply.trim(),
      model,
    });

  } catch (err) {
    console.error("HF Router exception:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
