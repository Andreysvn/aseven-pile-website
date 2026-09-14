const path = require("path");
const fs = require("fs");
const net = require("net");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const { Bot } = require("grammy");
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
bot.command("start", async (ctx) => {
  await ctx.reply(
    "🤖 *Bot ASEVEN PILE v2.0*\n\n" +
    "Ketik /help untuk melihat semua command.\n\n" +
    "✅ *Status: Online*\n" +
    `👤 User: ${ctx.from.first_name}`,
    { parse_mode: "Markdown" }
  );
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
      `🤖 *AI Response*\n\n` +
      `${result.text}\n\n` +
      `---\n` +
      `👤 Account: ${result.account}\n` +
      `🧠 Model: ${result.model}\n` +
      `📉 Sisa kuota: ${result.remaining}`;
    
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
  const args = ctx.message.text.split(" ").slice(1);
  const model = args[0];
  
  if (!model) {
    const status = ai.getStatus();
    await ctx.reply(
      `🧠 *AI Model saat ini:* ${status.model}\n\n` +
      `Pilihan tersedia:\n` +
      "├ `gemini-1.5-pro` - Paling pintar\n" +
      "├ `gemini-1.5-flash` - Cepat & hemat\n" +
      "├ `gemini-2.0-flash` - Terbaru\n" +
      "└ `gemini-2.5-pro` - Terbaru & terkuat\n\n" +
      `Usage: /ai-model [nama-model]`,
      { parse_mode: "Markdown" }
    );
    return;
  }
  
  const result = ai.setModel(model);
  await ctx.reply(
    result.success ? 
    `✅ ${result.message}` : 
    `❌ ${result.error}`
  );
});

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
