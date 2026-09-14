const path = require("path");
const fs = require("fs");
const net = require("net");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const { Bot, InlineKeyboard } = require("grammy");
const { authMiddleware, validatePath, requestConfirmation, getConfirmation, isDestructiveAction, PROJECT_ROOT } = require("./middleware/security");
const { logActivity, getRecentLogs, formatLogs } = require("./middleware/logger");
const { runCommand, runCommandAsync } = require("./utils/runner");
const AIController = require("./utils/ai");

// ============ CONFIGURATION ============
const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedUserId = process.env.TELEGRAM_ALLOWED_USER_ID?.trim();
const previewUrl = process.env.PREVIEW_URL?.trim();

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN belum diisi di .env");
}

if (!allowedUserId) {
  console.warn("TELEGRAM_ALLOWED_USER_ID belum diisi. Bot akan menolak semua pesan.");
}

// ============ CREATE BOT ============
const bot = new Bot(token);

// ============ AI CONTROLLER ============
const ai = new AIController();

// ============ MIDDLEWARE ============
// 1. Auth middleware - whitelist
bot.use(authMiddleware(allowedUserId));

// 2. Logger middleware
bot.use(async (ctx, next) => {
  const command = ctx.message?.text?.split(" ")[0] || "unknown";
  logActivity(ctx.from.id, command, ctx.message?.text || "");
  await next();
});

// ============ BASIC COMMANDS ============
bot.command(["start", "menu"], async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("🤖 Asisten AI (Agent CMS)", "action_agent_info").row()
    .text("⚙️ Git & Server Control", "action_server_menu").row()
    .text("🧠 Setting AI (Model & Pikiran)", "action_ai_settings").row()
    .text("📊 Cek Status Server (Health)", "action_cek_status").row()
    .text("❓ Bantuan Perintah Manual", "action_bantuan");
    
  await ctx.reply("🚀 *MAIN MENU ASEVEN PILE*\n\nSelamat datang bos! Semua kendali ada di tangan Anda. Pilih menu di bawah ini:", {
    reply_markup: keyboard,
    parse_mode: "Markdown"
  });
});

