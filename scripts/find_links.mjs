import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

function exists(routePath) {
  const clean = decodeURIComponent(routePath.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return fs.existsSync(path.join(dist, 'index.html'));
  const direct = path.join(dist, clean);
  const ext = path.extname(clean);
  if (ext && ext !== '.html') return fs.existsSync(direct);
  return (
    (fs.existsSync(direct) && fs.statSync(direct).isFile()) ||
    fs.existsSync(direct + '.html') ||
    fs.existsSync(path.join(direct, 'index.html'))
  );
}

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');
  const rel = path.relative(dist, f);
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/_astro/')) continue;
    if (!exists(href)) {
      console.log(`FILE: ${rel} -> BROKEN HREF: "${href}"`);
    }
  }
}
