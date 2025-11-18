// api/ai.js (Hugging Face proxy)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const HF_KEY = process.env.HF_API_KEY;
    if (!HF_KEY) return res.status(500).json({ error: "Server misconfigured: missing HF_API_KEY" });

    // pick a model available for inference. Change this if needed.
    const MODEL = "google/flan-t5-large"; // fallback, fast and usually accessible
    // For instruction/chat style models: try "tiiuae/falcon-7b-instruct" or "meta-llama/Llama-2-7b-chat" if available.

    const payload = {
      inputs: `You are ProCrafted AI, a concise construction consultant. Answer user: ${message}`,
      parameters: { max_new_tokens: 200, temperature: 0.7 }
    };

    const r = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();

    if (!r.ok) {
      console.error("HuggingFace error:", text);
      return res.status(500).json({ error: "HuggingFace error", details: text });
    }

    // HF responses are sometimes raw text or JSON depending on model; we try parse
    let reply = text;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed[0]?.generated_text) {
        reply = parsed[0].generated_text;
      } else if (parsed?.generated_text) {
        reply = parsed.generated_text;
      } else if (parsed?.choices && parsed.choices[0]?.text) {
        reply = parsed.choices[0].text;
      } else if (typeof parsed === "string") {
        reply = parsed;
      }
    } catch (e) {
      // text remains as-is
    }

    return res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("Server error in /api/ai:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