bot.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;
  
  if (data === "action_agent_info") {
    await ctx.answerCallbackQuery();
    await ctx.reply("🤖 *CARA PAKAI AGENT CMS*\n\nTidak perlu tombol! Cukup *Ketik Langsung* di chat ini pakai bahasa sehari-hari.\n\nContoh:\n_\"Tolong buatin draf halaman kota Semarang.\"_\n_\"Coba cek database kota, kalau ada Bandung tolong hapus.\"_\n\nAgent akan mengerti dan merespons!", { parse_mode: "Markdown" });
    return;
  }
  
  if (data === "action_ai_settings") {
    const status = ai.getStatus();
    const keyboard = new InlineKeyboard()
      .text("🔧 Ganti Model AI", "action_ganti_model").row()
      .text("⚙️ Ganti Mode Berpikir (Thinking)", "action_ganti_thinking").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText(`🧠 *Pengaturan AI Saat Ini:*\n\nModel: *${status.model}*\nThinking: *${status.thinking}*\n\nSilakan pilih yang mau diubah:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }

  if (data === "action_back_main") {
    const keyboard = new InlineKeyboard()
      .text("🤖 Asisten AI (Agent CMS)", "action_agent_info").row()
      .text("⚙️ Git & Server Control", "action_server_menu").row()
      .text("🧠 Setting AI (Model & Pikiran)", "action_ai_settings").row()
      .text("📊 Cek Status Server (Health)", "action_cek_status").row()
      .text("❓ Bantuan Perintah Manual", "action_bantuan");
    
    await ctx.editMessageText("🚀 *MAIN MENU ASEVEN PILE*\n\nSelamat datang bos! Semua kendali ada di tangan Anda. Pilih menu di bawah ini:", {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }
  
  if (data === "action_server_menu") {
    const keyboard = new InlineKeyboard()
      .text("🚀 npm run build (Deploy Web)", "server_deploy").row()
      .text("⬇️ git pull (Tarik Update Github)", "server_update").row()
      .text("⬆️ git push (Backup ke Github)", "server_backup").row()
      .text("🔄 Restart Server (Astro)", "server_restart").row()
      .text("🛑 Kill Process (Stop Semua)", "server_stop").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText(`⚙️ *Menu Git & Server Control*\n\nTombol-tombol di bawah ini akan mengeksekusi *raw command* langsung ke terminal laptop Anda. Gunakan dengan bijak:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }

  if (data === "action_ganti_model") {
    const status = ai.getStatus();
    const keyboard = new InlineKeyboard()
      .text("🏆 3.1 Pro High (Kasta Tertinggi)", "model_gemini-3.1-pro-preview").row()
      .text("👑 Pro Latest (Stabil)", "model_gemini-pro-latest").row()
      .text("⚡ 3.5 Flash (Paling Gesit)", "model_gemini-3.5-flash").row()
      .text("💨 Flash Latest (Stabil)", "model_gemini-flash-latest").row()
      .text("⚙️ 2.5 Flash (Lama)", "model_gemini-2.5-flash");
      
    await ctx.editMessageText(`🤖 *Model AI saat ini:* \`${status.model}\`\n\nSilakan klik tombol di bawah untuk mengganti model:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }
  
  if (data === "action_ganti_thinking") {
    const keyboard = new InlineKeyboard()
      .text("🚀 Mati (Respons Cepat)", "think_none").row()
      .text("⚡ Low (Singkat)", "think_low").row()
      .text("🤔 Medium (Step-by-step)", "think_medium").row()
      .text("🤯 High (Penalaran Mendalam)", "think_high");

    await ctx.editMessageText(`🤔 *Mode Berpikir saat ini:* \`${ai.thinkingLevel.toUpperCase()}\`\n\nSilakan pilih level pemikiran AI:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }
  
  if (data === "action_server_menu") {
    const keyboard = new InlineKeyboard()
      .text("🚀 Deploy ASeven Pile", "server_deploy").row()
      .text("🔄 Update (Pull + Build)", "server_update").row()
      .text("💾 Backup ke GitHub", "server_backup").row()
      .text("⚡ Restart Services", "server_restart").row()
      .text("⏹️ Stop Semua", "server_stop");

    await ctx.editMessageText(`🚀 *Menu Kontrol & Otomatisasi Laptop*\n\nKlik tombol di bawah untuk mengeksekusi perintah server di laptop Anda secara instan:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }

  if (data.startsWith("server_")) {
    const action = data.replace("server_", "");
    await ctx.answerCallbackQuery(`Menjalankan /${action}...`);
    
    // Memicu routing command grammar asli dengan text message palsu
    await ctx.reply(`⏳ Meneruskan perintah: \`/${action}\``, { parse_mode: "Markdown" });
    
    const mockMessage = { 
      message_id: ctx.callbackQuery.message.message_id, 
      from: ctx.from, 
      chat: ctx.callbackQuery.message.chat, 
      date: Math.floor(Date.now() / 1000), 
      text: `/${action}` 
    };
    
    bot.handleUpdate({ update_id: Math.floor(Math.random() * 1000000), message: mockMessage });
    return;
  }

  if (data === "action_cek_status") {
    await ctx.answerCallbackQuery("Mengecek status...");
    const previewOnline = await isPortOpen(4321);
    const buildExists = fs.existsSync(path.join(PROJECT_ROOT, "dist", "index.html"));
    const statusText = 
      "📊 *STATUS PROJECT*\n\n" +
      `🌐 Bot: *online*\n` +
      `🌍 Preview: *${previewOnline ? "online" : "offline"}*\n` +
      `📦 Build: *${buildExists ? "tersedia" : "belum ada"}*\n` +
      `🔌 Port: *4321*`;
    await ctx.reply(statusText, { parse_mode: "Markdown" });
    return;
  }
  
  if (data === "action_bantuan") {
    await ctx.answerCallbackQuery();
    await ctx.reply("Untuk perintah berat, Anda tetap harus mengetik demi keamanan:\n\n🚀 `/deploy` - Build & Publish Website\n🔪 `/kill` - Mematikan proses\n📋 `/logs` - Melihat histori log\n💻 `/update` - Sinkronisasi GitHub", { parse_mode: "Markdown" });
    return;
  }
  
  if (data.startsWith("think_")) {
    const level = data.replace("think_", "");
    const result = ai.setThinkingLevel(level);
    await ctx.answerCallbackQuery(result.message);
    await ctx.editMessageText(`✅ Mode Berpikir berhasil diubah menjadi: *${level.toUpperCase()}*`, { parse_mode: "Markdown" });
    return;
  }
  
  if (data.startsWith("model_")) {
    const modelName = data.replace("model_", "");
    const result = ai.setModel(modelName);
    await ctx.answerCallbackQuery(result.message || "Model diubah");
    await ctx.editMessageText(`✅ Model AI berhasil diubah menjadi: *${modelName}*`, { parse_mode: "Markdown" });
    return;
  }

  await next();
});

