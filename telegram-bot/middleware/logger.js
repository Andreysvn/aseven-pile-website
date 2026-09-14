const fs = require("fs");
const path = require("path");

// Log file location
const LOG_DIR = path.join(__dirname, "..", ".runtime");
const LOG_FILE = path.join(LOG_DIR, "bot-activity.log");

// Max log entries yang disimpan di memory
const MAX_LOG_ENTRIES = 100;

// In-memory log buffer
const logBuffer = [];

/**
 * Fungsi: Log activity
 */
function logActivity(userId, action, details = "", status = "info") {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    userId,
    action,
    details: sanitizeLog(details),
    status
  };
  
  // Tambah ke buffer
  logBuffer.push(entry);
  
  // Batasi buffer
  if (logBuffer.length > MAX_LOG_ENTRIES) {
    logBuffer.shift();
  }
  
  // Tulis ke file
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    
    const logLine = `[${timestamp}] [${status.toUpperCase()}] User:${userId} | ${action} | ${sanitizeLog(details)}\n`;
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (err) {
    console.error("Gagal tulis log:", err.message);
  }
  
  // Console log juga
  console.log(`[${timestamp}] [${status}] ${action}: ${sanitizeLog(details)}`);
}

/**
 * Fungsi: Sanitize log (hapus sensitif info)
 */
function sanitizeLog(text) {
  if (!text) return "";
  
  let sanitized = text.toString();
  
  // Hapus token jika ada
  sanitized = sanitized.replace(/TELEGRAM_BOT_TOKEN=.*/gi, "TELEGRAM_BOT_TOKEN=***");
  sanitized = sanitized.replace(/\d{10}:[A-Za-z0-9_-]{35}/g, "***BOT_TOKEN***");
  
  // Hapus password jika ada
  sanitized = sanitized.replace(/password[=:]\s*\S+/gi, "password=***");
  
  // Potong jika terlalu panjang
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + "...";
  }
  
  return sanitized;
}

/**
 * Fungsi: Ambil log terakhir
 */
function getRecentLogs(count = 20) {
  return logBuffer.slice(-count);
}

/**
 * Fungsi: Format log untuk ditampilkan
 */
function formatLogs(logs) {
  if (logs.length === 0) {
    return "📝 Tidak ada log activity.";
  }
  
  let output = "📝 *LOG ACTIVITY*\n\n";
  
  for (const log of logs) {
    const time = new Date(log.timestamp).toLocaleTimeString("id-ID");
    const icon = log.status === "success" ? "✅" : 
                 log.status === "error" ? "❌" : 
                 log.status === "warning" ? "⚠️" : "ℹ️";
    
    output += `${icon} \`${time}\` ${log.action}\n`;
    if (log.details) {
      output += `   └─ ${log.details}\n`;
    }
  }
  
  return output;
}

module.exports = {
  logActivity,
  getRecentLogs,
  formatLogs,
  sanitizeLog
};
