import fs from 'node:fs';

function cleanNoCss(dia) {
  const file = `dist/layanan/bore-pile/diameter/${dia}/index.html`;
  if (!fs.existsSync(file)) return '';
  let html = fs.readFileSync(file, 'utf8');
  
  // Extract main
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) return '';
  let content = mainMatch[1];
  
  // Cut off massive area chips at bottom if present
  const areaIdx = content.indexOf('<section class="section section-bg-alt');
  if (areaIdx !== -1) {
    content = content.slice(0, areaIdx);
  }

  // Remove <style>...</style>
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Remove style="..."
  content = content.replace(/\s*style="[^"]*"/gi, '');

  // Remove data-astro-cid
  content = content.replace(/\s*data-astro-cid-[a-z0-9_-]+/g, '');

  // Remove non-schema script tags
  content = content.replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, '');

  // Normalize whitespace
  content = content.replace(/>\s*</g, '><');
  
  // Pretty indent
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const tokens = content.match(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<[^>]+>|[^<]+)/g) || [];

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;
    if (token.startsWith('<!--') || token.startsWith('<script')) {
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<') && !token.startsWith('<!')) {
      const tagMatch = token.match(/^<([a-zA-Z0-9-]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      const isSelfClosing = token.endsWith('/>') || voidTags.has(tagName);
      formatted += tab.repeat(indent) + token + '\n';
      if (!isSelfClosing) indent++;
    } else {
      formatted += tab.repeat(indent) + token + '\n';
    }
  }

  return formatted.trim();
}

const d30 = cleanNoCss('30');
fs.writeFileSync('scratch/d30-tanpa-css.html', d30, 'utf8');
console.log(`Saved scratch/d30-tanpa-css.html (${d30.split('\n').length} lines)`);

const d40 = cleanNoCss('40');
fs.writeFileSync('scratch/d40-tanpa-css.html', d40, 'utf8');
console.log(`Saved scratch/d40-tanpa-css.html (${d40.split('\n').length} lines)`);

