import fs from 'node:fs';
import path from 'node:path';

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getHtmlFiles('./dist');
console.log('Total HTML files found in dist:', files.length);

const crossCityMismatches = [];
const canonicalMismatches = [];
const brokenWaLinks = [];
const ogIssues = [];
const trailingSlashIssues = [];
const schemaFaqMismatches = [];
const hardcodedDateIssues = [];

for (const file of files) {
  const relPath = path.relative('./dist', file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  // Check 1: Canonical URL check
  const canonMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
  if (canonMatch) {
    const canonUrl = canonMatch[1];
    let expectedPath = relPath.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    if (expectedPath === 'index') expectedPath = '';
    const canonPath = new URL(canonUrl).pathname.replace(/\/$/, '');
    if (canonPath !== (expectedPath ? `/${expectedPath}` : '')) {
      canonicalMismatches.push({ file: relPath, canonUrl, expected: `/${expectedPath}` });
    }
  }

  // Check 2: Cross-city strauss links
  // If this is a city page other than jakarta or bekasi, does it have strauss links pointing to jakarta?
  const cityMatch = relPath.match(/area-layanan\/bore-pile\/([^/]+)\/index\.html/);
  if (cityMatch) {
    const citySlug = cityMatch[1];
    if (citySlug !== 'jakarta' && citySlug !== 'bekasi') {
      const straussJakartaRegex = /href="\/area-layanan\/strauss-pile\/jakarta"/g;
      if (straussJakartaRegex.test(html)) {
        crossCityMismatches.push({
          file: relPath,
          city: citySlug,
          issue: 'Links to /area-layanan/strauss-pile/jakarta instead of city strauss or general strauss'
        });
      }
    }
  }

  // Check 3: WhatsApp Links format
  const waMatches = html.matchAll(/href="([^"]*wa\.me[^"]*)"/g);
  for (const m of waMatches) {
    const url = m[1];
    if (!url.includes('6285814173761')) {
      brokenWaLinks.push({ file: relPath, url });
    }
    // Check if double encoded
    if (url.includes('%2520') || url.includes('%252C')) {
      brokenWaLinks.push({ file: relPath, url, issue: 'DOUBLE_URL_ENCODED' });
    }
  }

  // Check 4: OpenGraph tags
  const hasOgTitle = /<meta[^>]+property="og:title"/i.test(html);
  const hasOgImage = /<meta[^>]+property="og:image"/i.test(html);
  const hasOgUrl = /<meta[^>]+property="og:url"/i.test(html);
  if (!hasOgTitle || !hasOgImage || !hasOgUrl) {
    if (!relPath.includes('diameter-') && !relPath.includes('portofolio')) {
      ogIssues.push({ file: relPath, hasOgTitle, hasOgImage, hasOgUrl });
    }
  }

  // Check 5: Schema FAQ vs HTML FAQ count
  const faqSchemaMatch = html.match(/"@type":\s*"FAQPage"[\s\S]*?"mainEntity":\s*(\[[^\]]+\])/);
  if (faqSchemaMatch) {
    try {
      const parsed = JSON.parse(faqSchemaMatch[1]);
      const htmlFaqCount = (html.match(/class="faq-question"/g) || []).length;
      if (htmlFaqCount > 0 && parsed.length !== htmlFaqCount) {
        schemaFaqMismatches.push({ file: relPath, schemaCount: parsed.length, htmlCount: htmlFaqCount });
      }
    } catch (_) {}
  }
}

console.log('=== DEEP DIVE AUDIT RESULTS ===');
console.log('1. Canonical Mismatches:', canonicalMismatches.length);
if (canonicalMismatches.length) console.log(canonicalMismatches);

console.log('2. Cross-City Link Mismatches (e.g. Bogor pointing to Strauss Jakarta):', crossCityMismatches.length);
if (crossCityMismatches.length) console.log(crossCityMismatches);

console.log('3. WhatsApp Links with issues:', brokenWaLinks.length);
if (brokenWaLinks.length) console.log(brokenWaLinks);

console.log('4. OpenGraph Tag issues:', ogIssues.length);
if (ogIssues.length) console.log(ogIssues);

console.log('5. FAQ Schema vs HTML Count Mismatches:', schemaFaqMismatches.length);
if (schemaFaqMismatches.length) console.log(schemaFaqMismatches);
