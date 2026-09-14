const path = require("path");
const net = require("net");
const { execSync } = require("child_process");
const { SYSTEM_PROMPT } = require("./system-prompt");

// Lazy-loaded client (ESM dynamic import from CommonJS)
let clientInstance = null;
let detectedServerUrl = null;

const ZEN_FREE_MODELS = [
  { id: "mimo-v2.5-free", name: "MiMo-V2.5 Free (Xiaomi)", free: true, available: true },
  { id: "big-pickle", name: "Big Pickle (Stealth)", free: true, available: true },
  { id: "ling-3.0-flash-fin-free", name: "Ling 3.0 Flash Fin", free: true, available: true },
  { id: "nemotron-3-ultra-free", name: "Nemotron 3 Ultra (NVIDIA)", free: true, available: true },
  { id: "nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning (NVIDIA)", free: true, available: true },
  { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3 Contributor", free: true, available: true },
];

const PAID_MODELS = [
  { id: "gpt-5.6-sol", name: "GPT 5.6 Sol (OpenAI)", free: false, available: true },
  { id: "gpt-5.6-terra", name: "GPT 5.6 Terra (OpenAI)", free: false, available: true },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5 (Anthropic)", free: false, available: true },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Google)", free: false, available: true },
  { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro (Google)", free: false, available: true },
  { id: "grok-4.6", name: "Grok 4.6 (xAI)", free: false, available: true },
];

function httpGet(url, timeout = 2000) {
  return new Promise((resolve) => {
    const req = require("http").get(url, { timeout }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

function getAllListeningPorts() {
  const ports = new Set();
  try {
    const output = execSync(
      'netstat -ano -p TCP | findstr "LISTENING"',
      { encoding: "utf-8", timeout: 5000 }
    );
    for (const line of output.split("\n")) {
      const m = line.match(/127\.0\.0\.1:(\d+)\s+.*LISTENING/);
      if (m) ports.add(parseInt(m[1], 10));
      const m2 = line.match(/0\.0\.0\.0:(\d+)\s+.*LISTENING/);
      if (m2) ports.add(parseInt(m2[1], 10));
    }
  } catch {}
  return [...ports];
}

function getOpenCodePids() {
  const pids = new Set();
  try {
    const output = execSync(
      'wmic process where "name=\'opencode.exe\'" get processid /format:list',
      { encoding: "utf-8", timeout: 5000 }
    );
    for (const line of output.split("\n")) {
      const m = line.match(/ProcessId=(\d+)/);
      if (m) pids.add(parseInt(m[1], 10));
    }
  } catch {}
  try {
    const output = execSync(
      'wmic process where "name=\'node.exe\' and commandline like \'%opencode%\'" get processid /format:list',
      { encoding: "utf-8", timeout: 5000 }
    );
    for (const line of output.split("\n")) {
      const m = line.match(/ProcessId=(\d+)/);
      if (m) pids.add(parseInt(m[1], 10));
    }
  } catch {}
  return [...pids];
}

function getPortsByPids(pids) {
  if (!pids.length) return [];
  const ports = new Set();
  try {
    const filter = pids.map((p) => `PID=${p}`).join(" or ");
    const output = execSync(
      `netstat -ano -p TCP | findstr "LISTENING"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    for (const line of output.split("\n")) {
      for (const pid of pids) {
        if (line.endsWith(pid) || line.endsWith(`${pid}\r`)) {
          const m = line.match(/127\.0\.0\.1:(\d+)/);
          if (m) ports.add(parseInt(m[1], 10));
          const m2 = line.match(/0\.0\.0\.0:(\d+)/);
          if (m2) ports.add(parseInt(m2[1], 10));
        }
      }
    }
  } catch {}
  return [...ports];
}

async function verifyOpenCodeServer(port, timeout = 2000) {
  const res = await httpGet(`http://127.0.0.1:${port}/session`, timeout);
  if (res && (res.status === 200 || res.status === 404)) return true;
  const res2 = await httpGet(`http://127.0.0.1:${port}/`, timeout);
  if (res2 && res2.status === 200) return true;
  return false;
}

async function detectOpenCodePort() {
  const configured = process.env.OPENCODE_SERVER_URL;
  if (configured) {
    const portMatch = configured.match(/:(\d+)$/);
    if (portMatch) {
      const port = parseInt(portMatch[1], 10);
      if (await verifyOpenCodeServer(port)) {
        console.log(`✅ OpenCode server ditemukan di port ${port} (dari .env)`);
        return port;
      }
      console.warn(`⚠️  Port ${port} dari .env tidak merespons, scanning...`);
    }
  }

  const opencodePids = getOpenCodePids();
  if (opencodePids.length) {
    console.log(`🔍 OpenCode proses ditemukan (PID: ${opencodePids.join(", ")}), cari port...`);
    const portsFromPid = getPortsByPids(opencodePids);
    for (const port of portsFromPid) {
      if (await verifyOpenCodeServer(port)) {
        console.log(`✅ OpenCode server ditemukan di port ${port} (dari PID ${opencodePids.join(",")})`);
        return port;
      }
    }
  }

  console.log(`🔍 Scanning semua listening port...`);
  const allPorts = getAllListeningPorts();
  console.log(`   Ditemukan ${allPorts.length} port listening`);

  for (const port of allPorts) {
    if (await verifyOpenCodeServer(port, 1500)) {
      console.log(`✅ OpenCode server ditemukan di port ${port} (scan semua port)`);
      return port;
    }
  }

  console.warn("❌ OpenCode server tidak ditemukan di semua port");
  return null;
}

async function getClient() {
  if (clientInstance) return clientInstance;

  let serverUrl = detectedServerUrl;
  if (!serverUrl) {
    const port = await detectOpenCodePort();
    if (port) {
      serverUrl = `http://127.0.0.1:${port}`;
      detectedServerUrl = serverUrl;
      process.env.OPENCODE_SERVER_URL = serverUrl;
    } else {
      serverUrl = process.env.OPENCODE_SERVER_URL || "http://127.0.0.1:4096";
      console.warn(`⚠️  OpenCode server tidak terdeteksi, pakai default: ${serverUrl}`);
    }
  }

  try {
    const sdk = await import("@opencode-ai/sdk");
    const { createOpencodeClient } = sdk;

    clientInstance = createOpencodeClient({ baseUrl: serverUrl });
    console.log(`✅ OpenCode client connected ke ${serverUrl}`);
    return clientInstance;
  } catch (err) {
    console.error(`❌ Gagal connect ke OpenCode server: ${err.message}`);
    console.error(`   Pastikan OpenCode server berjalan di ${serverUrl}`);
    return null;
  }
}

async function createSession(title) {
  const client = await getClient();
  if (!client) return { success: false, error: "OpenCode server tidak tersedia" };

  try {
    const result = await client.session.create({
      body: { title: title || "Telegram Bot Session" },
    });
    return { success: true, sessionId: result.data.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendPrompt(sessionId, prompt, modelId) {
  const client = await getClient();
  if (!client) return { success: false, error: "OpenCode server tidak tersedia" };

  try {
    const fullPrompt = SYSTEM_PROMPT + "\n\n---\n\n" + prompt;

    const body = {
      parts: [{ type: "text", text: fullPrompt }],
    };

    if (modelId) {
      body.model = { providerID: "opencode", modelID: modelId };
    }

    const result = await client.session.prompt({
      path: { id: sessionId },
      body,
    });

    let responseText = "";
    if (result.data && result.data.parts) {
      for (const part of result.data.parts) {
        if (part.type === "text") {
          responseText += part.text;
        }
      }
    }

    return {
      success: true,
      text: responseText || "(Tidak ada response text)",
      model: modelId || "default",
      sessionId,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function checkHealth() {
  const client = await getClient();
  if (!client) return { healthy: false, error: "Server tidak tersedia" };

  try {
    await client.session.list();
    return { healthy: true, version: "connected" };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

async function listSessions() {
  const client = await getClient();
  if (!client) return { success: false, error: "OpenCode server tidak tersedia" };

  try {
    const result = await client.session.list();
    const sessions = result.data || [];
    return { success: true, sessions };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function deleteSession(sessionId) {
  const client = await getClient();
  if (!client) return { success: false, error: "OpenCode server tidak tersedia" };

  try {
    await client.session.delete({ path: { id: sessionId } });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function abortSession(sessionId) {
  const client = await getClient();
  if (!client) return { success: false, error: "OpenCode server tidak tersedia" };

  try {
    await client.session.abort({ path: { id: sessionId } });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getAllModels() {
  return [...ZEN_FREE_MODELS, ...PAID_MODELS];
}

function getFreeModels() {
  return ZEN_FREE_MODELS;
}

function resetClient() {
  clientInstance = null;
  detectedServerUrl = null;
}

module.exports = {
  getClient,
  createSession,
  sendPrompt,
  checkHealth,
  listSessions,
  deleteSession,
  abortSession,
  getAllModels,
  getFreeModels,
  resetClient,
  ZEN_FREE_MODELS,
  PAID_MODELS,
};
