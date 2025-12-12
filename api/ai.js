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

    // FREE HuggingFace model: Llama-3.2-3B-Instruct
    const model = "meta-llama/Llama-3.2-3B-Instruct";

    const url = `https://api-inference.huggingface.co/models/${model}`;

    const payload = {
      inputs: message,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.6,
      }
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (data.error) {
      return res.status(502).json({ error: data.error });
    }

    const reply =
      data[0]?.generated_text?.replace(message, "")?.trim() ||
      "No reply generated.";

    return res.json({
      reply,
      model,
    });

  } catch (err) {
    console.error("HF error:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