bot.command("help", async (ctx) => {
  const helpText = 
    "📋 *DAFTAR COMMAND*\n\n" +
    
    "📁 *FILE EXPLORER*\n" +
    "├ /ls [folder] - Lihat isi folder\n" +
    "├ /cat [file] - Baca isi file\n" +
    "├ /mkdir [nama] - Buat folder\n" +
    "├ /touch [nama] - Buat file\n" +
    "└ /rm [file] - Hapus file ⚠️\n\n" +
    
    "🔧 *GIT CONTROL*\n" +
    "├ /git-status - Status repo\n" +
    "├ /git-diff - Lihat perubahan\n" +
    "├ /git-pull - Pull dari remote\n" +
    "├ /git-add [file] - Add ke staging\n" +
    "├ /git-commit [msg] - Commit\n" +
    "├ /git-push - Push ke remote\n" +
    "└ /git-log - Lihat history\n\n" +
    
    "🚀 *SERVICE*\n" +
    "├ /build - Build Astro\n" +
    "├ /restart - Restart preview\n" +
    "├ /stop - Stop semua service\n" +
    "├ /start-svc - Start semua service\n" +
    "├ /logs - Lihat log\n" +
    "├ /health - Cek semua service\n" +
    "└ /preview - URL tunnel\n\n" +
    
    "🤖 *AI*\n" +
    "├ /ai [pertanyaan] - Tanya ke AI\n" +
    "├ /ai-model [nama] - Ganti model\n" +
    "├ /ai-account [1/2] - Ganti account\n" +
    "└ /ai-status - Status kuota AI\n\n" +
    
    "💻 *SYSTEM*\n" +
    "├ /status - Status laptop\n" +
    "├ /processes - Running processes\n" +
    "├ /kill [nama/pid] - Kill proses ⚠️\n" +
    "└ /uptime - Berapa lama nyala\n\n" +
    
    "📝 *QUICK*\n" +
    "├ /deploy - Build + restart\n" +
    "├ /update - Pull + build + restart\n" +
    "└ /backup - Commit + push semua\n\n" +
    
    "⚠️ = Butuh konfirmasi";
  
  await ctx.reply(helpText, { parse_mode: "Markdown" });
});

