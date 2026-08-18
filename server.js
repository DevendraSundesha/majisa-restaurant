const express = require('express');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'majisa-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

/* ── Multer Config ─────────────────────────────────────── */
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  }
});

/* ── JSON Helpers ──────────────────────────────────────── */
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function readJSON(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '[]');
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2));
}

/* ── Auth Middleware ────────────────────────────────────── */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized — please login as admin' });
}

/* ═══════════════════════════════════════════════════════
   API ROUTES
   ═══════════════════════════════════════════════════════ */

/* ── Admin Authentication ──────────────────────────────── */
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'majisa123';

  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    res.json({ success: true, message: 'Padharo mhare admin panel! 🙏' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

/* ── Gallery & Hero Media ──────────────────────────────── */
app.get('/api/gallery', (req, res) => {
  const gallery = readJSON('gallery.json');
  res.json(gallery.filter(item => item.section === 'gallery'));
});

app.get('/api/hero-media', (req, res) => {
  const gallery = readJSON('gallery.json');
  res.json(gallery.filter(item => item.section === 'hero'));
});

app.get('/api/all-media', requireAdmin, (req, res) => {
  res.json(readJSON('gallery.json'));
});

app.post('/api/admin/upload', requireAdmin, upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const gallery = readJSON('gallery.json');
  const isVideo = req.file.mimetype.startsWith('video');
  const item = {
    id: Date.now().toString(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    type: isVideo ? 'video' : 'photo',
    section: req.body.section || 'gallery',
    caption: req.body.caption || '',
    uploadedAt: new Date().toISOString()
  };

  gallery.push(item);
  writeJSON('gallery.json', gallery);
  res.json({ success: true, item });
});

app.delete('/api/admin/media/:id', requireAdmin, (req, res) => {
  let gallery = readJSON('gallery.json');
  const item = gallery.find(g => g.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  // Delete file from disk
  const filepath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  gallery = gallery.filter(g => g.id !== req.params.id);
  writeJSON('gallery.json', gallery);
  res.json({ success: true });
});

/* ── Menu Management ───────────────────────────────────── */
app.get('/api/menu', (req, res) => {
  res.json(readJSON('menu.json'));
});

app.post('/api/admin/menu', requireAdmin, upload.single('image'), (req, res) => {
  const menu = readJSON('menu.json');
  const item = {
    id: req.body.id || Date.now().toString(),
    name: req.body.name,
    nameHindi: req.body.nameHindi || '',
    description: req.body.description || '',
    price: req.body.price,
    category: req.body.category || 'main',
    image: req.file ? req.file.filename : (req.body.existingImage || ''),
    isVeg: req.body.isVeg === 'true' || req.body.isVeg === true
  };

  const existingIndex = menu.findIndex(m => m.id === item.id);
  if (existingIndex >= 0) {
    // Update: delete old image if new one uploaded
    if (req.file && menu[existingIndex].image) {
      const oldPath = path.join(uploadsDir, menu[existingIndex].image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    menu[existingIndex] = item;
  } else {
    menu.push(item);
  }

  writeJSON('menu.json', menu);
  res.json({ success: true, item });
});

app.get('/api/get-logo-b64', (req, res) => {
  const downloadLogoPath = 'C:\\Users\\NexSecure\\Downloads\\New folder\\logo.png';
  const publicLogoPath = path.join(__dirname, 'public', 'logo.png');
  const publicBrandLogoPath = path.join(__dirname, 'public', 'majisa_brand_logo.png');
  const srcAssetsLogoPath = path.join(__dirname, 'src', 'assets', 'logo.png');

  try {
    const assetsDir = path.join(__dirname, 'src', 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    if (fs.existsSync(downloadLogoPath)) {
      const buf = fs.readFileSync(downloadLogoPath);
      fs.writeFileSync(publicLogoPath, buf);
      fs.writeFileSync(publicBrandLogoPath, buf);
      fs.writeFileSync(srcAssetsLogoPath, buf);
      const b64 = 'data:image/png;base64,' + buf.toString('base64');
      return res.json({ success: true, b64 });
    } else if (fs.existsSync(publicLogoPath)) {
      const buf = fs.readFileSync(publicLogoPath);
      const b64 = 'data:image/png;base64,' + buf.toString('base64');
      return res.json({ success: true, b64 });
    }
  } catch (err) {
    console.error('Logo sync error:', err);
  }
  res.json({ success: false });
});

app.delete('/api/admin/menu/:id', requireAdmin, (req, res) => {
  let menu = readJSON('menu.json');
  const item = menu.find(m => m.id === req.params.id);

  if (item && item.image) {
    const filepath = path.join(uploadsDir, item.image);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }

  menu = menu.filter(m => m.id !== req.params.id);
  writeJSON('menu.json', menu);
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; text-align: center; background: #160d08; color: #f2cf73; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; margin: -8px;">
      <h2 style="color: #d8a843; font-size: 2rem; margin-bottom: 10px;">🏜️ Majisa Cafe & Restaurant Backend Server is Running! 🪔</h2>
      <p style="color: #fff; font-size: 1.15rem; max-width: 600px; line-height: 1.6; margin-top: 0;">
        यह केवल API/Backend सर्वर है। मुख्य वेबसाइट और ओनर डैशबोर्ड देखने के लिए कृपया फ्रंटएंड सर्वर (Port 5173) पर जाएं।
      </p>
      <div style="margin: 30px 0;">
        <a href="http://localhost:5173" style="display: inline-block; background: #9d361b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px; border: 1px solid #a96d18; transition: background 0.2s;">
          🌐 Open Website (http://localhost:5173)
        </a>
        <a href="http://localhost:5173/#owner-admin" style="display: inline-block; background: #a96d18; color: #160d08; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px; transition: background 0.2s;">
          👤 Open Owner Admin Panel (PIN: 1122)
        </a>
      </div>
      <p style="color: #8c7365; font-size: 0.95rem; margin-top: 20px;">
        💡 <strong>टिप:</strong> दोनों सर्वर (Backend & Frontend) को एक साथ चलाने के लिए प्रोजेक्ट डायरेक्टरी में मौजूद <strong>run_project.bat</strong> फ़ाइल को रन करें।
      </p>
    </div>
  `);
});

/* ── Start Server ──────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  🏜️  ════════════════════════════════════════════`);
  console.log(`  🪔  Majisa Cafe & Restaurant Server`);
  console.log(`  🏜️  ════════════════════════════════════════════`);
  console.log(`  🌐  Backend API: http://localhost:${PORT}`);
  console.log(`  👤  Frontend & Admin: http://localhost:5173 (Admin Hash: #owner-admin)`);
  console.log(`  🏜️  ════════════════════════════════════════════\n`);
});

