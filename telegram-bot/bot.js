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
const { GEMINI_MODELS, THINKING_LEVELS } = require("./utils/gemini-client");
const { buildAgentPrompt } = require("./utils/system-prompt");

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
  const provider = ai.activeProvider === "gemini" ? "✨ Gemini" : "🧠 OpenCode";
  const keyboard = new InlineKeyboard()
    .text(`${provider} Aktif`, "action_ai_provider").row()
    .text("🔧 AI Settings", "action_ai_settings")
    .text("💬 Kirim Pesan AI", "action_agent_info").row()
    .text("🚀 Deploy & Server", "action_server_menu")
    .text("📂 Git Control", "action_git_menu").row()
    .text("🔎 SEO & Audit", "action_seo_menu")
    .text("🏙️ City CMS", "action_city_menu").row()
    .text("💰 Harga", "action_harga_menu")
    .text("💻 System", "action_system_menu").row()
    .text("📝 Code Quality", "action_code_menu")
    .text("📂 File Explorer", "action_file_menu").row()
    .text("📊 Status Lengkap", "action_cek_status").row()
    .text("❓ Bantuan", "action_bantuan");
    
  await ctx.reply("🚀 *MAIN MENU ASEVEN PILE*\n\nSelamat datang bos! Semua kendali ada di tangan Anda.\n\nKlik tombol di bawah untuk navigasi:", {
    reply_markup: keyboard,
    parse_mode: "Markdown"
  });
});