// ============ FILE EXPLORER ============
bot.command("ls", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const folder = args[0] || ".";
  
  const validation = validatePath(folder);
  if (!validation.valid) {
    await ctx.reply(validation.error);
    return;
  }
  
  try {
    const items = fs.readdirSync(validation.resolvedPath);
    let output = `📁 *${folder}*\n\n`;
    
    for (const item of items) {
      const itemPath = path.join(validation.resolvedPath, item);
      const isDir = fs.statSync(itemPath).isDirectory();
      output += isDir ? `📂 ${item}/\n` : `📄 ${item}\n`;
    }
    
    output += `\nTotal: ${items.length} item`;
    await ctx.reply(output, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("cat", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    await ctx.reply("Usage: /cat [file]");
    return;
  }
  
  const validation = validatePath(args[0]);
  if (!validation.valid) {
    await ctx.reply(validation.error);
    return;
  }
  
  try {
    const content = fs.readFileSync(validation.resolvedPath, "utf8");
    const truncated = content.length > 3500 
      ? content.substring(0, 3500) + "\n\n... (file dipotong)"
      : content;
    
    await ctx.reply(`📄 *${args[0]}*\n\n\`\`\`\n${truncated}\n\`\`\``, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    await ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("mkdir", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    await ctx.reply("Usage: /mkdir [nama-folder]");
    return;
  }
  
  const validation = validatePath(args[0]);
  if (!validation.valid) {
    await ctx.reply(validation.error);
    return;
  }
  
  try {
    fs.mkdirSync(validation.resolvedPath, { recursive: true });
    logActivity(ctx.from.id, "mkdir", args[0], "success");
    await ctx.reply(`✅ Folder "${args[0]}" berhasil dibuat.`);
  } catch (err) {
    await ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("touch", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    await ctx.reply("Usage: /touch [nama-file]");
    return;
  }
  
  const validation = validatePath(args[0]);
  if (!validation.valid) {
    await ctx.reply(validation.error);
    return;
  }
  
  try {
    fs.writeFileSync(validation.resolvedPath, "", "utf8");
    logActivity(ctx.from.id, "touch", args[0], "success");
    await ctx.reply(`✅ File "${args[0]}" berhasil dibuat.`);
  } catch (err) {
    await ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("rm", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    await ctx.reply("Usage: /rm [file]");
    return;
  }
  
  const validation = validatePath(args[0]);
  if (!validation.valid) {
    await ctx.reply(validation.error);
    return;
  }
  
  // Minta konfirmasi
  const confId = requestConfirmation("rm", { file: args[0] });
  
  await ctx.reply(
    `⚠️ *KONFIRMASI DIPERLUKAN*\n\n` +
    `File: \`${args[0]}\`\n` +
    `Aksi: *HAPUS PERMANEN*\n\n` +
    `Ketik \`/confirm ${confId}\` untuk konfirmasi\n` +
    `Ketik \`/cancel ${confId}\` untuk batal`,
    { parse_mode: "Markdown" }
  );
});

bot.command("confirm", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    await ctx.reply("Usage: /confirm [id]");
    return;
  }
  
  const conf = getConfirmation(args[0]);
  if (!conf) {
    await ctx.reply("❌ Konfirmasi tidak ditemukan atau sudah expired.");
    return;
  }
  
  if (conf.action === "rm") {
    try {
      fs.unlinkSync(path.join(PROJECT_ROOT, conf.details.file));
      logActivity(ctx.from.id, "rm", conf.details.file, "success");
      await ctx.reply(`✅ File "${conf.details.file}" berhasil dihapus.`);
    } catch (err) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  } else if (conf.action === "kill") {
    const result = runCommand("taskkill", ["/F", "/PID", conf.details.pid.toString()]);
    logActivity(ctx.from.id, "kill", conf.details.pid.toString(), result.success ? "success" : "error");
    await ctx.reply(result.success ? 
      `✅ Proses ${conf.details.pid} berhasil di-kill.` : 
      `❌ Gagal kill proses: ${result.output}`
    );
  }
});

bot.command("cancel", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length === 0) {
    await ctx.reply("Usage: /cancel [id]");
    return;
  }
  
  // Hapus dari pending
  const conf = getConfirmation(args[0]);
  if (conf) {
    await ctx.reply("✅ Aksi dibatalkan.");
  } else {
    await ctx.reply("❌ Konfirmasi tidak ditemukan atau sudah expired.");
  }
});

// ============ GIT CONTROL ============
bot.command("git-status", async (ctx) => {
  await ctx.reply("⏳ Checking git status...");
  const result = runCommand("git", ["status", "--short"]);
  await ctx.reply(
    result.success ? 
    `📊 *Git Status*\n\`\`\`\n${result.output}\n\`\`\`` : 
    `❌ Error: ${result.output}`,
    { parse_mode: "Markdown" }
  );
});

bot.command("git-diff", async (ctx) => {
  const result = runCommand("git", ["diff"]);
  const output = result.output || "Tidak ada perubahan.";
  await ctx.reply(
    `📝 *Git Diff*\n\`\`\`\n${output.substring(0, 3500)}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("git-pull", async (ctx) => {
  await ctx.reply("⏳ Pulling dari remote...");
  const result = runCommandAsync("git", ["pull"]);
  const res = await result;
  logActivity(ctx.from.id, "git-pull", "", res.success ? "success" : "error");
  await ctx.reply(
    res.success ? 
    `✅ *Pull berhasil!*\n\`\`\`\n${res.output}\n\`\`\`` : 
    `❌ Pull gagal:\n\`\`\`\n${res.output}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("git-add", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const file = args[0] || ".";
  
  const result = runCommand("git", ["add", file]);
  logActivity(ctx.from.id, "git-add", file, result.success ? "success" : "error");
  await ctx.reply(
    result.success ? 
    `✅ File "${file}" ditambahkan ke staging.` : 
    `❌ Error: ${result.output}`
  );
});

bot.command("git-commit", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const msg = args.join(" ");
  
  if (!msg) {
    await ctx.reply("Usage: /git-commit [pesan commit]");
    return;
  }
  
  await ctx.reply("⏳ Committing...");
  const result = runCommandAsync("git", ["commit", "-m", msg]);
  const res = await result;
  logActivity(ctx.from.id, "git-commit", msg, res.success ? "success" : "error");
  await ctx.reply(
    res.success ? 
    `✅ *Commit berhasil!*\n\`\`\`\n${res.output}\n\`\`\`` : 
    `❌ Commit gagal:\n\`\`\`\n${res.output}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("git-push", async (ctx) => {
  await ctx.reply("⏳ Pushing ke remote...");
  const result = runCommandAsync("git", ["push"]);
  const res = await result;
  logActivity(ctx.from.id, "git-push", "", res.success ? "success" : "error");
  await ctx.reply(
    res.success ? 
    `✅ *Push berhasil!*\n\`\`\`\n${res.output}\n\`\`\`` : 
    `❌ Push gagal:\n\`\`\`\n${res.output}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("git-log", async (ctx) => {
  const result = runCommand("git", ["log", "--oneline", "-10"]);
  await ctx.reply(
    `📜 *Git Log (10 terakhir)*\n\`\`\`\n${result.output}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

// ============ SERVICE CONTROL ============
function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const net = require("net");
    const socket = net.createConnection({ port, host });
    const finish = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(1200);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

bot.command("status", async (ctx) => {
  const previewOnline = await isPortOpen(4321);
  const buildExists = fs.existsSync(path.join(PROJECT_ROOT, "dist", "index.html"));
  
  const statusText = 
    "📊 *STATUS PROJECT*\n\n" +
    `🤖 Bot: *online*\n` +
    `🌐 Preview: *${previewOnline ? "online" : "offline"}*\n` +
    `📦 Build: *${buildExists ? "tersedia" : "belum ada"}*\n` +
    `🔌 Port: *4321*`;
  
  await ctx.reply(statusText, { parse_mode: "Markdown" });
});

bot.command("preview", async (ctx) => {
  if (previewUrl) {
    await ctx.reply(`🔗 *Preview URL:*\n${previewUrl}`, { parse_mode: "Markdown" });
  } else {
    await ctx.reply("🔗 Link preview belum diset.");
  }
});

bot.command("health", async (ctx) => {
  await ctx.reply("⏳ Checking services...");
  
  const previewOnline = await isPortOpen(4321);
  const buildExists = fs.existsSync(path.join(PROJECT_ROOT, "dist", "index.html"));
  
  let output = "🏥 *HEALTH CHECK*\n\n";
  output += `${previewOnline ? "✅" : "❌"} Preview (port 4321): *${previewOnline ? "ONLINE" : "OFFLINE"}*\n`;
  output += `${buildExists ? "✅" : "❌"} Build dist: *${buildExists ? "ADA" : "TIDAK ADA"}*\n`;
  output += `🤖 Bot: *ONLINE*\n`;
  
  await ctx.reply(output, { parse_mode: "Markdown" });
});

bot.command("logs", async (ctx) => {
  const logs = getRecentLogs(20);
  const output = formatLogs(logs);
  await ctx.reply(output, { parse_mode: "Markdown" });
});

bot.command("build", async (ctx) => {
  await ctx.reply("🔨 *Building Astro...*", { parse_mode: "Markdown" });
  
  const result = runCommandAsync("npm", ["run", "build"]);
  const res = await result;
  
  logActivity(ctx.from.id, "build", "", res.success ? "success" : "error");
  
  await ctx.reply(
    res.success ? 
    `✅ *Build berhasil!*\n\`\`\`\n${res.output.substring(res.output.length - 500)}\n\`\`\`` : 
    `❌ *Build gagal:*\n\`\`\`\n${res.output.substring(res.output.length - 1000)}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("restart", async (ctx) => {
  await ctx.reply("🔄 Restarting services...");
  
  // Stop dulu
  const projectProcesses = runCommand("powershell", [
    "-Command",
    `Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'node.exe' -and $_.CommandLine -like '*$root*') -or ($_.Name -eq 'cloudflared.exe' -and $_.CommandLine -match '127.0.0.1:4321') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Start lagi
  runCommandAsync("powershell", ["-Command", `Set-Location '${PROJECT_ROOT}'; npm start`]);
  
  logActivity(ctx.from.id, "restart", "", "success");
  await ctx.reply("✅ Services restarted!");
});

bot.command("stop", async (ctx) => {
  await ctx.reply("⏹️ Stopping services...");
  
  const result = runCommand("powershell", [
    "-Command",
    `Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'node.exe' -and $_.CommandLine -like '*$root*') -or ($_.Name -eq 'cloudflared.exe' -and $_.CommandLine -match '127.0.0.1:4321') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`
  ]);
  
  logActivity(ctx.from.id, "stop", "", "success");
  await ctx.reply("✅ Semua service dihentikan.");
});

bot.command("start-svc", async (ctx) => {
  await ctx.reply("🚀 Starting services...");
  
  runCommandAsync("powershell", ["-Command", `Set-Location '${PROJECT_ROOT}'; .\\start-all.ps1`]);
  
  logActivity(ctx.from.id, "start-svc", "", "success");
  await ctx.reply("✅ Services starting... (butuh beberapa detik)");
});

// ============ SYSTEM INFO ============
bot.command("processes", async (ctx) => {
  const result = runCommand("tasklist", ["/FI", "IMAGENAME eq node.exe", "/FO", "CSV"]);
  await ctx.reply(
    `⚙️ *Node.js Processes*\n\`\`\`\n${result.output.substring(0, 3500)}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("uptime", async (ctx) => {
  const result = runCommand("powershell", ["-Command", "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime"]);
  await ctx.reply(`⏰ *Uptime:* ${result.output.trim()}`, { parse_mode: "Markdown" });
});

// ============ QUICK ACTIONS ============
bot.command("deploy", async (ctx) => {
  await ctx.reply("🚀 *Deploying...*\n\n1/2 Building...", { parse_mode: "Markdown" });
  
  const buildResult = await runCommandAsync("npm", ["run", "build"]);
  
  if (!buildResult.success) {
    await ctx.reply(`❌ Build gagal:\n${buildResult.output.substring(buildResult.output.length - 500)}`);
    return;
  }
  
  await ctx.reply("🚀 *Deploying...*\n\n2/2 Restarting preview...", { parse_mode: "Markdown" });
  
  // Restart preview
  runCommandAsync("powershell", ["-Command", `Set-Location '${PROJECT_ROOT}'; .\\start-all.ps1`]);
  
  logActivity(ctx.from.id, "deploy", "", "success");
  await ctx.reply("✅ *Deploy berhasil!*\n\nPreview akan tersedia dalam beberapa detik.");
});

bot.command("update", async (ctx) => {
  await ctx.reply("📥 *Updating...*\n\n1/3 Git pull...", { parse_mode: "Markdown" });
  
  const pullResult = await runCommandAsync("git", ["pull"]);
  if (!pullResult.success) {
    await ctx.reply(`❌ Pull gagal:\n${pullResult.output}`);
    return;
  }
  
  await ctx.reply("🔨 *Updating...*\n\n2/3 Building...", { parse_mode: "Markdown" });
  
  const buildResult = await runCommandAsync("npm", ["run", "build"]);
  if (!buildResult.success) {
    await ctx.reply(`❌ Build gagal:\n${buildResult.output.substring(buildResult.output.length - 500)}`);
    return;
  }
  
  await ctx.reply("🚀 *Updating...*\n\n3/3 Restarting...", { parse_mode: "Markdown" });
  
  runCommandAsync("powershell", ["-Command", `Set-Location '${PROJECT_ROOT}'; .\\start-all.ps1`]);
  
  logActivity(ctx.from.id, "update", "", "success");
  await ctx.reply("✅ *Update berhasil!*");
});

bot.command("backup", async (ctx) => {
  await ctx.reply("💾 *Backing up...*", { parse_mode: "Markdown" });
  
  const addResult = runCommand("git", ["add", "."]);
  const commitResult = await runCommandAsync("git", ["commit", "-m", `backup: auto backup ${new Date().toISOString()}`]);
  const pushResult = await runCommandAsync("git", ["push"]);
  
  logActivity(ctx.from.id, "backup", "", pushResult.success ? "success" : "error");
  
  await ctx.reply(
    pushResult.success ? 
    "✅ *Backup berhasil!* Semua perubahan sudah di-push." : 
    `❌ Backup gagal:\n${pushResult.output}`,
    { parse_mode: "Markdown" }
  );
});

// ============ PSEO CMS ============
bot.command("seo", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const kota = args.join(" ");
  if (!kota) {
    await ctx.reply("Usage: /seo [Nama Kota]");
    return;
  }
  
  await ctx.reply(`🚀 *Membuat halaman SEO untuk ${kota}...*\nAI sedang meracik konten, mohon tunggu...`, { parse_mode: "Markdown" });
  
  try {
    const prompt = `Buatkan konten SEO paku bumi untuk kota ${kota}. 
Kembalikan HANYA format JSON valid tanpa markdown backticks, seperti ini:
{
  "slug": "kebab-case-nama-kota",
  "name": "${kota}",
  "province": "Nama Provinsi",
  "description": "2 kalimat penjelasan jasa bore pile profesional di wilayah ini",
  "localFaqs": [
    { "question": "Tanya 1 spesifik wilayah ini?", "answer": "Jawab 1" },
    { "question": "Tanya 2 spesifik wilayah ini?", "answer": "Jawab 2" }
  ]
}`;
    
    const result = await ai.sendPrompt(prompt);
    if (!result.success) {
      await ctx.reply(`❌ Gagal generate konten: ${result.error}`);
      return;
    }
    
    const jsonStr = result.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const newCity = JSON.parse(jsonStr);
    
    const citiesPath = path.join(PROJECT_ROOT, "src", "data", "cities.json");
    const citiesData = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
    
    const existingIndex = citiesData.findIndex(c => c.slug === newCity.slug);
    if (existingIndex > -1) {
      citiesData[existingIndex] = newCity;
      await ctx.reply(`🔄 Halaman *${kota}* sudah ada, data diperbarui!`, { parse_mode: "Markdown" });
    } else {
      citiesData.push(newCity);
      await ctx.reply(`✅ Halaman baru *${kota}* berhasil diracik!`, { parse_mode: "Markdown" });
    }
    
    fs.writeFileSync(citiesPath, JSON.stringify(citiesData, null, 2));
    
    await ctx.reply("🚀 *Mendeploy website...*", { parse_mode: "Markdown" });
    const deployResult = runCommand("npm", ["run", "build"]);
    if (deployResult.code !== 0) {
      await ctx.reply(`❌ Deploy Gagal:\n${deployResult.error}`);
      return;
    }
    
    await ctx.reply(`🎉 *SELESAI!*\nHalaman live: /area/${newCity.slug}`, { parse_mode: "Markdown" });
    
  } catch (err) {
    await ctx.reply(`❌ Error SEO CMS: ${err.message}\nBisa jadi format AI tidak valid JSON.`);
  }
});

// ============ AI INTEGRATION ============
bot.command("ai", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const prompt = args.join(" ");
  
  if (!prompt) {
    await ctx.reply("Usage: /ai [pertanyaan atau instruksi]");
    return;
  }
  
  // Kirim indikator loading
  const loadingMsg = await ctx.reply("⏳ *Processing...*", { parse_mode: "Markdown" });
  
  // Kirim ke AI
  const result = await ai.sendPrompt(prompt);
  
  // Edit pesan dengan hasil
  if (result.success) {
    const response = 
      `🤖 *[${result.model}]*\n\n` +
      `${result.text}\n\n` +
      `---\n` +
      `👤 Account: ${result.account}\n` +
      `⚡ Sisa kuota: ${result.remaining}`;
    
    // Split jika terlalu panjang
    if (response.length > 4000) {
      await bot.api.editMessageText(
        ctx.chat.id, 
        loadingMsg.message_id, 
        response.substring(0, 4000)
      );
    } else {
      await bot.api.editMessageText(
        ctx.chat.id, 
        loadingMsg.message_id, 
        response,
        { parse_mode: "Markdown" }
      );
    }
  } else {
    await bot.api.editMessageText(
      ctx.chat.id, 
      loadingMsg.message_id,
      `❌ *AI Error:*\n${result.error}`,
      { parse_mode: "Markdown" }
    );
  }
  
  logActivity(ctx.from.id, "ai", prompt.substring(0, 100), result.success ? "success" : "error");
});

bot.command("ai-model", async (ctx) => {
  const status = ai.getStatus();
  const keyboard = new InlineKeyboard()
    .text("🏆 3.1 Pro High (Kasta Tertinggi)", "model_gemini-3.1-pro-preview").row()
    .text("👑 Pro Latest (Stabil)", "model_gemini-pro-latest").row()
    .text("⚡ 3.5 Flash (Paling Gesit)", "model_gemini-3.5-flash").row()
    .text("💨 Flash Latest (Stabil)", "model_gemini-flash-latest").row()
    .text("⚙️ 2.5 Flash (Lama)", "model_gemini-2.5-flash");
    
  await ctx.reply(`🤖 *Model AI saat ini:* \`${status.model}\`\n\nSilakan klik tombol di bawah untuk mengganti model:`, {
    reply_markup: keyboard,
    parse_mode: "Markdown"
  });
});

// Handler callback_query digabung di atas

bot.command("ai-account", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const accountId = parseInt(args[0]);
  
  if (!accountId) {
    const status = ai.getStatus();
    let output = `👤 *AI Account*\n\n`;
    output += `Account aktif: *${status.currentAccount.id}*\n`;
    output += `Email: ${status.currentAccount.email}\n\n`;
    output += `Ketik \`/ai-account 1\` atau \`/ai-account 2\` untuk switch.`;
    
    await ctx.reply(output, { parse_mode: "Markdown" });
    return;
  }
  
  const result = ai.switchAccount(accountId);
  await ctx.reply(
    result.success ? 
    `✅ ${result.message}` : 
    `❌ ${result.error}`
  );
});

