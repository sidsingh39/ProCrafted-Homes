// assets/js/aiChat.js
(() => {
  const toggle = document.getElementById("ai-toggle");
  const chat = document.getElementById("ai-chat");
  const closeBtn = document.getElementById("ai-close");
  const form = document.getElementById("ai-form");
  const input = document.getElementById("ai-input");
  const msgs = document.getElementById("ai-messages");
  if (!toggle || !chat || !closeBtn || !form || !input || !msgs) {
    console.warn("AI Chat: missing DOM elements — chat not initialized.");
    return;
  }

  let busy = false;            // prevents double-sends
  let lastRequestAt = 0;       // cooldown timestamp (ms)
  const COOLDOWN_MS = 1500;

  function appendMsg(text, who = "bot") {
    const el = document.createElement("div");
    el.className = `ai-msg ${who}`;
    el.innerText = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function setLoading(state) {
    toggle.disabled = state;
    if (state) toggle.classList.add("ai-loading");
    else toggle.classList.remove("ai-loading");
  }

  toggle.addEventListener("click", () => {
    const hidden = chat.getAttribute("aria-hidden") === "true";
    chat.setAttribute("aria-hidden", hidden ? "false" : "true");
    if (hidden) input.focus();
  });

  closeBtn.addEventListener("click", () => chat.setAttribute("aria-hidden", "true"));

  // returns reply string or throws
  async function sendToAI(message) {
    if (!message || typeof message !== "string") throw new Error("Invalid message");

    const now = Date.now();
    if (now - lastRequestAt < COOLDOWN_MS) {
      throw new Error("Please wait a moment before sending another message.");
    }
    lastRequestAt = now;

    busy = true;
    setLoading(true);

    // append user and loader
    appendMsg(message, "user");
    const loader = appendMsg("Thinking...", "bot");
    loader.dataset.loading = "1";

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      // try parse JSON safely
      let data = null;
      const text = await res.text();
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

      // remove loader
      if (loader && loader.parentNode) loader.remove();

      if (!res.ok) {
        // prefer server-provided error message if present
        const serverMsg = data?.error || data?.details || text || `Server returned ${res.status}`;
        appendMsg(`Server: ${serverMsg}`, "bot");
        throw new Error(serverMsg);
      }

      const reply = data?.reply ?? (typeof text === "string" ? text : "No reply");
      appendMsg(String(reply).trim(), "bot");
      return reply;
    } catch (err) {
      // ensure loader removed
      const pendingLoader = msgs.querySelector('.ai-msg.bot[data-loading="1"]');
      if (pendingLoader && pendingLoader.parentNode) pendingLoader.remove();

      const errMsg = err?.message || "Network error. Try later.";
      appendMsg(errMsg, "bot");
      throw err;
    } finally {
      busy = false;
      setLoading(false);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    if (busy) return; // ignore while processing
    input.value = "";
    try {
      await sendToAI(v);
    } catch (err) {
      // error already displayed inside sendToAI
    }
  });

  // initial welcome
  appendMsg("Hi — I'm ProCrafted AI. Ask about estimates, materials, or contractors.", "bot");

  // expose API for other scripts; returns promise that resolves with reply string or rejects with error
  window.procraftedAI = {
    ask: async (text) => sendToAI(text),
    appendMsg
  };
})();