bot.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;
  
  if (data === "action_agent_info") {
    await ctx.answerCallbackQuery();
    await ctx.reply("🤖 *CARA PAKAI AI*\n\nKetik langsung di chat ini pakai bahasa sehari-hari.\n\nContoh:\n_\"Tolong buatin draf halaman kota Semarang.\"_\n_\"Cek database kota, kalau ada Bandung tolong hapus.\"_\n\nAgent akan mengerti dan merespons!", { parse_mode: "Markdown" });
    return;
  }
  
  if (data === "action_ai_provider") {
    const current = ai.activeProvider;
    const keyboard = new InlineKeyboard();
    
    if (current === "opencode") {
      keyboard.text("✅ OpenCode (aktif)", "noop").row();
    } else {
      keyboard.text("Switch ke OpenCode", "switch_opencode").row();
    }
    
    if (ai.gemini.hasAccounts) {
      if (current === "gemini") {
        keyboard.text("✅ Gemini (aktif)", "noop").row();
      } else {
        keyboard.text("Switch ke Gemini", "switch_gemini").row();
      }
    }
    
    keyboard.text("⬅️ Menu Utama", "action_back_main");
    
    await ctx.editMessageText(
      `🔄 *Switch Provider*\n\n` +
      `Provider aktif: *${current.toUpperCase()}*\n\n` +
      `Pilih provider AI yang ingin digunakan:`,
      { reply_markup: keyboard, parse_mode: "Markdown" }
    );
    return;
  }

  if (data === "switch_opencode") {
    const result = ai.switchProvider("opencode");
    await ctx.answerCallbackQuery(result.message);
    await ctx.editMessageText(`✅ Provider diubah ke *OpenCode*`, { parse_mode: "Markdown" });
    return;
  }

  if (data === "switch_gemini") {
    const result = ai.switchProvider("gemini");
    await ctx.answerCallbackQuery(result.message || result.error);
    if (result.success) {
      await ctx.editMessageText(`✅ Provider diubah ke *Gemini*\nModel: ${ai.gemini.currentModel}\nThinking: ${ai.gemini.thinkingLevel}`, { parse_mode: "Markdown" });
    } else {
      await ctx.editMessageText(`❌ ${result.error}`, { parse_mode: "Markdown" });
    }
    return;
  }

  if (data === "noop") {
    await ctx.answerCallbackQuery();
    return;
  }
  
  if (data === "action_batal_pending") {
    delete global._pendingMenuAction;
    delete global._pendingFaqSlug;
    delete global._pendingHargaTipe;
    delete global._pendingHargaDiam;
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("❌ Dibatalkan.", { reply_markup: { inline_keyboard: [[{ text: "⬅️ Menu Utama", callback_data: "action_back_main" }]] } });
    return;
  }
  
  if (data === "action_ai_settings") {
    const status = ai.getStatus();
    
    if (status.provider === "Gemini") {
      const keyboard = new InlineKeyboard()
        .text("🔧 Ganti Model", "action_ganti_gemini_model")
        .text("🤔 Thinking Level", "action_ganti_thinking").row()
        .text("👤 Switch Akun", "action_switch_gemini_account")
        .text("📊 Status Detail", "action_gemini_status").row()
        .text("🔄 Switch Provider", "action_ai_provider")
        .text("⬅️ Menu Utama", "action_back_main");

      await ctx.editMessageText(
        `✨ *GEMINI AI*\n\n` +
        `🤖 Model: *${status.model}*\n` +
        `🧠 Thinking: *${status.thinking}*\n` +
        `👤 Akun: *${status.activeAccount}*\n` +
        `📈 Requests: *${status.totalRequests}*\n\n` +
        `Pilih menu:`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    } else {
      const keyboard = new InlineKeyboard()
        .text("🔧 Ganti Model", "action_ganti_model")
        .text("🆕 Session Baru", "action_new_session").row()
        .text("📋 List Session", "action_list_sessions")
        .text("🗑 Hapus Session", "action_delete_session").row()
        .text("🔄 Switch Provider", "action_ai_provider")
        .text("⬅️ Menu Utama", "action_back_main");

      await ctx.editMessageText(
        `🧠 *OPENCODE AI*\n\n` +
        `🤖 Model: *${status.model}*\n` +
        `🔌 Server: *${status.server}*\n` +
        `💰 Cost: *FREE*\n\n` +
        `Pilih menu:`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    }
    return;
  }

  if (data === "action_back_main") {
    const provider = ai.activeProvider === "gemini" ? "✨ Gemini" : "🧠 OpenCode";
    const keyboard = new InlineKeyboard()
      .text(`${provider} Aktif`, "action_ai_provider").row()
      .text("🔧 AI Settings", "action_ai_settings")
      .text("💬 Kirim Pesan AI", "action_agent_info").row()
      .text("🚀 Deploy & Server", "action_server_menu")
      .text("📂 Git Control", "action_git_menu").row()
      .text("🔎 SEO & Audit", "action_seo_menu")
      .text("🏙️ City CMS", "action_city_menu").row()
      .text("💰 Harga", "action_harga_menu")
      .text("💻 System", "action_system_menu").row()
      .text("📝 Code Quality", "action_code_menu")
      .text("📂 File Explorer", "action_file_menu").row()
      .text("📊 Status Lengkap", "action_cek_status").row()
      .text("❓ Bantuan", "action_bantuan");
    
    await ctx.editMessageText("🚀 *MAIN MENU ASEVEN PILE*\n\nSelamat datang bos! Semua kendali ada di tangan Anda.\n\nKlik tombol di bawah untuk navigasi:", {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ GIT MENU ============
  if (data === "action_git_menu") {
    const keyboard = new InlineKeyboard()
      .text("📋 Git Status", "menu_gitstatus").row()
      .text("📝 Git Diff", "menu_gitdiff").row()
      .text("⬇️ Git Pull", "menu_gitpull").row()
      .text("⬆️ Git Push", "menu_gitpush").row()
      .text("📌 Git Add", "menu_gitadd").row()
      .text("💬 Git Commit", "menu_gitcommit").row()
      .text("📜 Git Log", "menu_gitlog").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("📂 *GIT CONTROL*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ SEO & AUDIT MENU ============
  if (data === "action_seo_menu") {
    const keyboard = new InlineKeyboard()
      .text("🔎 Cek SEO Homepage", "menu_seocheck").row()
      .text("📊 Audit SEO Semua Kota", "menu_seoaudit").row()
      .text("📄 Audit 1 Halaman Kota", "menu_seopage").row()
      .text("📋 List Semua Halaman", "menu_pages").row()
      .text("🔍 Audit Halaman Spesifik", "menu_auditpage").row()
      .text("💰 Cek Konsistensi Harga", "menu_pricingcheck").row()
      .text("⚡ Lighthouse Audit", "menu_lighthouse").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("🔎 *SEO & AUDIT*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ CITY CMS MENU ============
  if (data === "action_city_menu") {
    const keyboard = new InlineKeyboard()
      .text("📋 Daftar Kota", "menu_cities").row()
      .text("🤖 Generate SEO Kota", "menu_seo_gen").row()
      .text("➕ Tambah Kota", "menu_addcity").row()
      .text("👁️ Lihat Kota", "menu_viewcity").row()
      .text("✏️ Edit Kota", "menu_editcity").row()
      .text("🗑️ Hapus Kota", "menu_deletecity").row()
      .text("❓ Tambah FAQ", "menu_addfaq").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("🏙️ *CITY CMS*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ HARGA MENU ============
  if (data === "action_harga_menu") {
    const keyboard = new InlineKeyboard()
      .text("📋 Daftar Harga", "menu_listharga").row()
      .text("📄 Lihat URL Harga", "menu_hargapage").row()
      .text("📚 Semua URL Harga", "menu_allhargapages").row()
      .text("💰 Update Harga", "action_update_harga").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("💰 *HARGA*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ SYSTEM MENU ============
  if (data === "action_system_menu") {
    const keyboard = new InlineKeyboard()
      .text("💻 System Info", "menu_sysinfo").row()
      .text("⏱️ Uptime", "menu_uptime").row()
      .text("📊 Running Processes", "menu_processes").row()
      .text("🏥 Health Check", "menu_health").row()
      .text("🩺 Project Health", "menu_projecthealth").row()
      .text("📦 Cek Dependencies", "menu_deps").row()
      .text("📥 Install Dependencies", "menu_depsinstall").row()
      .text("🔒 Security Audit", "menu_audit").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("💻 *SYSTEM*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ CODE QUALITY MENU ============
  if (data === "action_code_menu") {
    const keyboard = new InlineKeyboard()
      .text("🔍 TypeScript Check", "menu_typecheck").row()
      .text("🧹 Lint Code", "menu_lint").row()
      .text("🔨 Build Check", "menu_buildcheck").row()
      .text("📦 Bundle Size", "menu_bundlesize").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("📝 *CODE QUALITY*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ FILE EXPLORER MENU ============
  if (data === "action_file_menu") {
    const keyboard = new InlineKeyboard()
      .text("📋 List Folder", "menu_ls").row()
      .text("📄 Baca File", "menu_cat").row()
      .text("📁 Buat Folder", "menu_mkdir").row()
      .text("📝 Buat File", "menu_touch").row()
      .text("🗑️ Hapus File", "menu_rm").row()
      .text("⬅️ Kembali", "action_back_main");

    await ctx.editMessageText("📂 *FILE EXPLORER*\n\nPilih perintah:", {
      reply_markup: keyboard, parse_mode: "Markdown"
    });
    return;
  }
  
  // ============ GIT COMMAND MENU HANDLERS ============
  if (data === "menu_gitstatus") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/gitstatus");
    return;
  }
  if (data === "menu_gitdiff") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/gitdiff");
    return;
  }
  if (data === "menu_gitpull") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/gitpull");
    return;
  }
  if (data === "menu_gitpush") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/gitpush");
    return;
  }
  if (data === "menu_gitlog") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/gitlog");
    return;
  }
  if (data === "menu_gitadd") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "gitadd";
    await ctx.reply("📌 *Git Add*\n\nKetik nama file yang mau di-add:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_gitcommit") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "gitcommit";
    await ctx.reply("💬 *Git Commit*\n\nKetik pesan commit:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  
  // ============ SEO COMMAND MENU HANDLERS ============
  if (data === "menu_seocheck") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/seocheck");
    return;
  }
  if (data === "menu_seoaudit") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/seoaudit");
    return;
  }
  if (data === "menu_pages") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/pages");
    return;
  }
  if (data === "menu_lighthouse") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/lighthouse");
    return;
  }
  if (data === "menu_pricingcheck") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/pricingcheck");
    return;
  }
  if (data === "menu_seopage") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "seopage";
    await ctx.reply("📄 *Audit SEO Halaman Kota*\n\nKetik slug kota:\nContoh: `jakarta-selatan`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_auditpage") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "auditpage";
    await ctx.reply("🔍 *Audit Halaman Spesifik*\n\nKetik path halaman:\nContoh: `faq` atau `harga/bore-pile/30-bekasi`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  
  // ============ CITY CMS MENU HANDLERS ============
  if (data === "menu_cities") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/cities");
    return;
  }
  if (data === "menu_seo_gen") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "seo_gen";
    await ctx.reply("🤖 *Generate SEO Kota*\n\nKetik nama kota yang mau dibuatkan halaman SEO:\nContoh: `Bandung`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_addcity") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "addcity";
    await ctx.reply(
      "➕ *Tambah Kota*\n\nKetik data kota dalam format JSON:\n\n" +
      "```json\n" +
      '{"slug":"nama-kota","name":"Nama Kota","province":"Provinsi","description":"Deskripsi jasa bore pile","localFaqs":[{"question":"Tanya?","answer":"Jawab."}]}\n' +
      "```",
      { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } }
    );
    return;
  }
  if (data === "menu_viewcity") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "viewcity";
    await ctx.reply("👁️ *Lihat Kota*\n\nKetik slug kota:\nContoh: `jakarta-selatan`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_editcity") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "editcity";
    await ctx.reply("✏️ *Edit Kota*\n\nKetik slug kota yang mau diedit:\nContoh: `jakarta-selatan`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_deletecity") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "deletecity";
    await ctx.reply("🗑️ *Hapus Kota*\n\nKetik slug kota yang mau dihapus:\nContoh: `jakarta-selatan`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_addfaq") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "addfaq_step1";
    await ctx.reply("❓ *Tambah FAQ*\n\nKetik slug kota:\nContoh: `jakarta-selatan`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  
  // ============ HARGA MENU HANDLERS ============
  if (data === "menu_listharga") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/listharga");
    return;
  }
  if (data === "menu_allhargapages") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/allhargapages");
    return;
  }
  if (data === "menu_hargapage") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "hargapage_step1";
    await ctx.reply("📄 *Lihat URL Harga*\n\nPilih tipe:\n1. `bore-pile`\n2. `strauss-pile`\n\nKetik tipe:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  
  // ============ SYSTEM MENU HANDLERS ============
  if (data === "menu_sysinfo") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/sysinfo");
    return;
  }
  if (data === "menu_uptime") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/uptime");
    return;
  }
  if (data === "menu_processes") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/processes");
    return;
  }
  if (data === "menu_health") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/health");
    return;
  }
  if (data === "menu_projecthealth") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/projecthealth");
    return;
  }
  if (data === "menu_deps") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/deps");
    return;
  }
  if (data === "menu_depsinstall") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/depsinstall");
    return;
  }
  if (data === "menu_audit") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/audit");
    return;
  }
  
  // ============ CODE QUALITY MENU HANDLERS ============
  if (data === "menu_typecheck") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/typecheck");
    return;
  }
  if (data === "menu_lint") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/lint");
    return;
  }
  if (data === "menu_buildcheck") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/buildcheck");
    return;
  }
  if (data === "menu_bundlesize") {
    await ctx.answerCallbackQuery("Menjalankan...");
    await ctx.reply("/bundlesize");
    return;
  }
  
  // ============ FILE EXPLORER MENU HANDLERS ============
  if (data === "menu_ls") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "ls";
    await ctx.reply("📋 *List Folder*\n\nKetik folder (atau kosong untuk folder saat ini):", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_cat") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "cat";
    await ctx.reply("📄 *Baca File*\n\nKetik path file:\nContoh: `src/data/cities.json`", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_mkdir") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "mkdir";
    await ctx.reply("📁 *Buat Folder*\n\nKetik nama folder:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_touch") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "touch";
    await ctx.reply("📝 *Buat File*\n\nKetik nama file:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  if (data === "menu_rm") {
    await ctx.answerCallbackQuery();
    global._pendingMenuAction = "rm";
    await ctx.reply("🗑️ *Hapus File*\n\nKetik nama file yang mau dihapus:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
    return;
  }
  
  if (data === "action_server_menu") {
    const keyboard = new InlineKeyboard()
      .text("🚀 Deploy ASeven Pile", "server_deploy").row()
      .text("🔄 Update (Pull + Build)", "server_update").row()
      .text("💾 Backup ke GitHub", "server_backup").row()
      .text("💰 Update Harga", "action_update_harga").row()
      .text("📅 Update Tanggal SEO", "action_update_seo_date").row()
      .text("⚡ Restart Services", "server_restart").row()
      .text("⏹️ Stop Semua Service", "server_stop").row()
      .text("💻 Restart Laptop", "laptop_restart").row()
      .text("⏻ Shutdown Laptop", "laptop_shutdown").row()
      .text("🔴 Kill All & Shutdown", "laptop_force_shutdown").row()
      .text("⬅️ Menu Utama", "action_back_main");

    await ctx.editMessageText(`💻 *KONTROL LAPTOP & PROJECT*\n\n⚠️ Perintah di bawah akan langsung dieksekusi.`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }

  if (data === "action_ganti_model") {
    const { ZEN_FREE_MODELS, PAID_MODELS } = require("./utils/opencode-client");
    const status = ai.getStatus();
    const keyboard = new InlineKeyboard();
    
    for (const m of ZEN_FREE_MODELS) {
      const icon = m.available ? "✅" : "❌";
      keyboard.text(`${icon} ${m.name}`, `model_${m.id}`).row();
    }
    for (const m of PAID_MODELS) {
      const icon = m.available ? "💰" : "❌";
      keyboard.text(`${icon} ${m.name}`, `model_${m.id}`).row();
    }
    keyboard.text("⬅️ Kembali", "action_ai_settings");
      
    await ctx.editMessageText(`🤖 *Model AI saat ini:* \`${status.model}\`\n\nSilakan klik tombol di bawah untuk mengganti model:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }
  
  if (data === "action_new_session") {
    await ctx.answerCallbackQuery();
    const chatId = ctx.from.id;
    ai.clearLocalSession(chatId);
    await ctx.editMessageText("✅ Session baru dibuat! Ketik pesan AI baru di chat.", { parse_mode: "Markdown" });
    return;
  }

  if (data === "action_list_sessions") {
    await ctx.answerCallbackQuery("Memuat sessions...");
    const result = await ai.listSessions();
    if (!result.success) {
      await ctx.editMessageText(`❌ Gagal ambil sessions: ${result.error}`);
      return;
    }
    const sessions = result.sessions || [];
    if (sessions.length === 0) {
      await ctx.editMessageText("📭 Belum ada session. Ketik pesan AI untuk mulai.");
      return;
    }
    let text = `📋 *Sessions (${sessions.length}):*\n\n`;
    for (const s of sessions.slice(0, 10)) {
      const title = s.title || "Untitled";
      const id = s.id || "unknown";
      text += `• *${title}*\n  \`${id.substring(0, 16)}...\`\n`;
    }
    await ctx.editMessageText(text, { parse_mode: "Markdown" });
    return;
  }

  if (data === "action_delete_session") {
    await ctx.answerCallbackQuery();
    const chatId = ctx.from.id;
    const result = ai.clearLocalSession(chatId);
    await ctx.editMessageText("✅ Session lokal dihapus. Session berikutnya akan baru.", { parse_mode: "Markdown" });
    return;
  }

  if (data === "action_ganti_gemini_model") {
    const keyboard = new InlineKeyboard();
    for (const m of GEMINI_MODELS) {
      const icon = !m.available ? "❌" : m.id === ai.gemini.currentModel ? "✅" : "•";
      keyboard.text(`${icon} ${m.name}`, `gemini_model_${m.id}`).row();
    }
    keyboard.text("⬅️ Kembali", "action_ai_settings");
    
    await ctx.editMessageText(
      `🔧 *Ganti Model Gemini*\n\nModel aktif: *${ai.gemini.currentModel}*\n\nPilih model:`,
      { reply_markup: keyboard, parse_mode: "Markdown" }
    );
    return;
  }

  if (data.startsWith("gemini_model_")) {
    const modelId = data.replace("gemini_model_", "");
    const result = ai.setGeminiModel(modelId);
    await ctx.answerCallbackQuery(result.message || result.error);
    if (result.success) {
      await ctx.editMessageText(`✅ Model diubah ke *${modelId}*`, { parse_mode: "Markdown" });
    } else {
      await ctx.editMessageText(`❌ ${result.error}`, { parse_mode: "Markdown" });
    }
    return;
  }

  if (data === "action_ganti_thinking") {
    const keyboard = new InlineKeyboard();
    for (const level of THINKING_LEVELS) {
      const icon = level === ai.gemini.thinkingLevel ? "✅" : "•";
      keyboard.text(`${icon} ${level.toUpperCase()}`, `thinking_${level}`).row();
    }
    keyboard.text("⬅️ Kembali", "action_ai_settings");
    
    await ctx.editMessageText(
      `🤔 *Thinking Level*\n\nLevel aktif: *${ai.gemini.thinkingLevel.toUpperCase()}*\n\n` +
      `• MINIMAL — hampir gak mikir, respons cepat\n` +
      `• LOW — mikir dikit\n` +
      `• MEDIUM — mikir sedang\n` +
      `• HIGH — mikir dalam, cocok untuk coding`,
      { reply_markup: keyboard, parse_mode: "Markdown" }
    );
    return;
  }

  if (data.startsWith("thinking_")) {
    const level = data.replace("thinking_", "");
    const result = ai.setGeminiThinking(level);
    await ctx.answerCallbackQuery(result.message || result.error);
    if (result.success) {
      await ctx.editMessageText(`✅ Thinking level diubah ke *${level.toUpperCase()}*`, { parse_mode: "Markdown" });
    } else {
      await ctx.editMessageText(`❌ ${result.error}`, { parse_mode: "Markdown" });
    }
    return;
  }

  if (data === "action_switch_gemini_account") {
    const accounts = ai.gemini.getAllStatus();
    if (accounts.length === 0) {
      await ctx.editMessageText("❌ Tidak ada akun Gemini yang dikonfigurasi.");
      return;
    }
    
    const keyboard = new InlineKeyboard();
    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const icon = i === ai.gemini.activeAccountIndex ? "✅" : "•";
      const status = acc.isLimited ? `⏳ LIMIT ${acc.minutesUntilReset}m` : `${acc.requestCount} req`;
      keyboard.text(`${icon} ${acc.name} — ${status}`, `gemini_acc_${i}`).row();
    }
    keyboard.text("⬅️ Kembali", "action_ai_settings");
    
    let text = `👤 *SWITCH AKUN GEMINI*\n\n`;
    text += `Akun aktif: *${ai.gemini.activeAccount?.name || "N/A"}*\n\n`;
    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const icon = i === ai.gemini.activeAccountIndex ? "✅" : "⬜";
      const status = acc.isLimited ? `⏳ LIMIT ${acc.minutesUntilReset}m` : `✓ ${acc.requestCount} req`;
      text += `${icon} *${acc.name}*\n`;
      text += `   📧 \`${acc.email}\`\n`;
      text += `   📊 ${status}\n\n`;
    }
    
    await ctx.editMessageText(text, { reply_markup: keyboard, parse_mode: "Markdown" });
    return;
  }

  if (data.startsWith("gemini_acc_")) {
    const index = parseInt(data.replace("gemini_acc_", ""));
    const result = ai.switchGeminiAccount(index);
    await ctx.answerCallbackQuery(result.message || result.error);
    if (result.success) {
      await ctx.editMessageText(`✅ Beralih ke *${ai.gemini.activeAccount.name}*`, { parse_mode: "Markdown" });
    } else {
      await ctx.editMessageText(`❌ ${result.error}`, { parse_mode: "Markdown" });
    }
    return;
  }

  if (data === "action_gemini_status") {
    const status = ai.geminiStatus();
    let text = `📊 *GEMINI AI STATUS*\n\n`;
    text += `🤖 Model: *${status.model}*\n`;
    text += `🧠 Thinking: *${status.thinking}*\n`;
    text += `👤 Akun aktif: *${status.activeAccount}*\n`;
    text += `📈 Total requests: *${status.totalRequests}*\n\n`;
    
    text += `*AKUN:*\n`;
    for (const acc of status.accounts) {
      const icon = acc.name === status.activeAccount ? "✅" : "⬜";
      const limit = acc.isLimited ? ` ⏳ LIMIT ${acc.minutesUntilReset}m` : ` ✓ ${acc.requestCount} req`;
      text += `${icon} *${acc.name}*\n`;
      text += `   📧 \`${acc.email}\`\n`;
      text += `   📊${limit}\n`;
    }
    
    await ctx.editMessageText(text, { parse_mode: "Markdown" });
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

  if (data === "laptop_restart") {
    await ctx.answerCallbackQuery("Restart laptop...");
    await ctx.reply("💻 *Restart Laptop*\n\n⏳ Laptop akan restart dalam 5 detik...", { parse_mode: "Markdown" });
    logActivity(ctx.from.id, "laptop_restart", "", "success");
    runCommand("powershell", ["-Command", "Start-Process shutdown -ArgumentList '/r /t 5 /f' -WindowStyle Hidden"]);
    return;
  }

  if (data === "laptop_shutdown") {
    await ctx.answerCallbackQuery("Shutdown laptop...");
    await ctx.reply("⏻ *Shutdown Laptop*\n\n⏳ Laptop akan mati dalam 10 detik...", { parse_mode: "Markdown" });
    logActivity(ctx.from.id, "laptop_shutdown", "", "success");
    runCommand("powershell", ["-Command", "Start-Process shutdown -ArgumentList '/s /t 10 /f' -WindowStyle Hidden"]);
    return;
  }

  if (data === "laptop_force_shutdown") {
    await ctx.answerCallbackQuery("Kill all & shutdown...");
    await ctx.reply("🔴 *Kill All Process & Shutdown*\n\n⏳ Membunuh semua process non-esensial, lalu shutdown dalam 5 detik...", { parse_mode: "Markdown" });
    
    // Kill non-essential processes
    const processes = ["node.exe", "cloudflared.exe", "astro", "code.exe"];
    for (const proc of processes) {
      runCommand("powershell", ["-Command", `Get-Process -Name "${proc}" -ErrorAction SilentlyContinue | Stop-Process -Force`]);
    }
    
    logActivity(ctx.from.id, "laptop_force_shutdown", "", "success");
    
    // Shutdown after kill
    setTimeout(() => {
      runCommand("powershell", ["-Command", "Start-Process shutdown -ArgumentList '/s /t 5 /f' -WindowStyle Hidden"]);
    }, 2000);
    
    return;
  }

  if (data === "action_update_harga") {
    const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
    const content = fs.readFileSync(pricingPath, "utf8");
    
    const keyboard = new InlineKeyboard()
      .text("📊 Lihat Harga Saat Ini", "harga_view").row()
      .text("🔧 Update Harga Bore Pile", "harga_bore").row()
      .text("🔧 Update Harga Strauss", "harga_strauss").row()
      .text("🏗️ Update Mobilisasi", "harga_mobilisasi").row()
      .text("⬅️ Kembali", "action_server_menu");

    await ctx.editMessageText(`💰 *UPDATE HARGA*\n\nPilih yang mau diupdate:`, {
      reply_markup: keyboard,
      parse_mode: "Markdown"
    });
    return;
  }

  if (data === "harga_view") {
    await ctx.answerCallbackQuery();
    const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
    const content = fs.readFileSync(pricingPath, "utf8");
    
    let text = "📊 *HARGA SAAT INI*\n\n";
    text += "*BORE PILE (Mesin):*\n";
    const boreMatches = content.matchAll(/diameter:\s*(\d+),\s*\n\s*pricePerMeter:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g);
    for (const m of boreMatches) {
      text += `• ${m[1]}cm: Rp ${parseInt(m[2]).toLocaleString("id-ID")}/m\n`;
    }
    
    text += "\n*STRAUSS (Manual):*\n";
    const straussSection = content.split("Strauss Pile")[1] || "";
    const straussMatches = straussSection.matchAll(/diameter:\s*(\d+),\s*\n\s*pricePerMeter:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g);
    for (const m of straussMatches) {
      text += `• ${m[1]}cm: Rp ${parseInt(m[2]).toLocaleString("id-ID")}/m\n`;
    }
    
    const lastUpdated = content.match(/lastUpdated:\s*"([^"]+)"/)?.[1] || "unknown";
    text += `\n📅 Last Updated: *${lastUpdated}*`;
    
    await ctx.editMessageText(text, { parse_mode: "Markdown" });
    return;
  }

  if (data === "harga_bore" || data === "harga_strauss") {
    await ctx.answerCallbackQuery();
    const type = data === "harga_bore" ? "bore" : "strauss";
    const label = type === "bore" ? "Bore Pile (Mesin)" : "Strauss (Manual)";
    
    global._pendingHargaAction = { type, step: "diameter" };
    
    await ctx.editMessageText(
      `🔧 *Update Harga ${label}*\n\nKetik diameter yang mau diupdate (angka):`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (data === "harga_mobilisasi") {
    await ctx.answerCallbackQuery();
    global._pendingHargaAction = { type: "mobilisasi", step: "harga" };
    
    await ctx.editMessageText(
      `🏗️ *Update Mobilisasi Fee*\n\nHarga saat ini: Rp 3.500.000\nKetik harga baru (angka):`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (data === "action_update_seo_date") {
    await ctx.answerCallbackQuery();
    global._pendingSeoDate = true;
    
    const today = new Date().toISOString().split("T")[0];
    await ctx.editMessageText(
      `📅 *Update Tanggal SEO*\n\nTanggal saat ini: *${today}*\nKetik tanggal baru (YYYY-MM-DD) atau ketik "today" untuk hari ini:`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (data === "action_cek_status") {
    await ctx.answerCallbackQuery("Mengecek status...");
    const previewOnline = await isPortOpen(4321);
    const buildExists = fs.existsSync(path.join(PROJECT_ROOT, "dist", "index.html"));
    
    let opencodeStatus = "❌ offline";
    try {
      const { checkHealth } = require("./utils/opencode-client");
      const health = await checkHealth();
      opencodeStatus = health.healthy ? `✅ online` : `❌ offline`;
    } catch (e) {
      opencodeStatus = `❌ error`;
    }
    
    const statusText = 
      "📊 *STATUS PROJECT*\n\n" +
      `🤖 Bot: *online*\n` +
      `🧠 OpenCode: *${opencodeStatus}*\n` +
      `🌍 Preview: *${previewOnline ? "online" : "offline"}*\n` +
      `📦 Build: *${buildExists ? "tersedia" : "belum ada"}*\n` +
      `🔌 Port: *4321*`;
    await ctx.reply(statusText, { parse_mode: "Markdown" });
    return;
  }
  
  if (data === "action_bantuan") {
    await ctx.answerCallbackQuery();
    await ctx.reply("/help");
    return;
  }
  
  if (data.startsWith("model_")) {
    const modelName = data.replace("model_", "");
    const result = ai.setOpenCodeModel(modelName);
    await ctx.answerCallbackQuery(result.message || result.error || "Model diubah");
    if (result.success) {
      await ctx.editMessageText(`✅ Model diubah ke: *${modelName}*`, { parse_mode: "Markdown" });
    } else {
      await ctx.editMessageText(`❌ ${result.error}`, { parse_mode: "Markdown" });
    }
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
    "├ /gitstatus - Status repo\n" +
    "├ /gitdiff - Lihat perubahan\n" +
    "├ /gitpull - Pull dari remote\n" +
    "├ /gitadd [file] - Add ke staging\n" +
    "├ /gitcommit [msg] - Commit\n" +
    "├ /gitpush - Push ke remote\n" +
    "└ /gitlog - Lihat history\n\n" +
    
    "🚀 *SERVICE*\n" +
    "├ /build - Build Astro\n" +
    "├ /restart - Restart preview\n" +
    "├ /stop - Stop semua service\n" +
    "├ /startsvc - Start semua service\n" +
    "├ /logs - Lihat log\n" +
    "├ /health - Cek semua service\n" +
    "└ /preview - URL tunnel\n\n" +
    
    "🤖 *AI (OpenCode + Gemini)*\n" +
    "├ /ai [pertanyaan] - Tanya ke AI\n" +
    "├ /aimodel - Ganti model\n" +
    "└ /aistatus - Status kuota AI\n\n" +
    
    "🏙️ *CITY MANAGEMENT*\n" +
    "├ /cities - Daftar semua kota\n" +
    "├ /viewcity [slug] - Detail kota\n" +
    "├ /addcity {json} - Tambah/edit kota\n" +
    "├ /editcity [slug] - Edit kota\n" +
    "├ /deletecity [slug] - Hapus kota\n" +
    "├ /addfaq [slug] [pertanyaan] - Tambah FAQ\n" +
    "├ /seo [nama kota] - Generate via AI\n" +
    "├ /listharga - Daftar harga semua diameter\n" +
    "├ /hargapage [tipe] [d] [kota] - Lihat URL harga\n" +
    "└ /allhargapages - Semua URL harga\n\n" +
    
    "💻 *SYSTEM*\n" +
    "├ /sysinfo - Info CPU, RAM, Disk\n" +
    "├ /uptime - Berapa lama nyala\n" +
    "├ /processes - Running processes\n" +
    "├ /kill [nama/pid] - Kill proses ⚠️\n" +
    "├ /monitorstart - Mulai auto monitor\n" +
    "├ /monitorstop - Matikan monitor\n" +
    "└ /monitorstatus - Status monitor\n\n" +
    
    "🏥 *PROJECT HEALTH*\n" +
    "├ /projecthealth - Cek semua aspek\n" +
    "├ /deps - Cek outdated dependencies\n" +
    "├ /depsinstall - Install dependencies\n" +
    "└ /audit - Security audit npm\n\n" +
    
    "📝 *CODE QUALITY*\n" +
    "├ /typecheck - TypeScript check\n" +
    "├ /lint - Jalankan linter\n" +
    "└ /buildcheck - Test build\n\n" +
    
    "📊 *PERFORMANCE*\n" +
    "├ /bundlesize - Cek ukuran bundle\n" +
    "├ /seocheck - Cek SEO homepage\n" +
    "├ /seoaudit - Audit semua halaman kota\n" +
    "├ /seopage [slug] - Audit 1 halaman kota\n" +
    "├ /pages - List semua halaman\n" +
    "├ /auditpage [path] - Audit SEO halaman spesifik\n" +
    "├ /pricingcheck - Cek konsistensi harga\n" +
    "└ /lighthouse - Audit performa\n\n" +
    
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
bot.command("gitstatus", async (ctx) => {
  await ctx.reply("⏳ Checking git status...");
  const result = runCommand("git", ["status", "--short"]);
  await ctx.reply(
    result.success ? 
    `📊 *Git Status*\n\`\`\`\n${result.output}\n\`\`\`` : 
    `❌ Error: ${result.output}`,
    { parse_mode: "Markdown" }
  );
});

bot.command("gitdiff", async (ctx) => {
  const result = runCommand("git", ["diff"]);
  const output = result.output || "Tidak ada perubahan.";
  await ctx.reply(
    `📝 *Git Diff*\n\`\`\`\n${output.substring(0, 3500)}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});

bot.command("gitpull", async (ctx) => {
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

bot.command("gitadd", async (ctx) => {
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

bot.command("gitcommit", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const msg = args.join(" ");
  
  if (!msg) {
    await ctx.reply("Usage: /gitcommit [pesan commit]");
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

bot.command("gitpush", async (ctx) => {
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

bot.command("gitlog", async (ctx) => {
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
  
  let opencodeStatus = "❌ offline";
  try {
    const { checkHealth } = require("./utils/opencode-client");
    const health = await checkHealth();
    opencodeStatus = health.healthy ? `✅ online (v${health.version})` : `❌ ${health.error}`;
  } catch (e) {
    opencodeStatus = `❌ ${e.message}`;
  }
  
  const statusText = 
    "📊 *STATUS PROJECT*\n\n" +
    `🤖 Bot: *online*\n` +
    `🧠 OpenCode: *${opencodeStatus}*\n` +
    `🌍 Preview: *${previewOnline ? "online" : "offline"}*\n` +
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
  await ctx.reply("🔄 Restarting bot...");
  
  // Jalankan script restart (async, jangan tunggu)
  const scriptPath = path.join(__dirname, "restart-bot.ps1");
  require("child_process").exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
  
  logActivity(ctx.from.id, "restart", "", "success");
  // Jangan panggil process.exit disini, biar script yang kill
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

bot.command("startsvc", async (ctx) => {
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

// ============ SYSTEM INFO ============
bot.command("sysinfo", async (ctx) => {
  await ctx.reply("📊 *Mengumpulkan data system...*", { parse_mode: "Markdown" });
  
  const psScript = `
    $os = Get-CimInstance Win32_OperatingSystem
    $cpu = Get-CimInstance Win32_Processor
    $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    $ramUsed = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 2)
    $ramTotal = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $ramPercent = [math]::Round(($ramUsed / $ramTotal) * 100, 1)
    $diskFree = [math]::Round($disk.FreeSpace / 1GB, 2)
    $diskTotal = [math]::Round($disk.Size / 1GB, 2)
    $diskPercent = [math]::Round((($diskTotal - $diskFree) / $diskTotal) * 100, 1)
    $uptime = (Get-Date) - $os.LastBootUpTime
    $uptimeStr = "$($uptime.Days)h $($uptime.Hours)m $($uptime.Minutes)s"
    
    Write-Output "CPU: $($cpu.Name)"
    Write-Output "CPU Usage: $($cpu.LoadLocation)%"
    Write-Output "RAM: ${ramUsed}GB / ${ramTotal}GB (${ramPercent}%)"
    Write-Output "Disk C: ${diskFree}GB free / ${diskTotal}GB (${diskPercent}% used)"
    Write-Output "Uptime: ${uptimeStr}"
    Write-Output "OS: $($os.Caption)"
  `;
  
  const result = runCommand("powershell", ["-Command", psScript]);
  const lines = result.output.trim().split("\n");
  
  const statusText = 
    "📊 *SYSTEM INFO*\n\n" +
    `🖥️ *CPU:* ${lines[0]?.replace("CPU: ", "")}\n` +
    `⚡ *Load:* ${lines[1]?.replace("CPU Usage: ", "")}\n` +
    `🧠 *RAM:* ${lines[2]?.replace("RAM: ", "")}\n` +
    `💾 *Disk C:* ${lines[3]?.replace("Disk C: ", "")}\n` +
    `⏰ *Uptime:* ${lines[4]?.replace("Uptime: ", "")}\n` +
    `🪟 *OS:* ${lines[5]?.replace("OS: ", "")}`;
  
  await ctx.reply(statusText, { parse_mode: "Markdown" });
});

// ============ AUTO MONITOR ============
let monitorInterval = null;
let monitorChatId = null;

async function checkServices() {
  const services = [
    { name: "Preview (4321)", port: 4321 },
    { name: "OpenCode (4096)", port: 4096 },
  ];
  
  const issues = [];
  
  for (const svc of services) {
    const isOpen = await isPortOpen(svc.port);
    if (!isOpen) {
      issues.push(svc.name);
    }
  }
  
  // Check disk space
  const diskResult = runCommand("powershell", ["-Command", 
    "(Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\").FreeSpace / 1GB"
  ]);
  const diskFree = parseFloat(diskResult.output.trim());
  if (diskFree < 10) {
    issues.push(`Disk C: ${diskFree.toFixed(1)}GB tersisa`);
  }
  
  // Check RAM
  const ramResult = runCommand("powershell", ["-Command", 
    "$os = Get-CimInstance Win32_OperatingSystem; [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 1)"
  ]);
  const ramPercent = parseFloat(ramResult.output.trim());
  if (ramPercent > 90) {
    issues.push(`RAM: ${ramPercent}%`);
  }
  
  return issues;
}

async function autoRestartServices(chatId) {
  const issues = await checkServices();
  
  if (issues.length === 0) return;
  
  // Cek service mana yang mati
  const previewDown = issues.some(i => i.includes("4321"));
  const opencodeDown = issues.some(i => i.includes("4096"));
  const systemIssue = issues.some(i => i.includes("Disk") || i.includes("RAM"));
  
  let restarted = [];
  
  // Restart preview kalau mati
  if (previewDown) {
    const buildExists = fs.existsSync(path.join(PROJECT_ROOT, "dist", "index.html"));
    if (buildExists) {
      runCommandAsync("powershell", ["-Command", 
        "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*vite*preview*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
      ]);
      Start-Sleep(2000);
      runCommandAsync("powershell", ["-Command",
        "Set-Location '${PROJECT_ROOT}'; Start-Process powershell -ArgumentList '-NoExit','-Command','npm start' -WindowStyle Minimized"
      ]);
      restarted.push("Preview (4321)");
    } else {
      await bot.api.sendMessage(chatId, "⚠️ Preview down & belum build. Jalankan /deploy dulu.", { parse_mode: "Markdown" });
    }
  }
  
  // Restart OpenCode kalau mati
  if (opencodeDown) {
    runCommandAsync("powershell", ["-Command",
      "Start-Process powershell -ArgumentList '-NoExit','-Command','opencode serve --port 4096' -WindowStyle Minimized"
    ]);
    restarted.push("OpenCode (4096)");
  }
  
  if (restarted.length > 0) {
    await bot.api.sendMessage(chatId, `⚠️ *AUTO MONITOR*\n\nService down: ${issues.join(", ")}\n🔄 Restarting: ${restarted.join(", ")}...`, { parse_mode: "Markdown" });
    
    setTimeout(async () => {
      const newIssues = await checkServices();
      if (newIssues.length === 0) {
        await bot.api.sendMessage(chatId, `✅ Restart berhasil! ${restarted.join(", ")} online.`, { parse_mode: "Markdown" });
      } else {
        await bot.api.sendMessage(chatId, `❌ Masih ada masalah: ${newIssues.join(", ")}`, { parse_mode: "Markdown" });
      }
    }, 8000);
  }
  
  // System warnings (disk/RAM)
  if (systemIssue) {
    const sysIssues = issues.filter(i => i.includes("Disk") || i.includes("RAM"));
    await bot.api.sendMessage(chatId, `⚠️ *SYSTEM WARNING*\n\n${sysIssues.join("\n")}`, { parse_mode: "Markdown" });
  }
}

bot.command("monitorstart", async (ctx) => {
  if (monitorInterval) {
    await ctx.reply("⚠️ Monitor sudah berjalan!");
    return;
  }
  
  monitorChatId = ctx.from.id;
  monitorInterval = setInterval(() => autoRestartServices(monitorChatId), 60000); // Setiap 1 menit
  
  logActivity(ctx.from.id, "monitor-start", "", "success");
  await ctx.reply("✅ *AUTO MONITOR STARTED*\n\n🔍 Checking setiap 1 menit\n🔄 Auto-restart jika service down\n📊 Alert jika disk/RAM tinggi", { parse_mode: "Markdown" });
});

bot.command("monitorstop", async (ctx) => {
  if (!monitorInterval) {
    await ctx.reply("⚠️ Monitor belum berjalan!");
    return;
  }
  
  clearInterval(monitorInterval);
  monitorInterval = null;
  monitorChatId = null;
  
  logActivity(ctx.from.id, "monitor-stop", "", "success");
  await ctx.reply("⏹️ *AUTO MONITOR STOPPED*", { parse_mode: "Markdown" });
});

bot.command("monitorstatus", async (ctx) => {
  const issues = await checkServices();
  
  const status = monitorInterval ? "🟢 ACTIVE" : "🔴 INACTIVE";
  const text = issues.length === 0 ? "✅ Semua normal" : `⚠️ Masalah: ${issues.join(", ")}`;
  
  await ctx.reply(
    `📊 *MONITOR STATUS*\n\n` +
    `Status: *${status}*\n` +
    `Check: *${monitorInterval ? "Setiap 1 menit" : "Nonaktif"}*\n\n` +
    `${text}`,
    { parse_mode: "Markdown" }
  );
});

// ============ PROJECT HEALTH ============
bot.command("projecthealth", async (ctx) => {
  await ctx.reply("🏥 *Checking project health...*", { parse_mode: "Markdown" });
  
  const checks = [];
  
  // 1. Node modules
  const nodeModulesExists = fs.existsSync(path.join(PROJECT_ROOT, "node_modules"));
  checks.push(nodeModulesExists ? "✅ node_modules ada" : "❌ node_modules hilang");
  
  // 2. Config files
  const configFiles = ["astro.config.mjs", "tsconfig.json", "package.json"];
  for (const f of configFiles) {
    const exists = fs.existsSync(path.join(PROJECT_ROOT, f));
    checks.push(exists ? `✅ ${f}` : `❌ ${f} hilang`);
  }
  
  // 3. Build output
  const buildExists = fs.existsSync(path.join(PROJECT_ROOT, "dist", "index.html"));
  checks.push(buildExists ? "✅ Build dist ada" : "⚠️ Build dist belum ada");
  
  // 4. .env check
  const envExists = fs.existsSync(path.join(__dirname, ".env"));
  checks.push(envExists ? "✅ .env ada" : "❌ .env hilang");
  
  // 5. Git status
  const gitStatus = runCommand("git", ["status", "--porcelain"]);
  const uncommitted = gitStatus.output.trim().split("\n").filter(l => l.trim()).length;
  checks.push(uncommitted === 0 ? "✅ Git clean" : `⚠️ ${uncommitted} file belum di-commit`);
  
  // 6. Preview server
  const previewOnline = await isPortOpen(4321);
  checks.push(previewOnline ? "✅ Preview server online" : "❌ Preview server offline");
  
  // 7. OpenCode server
  let opencodeOk = false;
  try {
    const { checkHealth } = require("./utils/opencode-client");
    const health = await checkHealth();
    opencodeOk = health.healthy;
    checks.push(opencodeOk ? "✅ OpenCode online" : "❌ OpenCode offline");
  } catch (e) {
    checks.push("❌ OpenCode error");
  }
  
  const passed = checks.filter(c => c.startsWith("✅")).length;
  const total = checks.length;
  const emoji = passed === total ? "💚" : passed >= total - 2 ? "💛" : "❤️";
  
  const output = `${emoji} *PROJECT HEALTH: ${passed}/${total}*\n\n${checks.join("\n")}`;
  await ctx.reply(output, { parse_mode: "Markdown" });
});

bot.command("deps", async (ctx) => {
  await ctx.reply("📦 *Checking dependencies...*", { parse_mode: "Markdown" });
  
  const result = runCommand("npm", ["outdated", "--json"]);
  
  if (!result.success || !result.output.trim()) {
    await ctx.reply("✅ *Semua dependencies up-to-date!*", { parse_mode: "Markdown" });
    return;
  }
  
  try {
    const outdated = JSON.parse(result.output);
    let text = "📦 *OUTDATED DEPENDENCIES:*\n\n";
    
    for (const [pkg, info] of Object.entries(outdated)) {
      text += `• *${pkg}*\n  Current: ${info.current}\n  Latest: ${info.latest}\n\n`;
    }
    
    text += "\nKetik `/depsinstall` untuk update semua.";
    await ctx.reply(text, { parse_mode: "Markdown" });
  } catch (e) {
    await ctx.reply(`📦 Output:\n${result.output.substring(0, 1500)}`, { parse_mode: "Markdown" });
  }
});

bot.command("depsinstall", async (ctx) => {
  await ctx.reply("📦 *Installing dependencies...*", { parse_mode: "Markdown" });
  const result = await runCommandAsync("npm", ["install"]);
  
  logActivity(ctx.from.id, "deps-install", "", result.success ? "success" : "error");
  
  await ctx.reply(
    result.success ? "✅ *Dependencies berhasil diinstall!*" : `❌ Gagal:\n${result.output.substring(result.output.length - 500)}`,
    { parse_mode: "Markdown" }
  );
});

bot.command("audit", async (ctx) => {
  await ctx.reply("🔒 *Running security audit...*", { parse_mode: "Markdown" });
  const result = runCommand("npm", ["audit", "--json"]);
  
  try {
    const audit = JSON.parse(result.output);
    const vuln = audit.metadata?.vulnerabilities || {};
    const total = Object.values(vuln).reduce((a, b) => a + b, 0);
    
    let text = "🔒 *SECURITY AUDIT*\n\n";
    text += `📊 Total issues: *${total}*\n`;
    text += `🔴 Critical: *${vuln.critical || 0}*\n`;
    text += `🟠 High: *${vuln.high || 0}*\n`;
    text += `🟡 Moderate: *${vuln.moderate || 0}*\n`;
    text += `🔵 Low: *${vuln.low || 0}*\n`;
    text += `ℹ️ Info: *${vuln.info || 0}*\n`;
    
    if (total > 0) {
      text += "\nKetik `/depsinstall` untuk update dependencies.";
    } else {
      text += "\n✅ Tidak ada vulnerability!";
    }
    
    await ctx.reply(text, { parse_mode: "Markdown" });
  } catch (e) {
    await ctx.reply(`🔒 Audit output:\n${result.output.substring(0, 1500)}`, { parse_mode: "Markdown" });
  }
});

// ============ CODE QUALITY ============
bot.command("typecheck", async (ctx) => {
  await ctx.reply("🔍 *Running TypeScript check...*", { parse_mode: "Markdown" });
  const result = runCommand("npx", ["tsc", "--noEmit"]);
  
  if (result.success) {
    await ctx.reply("✅ *TypeScript check passed!*\nTidak ada error.", { parse_mode: "Markdown" });
  } else {
    const errors = result.output.split("\n").filter(l => l.includes("error TS")).length;
    await ctx.reply(
      `❌ *TypeScript errors: ${errors}*\n\n\`\`\`\n${result.output.substring(result.output.length - 1000)}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
  }
});

bot.command("lint", async (ctx) => {
  await ctx.reply("🧹 *Running linter...*", { parse_mode: "Markdown" });
  
  const configPath = path.join(PROJECT_ROOT, "eslint.config.js");
  const hasEslint = fs.existsSync(configPath) || 
                    fs.existsSync(path.join(PROJECT_ROOT, ".eslintrc")) ||
                    fs.existsSync(path.join(PROJECT_ROOT, ".eslintrc.json"));
  
  if (!hasEslint) {
    const minimalConfig = `import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "*.config.*"],
  },
];
`;
    fs.writeFileSync(configPath, minimalConfig);
    await ctx.reply("ℹ️ *ESLint config belum ada.* Membuat config minimal...", { parse_mode: "Markdown" });
  }
  
  const installResult = await runCommandAsync("npm", ["install", "-D", "eslint", "@eslint/js", "typescript-eslint"]);
  if (!installResult.success) {
    await ctx.reply(`❌ Gagal install ESLint: ${installResult.output.substring(installResult.output.length - 500)}`, { parse_mode: "Markdown" });
    return;
  }
  
  const result = runCommand("npx", ["eslint", "src/", "--ext", ".js,.jsx,.ts,.tsx"]);
  
  if (result.success) {
    await ctx.reply("✅ *Lint passed!*\nTidak ada error.", { parse_mode: "Markdown" });
  } else {
    const errors = result.output.split("\n").filter(l => l.includes("error")).length;
    const warnings = result.output.split("\n").filter(l => l.includes("warning")).length;
    await ctx.reply(
      `⚠️ *Lint issues: ${errors} errors, ${warnings} warnings*\n\n\`\`\`\n${result.output.substring(result.output.length - 1500)}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
  }
});

bot.command("buildcheck", async (ctx) => {
  await ctx.reply("🔨 *Testing build...*", { parse_mode: "Markdown" });
  const startTime = Date.now();
  const result = await runCommandAsync("npm", ["run", "build"]);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  if (result.success) {
    // Check dist size
    const distPath = path.join(PROJECT_ROOT, "dist");
    let totalSize = 0;
    let fileCount = 0;
    
    function walkDir(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
          walkDir(fp);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      }
    }
    walkDir(distPath);
    
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    await ctx.reply(
      `✅ *Build successful!*\n\n⏱️ Duration: *${duration}s*\n📁 Files: *${fileCount}*\n💾 Size: *${sizeMB} MB*`,
      { parse_mode: "Markdown" }
    );
  } else {
    await ctx.reply(
      `❌ *Build gagal:*\n\`\`\`\n${result.output.substring(result.output.length - 1000)}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
  }
});

// ============ PERFORMANCE ============
bot.command("bundlesize", async (ctx) => {
  await ctx.reply("📊 *Analyzing bundle size...*", { parse_mode: "Markdown" });
  
  const distPath = path.join(PROJECT_ROOT, "dist");
  if (!fs.existsSync(distPath)) {
    await ctx.reply("⚠️ Belum ada build. Jalankan `/buildcheck` dulu.", { parse_mode: "Markdown" });
    return;
  }
  
  const categories = { html: 0, css: 0, js: 0, images: 0, other: 0 };
  const fileDetails = [];
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fp = path.join(dir, f);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) {
        walkDir(fp);
      } else {
        const ext = path.extname(f).toLowerCase();
        const sizeKB = (stat.size / 1024).toFixed(1);
        
        if (ext === ".html") categories.html += stat.size;
        else if (ext === ".css") categories.css += stat.size;
        else if (ext === ".js") categories.js += stat.size;
        else if ([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"].includes(ext)) categories.images += stat.size;
        else categories.other += stat.size;
        
        if (stat.size > 10240) {
          fileDetails.push(`${ext || "other"}: ${f} (${sizeKB}KB)`);
        }
      }
    }
  }
  walkDir(distPath);
  
  const fmt = (bytes) => (bytes / 1024).toFixed(1) + " KB";
  
  let text = "📊 *BUNDLE SIZE*\n\n";
  text += `📄 HTML: *${fmt(categories.html)}*\n`;
  text += `🎨 CSS: *${fmt(categories.css)}*\n`;
  text += `⚡ JavaScript: *${fmt(categories.js)}*\n`;
  text += `🖼️ Images: *${fmt(categories.images)}*\n`;
  text += `📦 Other: *${fmt(categories.other)}*\n`;
  text += `💾 Total: *${fmt(categories.html + categories.css + categories.js + categories.images + categories.other)}*\n`;
  
  if (fileDetails.length > 0) {
    text += "\n⚠️ *Large files (>10KB):*\n" + fileDetails.slice(0, 5).join("\n");
  }
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("seocheck", async (ctx) => {
  await ctx.reply("🔎 *Checking SEO...*", { parse_mode: "Markdown" });
  
  const distPath = path.join(PROJECT_ROOT, "dist");
  if (!fs.existsSync(distPath)) {
    await ctx.reply("⚠️ Belum ada build. Jalankan `/buildcheck` dulu.", { parse_mode: "Markdown" });
    return;
  }
  
  const issues = [];
  const good = [];
  
  // Check sitemap
  const sitemapExists = fs.existsSync(path.join(distPath, "sitemap.xml"));
  sitemapExists ? good.push("✅ Sitemap ada") : issues.push("❌ Sitemap tidak ada");
  
  // Check robots.txt
  const robotsExists = fs.existsSync(path.join(distPath, "robots.txt"));
  robotsExists ? good.push("✅ Robots.txt ada") : issues.push("❌ Robots.txt tidak ada");
  
  // Check index.html for meta tags
  const indexHtml = fs.existsSync(path.join(distPath, "index.html")) ? 
    fs.readFileSync(path.join(distPath, "index.html"), "utf8") : "";
  
  const hasTitle = /<title>[\s\S]+?<\/title>/.test(indexHtml);
  hasTitle ? good.push("✅ Title tag ada") : issues.push("❌ Title tag hilang");
  
  const hasMetaDesc = /<meta[\s\S]*?name=["']description["'][\s\S]*?>/.test(indexHtml);
  hasMetaDesc ? good.push("✅ Meta description ada") : issues.push("❌ Meta description hilang");
  
  const hasOgTags = /<meta[\s\S]*?property=["']og:/g.test(indexHtml);
  hasOgTags ? good.push("✅ OG tags ada") : issues.push("⚠️ OG tags hilang");
  
  const hasViewport = /<meta[\s\S]*?name=["']viewport["']/.test(indexHtml);
  hasViewport ? good.push("✅ Viewport meta ada") : issues.push("❌ Viewport meta hilang");
  
  const hasCanonical = /<link[\s\S]*?rel=["']canonical["']/.test(indexHtml);
  hasCanonical ? good.push("✅ Canonical link ada") : issues.push("⚠️ Canonical link hilang");
  
  // Check images for alt text
  const imgTags = indexHtml.match(/<img[\s\S]*?>/g) || [];
  const imgsWithoutAlt = imgTags.filter(t => !t.includes("alt="));
  if (imgsWithoutAlt.length === 0 && imgTags.length > 0) {
    good.push(`✅ Semua ${imgTags.length} gambar punya alt text`);
  } else if (imgsWithoutAlt.length > 0) {
    issues.push(`⚠️ ${imgsWithoutAlt.length} gambar tanpa alt text`);
  }
  
  // Check heading structure
  const hasH1 = /<h1[\s\S]*?>/.test(indexHtml);
  hasH1 ? good.push("✅ H1 tag ada") : issues.push("⚠️ H1 tag hilang di homepage");
  
  let text = "🔎 *SEO CHECK*\n\n";
  text += good.join("\n") + "\n";
  if (issues.length > 0) {
    text += "\n" + issues.join("\n");
  }
  text += `\n\n📊 Score: *${good.length}/${good.length + issues.length}*`;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("lighthouse", async (ctx) => {
  await ctx.reply("灯 *Lighthouse audit*\n\nMencoba menjalankan Lighthouse...", { parse_mode: "Markdown" });
  
  const result = await runCommandAsync("npx", ["lighthouse", "http://127.0.0.1:4321", "--output=json", "--quiet", "--chrome-flags=--headless --no-sandbox"]);
  
  if (!result.success) {
    await ctx.reply(
      "⚠️ *Lighthouse gagal dijalankan*\n\n" +
      "Kemungkinan Chrome/Chromium tidak terinstall.\n\n" +
      "Alternatif: jalankan manual di browser:\n" +
      "1. Buka `http://127.0.0.1:4321`\n" +
      "2. Tekan F12 → Lighthouse tab\n" +
      "3. Klik Generate report",
      { parse_mode: "Markdown" }
    );
    return;
  }
  
  try {
    const data = JSON.parse(result.output);
    const cats = data.categories || {};
    const audits = data.audits || {};
    
    let text = "📊 *LIGHTHOUSE REPORT*\n\n";
    
    const scores = [
      { name: "Performance", cat: cats.performance },
      { name: "Accessibility", cat: cats.accessibility },
      { name: "Best Practices", cat: cats["best-practices"] },
      { name: "SEO", cat: cats.seo },
    ];
    
    for (const s of scores) {
      if (s.cat) {
        const score = Math.round((s.cat.score || 0) * 100);
        const icon = score >= 90 ? "🟢" : score >= 50 ? "🟡" : "🔴";
        text += `${icon} *${s.name}:* ${score}/100\n`;
      }
    }
    
    const fcp = audits["first-contentful-paint"]?.displayValue;
    const lcp = audits["largest-contentful-paint"]?.displayValue;
    const tbt = audits["total-blocking-time"]?.displayValue;
    const cls = audits["cumulative-layout-shift"]?.displayValue;
    
    if (fcp || lcp || tbt || cls) {
      text += "\n*METRICS:*\n";
      if (fcp) text += `• FCP: ${fcp}\n`;
      if (lcp) text += `• LCP: ${lcp}\n`;
      if (tbt) text += `• TBT: ${tbt}\n`;
      if (cls) text += `• CLS: ${cls}\n`;
    }
    
    await ctx.reply(text, { parse_mode: "Markdown" });
  } catch (e) {
    await ctx.reply(`❌ Gagal parse Lighthouse output: ${e.message}`, { parse_mode: "Markdown" });
  }
});

// ============ SEO AUDIT ALL PAGES ============
bot.command("seoaudit", async (ctx) => {
  await ctx.reply("🔎 *SEO AUDIT - Semua Halaman*\n\nMenganalisis semua halaman kota...", { parse_mode: "Markdown" });
  
  const distPath = path.join(PROJECT_ROOT, "dist");
  if (!fs.existsSync(distPath)) {
    await ctx.reply("⚠️ Belum ada build. Jalankan `/buildcheck` dulu.", { parse_mode: "Markdown" });
    return;
  }
  
  // Find all city pages
  const areaPath = path.join(distPath, "area");
  if (!fs.existsSync(areaPath)) {
    await ctx.reply("❌ Folder `/area` tidak ditemukan di build.", { parse_mode: "Markdown" });
    return;
  }
  
  const cityDirs = fs.readdirSync(areaPath).filter(d => {
    const fp = path.join(areaPath, d);
    return fs.statSync(fp).isDirectory();
  });
  
  let totalGood = 0;
  let totalIssues = 0;
  const cityResults = [];
  
  for (const city of cityDirs) {
    const indexPath = path.join(areaPath, city, "index.html");
    if (!fs.existsSync(indexPath)) {
      cityResults.push({ city, good: 0, issues: ["index.html tidak ada"] });
      totalIssues++;
      continue;
    }
    
    const html = fs.readFileSync(indexPath, "utf8");
    const good = [];
    const issues = [];
    
    // Title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    if (titleMatch && titleMatch[1].length > 10) {
      good.push("✅ Title");
    } else {
      issues.push("❌ Title");
    }
    
    // Meta description
    const descMatch = html.match(/<meta[\s\S]*?name=["']description["'][\s\S]*?content=["']([\s\S]*?)["']/);
    if (descMatch && descMatch[1].length > 20) {
      good.push("✅ Description");
    } else {
      issues.push("❌ Description");
    }
    
    // H1
    const hasH1 = /<h1[\s\S]*?>/.test(html);
    hasH1 ? good.push("✅ H1") : issues.push("❌ H1");
    
    // Schema
    const hasSchema = html.includes("application/ld+json");
    hasSchema ? good.push("✅ Schema") : issues.push("❌ Schema");
    
    // Canonical
    const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'");
    hasCanonical ? good.push("✅ Canonical") : issues.push("❌ Canonical");
    
    // OG tags
    const hasOg = html.includes('property="og:');
    hasOg ? good.push("✅ OG Tags") : issues.push("❌ OG Tags");
    
    // Breadcrumbs
    const hasBreadcrumb = html.includes("BreadcrumbList");
    hasBreadcrumb ? good.push("✅ Breadcrumbs") : issues.push("⚠️ Breadcrumbs");
    
    // Internal links to other cities
    const linkMatches = html.match(/href=["']\/area\/[\w-]+["']/g) || [];
    if (linkMatches.length >= 3) {
      good.push(`✅ Internal links (${linkMatches.length})`);
    } else if (linkMatches.length > 0) {
      issues.push(`⚠️ Internal links sedikit (${linkMatches.length})`);
    } else {
      issues.push("❌ Internal links tidak ada");
    }
    
    totalGood += good.length;
    totalIssues += issues.length;
    
    cityResults.push({ city, good: good.length, issues: issues.length });
  }
  
  let text = `🔎 *SEO AUDIT ALL PAGES*\n\n📊 Total halaman: *${cityDirs.length}*\n\n`;
  
  for (const r of cityResults.sort((a, b) => a.issues - b.issues)) {
    const icon = r.issues === 0 ? "✅" : r.issues <= 2 ? "⚠️" : "❌";
    text += `${icon} *${r.city}*: ${r.good}✅ ${r.issues}❌\n`;
  }
  
  text += `\n📊 *Overall: ${totalGood}✅ ${totalIssues}❌*`;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("seopage", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const slug = args[0];
  
  if (!slug) {
    await ctx.reply("Usage: `/seopage [slug-kota]`\nContoh: `/seopage jakarta-selatan`");
    return;
  }
  
  const distPath = path.join(PROJECT_ROOT, "dist", "area", slug, "index.html");
  if (!fs.existsSync(distPath)) {
    await ctx.reply(`❌ Halaman \`/area/${slug}\` tidak ditemukan.`);
    return;
  }
  
  const html = fs.readFileSync(distPath, "utf8");
  
  let text = `🔎 *SEO AUDIT: ${slug}*\n\n`;
  
  // Title
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  text += `📌 *Title:* ${titleMatch ? titleMatch[1].substring(0, 60) : "❌ TIDAK ADA"}\n`;
  
  // Meta description
  const descMatch = html.match(/<meta[\s\S]*?name=["']description["'][\s\S]*?content=["']([\s\S]*?)["']/);
  text += `📝 *Description:* ${descMatch ? descMatch[1].substring(0, 80) + "..." : "❌ TIDAK ADA"}\n`;
  
  // Schema
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (schemaMatch) {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      text += `\n🏗️ *Schema:* ✅ ${schema["@type"]}\n`;
      text += `📞 *Phone:* ${schema.telephone || "❌ tidak ada"}\n`;
      text += `📍 *Address:* ${schema.address?.streetAddress || "❌ tidak ada"}\n`;
      text += `💰 *Price:* ${schema.priceRange || "❌ tidak ada"}\n`;
    } catch (e) {
      text += `\n🏗️ *Schema:* ⚠️ Parse error\n`;
    }
  }
  
  // H1
  const h1Match = html.match(/<h1[\s\S]*?>([\s\S]*?)<\/h1>/);
  text += `\n🏷️ *H1:* ${h1Match ? h1Match[1].trim().substring(0, 60) : "❌ TIDAK ADA"}\n`;
  
  // Images
  const imgs = html.match(/<img[\s\S]*?>/g) || [];
  const imgsWithAlt = imgs.filter(t => t.includes("alt="));
  text += `🖼️ *Images:* ${imgs.length} total, ${imgsWithAlt.length} punya alt\n`;
  
  // Internal links
  const links = html.match(/href=["']\/area\/[\w-]+["']/g) || [];
  text += `🔗 *Internal links:* ${links.length} ke kota lain\n`;
  
  // Word count (approximate)
  const bodyText = html.replace(/<[^>]+>/g, '').trim();
  const wordCount = bodyText.split(/\s+/).length;
  text += `📄 *Word count:* ~${wordCount} kata\n`;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("pages", async (ctx) => {
  const distPath = path.join(PROJECT_ROOT, "dist");
  if (!fs.existsSync(distPath)) {
    await ctx.reply("⚠️ Belum ada build. Jalankan `/buildcheck` dulu.", { parse_mode: "Markdown" });
    return;
  }
  
  const pages = [];
  function walkDir(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const route = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (fs.existsSync(path.join(fullPath, "index.html"))) {
          const size = fs.statSync(path.join(fullPath, "index.html")).size;
          pages.push({ route, size });
        }
        walkDir(fullPath, route);
      }
    }
  }
  walkDir(distPath, "");
  
  pages.sort((a, b) => a.route.localeCompare(b.route));
  
  let text = `📄 *DAFTAR HALAMAN (${pages.length})*\n\n`;
  for (const p of pages) {
    const sizeKB = (p.size / 1024).toFixed(1);
    text += `• \`${p.route}\` (${sizeKB}KB)\n`;
  }
  text += `\nGunakan \`/auditpage [path]\` untuk audit.\nContoh: \`/auditpage faq\``;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("auditpage", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const pagePath = args.join("/");
  
  if (!pagePath) {
    await ctx.reply("Usage: `/auditpage [path]`\n\nContoh:\n• `/auditpage faq`\n• `/auditpage harga`\n• `/auditpage kontak`\n• `/auditpage layanan/bore-pile-mesin/gawangan`\n\nKetik `/pages` untuk lihat semua halaman.", { parse_mode: "Markdown" });
    return;
  }
  
  const distPath = path.join(PROJECT_ROOT, "dist", pagePath, "index.html");
  if (!fs.existsSync(distPath)) {
    await ctx.reply(`❌ Halaman \`/${pagePath}\` tidak ditemukan.\n\nKetik \`/pages\` untuk lihat semua halaman.`, { parse_mode: "Markdown" });
    return;
  }
  
  const html = fs.readFileSync(distPath, "utf8");
  const good = [];
  const issues = [];
  
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  if (titleMatch && titleMatch[1].length > 10) {
    good.push(`✅ *Title:* ${titleMatch[1].substring(0, 60)}`);
  } else {
    issues.push(`❌ *Title:* ${titleMatch ? "terlalu pendek" : "TIDAK ADA"}`);
  }
  
  const descMatch = html.match(/<meta[\s\S]*?name=["']description["'][\s\S]*?content=["']([\s\S]*?)["']/);
  if (descMatch && descMatch[1].length > 20) {
    good.push(`✅ *Description:* ${descMatch[1].substring(0, 80)}...`);
  } else {
    issues.push(`❌ *Description:* ${descMatch ? "terlalu pendek" : "TIDAK ADA"}`);
  }
  
  const h1Match = html.match(/<h1[\s\S]*?>([\s\S]*?)<\/h1>/);
  if (h1Match) {
    good.push(`✅ *H1:* ${h1Match[1].trim().substring(0, 60)}`);
  } else {
    issues.push("❌ *H1:* TIDAK ADA");
  }
  
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (schemaMatch) {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      good.push(`✅ *Schema:* ${schema["@type"] || "unknown"}`);
    } catch (e) {
      issues.push("⚠️ *Schema:* JSON parse error");
    }
  } else {
    issues.push("❌ *Schema:* TIDAK ADA");
  }
  
  const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'");
  hasCanonical ? good.push("✅ *Canonical:* ada") : issues.push("❌ *Canonical:* TIDAK ADA");
  
  const hasOg = html.includes('property="og:');
  hasOg ? good.push("✅ *OG Tags:* ada") : issues.push("❌ *OG Tags:* TIDAK ADA");
  
  const hasViewport = html.includes('name="viewport"') || html.includes("name='viewport'");
  hasViewport ? good.push("✅ *Viewport:* ada") : issues.push("❌ *Viewport:* TIDAK ADA");
  
  const imgs = html.match(/<img[\s\S]*?>/g) || [];
  const imgsWithAlt = imgs.filter(t => t.includes("alt="));
  if (imgs.length > 0) {
    const imgScore = `${imgsWithAlt.length}/${imgs.length}`;
    imgsWithAlt.length === imgs.length
      ? good.push(`✅ *Images:* ${imgScore} punya alt`)
      : issues.push(`⚠️ *Images:* ${imgScore} punya alt`);
  }
  
  const links = html.match(/href=["'][^"']*["']/g) || [];
  const internalLinks = links.filter(l => l.includes("/area/") || l.includes("/harga/") || l.includes("/layanan/"));
  if (internalLinks.length >= 3) {
    good.push(`✅ *Internal links:* ${internalLinks.length}`);
  } else if (internalLinks.length > 0) {
    issues.push(`⚠️ *Internal links:* sedikit (${internalLinks.length})`);
  } else {
    issues.push("❌ *Internal links:* TIDAK ADA");
  }
  
  const bodyText = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(/\s+/).length;
  if (wordCount >= 300) {
    good.push(`✅ *Word count:* ~${wordCount} kata`);
  } else if (wordCount >= 100) {
    issues.push(`⚠️ *Word count:* tipis (~${wordCount} kata)`);
  } else {
    issues.push(`❌ *Word count:* terlalu sedikit (~${wordCount} kata)`);
  }
  
  const hasLang = html.includes('lang="');
  hasLang ? good.push("✅ *Lang attribute:* ada") : issues.push("⚠️ *Lang attribute:* TIDAK ADA");
  
  const hasFavicon = html.includes('rel="icon"') || html.includes("rel='icon'") || html.includes('rel="shortcut icon"');
  hasFavicon ? good.push("✅ *Favicon:* ada") : issues.push("⚠️ *Favicon:* TIDAK ADA");
  
  const score = good.length;
  const total = good.length + issues.length;
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";
  
  let text = `🔎 *AUDIT: /${pagePath}*\n\n`;
  text += `📊 *Score: ${score}/${total} (${pct}%) — Grade ${grade}*\n\n`;
  text += good.join("\n") + "\n";
  if (issues.length > 0) {
    text += "\n" + issues.join("\n");
  }
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("pricingcheck", async (ctx) => {
  await ctx.reply("💰 *PRICING CONSISTENCY CHECK*\n\nMenganalisis harga di semua file...", { parse_mode: "Markdown" });
  
  const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
  if (!fs.existsSync(pricingPath)) {
    await ctx.reply("❌ File pricing.ts tidak ditemukan!");
    return;
  }
  
  const content = fs.readFileSync(pricingPath, "utf8");
  
  let text = "💰 *PRICING STATUS*\n\n";
  
  // Last updated
  const lastUpdated = content.match(/lastUpdated:\s*"([^"]+)"/)?.[1] || "unknown";
  text += `📅 *Last Updated:* ${lastUpdated}\n`;
  
  // Mobilization fee
  const mobilization = content.match(/mobilizationFee:\s*(\d+)/)?.[1] || "unknown";
  text += `🏗️ *Mobilisasi:* Rp ${parseInt(mobilization).toLocaleString("id-ID")}\n\n`;
  
  // Bore pile prices
  text += "*BORE PILE (Mesin):*\n";
  const boreMatches = [...content.matchAll(/diameter:\s*(\d+),\s*\n\s*pricePerMeter:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g)];
  for (const m of boreMatches) {
    text += `• ${m[1]}cm: Rp ${parseInt(m[2]).toLocaleString("id-ID")}/m\n`;
  }
  
  // Strauss prices
  text += "\n*STRAUSS (Manual):*\n";
  const straussSection = content.split("straussTiers")[1] || "";
  const straussMatches = [...straussSection.matchAll(/diameter:\s*(\d+),\s*\n\s*pricePerMeter:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g)];
  for (const m of straussMatches) {
    text += `• ${m[1]}cm: Rp ${parseInt(m[2]).toLocaleString("id-ID")}/m\n`;
  }
  
  // Check if calculator uses same prices
  const calcPath = path.join(PROJECT_ROOT, "src", "components", "calculator", "PriceCalculator.tsx");
  const calcExists = fs.existsSync(calcPath);
  text += `\n📊 *Calculator:* ${calcExists ? "✅ Ada" : "❌ Hilang"}`;
  
  // Check if pricing.ts is imported
  const calcContent = calcExists ? fs.readFileSync(calcPath, "utf8") : "";
  const importsPricing = calcContent.includes("pricing.ts") || calcContent.includes("from '../../data/pricing'");
  text += `\n🔗 *Calculator import pricing:* ${importsPricing ? "✅ Ya" : "❌ Tidak (harga beda!)"}`;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

// ============ QUICK ACTIONS ============
bot.command("deploy", async (ctx) => {
  await ctx.reply("🚀 *Deploying...*\n\n0/3 Auto-backup...", { parse_mode: "Markdown" });
  
  // Auto-backup sebelum deploy
  const hasChanges = runCommand("git", ["status", "--porcelain"]);
  if (hasChanges.output.trim()) {
    runCommand("git", ["add", "."]);
    const commitResult = await runCommandAsync("git", ["commit", "-m", `auto-backup: sebelum deploy ${new Date().toISOString()}`]);
    if (commitResult.success) {
      await ctx.reply("✅ Backup tersimpan.");
    }
  }
  
  await ctx.reply("🚀 *Deploying...*\n\n1/3 Building...", { parse_mode: "Markdown" });
  
  const buildResult = await runCommandAsync("npm", ["run", "build"]);
  
  if (!buildResult.success) {
    await ctx.reply(`❌ Build gagal:\n${buildResult.output.substring(buildResult.output.length - 500)}`);
    return;
  }
  
  await ctx.reply("🚀 *Deploying...*\n\n2/3 Restarting preview...", { parse_mode: "Markdown" });
  
  // Restart preview
  runCommandAsync("powershell", ["-Command", `Set-Location '${PROJECT_ROOT}'; .\\start-all.ps1`]);
  
  logActivity(ctx.from.id, "deploy", "", "success");
  await ctx.reply("✅ *Deploy berhasil!*\n\nAuto-backup tersimpan. Preview akan tersedia dalam beberapa detik.");
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
    const deployResult = await runCommandAsync("npm", ["run", "build"]);
    if (!deployResult.success) {
      await ctx.reply(`❌ Deploy Gagal:\n${deployResult.output.substring(deployResult.output.length - 500)}`);
      return;
    }
    
    await ctx.reply(`🎉 *SELESAI!*\nHalaman live: /area/${newCity.slug}`, { parse_mode: "Markdown" });
    
  } catch (err) {
    await ctx.reply(`❌ Error SEO CMS: ${err.message}\nBisa jadi format AI tidak valid JSON.`);
  }
});

// ============ CITY MANAGEMENT ============
const CITIES_PATH = path.join(PROJECT_ROOT, "src", "data", "cities.json");

function loadCities() {
  return JSON.parse(fs.readFileSync(CITIES_PATH, "utf8"));
}

function saveCities(data) {
  fs.writeFileSync(CITIES_PATH, JSON.stringify(data, null, 2));
}

bot.command("cities", async (ctx) => {
  const cities = loadCities();
  let text = `🏙️ *DAFTAR KOTA (${cities.length})*\n\n`;
  
  for (const city of cities) {
    const faqCount = city.localFaqs?.length || 0;
    text += `• *${city.name}* (\`${city.slug}\`)\n  📍 ${city.province} | ❓ ${faqCount} FAQ\n`;
  }
  
  text += "\nKetik `/viewcity [slug]` untuk detail.";
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("viewcity", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const slug = args[0];
  
  if (!slug) {
    await ctx.reply("Usage: `/viewcity [slug]`\nContoh: `/viewcity jakarta-selatan`");
    return;
  }
  
  const cities = loadCities();
  const city = cities.find(c => c.slug === slug);
  
  if (!city) {
    await ctx.reply(`❌ Kota dengan slug \`${slug}\` tidak ditemukan.`);
    return;
  }
  
  let text = `🏙️ *${city.name}*\n\n`;
  text += `📌 Slug: \`${city.slug}\`\n`;
  text += `📍 Provinsi: ${city.province}\n`;
  text += `📝 Description: ${city.description}\n\n`;
  
  if (city.localFaqs && city.localFaqs.length > 0) {
    text += `*FAQ (${city.localFaqs.length}):*\n`;
    for (const faq of city.localFaqs) {
      text += `• Q: ${faq.question}\n  A: ${faq.answer}\n`;
    }
  }
  
  text += `\nKetik \`/editcity ${slug}\` untuk edit.`;
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("addcity", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const jsonStr = args.join(" ");
  
  if (!jsonStr) {
    await ctx.reply(
      "Usage: `/addcity {json}`\n\n" +
      "Contoh:\n`/addcity {\"slug\":\"tangerang\",\"name\":\"Tangerang\",\"province\":\"Banten\",\"description\":\"Jasa bore pile profesional di Tangerang\",\"localFaqs\":[{\"question\":\"Tanya?\",\"answer\":\"Jawab.\"}]}`",
      { parse_mode: "Markdown" }
    );
    return;
  }
  
  try {
    const newCity = JSON.parse(jsonStr);
    
    if (!newCity.slug || !newCity.name || !newCity.province || !newCity.description) {
      await ctx.reply("❌ JSON harus punya: slug, name, province, description");
      return;
    }
    
    const cities = loadCities();
    const existing = cities.findIndex(c => c.slug === newCity.slug);
    
    if (existing > -1) {
      cities[existing] = newCity;
    } else {
      cities.push(newCity);
    }
    
    saveCities(cities);
    
    logActivity(ctx.from.id, "add-city", newCity.slug, "success");
    
    await ctx.reply(
      `✅ *Kota ${existing > -1 ? "diupdate" : "ditambahkan"}!*\n\n` +
      `📌 ${newCity.name} (\`${newCity.slug}\`)\n` +
      `📍 ${newCity.province}\n\n` +
      `Ketik \`/deploy\` untuk rebuild.`,
      { parse_mode: "Markdown" }
    );
  } catch (e) {
    await ctx.reply(`❌ JSON error: ${e.message}\n\nPastikan format JSON benar.`);
  }
});

bot.command("editcity", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const slug = args[0];
  
  if (!slug) {
    await ctx.reply("Usage: `/editcity [slug]` lalu kirim JSON baru");
    return;
  }
  
  const cities = loadCities();
  const city = cities.find(c => c.slug === slug);
  
  if (!city) {
    await ctx.reply(`❌ Kota \`${slug}\` tidak ditemukan.`);
    return;
  }
  
  global._pendingCityEdit = slug;
  
  await ctx.reply(
    `✏️ *Edit: ${city.name}*\n\n` +
    `Data saat ini:\n\`\`\`json\n${JSON.stringify(city, null, 2)}\n\`\`\`\n\n` +
    `Kirim JSON baru (bisa edit sebagian):`,
    { parse_mode: "Markdown" }
  );
});

bot.command("deletecity", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const slug = args[0];
  
  if (!slug) {
    await ctx.reply("Usage: `/deletecity [slug]`");
    return;
  }
  
  const cities = loadCities();
  const index = cities.findIndex(c => c.slug === slug);
  
  if (index === -1) {
    await ctx.reply(`❌ Kota \`${slug}\` tidak ditemukan.`);
    return;
  }
  
  const deleted = cities.splice(index, 1)[0];
  saveCities(cities);
  
  logActivity(ctx.from.id, "delete-city", slug, "success");
  
  await ctx.reply(
    `🗑️ *Kota dihapus:*\n\n` +
    `📌 ${deleted.name} (\`${deleted.slug}\`)\n\n` +
    `Ketik \`/deploy\` untuk rebuild.`,
    { parse_mode: "Markdown" }
  );
});

bot.command("addfaq", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const slug = args[0];
  const question = args.slice(1).join(" ");
  
  if (!slug || !question) {
    await ctx.reply("Usage: `/addfaq [slug] [pertanyaan]` lalu kirim jawaban");
    return;
  }
  
  const cities = loadCities();
  const city = cities.find(c => c.slug === slug);
  
  if (!city) {
    await ctx.reply(`❌ Kota \`${slug}\` tidak ditemukan.`);
    return;
  }
  
  global._pendingFaqAdd = { slug, question };
  
  await ctx.reply(
    `❓ *Tambah FAQ ke ${city.name}*\n\nPertanyaan: *${question}*\n\nKirim jawaban:`,
    { parse_mode: "Markdown" }
  );
});

// ============ DIAMETER PAGE MANAGEMENT ============
bot.command("listharga", async (ctx) => {
  const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
  if (!fs.existsSync(pricingPath)) {
    await ctx.reply("❌ File pricing.ts tidak ditemukan!");
    return;
  }
  
  const content = fs.readFileSync(pricingPath, "utf8");
  
  // Parse bore pile
  const boreMatches = [...content.matchAll(/diameter:\s*(\d+),\s*\n\s*pricePerMeter:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g)];
  
  // Parse strauss
  const straussSection = content.split("straussTiers")[1] || "";
  const straussMatches = [...straussSection.matchAll(/diameter:\s*(\d+),\s*\n\s*pricePerMeter:\s*\{\s*min:\s*(\d+),\s*max:\s*(\d+)/g)];
  
  const cities = loadCities();
  
  let text = "💰 *DAFTAR HARGA PER DIAMETER*\n\n";
  
  text += "*BORE PILE (Mesin):*\n";
  for (const m of boreMatches) {
    const price = parseInt(m[2]);
    text += `• ${m[1]}cm: Rp ${price.toLocaleString("id-ID")}/m\n`;
  }
  
  text += "\n*STRAUSS PILE (Manual):*\n";
  for (const m of straussMatches) {
    const price = parseInt(m[2]);
    text += `• ${m[1]}cm: Rp ${price.toLocaleString("id-ID")}/m\n`;
  }
  
  text += `\n*Total halaman:* ${(boreMatches.length + straussMatches.length) * cities.length} halaman`;
  text += `\n\nKetik \`/hargapage [tipe] [diameter] [kota]\` untuk lihat URL.`;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("hargapage", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const [tipe, diameter, kota] = args;
  
  if (!tipe || !diameter || !kota) {
    await ctx.reply(
      "Usage: `/hargapage [bore-pile|strauss-pile] [diameter] [slug-kota]`\n\n" +
      "Contoh:\n`/hargapage bore-pile 30 jakarta-selatan`\n`/hargapage strauss-pile 40 bekasi`",
      { parse_mode: "Markdown" }
    );
    return;
  }
  
  if (!["bore-pile", "strauss-pile"].includes(tipe)) {
    await ctx.reply("❌ Tipe harus `bore-pile` atau `strauss-pile`");
    return;
  }
  
  const url = `/harga/${tipe}/${diameter}cm-${kota}`;
  await ctx.reply(
    `🔗 *URL Halaman Harga*\n\n` +
    `📌 Tipe: ${tipe}\n` +
    `📏 Diameter: ${diameter}cm\n` +
    `🏙️ Kota: ${kota}\n\n` +
    `🌐 *Full URL:* https://asevenpile.com${url}\n` +
    `📂 *Path:* ${url}`,
    { parse_mode: "Markdown" }
  );
});

bot.command("allhargapages", async (ctx) => {
  await ctx.reply("📋 *SEMUA HALAMAN HARGA*\n\nGenerating...", { parse_mode: "Markdown" });
  
  const cities = loadCities();
  const boreDiameters = [30, 40, 50, 60, 80];
  const straussDiameters = [20, 25, 30, 40];
  
  let text = "📋 *SEMUA HALAMAN HARGA*\n\n";
  
  text += "*BORE PILE:*\n";
  for (const city of cities) {
    for (const d of boreDiameters) {
      text += `• /harga/bore-pile/${d}cm-${city.slug}\n`;
    }
  }
  
  text += "\n*STRAUSS PILE:*\n";
  for (const city of cities) {
    for (const d of straussDiameters) {
      text += `• /harga/strauss-pile/${d}cm-${city.slug}\n`;
    }
  }
  
  text += `\n📊 *Total: ${(boreDiameters.length + straussDiameters.length) * cities.length} halaman*`;
  
  await ctx.reply(text, { parse_mode: "Markdown" });
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

bot.command("aimodel", async (ctx) => {
  const { ZEN_FREE_MODELS, PAID_MODELS } = require("./utils/opencode-client");
  const status = ai.getStatus();
  const keyboard = new InlineKeyboard();
  
  for (const m of ZEN_FREE_MODELS) {
    keyboard.text(`🆓 ${m.name}`, `model_${m.id}`).row();
  }
  for (const m of PAID_MODELS) {
    keyboard.text(`💰 ${m.name}`, `model_${m.id}`).row();
  }
    
  await ctx.reply(`🤖 *Model AI saat ini:* \`${status.model}\`\n\nSilakan klik tombol di bawah untuk mengganti model:`, {
    reply_markup: keyboard,
    parse_mode: "Markdown"
  });
});

// Handler callback_query digabung di atas

bot.command("aiaccount", async (ctx) => {
  if (ai.activeProvider === "gemini") {
    const accounts = ai.gemini.getAllStatus();
    let text = "👤 *GEMINI ACCOUNTS*\n\n";
    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const icon = i === ai.gemini.activeAccountIndex ? "✅" : "⬜";
      const status = acc.isLimited ? `⏳ LIMIT ${acc.minutesUntilReset}m` : `✓ ${acc.requestCount} req`;
      text += `${icon} *${acc.name}*\n   📧 \`${acc.email}\`\n   📊 ${status}\n\n`;
    }
    text += `Gunakan /aistatus untuk info lengkap.`;
    await ctx.reply(text, { parse_mode: "Markdown" });
  } else {
    await ctx.reply(
      "ℹ️ *Provider aktif: OpenCode Zen*\n\n" +
      "OpenCode Zen gratis, tidak perlu switch account.\n" +
      "Gunakan `/aimodel` untuk ganti model.",
      { parse_mode: "Markdown" }
    );
  }
});

bot.command("aistatus", async (ctx) => {
  const status = ai.formatStatus();
  await ctx.reply(status, { parse_mode: "Markdown" });
});

// ============ ERROR HANDLER ============
bot.catch((error) => {
  console.error("Bot error:", error);
  logActivity("system", "error", error.message, "error");
});

// Global chat memory (Menyimpan 20 chat terakhir agar bisa ngobrol natural)
const MEMORY_FILE = path.join(__dirname, ".runtime", "chat-memory.json");

function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Gagal load chat memory:", err.message);
  }
  return [];
}

function saveMemory(memory) {
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (err) {
    console.error("Gagal save chat memory:", err.message);
  }
}

const globalChatMemory = loadMemory();

// ============ AUTONOMOUS AGENT (NATURAL LANGUAGE) ============
bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;
  if (userText.startsWith("/")) return;

  // Handle pending city edit
  if (global._pendingCityEdit) {
    const slug = global._pendingCityEdit;
    delete global._pendingCityEdit;
    
    try {
      const newCity = JSON.parse(userText);
      const cities = loadCities();
      const index = cities.findIndex(c => c.slug === slug);
      
      if (index === -1) {
        await ctx.reply(`❌ Kota \`${slug}\` tidak ditemukan.`);
        return;
      }
      
      cities[index] = { ...cities[index], ...newCity, slug };
      saveCities(cities);
      
      logActivity(ctx.from.id, "edit-city", slug, "success");
      
      await ctx.reply(
        `✅ *Kota diupdate!*\n\n` +
        `📌 ${cities[index].name} (\`${cities[index].slug}\`)\n\n` +
        `Ketik \`/deploy\` untuk rebuild.`,
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      await ctx.reply(`❌ JSON error: ${e.message}`);
    }
    return;
  }
  
  // Handle pending FAQ answer
  if (global._pendingFaqAdd) {
    const { slug, question } = global._pendingFaqAdd;
    delete global._pendingFaqAdd;
    
    const cities = loadCities();
    const city = cities.find(c => c.slug === slug);
    
    if (!city) {
      await ctx.reply(`❌ Kota \`${slug}\` tidak ditemukan.`);
      return;
    }
    
    if (!city.localFaqs) city.localFaqs = [];
    city.localFaqs.push({ question, answer: userText });
    saveCities(cities);
    
    logActivity(ctx.from.id, "add-faq", slug, "success");
    
    await ctx.reply(
      `✅ *FAQ ditambahkan ke ${city.name}!*\n\n` +
      `Q: ${question}\nA: ${userText}\n\n` +
      `Ketik \`/deploy\` untuk rebuild.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // Handle pending pricing/SEO date updates
  if (global._pendingHargaAction) {
    const action = global._pendingHargaAction;
    
    if (action.type === "mobilisasi" && action.step === "harga") {
      const newPrice = parseInt(userText.replace(/[^0-9]/g, ""));
      if (isNaN(newPrice)) {
        await ctx.reply("❌ Harus angka! Ketik harga baru.");
        return;
      }
      
      const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
      let content = fs.readFileSync(pricingPath, "utf8");
      content = content.replace(/mobilizationFee:\s*\d+/, `mobilizationFee: ${newPrice}`);
      fs.writeFileSync(pricingPath, content);
      
      delete global._pendingHargaAction;
      logActivity(ctx.from.id, "update-harga-mobilisasi", newPrice.toString(), "success");
      
      await ctx.reply(`✅ *Mobilisasi diupdate!*\n\nHarga baru: *Rp ${newPrice.toLocaleString("id-ID")}*\n\nKetik /deploy untuk rebuild.`, { parse_mode: "Markdown" });
      return;
    }
    
    if ((action.type === "bore" || action.type === "strauss") && action.step === "diameter") {
      const diameter = parseInt(userText.replace(/[^0-9]/g, ""));
      if (isNaN(diameter)) {
        await ctx.reply("❌ Harus angka! Ketik diameter.");
        return;
      }
      
      global._pendingHargaAction = { type: action.type, diameter, step: "harga" };
      await ctx.reply(`Diameter: *${diameter}cm*\n\nKetik harga per meter (angka):`, { parse_mode: "Markdown" });
      return;
    }
    
    if ((action.type === "bore" || action.type === "strauss") && action.step === "harga") {
      const newPrice = parseInt(userText.replace(/[^0-9]/g, ""));
      if (isNaN(newPrice)) {
        await ctx.reply("❌ Harus angka! Ketik harga per meter.");
        return;
      }
      
      const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
      let content = fs.readFileSync(pricingPath, "utf8");
      
      const section = action.type === "bore" ? "pricingTiers" : "straussTiers";
      const sectionStart = content.indexOf(`export const ${section}`);
      const sectionEnd = content.indexOf("];", sectionStart) + 2;
      const sectionContent = content.substring(sectionStart, sectionEnd);
      
      const diamRegex = new RegExp(`diameter:\\s*${action.diameter}[\\s\\S]*?pricePerMeter:\\s*\\{\\s*min:\\s*\\d+`, "g");
      
      if (diamRegex.test(sectionContent)) {
        const newSection = sectionContent.replace(
          new RegExp(`(diameter:\\s*${action.diameter}[\\s\\S]*?pricePerMeter:\\s*\\{\\s*min:\\s*)\\d+`),
          `$1${newPrice}`
        ).replace(
          new RegExp(`(diameter:\\s*${action.diameter}[\\s\\S]*?max:\\s*)\\d+`),
          `$1${newPrice}`
        );
        
        content = content.substring(0, sectionStart) + newSection + content.substring(sectionEnd);
      }
      
      fs.writeFileSync(pricingPath, content);
      delete global._pendingHargaAction;
      
      logActivity(ctx.from.id, `update-harga-${action.type}`, `${action.diameter}cm: ${newPrice}`, "success");
      
      await ctx.reply(
        `✅ *Harga diupdate!*\n\n` +
        `Type: ${action.type === "bore" ? "Bore Pile" : "Strauss"}\n` +
        `Diameter: ${action.diameter}cm\n` +
        `Harga baru: *Rp ${newPrice.toLocaleString("id-ID")}/m*\n\n` +
        `Ketik /deploy untuk rebuild.`,
        { parse_mode: "Markdown" }
      );
      return;
    }
  }
  
  if (global._pendingSeoDate) {
    let newDate = userText.trim();
    if (newDate.toLowerCase() === "today") {
      newDate = new Date().toISOString().split("T")[0];
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      await ctx.reply("❌ Format salah! Gunakan YYYY-MM-DD atau ketik \"today\".");
      return;
    }
    
    const pricingPath = path.join(PROJECT_ROOT, "src", "data", "pricing.ts");
    let content = fs.readFileSync(pricingPath, "utf8");
    content = content.replace(/lastUpdated:\s*"[^"]+"/, `lastUpdated: "${newDate}"`);
    fs.writeFileSync(pricingPath, content);
    
    delete global._pendingSeoDate;
    logActivity(ctx.from.id, "update-seo-date", newDate, "success");
    
    await ctx.reply(
      `✅ *Tanggal SEO diupdate!*\n\n` +
      `Tanggal baru: *${newDate}*\n\n` +
      `Ketik /deploy untuk rebuild.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // Handle menu interactive actions
  if (global._pendingMenuAction) {
    const action = global._pendingMenuAction;
    
    // Cek batal
    if (text.toLowerCase() === "batal" || text.toLowerCase() === "cancel" || text === "❌ Batal") {
      delete global._pendingMenuAction;
      await ctx.reply("❌ Dibatalkan.", { reply_markup: { inline_keyboard: [[{ text: "⬅️ Menu Utama", callback_data: "action_back_main" }]] } });
      return;
    }
    
    delete global._pendingMenuAction;

    // Git actions
    if (action === "gitadd") {
      await ctx.reply(`/gitadd ${userText}`);
      return;
    }
    if (action === "gitcommit") {
      await ctx.reply(`/gitcommit ${userText}`);
      return;
    }

    // SEO actions
    if (action === "seopage") {
      await ctx.reply(`/seopage ${userText}`);
      return;
    }
    if (action === "auditpage") {
      await ctx.reply(`/auditpage ${userText}`);
      return;
    }
    if (action === "seo_gen") {
      await ctx.reply(`/seo ${userText}`);
      return;
    }

    // City actions
    if (action === "addcity") {
      await ctx.reply(`/addcity ${userText}`);
      return;
    }
    if (action === "viewcity") {
      await ctx.reply(`/viewcity ${userText}`);
      return;
    }
    if (action === "editcity") {
      await ctx.reply(`/editcity ${userText}`);
      return;
    }
    if (action === "deletecity") {
      await ctx.reply(`/deletecity ${userText}`);
      return;
    }
    if (action === "addfaq_step1") {
      global._pendingMenuAction = "addfaq_step2";
      global._pendingFaqSlug = userText;
      await ctx.reply("❓ Ketik pertanyaan FAQ:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
      return;
    }
    if (action === "addfaq_step2") {
      const slug = global._pendingFaqSlug;
      delete global._pendingFaqSlug;
      await ctx.reply(`/addfaq ${slug} ${userText}`);
      return;
    }

    // Harga actions
    if (action === "hargapage_step1") {
      global._pendingMenuAction = "hargapage_step2";
      global._pendingHargaTipe = userText;
      await ctx.reply("📐 Ketik diameter (angka):", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
      return;
    }
    if (action === "hargapage_step2") {
      global._pendingMenuAction = "hargapage_step3";
      global._pendingHargaDiam = userText;
      await ctx.reply("🏙️ Ketik slug kota:", { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "❌ Batal", callback_data: "action_batal_pending" }]] } });
      return;
    }
    if (action === "hargapage_step3") {
      const tipe = global._pendingHargaTipe;
      const diam = global._pendingHargaDiam;
      delete global._pendingHargaTipe;
      delete global._pendingHargaDiam;
      await ctx.reply(`/hargapage ${tipe} ${diam} ${userText}`);
      return;
    }

    // File actions
    if (action === "ls") {
      await ctx.reply(`/ls ${userText || "."}`);
      return;
    }
    if (action === "cat") {
      await ctx.reply(`/cat ${userText}`);
      return;
    }
    if (action === "mkdir") {
      await ctx.reply(`/mkdir ${userText}`);
      return;
    }
    if (action === "touch") {
      await ctx.reply(`/touch ${userText}`);
      return;
    }
    if (action === "rm") {
      await ctx.reply(`/rm ${userText}`);
      return;
    }
  }

  // Hanya proses jika private chat ATAU user me-reply pesan dari bot ini
  const isPrivate = ctx.chat.type === "private";
  const isReplyToBot = ctx.message.reply_to_message && ctx.message.reply_to_message.from.id === ctx.me.id;
  
  if (!isPrivate && !isReplyToBot) return;
  
  if (userText.startsWith("/")) return; // Abaikan command
  
  const loadingMsg = await ctx.reply("🧠 *Agent berpikir...*", { parse_mode: "Markdown" });
  
  // Format history obrolan sebelumnya
  let historyText = globalChatMemory.map(msg => `${msg.role === 'user' ? 'Bos' : 'Kamu'}: ${msg.text}`).join('\n\n');
  
  // Jika user me-reply pesan spesifik, tambahkan sebagai konteks prioritas
  const replyContext = ctx.message.reply_to_message ? `\n[Pesan yang di-reply Bos secara spesifik]:\n"${ctx.message.reply_to_message.text}"` : "";
  
  try {
    const agentPrompt = buildAgentPrompt(userText, globalChatMemory, replyContext);

    const result = await ai.sendPrompt(agentPrompt);
    
    if (!result.success) {
      await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, `❌ Error AI: ${result.error}`);
      return;
    }

    const aiResponse = result.text;
    
    // Simpan ke memori global
    globalChatMemory.push({ role: 'user', text: userText });
    globalChatMemory.push({ role: 'assistant', text: aiResponse.replace(/```json_action\n[\s\S]*?```/, '[Mengeksekusi Tindakan JSON]').trim() });
    if (globalChatMemory.length > 20) globalChatMemory.splice(0, globalChatMemory.length - 20);
    saveMemory(globalChatMemory);
    
    // Deteksi apakah AI mengeluarkan JSON Action
    const actionMatch = aiResponse.match(/```json_action\n([\s\S]*?)```/);
    
    if (actionMatch) {
      // AI memutuskan untuk Action!
      let actionJson;
      try {
        actionJson = JSON.parse(actionMatch[1].trim());
      } catch (parseErr) {
        await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id,
          `❌ Gagal parse action dari AI: ${parseErr.message}\n\nRespons AI:\n${aiResponse.substring(0, 500)}`);
        return;
      }
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
        await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, `🚀 *Tindakan Agen:* Menyimpan ke GitHub & Deploy...`, { parse_mode: "Markdown" });
        
        runCommand("git", ["add", "."]);
        runCommand("git", ["commit", "-m", "feat: Auto-update from Agent CMS"]);
        runCommand("git", ["push"]);

        await ctx.reply("⏳ Membangun ulang website (Build)...");
        const buildResult = await runCommandAsync("npm", ["run", "build"]);
        
        if (!buildResult.success) {
          await ctx.reply(`❌ Build gagal:\n\`\`\`\n${buildResult.output.substring(buildResult.output.length - 800)}\n\`\`\``, { parse_mode: "Markdown" });
          return;
        }

        await ctx.reply("🔄 Merestart server preview...");
        runCommandAsync("powershell", ["-Command", `Set-Location '${PROJECT_ROOT}'; .\\start-all.ps1`]);

        await ctx.reply(`🎉 *Deploy Selesai Sempurna!*\n\n✅ Data aman di GitHub\n✅ Website Astro berhasil di-build\n✅ Server sukses direstart.`);
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
console.log("🤖 Telegram bot v2.1 (Grammy) aktif...");
console.log(`📁 Project root: ${PROJECT_ROOT}`);

// ============ SET BOT COMMANDS (Autocomplete) ============
const commands = [
  { command: "start", description: "Menu utama" },
  { command: "help", description: "Semua command" },
  { command: "ai", description: "Chat AI" },
  { command: "model", description: "Ganti model AI" },
  { command: "status", description: "Status server" },
  { command: "deploy", description: "Build dan deploy" },
  { command: "build", description: "Build Astro" },
  { command: "restart", description: "Restart server" },
  { command: "stop", description: "Stop semua service" },
  { command: "preview", description: "URL preview" },
  { command: "logs", description: "Lihat log" },
  { command: "sysinfo", description: "Info sistem" },
  { command: "cities", description: "Daftar kota" },
  { command: "addcity", description: "Tambah kota" },
  { command: "deletecity", description: "Hapus kota" },
  { command: "listharga", description: "Daftar harga" },
  { command: "seo", description: "Generate SEO" },
  { command: "seoaudit", description: "Audit SEO" },
  { command: "pages", description: "List semua halaman" },
  { command: "auditpage", description: "Audit halaman spesifik" },
  { command: "aimodel", description: "Ganti model AI" },
  { command: "aistatus", description: "Status AI" },
  { command: "typecheck", description: "TypeScript check" },
  { command: "lint", description: "Linting code" },
  { command: "gitstatus", description: "Status git" },
  { command: "gitdiff", description: "Lihat perubahan" },
  { command: "gitpull", description: "Pull dari remote" },
  { command: "gitpush", description: "Push ke remote" },
  { command: "gitadd", description: "Add ke staging" },
  { command: "gitcommit", description: "Commit perubahan" },
  { command: "gitlog", description: "Lihat history" },
  { command: "ls", description: "Lihat isi folder" },
  { command: "cat", description: "Baca file" },
  { command: "health", description: "Cek semua service" },
  { command: "projecthealth", description: "Cek semua aspek" },
  { command: "deps", description: "Cek outdated deps" },
  { command: "depsinstall", description: "Install dependencies" },
  { command: "audit", description: "Security audit" },
  { command: "bundlesize", description: "Cek ukuran bundle" },
  { command: "seocheck", description: "Cek SEO homepage" },
  { command: "seopage", description: "Audit 1 halaman kota" },
  { command: "pricingcheck", description: "Cek konsistensi harga" },
  { command: "lighthouse", description: "Audit performa" },
  { command: "startsvc", description: "Start semua service" },
  { command: "monitorstart", description: "Mulai monitor" },
  { command: "monitorstop", description: "Stop monitor" },
  { command: "monitorstatus", description: "Status monitor" },
];

bot.start({
  onStart: async (botInfo) => {
    console.log(`✅ @${botInfo.username} berhasil start!`);
    logActivity("system", "bot-start", `Bot @${botInfo.username} started`, "success");
    
    // Set commands SETELAH bot start
    try {
      await bot.api.setMyCommands(commands);
      console.log("✅ Bot commands terdaftar di Telegram");
    } catch (err) {
      console.warn("⚠️ Gagal set commands:", err.message);
    }
  },
}).catch((error) => {
  console.error("Polling error:", error);
  process.exitCode = 1;
});
