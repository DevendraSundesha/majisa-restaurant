const fs = require('fs');
const path = require('path');

const brainDir = "C:\\Users\\NexSecure\\.gemini\\antigravity-ide\\brain\\86e399b7-3fd8-4faf-b691-237e7aa99e40";
const publicImagesDir = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

const filesToCopy = {
  "charpai_dining_photo_1785303470124.png": "charpai_dining.png",
  "desi_chulha_cooking_photo_1785303486092.png": "desi_chulha.png",
  "earthen_clay_cookery_photo_1785303501104.png": "earthen_cookery.png",
  "marwari_manuhaar_thali_photo_1785303516199.png": "marwari_manuhaar.png"
};

for (const [srcName, dstName] of Object.entries(filesToCopy)) {
  const srcPath = path.join(brainDir, srcName);
  const dstPath = path.join(publicImagesDir, dstName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, dstPath);
    console.log(`Copied ${srcName} -> ${dstName}`);
  } else {
    console.log(`Source not found: ${srcPath}`);
  }
}
