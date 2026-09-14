const {
  createSession,
  sendPrompt: sendOpenCodePrompt,
  checkHealth,
  listSessions,
  deleteSession,
  abortSession,
  getAllModels,
  getFreeModels,
} = require("./opencode-client");
const { GeminiClient, GEMINI_MODELS, THINKING_LEVELS } = require("./gemini-client");

class AIController {
  constructor() {
    this.activeProvider = "opencode";
    this.opencodeModel = process.env.OPENCODE_DEFAULT_MODEL || "mimo-v2.5-free";
    this.sessions = new Map();
    this.requestCount = 0;
    this.serverUrl = process.env.OPENCODE_SERVER_URL || "http://127.0.0.1:4096";
    this.gemini = new GeminiClient();
  }

  get currentModel() {
    return this.activeProvider === "opencode" ? this.opencodeModel : this.gemini.currentModel;
  }

  async getOrCreateSession(chatId) {
    const key = chatId || "default";
    if (this.sessions.has(key)) {
      return this.sessions.get(key);
    }

    const result = await createSession(`TG-Chat-${key}`);
    if (result.success) {
      this.sessions.set(key, result.sessionId);
      return result.sessionId;
    }
    return null;
  }

  async sendPrompt(prompt, chatId) {
    if (this.activeProvider === "gemini") {
      return await this.gemini.sendPrompt(prompt);
    }

    const sessionId = await this.getOrCreateSession(chatId);
    if (!sessionId) {
      return {
        success: false,
        error: "Gagal membuat session. Pastikan OpenCode server berjalan.",
      };
    }

    this.requestCount++;
    const result = await sendOpenCodePrompt(sessionId, prompt, this.opencodeModel);

    if (result.success) {
      return {
        success: true,
        text: result.text,
        model: result.model,
        account: "opencode-zen",
      };
    }

    return { success: false, error: result.error };
  }

  switchProvider(provider) {
    if (provider !== "opencode" && provider !== "gemini") {
      return { success: false, error: "Provider tidak valid" };
    }
    if (provider === "gemini" && !this.gemini.hasAccounts) {
      return { success: false, error: "Akun Gemini belum dikonfigurasi di .env" };
    }
    this.activeProvider = provider;
    return { success: true, message: `Provider diubah ke ${provider.toUpperCase()}` };
  }

  setOpenCodeModel(model) {
    const allModels = getAllModels();
    const found = allModels.find((m) => m.id === model);
    if (!found) {
      return { success: false, error: `Model tidak valid` };
    }
    this.opencodeModel = model;
    return { success: true, message: `OpenCode model diubah ke ${found.name}` };
  }

  setGeminiModel(model) {
    return this.gemini.setModel(model);
  }

  setGeminiThinking(level) {
    return this.gemini.setThinkingLevel(level);
  }

  switchGeminiAccount(index) {
    return this.gemini.switchAccount(index);
  }

  getStatus() {
    if (this.activeProvider === "gemini") {
      return this.geminiStatus();
    }
    return this.openCodeStatus();
  }

  openCodeStatus() {
    return {
      provider: "OpenCode",
      model: this.opencodeModel,
      server: this.serverUrl,
      requests: this.requestCount,
      cost: "FREE",
    };
  }

  geminiStatus() {
    const accounts = this.gemini.getAllStatus();
    const active = this.gemini.activeAccount;
    return {
      provider: "Gemini",
      model: this.gemini.currentModel,
      thinking: this.gemini.thinkingLevel,
      activeAccount: active ? active.name : "N/A",
      accounts,
      totalRequests: this.gemini.totalRequests,
    };
  }

  async listSessions() {
    return await listSessions();
  }

  async deleteSession(sessionId) {
    const result = await deleteSession(sessionId);
    if (result.success) {
      for (const [key, id] of this.sessions.entries()) {
        if (id === sessionId) this.sessions.delete(key);
      }
    }
    return result;
  }

  async abortSession(sessionId) {
    return await abortSession(sessionId);
  }

  clearLocalSession(chatId) {
    const key = chatId || "default";
    this.sessions.delete(key);
    return { success: true, message: "Session lokal dihapus." };
  }

  formatStatus() {
    const status = this.getStatus();

    if (status.provider === "Gemini") {
      let output = "📊 *GEMINI AI STATUS*\n\n";
      output += `🤖 Model: *${status.model}*\n`;
      output += `🧠 Thinking: *${status.thinking}*\n`;
      output += `👤 Akun aktif: *${status.activeAccount}*\n`;
      output += `📈 Total requests: *${status.totalRequests}*\n\n`;

      output += "*AKUN:*\n";
      for (const acc of status.accounts) {
        const icon = acc.name === status.activeAccount ? "✅" : "⬜";
        const limit = acc.isLimited ? ` ⏳ ${acc.minutesUntilReset}m` : "";
        output += `${icon} ${acc.name} — ${acc.requestCount} req${limit}\n`;
      }

      output += "\n*MODELS:*\n";
      for (const m of GEMINI_MODELS) {
        const icon = !m.available ? "❌" : m.id === status.model ? "✅" : "⬜";
        output += `${icon} ${m.name}\n   \`${m.id}\`\n`;
      }

      return output;
    }

    let output = "📊 *OPENCODE AI STATUS*\n\n";
    output += `🤖 Model: *${status.model}*\n`;
    output += `🔌 Server: *${status.server}*\n`;
    output += `📈 Total requests: *${status.requests}*\n`;
    output += `💰 Cost: *${status.cost}*\n\n`;

    output += "*MODELS:*\n";
    for (const m of getFreeModels()) {
      const icon = !m.available ? "❌" : m.id === status.model ? "✅" : "⬜";
      output += `${icon} ${m.name}\n   \`${m.id}\`\n`;
    }

    return output;
  }
}

module.exports = AIController;
