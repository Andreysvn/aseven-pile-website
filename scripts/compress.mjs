import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = './public/imgs';
const files = fs.readdirSync(dir).filter(f => f.startsWith('header-jasa-bore-pile-') && f.endsWith('.png'));

async function processImages() {
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace('.png', '.webp'));
    
    // We want to make it webp, <80kb. Let's resize it to width 800 and quality 60.
    await sharp(inputPath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 60 })
      .toFile(outputPath);
      
    const stat = fs.statSync(outputPath);
    console.log(`Compressed ${file} -> ${(stat.size / 1024).toFixed(2)} KB`);
    
    // Check if it's < 80kb, if not, try lowering quality
    if (stat.size > 80 * 1024) {
      console.log('Still too large, recompessing with lower quality/size...');
      await sharp(inputPath)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 50 })
        .toFile(outputPath);
      console.log(`Re-compressed ${file} -> ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    }
    
    // delete the original png
    fs.unlinkSync(inputPath);
  }
}

processImages().catch(console.error);

