// api/ai.js — quick, pragmatic HF router with guaranteed-free fallbacks
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const HF_KEY = process.env.HF_API_KEY;
    console.log("HF key present?", Boolean(HF_KEY));
    if (!HF_KEY) return res.status(500).json({ error: "Server misconfigured: missing HF_API_KEY" });

    const url = "https://router.huggingface.co/hf-inference";

    // FAST, free-first candidate models (prioritise availability over quality)
    const candidates = [
      "distilgpt2",
      "gpt2",
      "sshleifer/tiny-gpt2"
    ];

    // Small prompt prefix to steer responses toward construction-help style.
    // Keep it short because these small models have tiny context windows.
    const promptPrefix = "You are ProCrafted AI, a concise construction assistant. Answer briefly and practically.\nUser: ";

    let lastError = null;
    for (const MODEL of candidates) {
      try {
        const payload = {
          model: MODEL,
          // small models expect "inputs" or "input" as raw text
          inputs: promptPrefix + message,
          parameters: { max_new_tokens: 120, temperature: 0.6 }
        };

        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${HF_KEY}`
          },
          body: JSON.stringify(payload)
        });

        const text = await r.text();

        if (!r.ok) {
          console.warn(`Model ${MODEL} returned ${r.status}:`, text);
          lastError = { model: MODEL, status: r.status, body: text };
          continue; // try next model
        }

        // parse common return shapes, fallback to raw text
        let reply = (text || "").trim();
        try {
          const parsed = JSON.parse(text);
          if (parsed === null) reply = "";
          else if (typeof parsed === "string") reply = parsed;
          else if (Array.isArray(parsed)) {
            reply = parsed[0]?.generated_text ?? parsed[0]?.output ?? JSON.stringify(parsed);
          } else {
            reply = parsed.generated_text ?? parsed.outputs?.[0]?.generated_text ?? parsed.result ?? parsed.output ?? JSON.stringify(parsed);
          }
        } catch (e) {
          // keep text as-is
        }

        console.log(`Model ${MODEL} succeeded.`);
        return res.json({ reply: String(reply).trim() || "No reply from model.", model: MODEL });
      } catch (err) {
        console.error(`Error calling model ${MODEL}:`, err);
        lastError = { model: MODEL, error: String(err) };
      }
    }

    return res.status(502).json({ error: "All models failed", details: lastError });
  } catch (err) {
    console.error("Server error in /api/ai:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