bot.command("ai-status", async (ctx) => {
  const status = ai.formatStatus();
  await ctx.reply(status, { parse_mode: "Markdown" });
});

// ============ ERROR HANDLER ============
bot.catch((error) => {
  console.error("Bot error:", error);
  logActivity("system", "error", error.message, "error");
});

// ============ AUTONOMOUS AGENT (NATURAL LANGUAGE) ============
bot.on("message:text", async (ctx) => {
  // Hanya proses jika private chat ATAU user me-reply pesan dari bot ini
  const isPrivate = ctx.chat.type === "private";
  const isReplyToBot = ctx.message.reply_to_message && ctx.message.reply_to_message.from.id === ctx.me.id;
  
  if (!isPrivate && !isReplyToBot) return;

  const userText = ctx.message.text;
  if (userText.startsWith("/")) return; // Abaikan command
  
  const replyContext = ctx.message.reply_to_message ? ctx.message.reply_to_message.text : "";
  
  const loadingMsg = await ctx.reply("🧠 *Agent berpikir...*", { parse_mode: "Markdown" });
  
  try {
    const agentPrompt = `Kamu adalah Autonomous Agent ASeven Pile, asisten cerdas yang bertugas mengelola website perusahaan jasa bore pile. Kamu punya memori dan bisa mengeksekusi tindakan.

Konteks obrolan sebelumnya (JIKA ADA):
"""
${replyContext}
"""

Pesan/Perintah baru dari bos:
"""
${userText}
"""

TUGASMU:
1. Pahami maksud bos berdasarkan pesan baru dan konteks sebelumnya.
2. Jika bos ingin MEMASUKKAN DATA / REVISI / MENGHAPUS kota ke database, atau MEN-DEPLOY website, kamu HARUS merespons HANYA dengan blok JSON Action agar sistem bisa otomatis mengeksekusinya.
3. Jika bos HANYA minta dibuatkan Draf untuk dibaca dulu, atau sekadar ngobrol, balaslah dengan bahasa manusia (santai tapi profesional, gunakan sapaan "bos").

DAFTAR ACTION (Gunakan salah satu format ini DI DALAM teks balasanmu jika butuh eksekusi):

ACTION UPDATE/TAMBAH KOTA:
\`\`\`json_action
{
  "action": "UPDATE_CITY",
  "data": {
    "slug": "kebab-case-kota",
    "name": "Nama Kota",
    "province": "Nama Provinsi",
    "description": "Deskripsi unik 2 kalimat...",
    "localFaqs": [ { "question": "Tanya?", "answer": "Jawab" } ]
  }
}
\`\`\`

ACTION HAPUS KOTA:
\`\`\`json_action
{
  "action": "DELETE_CITY",
  "slug": "kebab-case-kota"
}
\`\`\`

ACTION DEPLOY WEBSITE:
\`\`\`json_action
{ "action": "DEPLOY" }
\`\`\`

ATURAN REVISI KETAT:
Jika bos meminta revisi dari teks sebelumnya, BACA konteks sebelumnya, temukan teks yang salah, dan hasilkan \`json_action\` "UPDATE_CITY" dengan data keseluruhan yang sudah diperbaiki kalimatnya sesuai permintaan bos.`;

    const result = await ai.sendPrompt(agentPrompt);
    
    if (!result.success) {
      await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, `❌ Error AI: ${result.error}`);
      return;
    }

    const aiResponse = result.text;
    
    // Deteksi apakah AI mengeluarkan JSON Action
    const actionMatch = aiResponse.match(/```json_action\n([\s\S]*?)```/);
    
    if (actionMatch) {
      // AI memutuskan untuk Action!
      const actionJson = JSON.parse(actionMatch[1].trim());
      const citiesPath = path.join(PROJECT_ROOT, "src", "data", "cities.json");
      const citiesData = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
      
      let replyMsg = "";
      
      if (actionJson.action === "UPDATE_CITY") {
        const existingIndex = citiesData.findIndex(c => c.slug === actionJson.data.slug);
        if (existingIndex > -1) {
          citiesData[existingIndex] = actionJson.data;
          replyMsg = `✅ *Tindakan Agen:* Data kota *${actionJson.data.name}* berhasil direvisi di database!`;
        } else {
          citiesData.push(actionJson.data);
          replyMsg = `✅ *Tindakan Agen:* Data kota *${actionJson.data.name}* berhasil ditambahkan ke database!`;
        }
        fs.writeFileSync(citiesPath, JSON.stringify(citiesData, null, 2));
      } 
      else if (actionJson.action === "DELETE_CITY") {
        const filtered = citiesData.filter(c => c.slug !== actionJson.slug);
        fs.writeFileSync(citiesPath, JSON.stringify(filtered, null, 2));
        replyMsg = `🗑️ *Tindakan Agen:* Data kota *${actionJson.slug}* berhasil dihapus dari database!`;
      }
      else if (actionJson.action === "DEPLOY") {
        replyMsg = `🚀 *Tindakan Agen:* Mengeksekusi Deploy Website...`;
        await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, replyMsg, { parse_mode: "Markdown" });
        runCommand("npm", ["run", "build"]);
        await ctx.reply(`🎉 *Deploy Selesai!* Website sudah live dengan data terbaru.`);
        return;
      }
      
      // Jika ada teks manusiawi di luar blok json_action, tampilkan juga
      const humanText = aiResponse.replace(/```json_action\n[\s\S]*?```/, '').trim();
      if (humanText) {
        replyMsg = humanText + "\n\n" + replyMsg;
      }
      
      await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, replyMsg, { parse_mode: "Markdown" });
      
    } else {
      // AI hanya membalas percakapan (Draft/Tanya-jawab)
      await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, aiResponse, { parse_mode: "Markdown" });
    }
    
  } catch (err) {
    await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, `❌ Agen mengalami error saat berpikir: ${err.message}`);
  }
});

// ============ START BOT ============
console.log("🤖 Telegram bot v2.0 (Grammy) aktif...");
console.log(`📁 Project root: ${PROJECT_ROOT}`);

bot.start({
  onStart: (botInfo) => {
    console.log(`✅ @${botInfo.username} berhasil start!`);
    logActivity("system", "bot-start", `Bot @${botInfo.username} started`, "success");
  },
}).catch((error) => {
  console.error("Polling error:", error);
  process.exitCode = 1;
});
