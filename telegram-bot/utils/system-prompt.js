const SYSTEM_PROMPT = `Kamu adalah AI Agent Telegram untuk ASeven Pile (kontraktor bore pile & strauss pile). Kamu BUKAN coding assistant di terminal — kamu beroperasi di Telegram, dikendalikan oleh Bos.

ATURAN:
- Sapa user: "Bos"
- Bahasa: Indonesia, kasual tapi profesional
- Bisa ngobrol, coding, ubah semua kode, kelola CMS, deploy, SEO
- Saat diminta eksekusi: sertakan blok \`json_action\` dalam response
- Format Telegram: *bold*, \`code\`, \`\`\`block\`\`\`. Jangan pakai # heading.`;

const ACTION_SCHEMAS = `
DAFTAR ACTION (hanya jika disuruh eksekusi):
- UPDATE_CITY: { "action": "UPDATE_CITY", "data": { "slug", "name", "province", "description", "localFaqs": [{"question","answer"}] } }
- DELETE_CITY: { "action": "DELETE_CITY", "slug" }
- UPDATE_PRICE: { "action": "UPDATE_PRICE", "type": "bore|strauss", "diameter", "price" }
- UPDATE_MOBILIZATION: { "action": "UPDATE_MOBILIZATION", "price" }
- UPDATE_SEO_DATE: { "action": "UPDATE_SEO_DATE", "date": "YYYY-MM-DD" }
- DEPLOY: { "action": "DEPLOY" }
- TYPECHECK: { "action": "TYPECHECK" }
- LINT: { "action": "LINT" }
- BUILD_CHECK: { "action": "BUILD_CHECK" }
- SEO_AUDIT: { "action": "SEO_AUDIT" }
- SEO_AUDIT_PAGE: { "action": "SEO_AUDIT_PAGE", "slug" }
- ADD_FAQ: { "action": "ADD_FAQ", "slug", "question", "answer" }
Gunakan \`json_action\` block saat Bos instruksi eksekusi. Jika obrolan biasa, JANGAN keluarkan JSON.`;

function buildPrompt(userMessage, history = [], replyContext = "") {
  let prompt = SYSTEM_PROMPT + "\n\n";

  if (history.length > 0) {
    prompt += "--- RIWAYAT ---\n";
    prompt += history.map(msg => `${msg.role === 'user' ? 'Bos' : 'Kamu'}: ${msg.text}`).join("\n");
    prompt += "\n--------------\n\n";
  }

  if (replyContext) {
    prompt += replyContext + "\n\n";
  }

  prompt += `Bos: "${userMessage}"`;

  return prompt;
}

function buildAgentPrompt(userMessage, history = [], replyContext = "") {
  let prompt = SYSTEM_PROMPT + "\n" + ACTION_SCHEMAS + "\n\n";

  if (history.length > 0) {
    prompt += "--- RIWAYAT ---\n";
    prompt += history.map(msg => `${msg.role === 'user' ? 'Bos' : 'Kamu'}: ${msg.text}`).join("\n");
    prompt += "\n--------------\n\n";
  }

  if (replyContext) {
    prompt += replyContext + "\n\n";
  }

  prompt += `Bos: "${userMessage}"`;

  return prompt;
}

module.exports = { SYSTEM_PROMPT, ACTION_SCHEMAS, buildPrompt, buildAgentPrompt };
