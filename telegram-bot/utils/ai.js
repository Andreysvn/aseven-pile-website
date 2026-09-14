const https = require("https");

class AIController {
  constructor() {
    this.accounts = [
      {
        id: 1,
        email: process.env.AI_API_EMAIL_1 || "",
        apiKey: process.env.AI_API_KEY_1 || "",
        requestsToday: 0,
        lastReset: Date.now(),
        isActive: true
      },
      {
        id: 2,
        email: process.env.AI_API_EMAIL_2 || "",
        apiKey: process.env.AI_API_KEY_2 || "",
        requestsToday: 0,
        lastReset: Date.now(),
        isActive: true
      }
    ];
    
    this.currentAccountIndex = 0;
    this.defaultModel = process.env.AI_DEFAULT_MODEL || "gemini-3.5-flash";
    this.autoSwitch = process.env.AI_AUTO_SWITCH === "true";
    this.thinkingLevel = "none";
    
    // Limit per hari (Gemini free tier: 1500 requests/day)
    this.dailyLimit = 1500;
  }

  /**
   * Get current active account
   */
  getCurrentAccount() {
    return this.accounts[this.currentAccountIndex];
  }

  setThinkingLevel(level) {
    this.thinkingLevel = level;
    return { success: true, message: `Thinking Mode diubah ke: ${level.toUpperCase()}` };
  }

  /**
   * Get all accounts status
   */
  getStatus() {
    const current = this.getCurrentAccount();
    
    return {
      model: this.defaultModel,
      currentAccount: {
        id: current.id,
        email: current.email,
        requestsToday: current.requestsToday,
        remaining: this.dailyLimit - current.requestsToday,
        percentage: Math.round((current.requestsToday / this.dailyLimit) * 100)
      },
      accounts: this.accounts.map(acc => ({
        id: acc.id,
        email: acc.email,
        isActive: acc.isActive,
        requestsToday: acc.requestsToday
      })),
      autoSwitch: this.autoSwitch
    };
  }

  /**
   * Switch to specific account
   */
  switchAccount(accountId) {
    const index = this.accounts.findIndex(acc => acc.id === accountId);
    if (index === -1) {
      return { success: false, error: "Account tidak ditemukan." };
    }
    
    if (!this.accounts[index].apiKey) {
      return { success: false, error: `Account ${accountId} belum diset API key-nya.` };
    }
    
    this.currentAccountIndex = index;
    return { 
      success: true, 
      message: `Switched ke Account ${accountId} (${this.accounts[index].email})` 
    };
  }

  /**
   * Change AI model
   */
  setModel(model) {
    const validModels = [
      "gemini-2.5-pro",
      "gemini-2.5-flash", 
      "gemini-3.1-pro-preview",
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-pro-latest"
    ];
    
    if (!validModels.includes(model)) {
      return { 
        success: false, 
        error: `Model tidak valid. Pilihan: ${validModels.join(", ")}` 
      };
    }
    
    this.defaultModel = model;
    return { success: true, message: `Model diubah ke ${model}` };
  }

  /**
   * Send prompt to Gemini API
   */
  async sendPrompt(prompt) {
    const account = this.getCurrentAccount();
    
    // Cek API key
    if (!account.apiKey) {
      return {
        success: false,
        error: `API key belum diset untuk Account ${account.id}.\nBuka .env.template dan isi AI_API_KEY_${account.id}`
      };
    }
    
    // Cek limit
    if (account.requestsToday >= this.dailyLimit) {
      if (this.autoSwitch) {
        // Coba switch ke account lain
        const switched = this.tryAutoSwitch();
        if (switched) {
          return this.sendPrompt(prompt); // Recurse dengan account baru
        }
      }
      return {
        success: false,
        error: `Account ${account.id} sudah mencapai limit harian (${this.dailyLimit} requests).`
      };
    }
    
    // Kirim ke Gemini API
    return new Promise((resolve) => {
      let finalPrompt = prompt;
      if (this.thinkingLevel === 'low') {
        finalPrompt = 'Berpikirlah secara singkat dan langsung ke intinya:\n\n' + prompt;
      } else if (this.thinkingLevel === 'medium') {
        finalPrompt = 'Berpikirlah selangkah demi selangkah (step-by-step) dengan logika yang terstruktur sebelum menjawab:\n\n' + prompt;
      } else if (this.thinkingLevel === 'high') {
        finalPrompt = 'Anda sedang dalam MODE HIGH THINKING. Lakukan penalaran logika yang sangat mendalam, berlapis, dan ekstensif. Pikirkan berbagai sudut pandang dan probabilitas. Gunakan tag <thought> untuk menjabarkan proses berpikir Anda sebelum memberikan jawaban akhir:\n\n' + prompt;
      }
      
      const requestBody = JSON.stringify({
        contents: [{
          parts: [{
            text: finalPrompt
          }]
        }],
        generationConfig: {
          temperature: (this.thinkingLevel === 'high' || this.thinkingLevel === 'medium') ? 0.3 : 0.7,
          maxOutputTokens: 8192
        }
      });

      const options = {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${this.defaultModel}:generateContent?key=${account.apiKey}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(options, (res) => {
        let data = "";
        
        res.on("data", (chunk) => {
          data += chunk;
        });
        
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            
            // Update request count
            account.requestsToday++;
            
            if (response.candidates && response.candidates[0]) {
              const text = response.candidates[0].content.parts[0].text;
              resolve({
                success: true,
                text: text,
                account: account.email,
                model: this.defaultModel,
                remaining: this.dailyLimit - account.requestsToday
              });
            } else if (response.error) {
              resolve({
                success: false,
                error: response.error.message || "Unknown error"
              });
            } else {
              resolve({
                success: false,
                error: "Tidak ada response dari AI"
              });
            }
          } catch (err) {
            resolve({
              success: false,
              error: `Parse error: ${err.message}`
            });
          }
        });
      });

      req.on("error", (err) => {
        resolve({
          success: false,
          error: `Connection error: ${err.message}`
        });
      });

      req.write(requestBody);
      req.end();
    });
  }

  /**
   * Try auto-switch to another account if limit reached
   */
  tryAutoSwitch() {
    for (let i = 0; i < this.accounts.length; i++) {
      if (i !== this.currentAccountIndex && 
          this.accounts[i].apiKey && 
          this.accounts[i].requestsToday < this.dailyLimit) {
        this.currentAccountIndex = i;
        return true;
      }
    }
    return false;
  }

  /**
   * Format status untuk Telegram
   */
  formatStatus() {
    const status = this.getStatus();
    
    let output = "📊 *AI STATUS*\n\n";
    output += `🤖 Model: *${status.model}*\n`;
    output += `👤 Account: *${status.currentAccount.id}* (${status.currentAccount.email})\n`;
    output += `📈 Request hari ini: *${status.currentAccount.requestsToday}*\n`;
    output += `📉 Sisa kuota: *${status.currentAccount.remaining}*\n`;
    output += `📊 Usage: *${status.currentAccount.percentage}%*\n`;
    output += `🔄 Auto-switch: *${status.autoSwitch ? "ON" : "OFF"}*\n\n`;
    
    output += "*DAFTAR ACCOUNT:*\n";
    for (const acc of status.accounts) {
      const icon = acc.id === status.currentAccount.id ? "✅" : "⬜";
      const key = acc.apiKey ? "✓" : "✗";
      output += `${icon} Account ${acc.id}: ${acc.email} [Key: ${key}]\n`;
    }
    
    return output;
  }
}

module.exports = AIController;
