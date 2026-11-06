import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const CITIES_PATH = path.resolve('src/data/cities.json');
const HTML_JAKARTA = path.resolve('scratch/halaman-bore-pile-jakarta-konten.html');

console.log('[WATCHER] Auto-Sync Active! Menunggu perubahan di scratch/halaman-bore-pile-jakarta-konten.html...');

let isProcessing = false;
let debounceTimer = null;

function syncJakarta() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    console.log('\n[SYNC] Terdeteksi penyimpanan file scratch/halaman-bore-pile-jakarta-konten.html!');
    const content = fs.readFileSync(HTML_JAKARTA, 'utf8');

    // 1. Ekstrak Schema Description
    const schemaMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let newDesc = '';
    if (schemaMatch) {
      try {
        const json = JSON.parse(schemaMatch[1]);
        if (json.description) {
          newDesc = json.description;
        }
      } catch (e) {}
    }

    // 2. Ekstrak FAQs dari Schema FAQPage
    const faqSchemaMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?)<\/script>/);
    let newFaqs = null;
    if (faqSchemaMatch) {
      try {
        const faqJson = JSON.parse(faqSchemaMatch[1]);
        if (Array.isArray(faqJson.mainEntity)) {
          newFaqs = faqJson.mainEntity.map(q => ({
            question: q.name,
            answer: q.acceptedAnswer?.text || ''
          }));
        }
      } catch (e) {}
    }

    // Update cities.json
    if (fs.existsSync(CITIES_PATH)) {
      const cities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));
      const jkt = cities.find(c => c.slug === 'jakarta');
      let changed = false;

      if (jkt) {
        if (newDesc && jkt.descriptionBore !== newDesc) {
          jkt.descriptionBore = newDesc;
          console.log(`[SYNC SUCCESS] Schema/Meta Description diperbarui: "${newDesc}"`);
          changed = true;
        }
        if (newFaqs && newFaqs.length > 0) {
          jkt.localFaqs = newFaqs;
          console.log(`[SYNC SUCCESS] ${newFaqs.length} FAQs lokal Jakarta berhasil disinkronkan!`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(CITIES_PATH, JSON.stringify(cities, null, 2), 'utf8');
        console.log('[SYNC SUCCESS] src/data/cities.json telah otomatis diupdate!');
      } else {
        console.log('[SYNC INFO] Tidak ada perubahan data schema/FAQ yang perlu ditulis.');
      }
    }
  } catch (err) {
    console.error('[SYNC ERROR]', err.message);
  } finally {
    isProcessing = false;
  }
}

fs.watchFile(HTML_JAKARTA, { interval: 1000 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncJakarta();
    }, 500);
  }
});

