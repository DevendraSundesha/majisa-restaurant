const fs = require('fs');
const path = require('path');

const downloadsDir = "C:\\Users\\NexSecure\\Downloads";
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const files = ['majisa.mp4', 'video 2.mp4', '001637.mp4', '1U9A3923.mp4'];

for (const fileName of files) {
  const src = path.join(downloadsDir, fileName);
  const dst = path.join(uploadsDir, fileName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`✓ Copied ${fileName} to uploads/`);
  }
}
