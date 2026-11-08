const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadAppsScript(relativePath, mocks = {}) {
  const filename = path.resolve(process.cwd(), relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const context = vm.createContext({ console, ...mocks });
  vm.runInContext(source, context, { filename, timeout: 1000 });
  return { context };
}

module.exports = { loadAppsScript };