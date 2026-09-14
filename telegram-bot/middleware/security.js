const path = require("path");
const fs = require("fs");

// Project root (folder yang boleh diakses bot)
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// Destructive actions yang butuh konfirmasi
const DESTRUCTIVE_ACTIONS = [
  "rm",
  "rmdir", 
  "kill",
  "reboot",
  "force-push",
  "git-reset",
  "git-clean"
];

// Pending confirmations (simpan di memory)
const pendingConfirmations = new Map();

/**
 * Middleware: Whitelist authentication
 * Cuma user ID yang diizinkan yang bisa pakai bot
 */
function authMiddleware(allowedUserId) {
  return async (ctx, next) => {
    const senderId = ctx.from?.id?.toString();
    
    if (!senderId || senderId !== allowedUserId) {
      if (senderId) {
        console.warn(`[SECURITY] Unauthorized access attempt from user ID: ${senderId}`);
      }
      return;
    }
    
    await next();
  };
}

/**
 * Middleware: Folder restriction
 * Pastikan akses file dibatasi ke project root
 */
function validatePath(filePath) {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  
  // Pastikan path masih dalam project root
  if (!resolved.startsWith(PROJECT_ROOT)) {
    return { 
      valid: false, 
      error: `⛔ Akses ditolak. Path "${filePath}" di luar project folder.` 
    };
  }
  
  return { valid: true, resolvedPath: resolved };
}

/**
 * Fungsi: Minta konfirmasi sebelum destructive action
 */
function requestConfirmation(action, details) {
  const id = Date.now().toString();
  
  pendingConfirmations.set(id, {
    action,
    details,
    createdAt: Date.now()
  });
  
  // Auto-hapus setelah 60 detik
  setTimeout(() => {
    pendingConfirmations.delete(id);
  }, 60000);
  
  return id;
}

/**
 * Fungsi: Cek apakah konfirmasi valid
 */
function getConfirmation(id) {
  const conf = pendingConfirmations.get(id);
  if (!conf) return null;
  
  // Cek apakah belum expired (60 detik)
  if (Date.now() - conf.createdAt > 60000) {
    pendingConfirmations.delete(id);
    return null;
  }
  
  pendingConfirmations.delete(id);
  return conf;
}

/**
 * Fungsi: Cek apakah action butuh konfirmasi
 */
function isDestructiveAction(action) {
  return DESTRUCTIVE_ACTIONS.includes(action.toLowerCase());
}

module.exports = {
  PROJECT_ROOT,
  authMiddleware,
  validatePath,
  requestConfirmation,
  getConfirmation,
  isDestructiveAction,
  DESTRUCTIVE_ACTIONS
};
