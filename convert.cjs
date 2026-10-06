const sharp = require("sharp");
const path = require("path");

const files = [
  "header-jasa-strauss-pile-jakarta-aseven-pile.png",
  "proses-strauss-pile-jakarta-aseven-pile.png",
  "proses-strauss-pile-2-jakarta-aseven-pile.png"
];

async function convert() {
  for (const file of files) {
    const input = path.join(__dirname, "public/imgs", file);
    const output = path.join(__dirname, "public/imgs", file.replace(".png", ".webp"));
    console.log("Converting " + file);
    await sharp(input)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(output);
    console.log("Saved " + output);
  }
}

convert().catch(console.error);
