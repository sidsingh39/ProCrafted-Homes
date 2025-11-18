// api/ai.js  — Hugging Face Router (hf-inference) proxy
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const HF_KEY = process.env.HF_API_KEY;
    console.log("HF key present?", Boolean(HF_KEY));
    if (!HF_KEY) return res.status(500).json({ error: "Server misconfigured: missing HF_API_KEY" });

    // Pick a model that is commonly available; change if you prefer another.
    // NOTE: some models require paid access or enabling hosted inference on HF.
    const MODEL = "google/flan-t5-large";

    // router.huggingface.co/hf-inference is the recommended modern endpoint
    const url = "https://router.huggingface.co/hf-inference";

    const payload = {
      model: MODEL,
      // using 'input' / 'inputs' — many router-backed models understand this
      input: message,
      parameters: { max_new_tokens: 200, temperature: 0.7 }
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
      console.error("HuggingFace router error:", text);
      return res.status(500).json({ error: "HuggingFace error", details: text });
    }

    // Try to parse common shapes. Router may return plain text OR JSON.
    let reply = (text || "").trim();

    try {
      const parsed = JSON.parse(text);
      // Common possible shapes:
      // 1) { generated_text: "..." }
      // 2) [{ generated_text: "..." }, ...]
      // 3) { outputs: [{ generated_text: "..."}] }
      // 4) { result: "..." } or plain string in parsed
      if (parsed === null) {
        reply = "";
      } else if (typeof parsed === "string") {
        reply = parsed;
      } else if (Array.isArray(parsed)) {
        // array of results
        if (parsed[0]?.generated_text) reply = parsed[0].generated_text;
        else if (parsed[0]?.output) reply = parsed[0].output;
        else reply = JSON.stringify(parsed);
      } else {
        // object
        if (parsed.generated_text) reply = parsed.generated_text;
        else if (parsed.outputs && parsed.outputs[0]?.generated_text) reply = parsed.outputs[0].generated_text;
        else if (parsed.result) reply = parsed.result;
        else if (parsed.output) reply = parsed.output;
        else reply = JSON.stringify(parsed);
      }
    } catch (e) {
      // not JSON — keep text
    }

    return res.json({ reply: String(reply).trim() || "No reply from model." });
  } catch (err) {
    console.error("Server error in /api/ai:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
