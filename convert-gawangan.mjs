import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputDir = 'C:/Users/Asus/.gemini/antigravity/brain/d3892fca-84ce-4ab4-a6da-2bebba0f2480/.user_uploaded';
const outputDir = './public/assets/images/layanan/gawangan';

// We only process the one new image (Gawangan)
const file = { input: 'media_1790527782725.jpg', output: 'gawangan-alat.webp', width: 1200 };

const inputPath = path.join(inputDir, file.input);
const outputPath = path.join(outputDir, file.output);

if (fs.existsSync(inputPath)) {
  const info = await sharp(inputPath)
    .resize({ width: file.width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  console.log(`✓ ${file.output} → ${(info.size / 1024).toFixed(0)}KB (${info.width}x${info.height})`);
} else {
  console.error(`File not found: ${inputPath}`);
}
