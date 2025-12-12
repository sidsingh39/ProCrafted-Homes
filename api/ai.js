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

    // FREE model — good quality + fast
    const model = "meta-llama/Llama-3.2-3B-Instruct";

    const payload = {
      model,
      inputs: message,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7
      }
    };

    const r = await fetch("https://router.huggingface.co/hf-inference", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!r.ok || data.error) {
      console.error("HF Router error:", data);
      return res.status(502).json({
        error: data.error || "HF Router request failed",
        details: data
      });
    }

    let reply = "";

    // Extract reply from router response formats
    if (Array.isArray(data)) {
      reply = data[0]?.generated_text || "";
    } else if (data.generated_text) {
      reply = data.generated_text;
    } else {
      reply = JSON.stringify(data);
    }

    reply = reply.replace(message, "").trim();

    return res.json({
      reply: reply || "No reply generated.",
      model
    });

  } catch (err) {
    console.error("HF router exception:", err);
    return res.status(500).json({ error: "Server error", message: String(err) });
  }
}
