const { execSync, spawn } = require("child_process");
const path = require("path");

// Project root
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Max output length (bytes)
const MAX_OUTPUT_LENGTH = 4000;

/**
 * Fungsi: Jalankan command sync (untuk command cepat)
 */
function runCommand(command, args = [], options = {}) {
  const cwd = options.cwd || PROJECT_ROOT;
  
  try {
    const result = execSync(
      `${command} ${args.join(" ")}`,
      { 
        cwd,
        encoding: "utf8",
        timeout: options.timeout || 30000,
        maxBuffer: 1024 * 1024
      }
    );
    
    return {
      success: true,
      output: truncateOutput(result)
    };
  } catch (err) {
    return {
      success: false,
      output: truncateOutput(err.stdout || err.stderr || err.message)
    };
  }
}

/**
 * Fungsi: Jalankan command async (untuk command lama)
 */
function runCommandAsync(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const cwd = options.cwd || PROJECT_ROOT;
    let output = "";
    let killed = false;
    
    const proc = spawn(command, args, {
      cwd,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    
    proc.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    proc.stderr.on("data", (data) => {
      output += data.toString();
    });
    
    // Timeout
    const timeout = setTimeout(() => {
      killed = true;
      proc.kill("SIGTERM");
    }, options.timeout || 60000);
    
    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0 && !killed,
        code,
        output: truncateOutput(output),
        killed
      });
    });
    
    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        code: 1,
        output: err.message,
        killed: false
      });
    });
  });
}

/**
 * Fungsi: Truncate output jika terlalu panjang
 */
function truncateOutput(text) {
  if (!text) return "";
  
  // Bersihkan ANSI codes
  const cleaned = text.replace(/\x1B\[[0-9;]*[mK]/g, "");
  
  if (cleaned.length > MAX_OUTPUT_LENGTH) {
    return cleaned.substring(0, MAX_OUTPUT_LENGTH) + "\n... (output dipotong)";
  }
  
  return cleaned;
}

/**
 * Fungsi: Escape markdown characters
 */
function escapeMarkdown(text) {
  if (!text) return "";
  
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`");
}

module.exports = {
  PROJECT_ROOT,
  runCommand,
  runCommandAsync,
  truncateOutput,
  escapeMarkdown
};
