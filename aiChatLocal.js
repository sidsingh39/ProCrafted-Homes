// aiChatLocal.js
// Browser-only AI — no backend, no API keys needed

import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";

// Load DistilGPT2 silently (not used for replies now)
let generator;
(async () => {
    generator = await pipeline("text-generation", "Xenova/distilGPT2");
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// UI elements
const toggle = document.getElementById("ai-toggle");
const chat = document.getElementById("ai-chat");
const closeBtn = document.getElementById("ai-close");
const form = document.getElementById("ai-form");
const input = document.getElementById("ai-input");
const msgs = document.getElementById("ai-messages");

function appendMsg(text, who = 'bot') {
    const el = document.createElement("div");
    el.className = `ai-msg ${who}`;
    el.innerText = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
}

// Open/close chat
toggle.addEventListener("click", () => {
    const hidden = chat.getAttribute("aria-hidden") === "true";
    chat.setAttribute("aria-hidden", hidden ? "false" : "true");
    if (hidden) input.focus();
});

closeBtn.addEventListener("click", () => chat.setAttribute("aria-hidden","true"));


// --------------------
// MAIN CHAT HANDLER
// --------------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    input.value = "";

    appendMsg(message, "user");
    appendMsg("Thinking...", "bot");

    await sleep(100);

    // remove “Thinking…”
    msgs.lastChild.remove();

    // ALWAYS use your rule-based replies
    const reply = generateReply(message);
    appendMsg(reply, "bot");
});


// --------------------
// RULE-BASED REPLY LOGIC
// --------------------
function generateReply(userMsg) {
    userMsg = userMsg.toLowerCase();

    // Cost questions
    if (userMsg.includes("cost") || userMsg.includes("price") || userMsg.includes("estimate")) {
        return (
            "Here’s a rough estimate:\n\n" +
            "• 2 BHK basic construction: ₹1,400 to ₹1,800 per sq.ft\n" +
            "• Premium finish: ₹2,000 to ₹2,600 per sq.ft\n" +
            "• Luxury finish: ₹3,000+ per sq.ft\n\n" +
            "Tell me the city + size in sq.ft and I’ll calculate exact numbers for you."
        );
    }

    // Material questions
    if (userMsg.includes("cement") || userMsg.includes("sand") || userMsg.includes("steel") || userMsg.includes("material")) {
        return (
            "Approx material breakdown per 1000 sq.ft:\n\n" +
            "• Cement: 220–260 bags\n" +
            "• Steel: 4–4.5 tonnes\n" +
            "• Sand: 600–700 cubic ft\n" +
            "• Bricks: 8,000–9,000\n\n" +
            "If you want, I can give a detailed BoQ too."
        );
    }

    // Contractor help
    if (userMsg.includes("contractor") || userMsg.includes("builder") || userMsg.includes("hire")) {
        return (
            "Looking for a contractor? I can connect you to vetted workers from your city.\n" +
            "Just tell me the location + project type (house / flat / renovation)."
        );
    }

    // Greetings
    if (userMsg.includes("hi") || userMsg.includes("hello") || userMsg.includes("hey")) {
        return "Hi there! What can I help you with today?";
    }

    // Default fallback
    return (
        "Got you! But give me more details.\n" +
        "Are you asking about cost, materials, labour, or contractors?"
    );
}


// --------------------
// WELCOME MESSAGE
// --------------------
appendMsg("Hi — I'm ProCrafted AI (Local Mode). Ask me anything!", "bot");
