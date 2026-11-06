import fs from 'node:fs';

function cleanHtmlToHumanFormat(filePath) {
  if (!fs.existsSync(filePath)) return '';
  let raw = fs.readFileSync(filePath, 'utf8');

  // Extract main
  const mainMatch = raw.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) return '';
  let content = mainMatch[1];

  // Remove <style>...</style>
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove style="..."
  content = content.replace(/\s*style="[^"]*"/gi, '');
  // Remove data-astro-cid
  content = content.replace(/\s*data-astro-cid-[a-z0-9_-]+/g, '');
  // Remove non-schema script tags
  content = content.replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, '');

  // Collapse consecutive whitespaces and newlines
  content = content.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  content = content.replace(/>\s*\n\s*</g, '><');

  let lines = [];
  let indent = 0;
  const tokens = content.match(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<[^>]+>|[^<]+)/g) || [];
  let currentLine = '';
  
  for (let token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('<!--')) {
      if (currentLine) { lines.push('  '.repeat(indent) + currentLine); currentLine = ''; }
      lines.push('  '.repeat(indent) + trimmed);
    } else if (trimmed.startsWith('<script')) {
      if (currentLine) { lines.push('  '.repeat(indent) + currentLine); currentLine = ''; }
      lines.push('  '.repeat(indent) + trimmed);
    } else if (trimmed.startsWith('</')) {
      const tag = trimmed.slice(2, -1).toLowerCase().split(' ')[0];
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'th', 'td', 'span', 'strong', 'em', 'a', 'b', 'i'].includes(tag) && currentLine) {
        currentLine += trimmed;
        lines.push('  '.repeat(indent) + currentLine);
        currentLine = '';
      } else {
        if (currentLine) { lines.push('  '.repeat(indent) + currentLine); currentLine = ''; }
        indent = Math.max(0, indent - 1);
        lines.push('  '.repeat(indent) + trimmed);
      }
    } else if (trimmed.startsWith('<') && !trimmed.startsWith('<!')) {
      const tagMatch = trimmed.match(/^<([a-zA-Z0-9-]+)/);
      const tag = tagMatch ? tagMatch[1].toLowerCase() : '';
      const isVoid = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tag) || trimmed.endsWith('/>');
      
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'th', 'td'].includes(tag)) {
        if (currentLine) { lines.push('  '.repeat(indent) + currentLine); currentLine = ''; }
        currentLine = trimmed;
      } else if (['span', 'strong', 'em', 'a', 'b', 'i', 'code', 'small'].includes(tag) && currentLine) {
        currentLine += (currentLine.endsWith(' ') || currentLine.endsWith('>') ? '' : ' ') + trimmed;
      } else {
        if (currentLine) { lines.push('  '.repeat(indent) + currentLine); currentLine = ''; }
        lines.push('  '.repeat(indent) + trimmed);
        if (!isVoid) indent++;
      }
    } else {
      if (currentLine) {
        currentLine += (currentLine.endsWith(' ') || currentLine.endsWith('>') ? '' : ' ') + trimmed;
      } else {
        lines.push('  '.repeat(indent) + trimmed);
      }
    }
  }
  if (currentLine) lines.push('  '.repeat(indent) + currentLine);

  return lines.join('\n');
}

const jktFile = 'dist/area-layanan/bore-pile/jakarta/index.html';
const jktResult = cleanHtmlToHumanFormat(jktFile);
fs.writeFileSync('scratch/halaman-bore-pile-jakarta-konten.html', jktResult, 'utf8');
console.log(`Saved scratch/halaman-bore-pile-jakarta-konten.html (${jktResult.split('\n').length} lines)`);

const d30File = 'dist/layanan/bore-pile/diameter/30/index.html';
if (fs.existsSync(d30File)) {
  const d30Result = cleanHtmlToHumanFormat(d30File);
  fs.writeFileSync('scratch/halaman-d30-clean.html', d30Result, 'utf8');
  console.log(`Saved scratch/halaman-d30-clean.html (${d30Result.split('\n').length} lines)`);
}

const d40File = 'dist/layanan/bore-pile/diameter/40/index.html';
if (fs.existsSync(d40File)) {
  const d40Result = cleanHtmlToHumanFormat(d40File);
  fs.writeFileSync('scratch/halaman-d40-clean.html', d40Result, 'utf8');
  console.log(`Saved scratch/halaman-d40-clean.html (${d40Result.split('\n').length} lines)`);
}
