const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\NexSecure\\Downloads\\New folder (3)\\logo majisa rehan.png";
const dst1 = path.join(__dirname, '../public/logo.png');
const dst2 = path.join(__dirname, '../public/images/logo.png');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dst1);
  fs.copyFileSync(src, dst2);
  console.log('Successfully copied logo to public/logo.png!');
} else {
  console.error('Src logo file not found at:', src);
}
