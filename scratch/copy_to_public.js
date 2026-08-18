const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\NexSecure\\Downloads\\majisa.mp4";
const dstDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}
const dst = path.join(dstDir, 'majisa.mp4');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dst);
  console.log('SUCCESS: majisa.mp4 copied to public/uploads/majisa.mp4');
} else {
  console.log('ERROR: src file not found:', src);
}
