const { SYSTEM_PROMPT } = require("./system-prompt");

const GEMINI_MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", thinking: false, speed: "fast", available: true },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", thinking: false, speed: "ultra-fast", available: true },
];

const THINKING_LEVELS = ["none", "low", "medium", "high"];

class GeminiAccount {
  constructor(name, apiKey, email) {
    this.name = name;
    this.apiKey = apiKey;
    this.email = email || "N/A";
    this.requestCount = 0;
    this.lastReset = Date.now();
    this.isLimited = false;
    this.limitResetTime = null;
  }

  canRequest() {
    if (this.isLimited && Date.now() < this.limitResetTime) return false;
    if (this.isLimited && Date.now() >= this.limitResetTime) {
      this.isLimited = false;
      this.requestCount = 0;
    }
    return true;
  }

  incrementUsage() {
    this.requestCount++;
  }

  setLimited(minutes) {
    this.isLimited = true;
    this.limitResetTime = Date.now() + minutes * 60 * 1000;
  }

  getStatus() {
    const remaining = this.isLimited
      ? Math.ceil((this.limitResetTime - Date.now()) / 60000)
      : null;
    return {
      name: this.name,
      email: this.email,
      requestCount: this.requestCount,
      isLimited: this.isLimited,
      minutesUntilReset: remaining,
    };
  }
}

class GeminiClient {
  constructor() {
    this.accounts = [];
    this.activeAccountIndex = 0;
    this.currentModel = process.env.GEMINI_DEFAULT_MODEL || "gemini-3.6-flash";
    this.thinkingLevel = "medium";
    this.totalRequests = 0;

    const key1 = process.env.GEMINI_API_KEY_1;
    const key2 = process.env.GEMINI_API_KEY_2;
    const email1 = process.env.GEMINI_API_EMAIL_1;
    const email2 = process.env.GEMINI_API_EMAIL_2;

    if (key1) this.accounts.push(new GeminiAccount("Akun 1", key1, email1));
    if (key2) this.accounts.push(new GeminiAccount("Akun 2", key2, email2));
  }

  get hasAccounts() {
    return this.accounts.length > 0;
  }

  get activeAccount() {
    return this.accounts[this.activeAccountIndex] || null;
  }

  switchAccount(index) {
    if (index < 0 || index >= this.accounts.length) {
      return { success: false, error: "Akun tidak valid" };
    }
    this.activeAccountIndex = index;
    return { success: true, message: `Beralih ke ${this.accounts[index].name}` };
  }

  setModel(modelId) {
    const found = GEMINI_MODELS.find((m) => m.id === modelId);
    if (!found) {
      return { success: false, error: "Model tidak valid" };
    }
    this.currentModel = modelId;
    return { success: true, message: `Model diubah ke ${found.name}` };
  }

  setThinkingLevel(level) {
    if (!THINKING_LEVELS.includes(level)) {
      return { success: false, error: `Level tidak valid. Pilihan: ${THINKING_LEVELS.join(", ")}` };
    }
    this.thinkingLevel = level;
    return { success: true, message: `Thinking level diubah ke: ${level.toUpperCase()}` };
  }

  findAvailableAccount() {
    for (let i = 0; i < this.accounts.length; i++) {
      const idx = (this.activeAccountIndex + i) % this.accounts.length;
      if (this.accounts[idx].canRequest()) {
        this.activeAccountIndex = idx;
        return this.accounts[idx];
      }
    }
    return null;
  }

  async sendPrompt(prompt) {
    if (!this.hasAccounts) {
      return { success: false, error: "Tidak ada akun Gemini yang dikonfigurasi" };
    }

    const account = this.findAvailableAccount();
    if (!account) {
      const resetTimes = this.accounts.map((a) => {
        const status = a.getStatus();
        return `${a.name}: ${status.minutesUntilReset} menit lagi`;
      });
      return {
        success: false,
        error: `Semua akun sedang limit. Reset dalam:\n${resetTimes.join("\n")}`,
      };
    }

    try {
      const model = GEMINI_MODELS.find((m) => m.id === this.currentModel);
      const supportsThinking = model && model.thinking;

      const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {},
      };

      if (supportsThinking && this.thinkingLevel !== "none") {
        const thinkingBudget = {
          low: 1024,
          medium: 8192,
          high: 32768,
        }[this.thinkingLevel] || 8192;
        
        body.generationConfig.thinkingConfig = {
          thinkingBudget,
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${account.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || response.statusText;

        if (response.status === 429) {
          account.setLimited(1);
          return this.sendPrompt(prompt);
        }

        return { success: false, error: `Gemini API error: ${errorMessage}` };
      }

      const data = await response.json();
      account.incrementUsage();
      this.totalRequests++;

      let responseText = "";
      if (data.candidates && data.candidates[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.text) {
            responseText += part.text;
          }
        }
      }

      return {
        success: true,
        text: responseText || "(Tidak ada response text)",
        model: this.currentModel,
        thinking: supportsThinking ? this.thinkingLevel : "off",
        account: account.name,
      };
    } catch (err) {
      return { success: false, error: `Gemini error: ${err.message}` };
    }
  }

  getAllStatus() {
    return this.accounts.map((a) => a.getStatus());
  }
}

module.exports = { GeminiClient, GEMINI_MODELS, THINKING_LEVELS };
