// Sim AI Free - App Logic

// Enter the app from landing page
function enterApp() {
  document.getElementById("landing-page").style.display = "none";
  document.getElementById("main-app").style.display = "block";
}

// Go back to landing
function goBack() {
  document.getElementById("main-app").style.display = "none";
  document.getElementById("landing-page").style.display = "block";
}

// Switch tabs in sidebar
function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(function(el) { el.classList.remove("active"); });
  document.querySelectorAll(".nav-item").forEach(function(el) { el.classList.remove("active"); });
  document.getElementById("tab-" + tabName).classList.add("active");
  event.currentTarget.classList.add("active");
}

// Auto-resize textarea
document.addEventListener("DOMContentLoaded", function() {
  var input = document.getElementById("chat-input");
  if (input) {
    input.addEventListener("input", function() {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 150) + "px";
    });
  }
});

// Chat with AI (using Google Gemini 2.5 Flash free API via Generative Language)
var GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
// NOTE: For production, use your own API key. This is a demo placeholder.
// Get a free key at https://aistudio.google.com/apikey
var API_KEY = "";

var chatHistory = [];

async function sendMessage() {
  var input = document.getElementById("chat-input");
  var text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";

  // Add user message to UI
  addMessage(text, "user");
  chatHistory.push({ role: "user", parts: [{ text: text }] });

  // Show typing indicator
  var typingEl = addTypingIndicator();

  try {
    if (!API_KEY) {
      // Fallback: local echo response if no API key
      await new Promise(function(r) { setTimeout(r, 1000); });
      typingEl.remove();
      var fallback = getFallbackResponse(text);
      addMessage(fallback, "assistant");
      chatHistory.push({ role: "model", parts: [{ text: fallback }] });
      return;
    }

    var response = await fetch(GEMINI_API_URL + "?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory,
        systemInstruction: {
          parts: [{ text: "You are a helpful AI assistant in the Sim AI Free platform. Respond in the same language the user writes in. Be helpful, concise, and friendly. You can help with coding, analysis, writing, and any other tasks." }]
        },
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      })
    });

    var data = await response.json();
    typingEl.remove();

    if (data.candidates && data.candidates[0]) {
      var reply = data.candidates[0].content.parts[0].text;
      addMessage(reply, "assistant");
      chatHistory.push({ role: "model", parts: [{ text: reply }] });
    } else {
      addMessage("Error: " + JSON.stringify(data), "assistant");
    }
  } catch (err) {
    typingEl.remove();
    addMessage("Connection error: " + err.message, "assistant");
  }
}

function addMessage(text, role) {
  var container = document.getElementById("chat-messages");
  var div = document.createElement("div");
  div.className = "message " + role;

  var avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "You" : "";
  if (role !== "user") avatar.innerHTML = "&#129302;";

  var content = document.createElement("div");
  content.className = "message-content";
  content.innerHTML = formatMessage(text);

  div.appendChild(avatar);
  div.appendChild(content);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
  var container = document.getElementById("chat-messages");
  var div = document.createElement("div");
  div.className = "message assistant";
  div.innerHTML = '<div class="message-avatar">&#129302;</div><div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function formatMessage(text) {
  // Simple markdown: bold, code blocks, lists
  text = text.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\n/g, "<br>");
  return text;
}

function getFallbackResponse(text) {
  var lower = text.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("privet") || lower.includes("hey")) {
    return "Hello! I am the Sim AI assistant. How can I help you today?";
  }
  if (lower.includes("who are you") || lower.includes("what are you")) {
    return "I am an AI assistant built into the Sim AI Free platform. I can help with questions, coding, analysis, and much more!";
  }
  return "To enable full AI capabilities, add your free Google Gemini API key in app.js (variable API_KEY). Get one free at https://aistudio.google.com/apikey\n\nYour message: " + text;
}
