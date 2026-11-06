import fs from 'node:fs';

function formatHtml(html) {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  // Normalize whitespace between tags
  html = html.replace(/>\s*</g, '><');

  // Void/self-closing elements
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  // Regex to match tags, comments, or text
  const tokens = html.match(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>|[^<]+)/g) || [];

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    if (token.startsWith('<!--')) {
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<script') || token.startsWith('<style')) {
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('</')) {
      // Closing tag
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<') && !token.startsWith('<!')) {
      // Opening or self-closing tag
      const tagMatch = token.match(/^<([a-zA-Z0-9-]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      const isSelfClosing = token.endsWith('/>') || voidTags.has(tagName);

      formatted += tab.repeat(indent) + token + '\n';
      if (!isSelfClosing) {
        indent++;
      }
    } else {
      // Text node
      formatted += tab.repeat(indent) + token + '\n';
    }
  }

  return formatted.trim();
}

function cleanHtml(rawHtml) {
  // Extract main
  const mainMatch = rawHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) return '';
  let content = mainMatch[1];
  
  // Remove data-astro-cid attributes
  content = content.replace(/\s*data-astro-cid-[a-z0-9_-]+/g, '');
  
  // Remove massive area chips section if present to keep it focused on the content
  const areaIdx = content.indexOf('<section class="section section-bg-alt');
  if (areaIdx !== -1) {
    content = content.slice(0, areaIdx);
  }
  
  return formatHtml(content);
}

for (const dia of ['30', '40']) {
  const file = `dist/layanan/bore-pile/diameter/${dia}/index.html`;
  if (!fs.existsSync(file)) continue;
  const raw = fs.readFileSync(file, 'utf8');
  const cleaned = cleanHtml(raw);
  fs.writeFileSync(`scratch/halaman-d${dia}-clean.html`, cleaned, 'utf8');
  console.log(`Saved scratch/halaman-d${dia}-clean.html (lines: ${cleaned.split('\n').length})`);
}

