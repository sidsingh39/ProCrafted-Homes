// assets/js/aiChat.js
(() => {
  const toggle = document.getElementById("ai-toggle");
  const chat = document.getElementById("ai-chat");
  const closeBtn = document.getElementById("ai-close");
  const form = document.getElementById("ai-form");
  const input = document.getElementById("ai-input");
  const msgs = document.getElementById("ai-messages");

  function appendMsg(text, who='bot') {
    const el = document.createElement("div");
    el.className = `ai-msg ${who}`;
    el.innerText = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setLoading(state) {
    toggle.disabled = state;
  }

  toggle.addEventListener("click", () => {
    const hidden = chat.getAttribute("aria-hidden") === "true";
    chat.setAttribute("aria-hidden", hidden ? "false" : "true");
    if (hidden) input.focus();
  });
  closeBtn.addEventListener("click", () => chat.setAttribute("aria-hidden","true"));

  async function sendToAI(message) {
    appendMsg(message, 'user');
    const loader = document.createElement("div");
    loader.className = "ai-msg bot";
    loader.innerText = "Thinking...";
    msgs.appendChild(loader);
    msgs.scrollTop = msgs.scrollHeight;
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      loader.remove();
      appendMsg(data.reply || "Sorry, something went wrong.", 'bot');
    } catch (err) {
      loader.remove();
      appendMsg("Network error. Try again later.", 'bot');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    sendToAI(v);
  });

  // welcome message
  appendMsg("Hi — I'm ProCrafted AI. Ask about estimates, materials, or contractors.", 'bot');

  // expose helper for other scripts (estimator will use this later)
  window.procraftedAI = {
    ask: async (text) => { await sendToAI(text); },
    appendMsg
  };
})();
