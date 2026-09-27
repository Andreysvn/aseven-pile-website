import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\d3892fca-84ce-4ab4-a6da-2bebba0f2480\\.user_uploaded';
const outputDir = 'public/assets/images/layanan/mini-crane';

const images = [
  { file: 'media_1790527782705.jpg', name: 'mc-sempit.webp' },
  { file: 'media_1790527782707.jpg', name: 'mc-rig.webp' },
  { file: 'media_1790527782719.jpg', name: 'mc-air-abu.webp' },
  { file: 'media_1790527782725.jpg', name: 'mc-gudang.webp' },
  { file: 'media_1790527782738.jpg', name: 'mc-air-coklat.webp' }
];

async function convert() {
  for (const img of images) {
    const inputPath = path.join(inputDir, img.file);
    const outputPath = path.join(outputDir, img.name);
    
    await sharp(inputPath)
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    console.log(`Converted ${img.file} to ${img.name}`);
  }
}

convert().catch(console.error);
