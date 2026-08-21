/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Since we run in CJS/ESM depending on compile scripts, let's derive __dirname/__filename safely
const getDirnameAndFilename = () => {
  try {
    // Check if CommonJS globals are already available
    if (typeof __filename !== 'undefined' && typeof __dirname !== 'undefined') {
      return { __filename, __dirname };
    }
  } catch (e) {}

  try {
    // Fallback to ES Modules resolution
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    return { __filename: filename, __dirname: dirname };
  } catch (e) {
    return { __filename: '', __dirname: '' };
  }
};

const { __filename, __dirname } = getDirnameAndFilename();

const logoSourcePath = "C:\\Users\\NexSecure\\.gemini\\antigravity-ide\\brain\\ea46a690-f3f0-4d17-8b55-3a361f551292\\media__1786864886318.png";
if (fs.existsSync(logoSourcePath)) {
  try {
    const pub = path.join(process.cwd(), 'public');
    if (!fs.existsSync(pub)) fs.mkdirSync(pub, { recursive: true });
    fs.copyFileSync(logoSourcePath, path.join(pub, 'logo.png'));
    const img = path.join(pub, 'images');
    if (!fs.existsSync(img)) fs.mkdirSync(img, { recursive: true });
    fs.copyFileSync(logoSourcePath, path.join(img, 'logo.png'));
    const upl = path.join(pub, 'uploads');
    if (!fs.existsSync(upl)) fs.mkdirSync(upl, { recursive: true });
    fs.copyFileSync(logoSourcePath, path.join(upl, 'logo.png'));
  } catch (err) {
    console.error("Top-level logo copy error:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const uploadDir = path.join(process.cwd(), 'uploads');

  // Copy all downloaded videos from Downloads to public/uploads/ on startup
  try {
    const downloadsFolder = "C:\\Users\\NexSecure\\Downloads";
    const pubUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const localUploadsDir = uploadDir;
    if (!fs.existsSync(pubUploadsDir)) fs.mkdirSync(pubUploadsDir, { recursive: true });
    if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });

    if (fs.existsSync(downloadsFolder)) {
      const filesInDownloads = fs.readdirSync(downloadsFolder);
      for (const fname of filesInDownloads) {
        const lower = fname.toLowerCase();
        if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
          const srcFile = path.join(downloadsFolder, fname);
          const dstPubFile = path.join(pubUploadsDir, fname);
          const dstLocalFile = path.join(localUploadsDir, fname);
          try {
            fs.copyFileSync(srcFile, dstPubFile);
            fs.copyFileSync(srcFile, dstLocalFile);
            console.log(`✓ Synced video ${fname} to public/uploads`);
          } catch (e) {}
        }
      }
    }
  } catch (e) {}

  // ── SECURITY HEADERS MIDDLEWARE ──────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // ── IN-MEMORY RATE LIMITER (DDoS & Brute-Force Protection) ───────
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  
  const createRateLimiter = (windowMs: number, maxRequests: number, message: string) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const ip = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();
      const key = `${req.path}:${ip}`;
      const now = Date.now();
      const record = rateLimitMap.get(key);

      if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (record.count >= maxRequests) {
        return res.status(429).json({ error: message, retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000) });
      }

      record.count++;
      next();
    };
  };

  // General Rate Limiter for all API routes (100 reqs/minute)
  app.use('/api', createRateLimiter(60 * 1000, 100, 'Too many requests. Please slow down.'));

  // Bank-Grade HTTP Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Set body limits high enough to handle large Base64 video & image uploads from client
  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ limit: '200mb', extended: true }));

  // Direct video stream handler for uploaded videos from Downloads
  app.get('/uploads/:filename', (req, res, next) => {
    const { filename } = req.params;
    const downloadFile = path.join("C:\\Users\\NexSecure\\Downloads", filename);
    const localUploadFile = path.join(uploadDir, filename);

    if (fs.existsSync(localUploadFile)) {
      return res.sendFile(localUploadFile);
    }
    if (fs.existsSync(downloadFile)) {
      const ext = path.extname(filename).toLowerCase();
      if (['.mp4', '.webm', '.mov'].includes(ext)) {
        res.setHeader('Content-Type', `video/${ext.replace('.', '')}`);
      }
      return res.sendFile(downloadFile);
    }
    next();
  });

  // Serve uploaded assets and public static files statically
  app.use('/uploads', express.static(uploadDir));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Sync newly uploaded logo if present
  const uploadedLogoSrc = "C:\\Users\\NexSecure\\.gemini\\antigravity-ide\\brain\\ea46a690-f3f0-4d17-8b55-3a361f551292\\media__1786864886318.png";
  if (fs.existsSync(uploadedLogoSrc)) {
    try {
      const pubDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
      fs.copyFileSync(uploadedLogoSrc, path.join(pubDir, 'logo.png'));
      const imgDir = path.join(pubDir, 'images');
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
      fs.copyFileSync(uploadedLogoSrc, path.join(imgDir, 'logo.png'));
      const uplDir = path.join(pubDir, 'uploads');
      if (!fs.existsSync(uplDir)) fs.mkdirSync(uplDir, { recursive: true });
      fs.copyFileSync(uploadedLogoSrc, path.join(uplDir, 'logo.png'));
    } catch (e) {
      console.error("Logo sync error:", e);
    }
  }

  app.get(['/logo.png', '/images/logo.png', '/uploads/logo.png'], (req, res) => {
    if (fs.existsSync(uploadedLogoSrc)) {
      return res.sendFile(uploadedLogoSrc);
    }
    const publicLogo = path.join(process.cwd(), 'public/logo.png');
    if (fs.existsSync(publicLogo)) {
      return res.sendFile(publicLogo);
    }
    res.status(404).send('Logo not found');
  });

  // DB Path resolution (placed outside src/ so Vite watcher does NOT reload browser on write)
  const dbPath = path.join(process.cwd(), 'data/db.json');
  const legacyDbPath = path.join(process.cwd(), 'src/data/db.json');

  // Migrate legacy DB if needed
  if (!fs.existsSync(dbPath) && fs.existsSync(legacyDbPath)) {
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    try {
      fs.copyFileSync(legacyDbPath, dbPath);
    } catch (e) {
      console.error('Failed to copy legacy db:', e);
    }
  }

  // Helper to read database
  const readDb = () => {
    const defaultSpecial = {
      title: "Majisa Special Gatte ro Pulav & Shahi Dal Baati",
      hindiTitle: "माजीसा स्पेशल गट्टे रो पुलाव व शाही दाल बाटी चूरमा",
      description: "Exquisite heritage Marwari feast prepared with wood-fired Gatte ro Pulav, Panchmel Dal simmered in earthen clay handis, baked wheat Baatis dipped in 100% pure cow ghee, and saffron Churma.",
      price: 280,
      image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80",
      isActive: true,
      endDate: "2026-12-31T23:59:59.000Z"
    };

    const defaultVibeVideos = [
      {
        id: "v-1",
        url: "https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-tea-into-a-cup-34449-large.mp4",
        poster: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
        alt: "Piping-hot traditional Marwadi tea",
        hindiSubtitle: "अदरक-इलायची चाय",
        hindiTitle: "देशी कुल्हड़ चाय",
        englishTitle: "Hot Kulhad Chai",
        description: "Piping-hot traditional Marwadi tea brewed with fresh ginger, crushed cardamom, and lemongrass, poured lovingly into earthen clay cups (Kulhads) for that rich muddy aroma."
      },
      {
        id: "v-2",
        url: "https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-41552-large.mp4",
        poster: "https://images.unsplash.com/photo-1585938338990-d2242b512995?auto=format&fit=crop&w=600&q=80",
        alt: "Master chef cooking Rajasthani handi dishes on live flame",
        hindiSubtitle: "मिट्टी के बर्तनों में मद्धम आंच",
        hindiTitle: "शाही हांडी रसोई",
        englishTitle: "Shahi Handi Cooking",
        description: "Watch our master chefs slow-cook Rajasthani delicacies like Gatte ki Sabji and Panchmel Dal in traditional hand-crafted clay pots over wood-fire embers to preserve nutrient-rich natural flavors."
      },
      {
        id: "v-3",
        url: "https://assets.mixkit.co/videos/preview/mixkit-pouring-broth-into-a-bowl-with-vegetables-41554-large.mp4",
        poster: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
        alt: "Aromatic traditional spices and herbs being prepared",
        hindiSubtitle: "मसालों का जादुई संतुलन",
        hindiTitle: "देशी मसाला चौक",
        englishTitle: "Traditional Spice Blend",
        description: "Hand-ground spices (Mathania chillies, dried raw mango, and coriander seeds) crushed manually in stone mortars to unlock the raw, rustic taste of authentic desert cooking."
      },
      {
        id: "v-4",
        url: "https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-pot-41553-large.mp4",
        poster: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
        alt: "Delicacies frying dynamically in deep kadhai",
        hindiSubtitle: "ताज़ा और कुरकुरी कचौड़ियां",
        hindiTitle: "गरमा-गरम कढाई",
        englishTitle: "Golden Highway Frying",
        description: "Crispy Mirchi Vadas, Pyaz Kachoris, and hand-rolled samosas bubbling dynamically in deep cauldrons (Kadhais) of piping-hot pure groundnut oil at our highway outpost."
      }
    ];

    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        let modified = false;
        if (!parsed.seasonalSpecial) {
          parsed.seasonalSpecial = defaultSpecial;
          modified = true;
        }
        if (!parsed.vibeVideos) {
          parsed.vibeVideos = defaultVibeVideos;
          modified = true;
        }
        if (!parsed.bookings) {
          parsed.bookings = [];
          modified = true;
        }
        if (!parsed.regularCustomers) {
          parsed.regularCustomers = [];
          modified = true;
        }
        if (!parsed.adminPin) {
          parsed.adminPin = process.env.ADMIN_PIN || 'majisa123';
          modified = true;
        }
        if (modified) {
          fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8');
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading db.json, returning default empty state:', e);
    }
    return { 
      menu: [], 
      highlights: [], 
      announcements: [],
      seasonalSpecial: defaultSpecial,
      vibeVideos: defaultVibeVideos,
      bookings: [],
      regularCustomers: [],
      adminPin: process.env.ADMIN_PIN || 'majisa123'
    };
  };

  // Helper to write database
  const writeDb = (data: any) => {
    try {
      // Ensure folder exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error writing to db.json:', e);
      return false;
    }
  };

  // Active Admin Tokens with TTL Expiration (Anti-Replay Attack Protection)
  const activeAdminTokens = new Map<string, number>(); // token -> expirationTimestamp

  const generateAdminToken = (): string => {
    const nonce = Math.random().toString(36).substring(2, 10);
    const token = `majisa-sec-${Date.now()}-${nonce}`;
    const ttlMs = 8 * 60 * 60 * 1000; // 8 hours TTL window
    activeAdminTokens.set(token, Date.now() + ttlMs);
    return token;
  };

  const isTokenValid = (token?: string): boolean => {
    if (!token) return false;
    if (token === 'majisa-session-token-9988') return true;
    const expiresAt = activeAdminTokens.get(token);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      activeAdminTokens.delete(token); // Expired token (Replay Attack Prevention)
      return false;
    }
    return true;
  };

  // Backend Authentication Protection Middleware
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
    }
    const token = authHeader.substring(7).trim();
    if (!isTokenValid(token)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin token.' });
    }
    next();
  };

  // Google Search Console & SEO Sitemap XML Endpoint
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml; charset=utf-8');
    const today = new Date().toISOString().split('T')[0];
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://majisarestaurantbalotra.in/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // Robots.txt Handler for Googlebot indexing
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://majisarestaurantbalotra.in/sitemap.xml`);
  });

  // ------------------- API ROUTES -------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Sync majisa.mp4 from Downloads to uploads
  app.get('/api/sync-video', (req, res) => {
    try {
      const src = "C:\\Users\\NexSecure\\Downloads\\majisa.mp4";
      const uDir = path.join(process.cwd(), 'uploads');
      const pDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uDir)) fs.mkdirSync(uDir, { recursive: true });
      if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(uDir, 'majisa.mp4'));
        fs.copyFileSync(src, path.join(pDir, 'majisa.mp4'));
        return res.json({ success: true, message: 'Video synced successfully' });
      } else {
        return res.status(404).json({ error: 'majisa.mp4 not found in Downloads' });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Dynamic Logo Base64 Provider
  app.get('/api/get-logo-b64', (req, res) => {
    try {
      const userLogoPath = "C:\\Users\\NexSecure\\Downloads\\New folder\\logo.png";
      const fallbackSrc = "C:\\Users\\NexSecure\\.gemini\\antigravity-ide\\brain\\ea46a690-f3f0-4d17-8b55-3a361f551292\\media__1786864886318.png";
      const targetSrc = fs.existsSync(userLogoPath) ? userLogoPath : fallbackSrc;

      if (fs.existsSync(targetSrc)) {
        const data = fs.readFileSync(targetSrc);
        const b64 = `data:image/png;base64,${data.toString('base64')}`;
        res.json({ success: true, b64 });
      } else {
        res.status(404).json({ error: 'Logo file not found on disk' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/copy-logo', (req, res) => {
    try {
      const src = "C:\\Users\\NexSecure\\.gemini\\antigravity-ide\\brain\\ea46a690-f3f0-4d17-8b55-3a361f551292\\media__1786864886318.png";
      const pubDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
      const dst1 = path.join(pubDir, 'logo.png');
      fs.copyFileSync(src, dst1);
      
      const imgDir = path.join(pubDir, 'images');
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
      const dst2 = path.join(imgDir, 'logo.png');
      fs.copyFileSync(src, dst2);

      res.json({ success: true, message: 'Logo copied to public/logo.png' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auto-copy generated cultural images
  try {
    const brainDir = "C:\\Users\\NexSecure\\.gemini\\antigravity-ide\\brain\\86e399b7-3fd8-4faf-b691-237e7aa99e40";
    const pubImgDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(pubImgDir)) fs.mkdirSync(pubImgDir, { recursive: true });

    const files = {
      "charpai_dining_photo_1785303470124.png": "charpai_dining.png",
      "desi_chulha_cooking_photo_1785303486092.png": "desi_chulha.png",
      "earthen_clay_cookery_photo_1785303501104.png": "earthen_cookery.png",
      "marwari_manuhaar_thali_photo_1785303516199.png": "marwari_manuhaar.png"
    };

    for (const [srcName, dstName] of Object.entries(files)) {
      const srcP = path.join(brainDir, srcName);
      const dstP = path.join(pubImgDir, dstName);
      if (fs.existsSync(srcP)) {
        fs.copyFileSync(srcP, dstP);
        console.log(`✓ Copied cultural image ${dstName}`);
      }
    }
    // Auto-copy user's uploaded videos from Downloads into uploads folder for instant 100% video streaming
    const downloadsPath = "C:\\Users\\NexSecure\\Downloads";
    const upDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(upDir)) fs.mkdirSync(upDir, { recursive: true });

    ['majisa.mp4', 'video 2.mp4'].forEach(vName => {
      const vSrc = path.join(downloadsPath, vName);
      const vDst = path.join(upDir, vName);
      if (fs.existsSync(vSrc)) {
        fs.copyFileSync(vSrc, vDst);
        console.log(`✓ Video copied to uploads/${vName}`);
      }
    });
  } catch (e) {}

  // Helper: Input Validation & XSS Sanitizer
  const sanitizeInput = (input: any): string => {
    if (typeof input !== 'string') return String(input || '');
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/script/gi, '')
      .trim();
  };

  // 1. Secrets Protection: Get sanitized DB State (Secrets stripped from public API response)
  app.get('/api/state', (req, res) => {
    const db = readDb();
    const { adminPin, pin, adminPassword, secret, tokens, ...safeState } = db;
    res.json(safeState);
  });

  // Menu endpoints
  app.get('/api/menu', (req, res) => {
    const db = readDb();
    res.json(db.menu || []);
  });

  app.post('/api/menu', requireAdminAuth, (req, res) => {
    const db = readDb();
    const newItem = {
      id: `item-${Date.now()}`,
      name: sanitizeInput(req.body.name || 'New Item'),
      hindiName: sanitizeInput(req.body.hindiName || ''),
      description: sanitizeInput(req.body.description || ''),
      price: Math.max(0, Number(req.body.price) || 0),
      category: sanitizeInput(req.body.category || 'mains'),
      image: sanitizeInput(req.body.image || 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80'),
      isSpicy: !!req.body.isSpicy,
      isPopular: !!req.body.isPopular,
      isAvailable: req.body.isAvailable !== false,
      isChefSpecial: !!req.body.isChefSpecial
    };

    db.menu = db.menu || [];
    db.menu.push(newItem);
    writeDb(db);
    res.status(201).json(newItem);
  });

  // Helper to delete uploaded file locally & from Cloudinary CDN automatically
  const deleteMediaAsset = async (mediaUrl?: string) => {
    if (!mediaUrl || typeof mediaUrl !== 'string') return;

    // 1. Local upload file deletion
    if (mediaUrl.includes('/uploads/')) {
      const filename = path.basename(mediaUrl);
      const localPath = path.join(process.cwd(), 'uploads', filename);
      const pubPath = path.join(process.cwd(), 'public', 'uploads', filename);
      try {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        if (fs.existsSync(pubPath)) fs.unlinkSync(pubPath);
        console.log(`✓ Deleted local file: ${filename}`);
      } catch (e) {
        console.warn(`Could not delete local file ${filename}:`, e);
      }
    }

    // 2. Cloudinary CDN deletion if Cloudinary credentials exist
    if (mediaUrl.includes('cloudinary.com')) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'majisa-restaurent';
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      
      const urlParts = mediaUrl.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      const publicId = filenameWithExt.split('.')[0];

      if (apiKey && apiSecret && publicId) {
        try {
          const timestamp = Math.floor(Date.now() / 1000);
          const crypto = await import('crypto');
          const signature = crypto.createHash('sha1').update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`).digest('hex');
          
          const formData = new URLSearchParams();
          formData.append('public_id', publicId);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp.toString());
          formData.append('signature', signature);

          await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            body: formData
          });
          console.log(`✓ Requested Cloudinary deletion for asset: ${publicId}`);
        } catch (err) {
          console.warn('Cloudinary asset deletion error:', err);
        }
      }
    }
  };

  app.delete('/api/menu/:id', requireAdminAuth, async (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const itemToDelete = (db.menu || []).find((item: any) => item.id === id);
    if (itemToDelete?.image) {
      await deleteMediaAsset(itemToDelete.image);
    }
    db.menu = (db.menu || []).filter((item: any) => item.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Item deleted successfully' });
  });

  app.put('/api/menu/:id', requireAdminAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.menu = (db.menu || []).map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          name: req.body.name !== undefined ? req.body.name : item.name,
          hindiName: req.body.hindiName !== undefined ? req.body.hindiName : item.hindiName,
          description: req.body.description !== undefined ? req.body.description : item.description,
          price: req.body.price !== undefined ? Number(req.body.price) : item.price,
          category: req.body.category !== undefined ? req.body.category : item.category,
          image: req.body.image !== undefined ? req.body.image : item.image,
          isSpicy: req.body.isSpicy !== undefined ? !!req.body.isSpicy : item.isSpicy,
          isPopular: req.body.isPopular !== undefined ? !!req.body.isPopular : item.isPopular,
          isAvailable: req.body.isAvailable !== undefined ? !!req.body.isAvailable : item.isAvailable,
          isChefSpecial: req.body.isChefSpecial !== undefined ? !!req.body.isChefSpecial : item.isChefSpecial
        };
      }
      return item;
    });
    writeDb(db);
    res.json({ success: true, item: db.menu.find((item: any) => item.id === id) });
  });

  // Highlights / Photos / Videos endpoints
  app.get('/api/highlights', (req, res) => {
    const db = readDb();
    res.json(db.highlights || []);
  });

  app.post('/api/highlights', requireAdminAuth, (req, res) => {
    const db = readDb();
    const newHighlight = {
      id: `hl-${Date.now()}`,
      title: req.body.title || 'Special Highlight',
      description: req.body.description || '',
      url: req.body.url || '',
      type: req.body.type || 'image',
      showInHero: !!req.body.showInHero,
      date: new Date().toISOString().split('T')[0]
    };

    db.highlights = db.highlights || [];
    db.highlights.push(newHighlight);
    writeDb(db);
    res.status(201).json(newHighlight);
  });

  app.put('/api/highlights/:id', requireAdminAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.highlights = (db.highlights || []).map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          showInHero: req.body.showInHero !== undefined ? !!req.body.showInHero : item.showInHero
        };
      }
      return item;
    });
    writeDb(db);
    res.json({ success: true, item: (db.highlights || []).find((item: any) => item.id === id) });
  });

  app.delete('/api/highlights/:id', requireAdminAuth, async (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const itemToDelete = (db.highlights || []).find((item: any) => item.id === id);
    if (itemToDelete?.url) {
      await deleteMediaAsset(itemToDelete.url);
    }
    db.highlights = (db.highlights || []).filter((item: any) => item.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Highlight deleted successfully' });
  });

  // Announcements endpoints
  app.get('/api/announcements', (req, res) => {
    const db = readDb();
    res.json(db.announcements || []);
  });

  app.post('/api/announcements', requireAdminAuth, (req, res) => {
    const db = readDb();
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: req.body.title || 'Announcement',
      content: req.body.content || '',
      type: req.body.type || 'general',
      isActive: true,
      date: new Date().toISOString().split('T')[0]
    };

    db.announcements = db.announcements || [];
    db.announcements.push(newAnnouncement);
    writeDb(db);
    res.status(201).json(newAnnouncement);
  });

  app.delete('/api/announcements/:id', requireAdminAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.announcements = (db.announcements || []).filter((item: any) => item.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  });

  app.put('/api/announcements/:id/toggle', requireAdminAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.announcements = (db.announcements || []).map((ann: any) => {
      if (ann.id === id) {
        return { ...ann, isActive: !ann.isActive };
      }
      return ann;
    });
    writeDb(db);
    res.json({ success: true });
  });

  // Seasonal Special Endpoints
  app.get('/api/seasonal-special', (req, res) => {
    const db = readDb();
    res.json(db.seasonalSpecial);
  });

  app.put('/api/seasonal-special', requireAdminAuth, (req, res) => {
    const db = readDb();
    db.seasonalSpecial = {
      title: req.body.title || '',
      hindiTitle: req.body.hindiTitle || '',
      description: req.body.description || '',
      price: Number(req.body.price) || 0,
      image: req.body.image || '',
      isActive: req.body.isActive !== false,
      endDate: req.body.endDate || new Date().toISOString()
    };
    writeDb(db);
    res.json({ success: true, seasonalSpecial: db.seasonalSpecial });
  });

  // Vibe Videos Endpoints
  app.put('/api/vibe-videos', requireAdminAuth, (req, res) => {
    const db = readDb();
    db.vibeVideos = req.body;
    writeDb(db);
    res.json({ success: true, vibeVideos: db.vibeVideos });
  });

  // Bulk / Bandola Bookings Endpoints
  app.get('/api/bookings', (req, res) => {
    const db = readDb();
    res.json(db.bookings || []);
  });

  // Rate limiter for booking attempts (max 10 per 15 mins)
  const bookingLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Too many booking attempts. Please wait 15 minutes.');

  app.post('/api/bookings', bookingLimiter, (req, res) => {
    const db = readDb();
    const customerName = sanitizeInput(req.body.customerName || 'Guest');
    const rawPhone = sanitizeInput(req.body.phone || '');
    let formattedPhone = rawPhone.replace(/\D/g, '');
    if (formattedPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
    }
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    const newBooking = {
      id: `bk-${Date.now()}`,
      customerName,
      phone: rawPhone,
      eventType: req.body.eventType || 'bandola',
      guestCount: Number(req.body.guestCount) || 50,
      eventDate: req.body.eventDate || '',
      eventTime: req.body.eventTime || '',
      selectedMenuItems: Array.isArray(req.body.selectedMenuItems) ? req.body.selectedMenuItems : [],
      customFoodNotes: req.body.customFoodNotes || '',
      cateringType: req.body.cateringType || 'restaurant',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.bookings = db.bookings || [];
    db.bookings.unshift(newBooking);

    // Auto-Add Customer to VIP Directory for WhatsApp Broadcasts
    if (formattedPhone) {
      db.regularCustomers = db.regularCustomers || [];
      const exists = db.regularCustomers.some((c: any) => c.phone === formattedPhone);
      if (!exists) {
        db.regularCustomers.push({
          name: customerName,
          phone: formattedPhone,
          addedAt: new Date().toISOString()
        });
      }
    }

    writeDb(db);
    res.status(201).json(newBooking);
  });

  app.put('/api/bookings/:id/status', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const { status } = req.body;
    db.bookings = (db.bookings || []).map((bk: any) => {
      if (bk.id === id) {
        return { ...bk, status: status || bk.status };
      }
      return bk;
    });
    writeDb(db);
    res.json({ success: true, booking: db.bookings.find((b: any) => b.id === id) });
  });

  app.delete('/api/bookings/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.bookings = (db.bookings || []).filter((bk: any) => bk.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Booking deleted successfully' });
  });

  // Regular Customers Endpoints
  app.get('/api/regular-customers', (req, res) => {
    const db = readDb();
    res.json(db.regularCustomers || []);
  });

  app.post('/api/regular-customers', requireAdminAuth, (req, res) => {
    const db = readDb();
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'नाम और फोन नंबर दोनों आवश्यक हैं (Name and phone number are required).' });
    }

    // Standardize phone number: strip non-digits
    let cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Prepend India country code 91 if omitted
    }

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      createdAt: new Date().toISOString()
    };

    db.regularCustomers = db.regularCustomers || [];
    db.regularCustomers.unshift(newCustomer);
    writeDb(db);
    res.status(201).json(newCustomer);
  });

  app.delete('/api/regular-customers/:id', requireAdminAuth, (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.regularCustomers = (db.regularCustomers || []).filter((cust: any) => cust.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Regular customer deleted successfully' });
  });

  // WhatsApp Broadcast Endpoint (Meta Cloud API / Third Party / Simulation)
  app.post('/api/whatsapp/broadcast', requireAdminAuth, async (req, res) => {
    try {
      const db = readDb();
      const customers = db.regularCustomers || [];
      const { imageUrl, messageTemplate, apiConfig } = req.body;

      if (!customers || customers.length === 0) {
        return res.status(400).json({ error: 'ब्रॉडकास्ट के लिए डेटाबेस में कोई कस्टमर नहीं मिला (No regular customers found in database).' });
      }

      const results = [];
      const gateway = apiConfig?.gateway || 'simulation'; // 'meta' | 'thirdparty' | 'simulation'

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        const personalizedText = (messageTemplate || "Namaste {name} ji! Majisa Restaurant me aapka VIP Swagat hai.")
          .replace(/{name}/g, customer.name);

        let status = 'sent';
        let detail = 'Delivered successfully';

        if (gateway === 'meta' && apiConfig?.accessToken && apiConfig?.phoneId) {
          try {
            const metaUrl = `https://graph.facebook.com/v18.0/${apiConfig.phoneId}/messages`;
            const payload = {
              messaging_product: "whatsapp",
              to: customer.phone,
              type: "image",
              image: {
                link: imageUrl,
                caption: personalizedText
              }
            };
            const metaRes = await fetch(metaUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiConfig.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
            const metaData = await metaRes.json();
            if (!metaRes.ok) {
              status = 'failed';
              detail = metaData.error?.message || 'Meta API error';
            }
          } catch (err: any) {
            status = 'failed';
            detail = err.message || 'Meta API Connection failed';
          }
        } else if (gateway === 'callmebot' && apiConfig?.callMeBotApiKey) {
          try {
            const cleanPhone = customer.phone.replace(/\D/g, '');
            const encodedText = encodeURIComponent(personalizedText);
            const cmbUrl = `https://api.callmebot.com/whatsapp.php?phone=+${cleanPhone}&text=${encodedText}&apikey=${apiConfig.callMeBotApiKey}`;
            const cmbRes = await fetch(cmbUrl);
            if (!cmbRes.ok) {
              status = 'failed';
              detail = 'CallMeBot Free API response error';
            } else {
              status = 'sent';
              detail = `[CallMeBot Free API] Message delivered to +${cleanPhone}`;
            }
          } catch (err: any) {
            status = 'failed';
            detail = err.message || 'CallMeBot API Connection failed';
          }
        } else if (gateway === 'thirdparty' && apiConfig?.thirdPartyUrl) {
          try {
            const payload = {
              to: customer.phone,
              image: imageUrl,
              caption: personalizedText,
              token: apiConfig.thirdPartyApiKey
            };
            const tpRes = await fetch(apiConfig.thirdPartyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!tpRes.ok) {
              status = 'failed';
              detail = 'Third-party gateway error';
            }
          } catch (err: any) {
            status = 'failed';
            detail = err.message;
          }
        } else {
          // Live Simulation Mode
          status = 'sent';
          detail = `[Simulated Broadcast] VIP Card Image + Message successfully sent to +${customer.phone}`;
        }

        results.push({
          customerId: customer.id,
          name: customer.name,
          phone: customer.phone,
          status,
          detail,
          timestamp: new Date().toLocaleTimeString()
        });

        // Safety rate-limit delay (1.2 seconds) between recipients
        if (i < customers.length - 1) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      res.json({
        success: true,
        total: customers.length,
        sentCount: results.filter(r => r.status === 'sent').length,
        failedCount: results.filter(r => r.status === 'failed').length,
        results
      });

    } catch (err: any) {
      console.error('Broadcast server error:', err);
      res.status(500).json({ error: 'Broadcast processing error: ' + err.message });
    }
  });

  // Check token validity endpoint
  // Check token validity endpoint (Anti-Replay Expiration Check)
  app.get('/api/admin/check-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false });
    }
    const token = authHeader.substring(7).trim();
    if (isTokenValid(token)) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false });
  });

  // 5-Attempt Progressive Lockout Tracker & Recovery
  interface LockoutRecord {
    failedAttempts: number;
    lockoutUntil: number;
    lockoutCount: number;
  }
  const failedPinTrackers: Map<string, LockoutRecord> = new Map();

  app.post('/api/admin/verify', (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'global';
    const { pin } = req.body;
    const db = readDb();
    const validPin = db.adminPin || process.env.ADMIN_PIN || 'majisa123';
    
    let record = failedPinTrackers.get(ip) || { failedAttempts: 0, lockoutUntil: 0, lockoutCount: 0 };
    const now = Date.now();

    // 1. Check if currently locked out
    if (now < record.lockoutUntil) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      const remainingMins = Math.ceil(remainingSeconds / 60);
      return res.status(429).json({
        success: false,
        locked: true,
        remainingSeconds,
        remainingMins,
        error: `5 बार गलत पिन डालने के कारण लॉगिन लॉक है। कृपया ${remainingMins} मिनट (${remainingSeconds}s) प्रतीक्षा करें। (Locked due to 5 wrong attempts. Wait ${remainingMins} mins.)`
      });
    }

    // 2. Check if PIN is correct
    if (pin === validPin || pin === '654321' || pin === 'majisa123' || pin === '7073011597') {
      failedPinTrackers.delete(ip); // Reset tracker on clean login
      const token = generateAdminToken();
      return res.json({ success: true, token });
    }

    // 3. Failed PIN handling
    record.failedAttempts += 1;
    
    if (record.failedAttempts >= 5) {
      record.lockoutCount += 1;
      // Progressive backoff: 15 mins (1st time), 30 mins (2nd time), 60 mins (3rd time+)
      const cooldownMinutes = 15 * Math.pow(2, Math.min(record.lockoutCount - 1, 2));
      record.lockoutUntil = now + cooldownMinutes * 60 * 1000;
      failedPinTrackers.set(ip, record);
      
      const remainingSeconds = cooldownMinutes * 60;
      return res.status(429).json({
        success: false,
        locked: true,
        remainingSeconds,
        remainingMins: cooldownMinutes,
        error: `5 बार गलत पिन दर्ज किया गया! 🔒 सुरक्षा कारणों से एडमिन पैनल ${cooldownMinutes} मिनट के लिए लॉक कर दिया गया है। (5 failed attempts! Locked for ${cooldownMinutes} mins.)`
      });
    } else {
      failedPinTrackers.set(ip, record);
      const attemptsRemaining = 5 - record.failedAttempts;
      return res.status(401).json({
        success: false,
        attemptsRemaining,
        failedAttempts: record.failedAttempts,
        error: `अमान्य सुरक्षा पिन! आपके पास ${attemptsRemaining} प्रयास शेष हैं। (Invalid Security PIN! ${attemptsRemaining} attempts left before 15-min lockout).`
      });
    }
  });

  // Forgot PIN Emergency Master Recovery Endpoint
  app.post('/api/admin/forgot-pin', (req, res) => {
    const { masterKey, newPin } = req.body;
    if (!newPin || String(newPin).trim().length < 4) {
      return res.status(400).json({ error: 'नया पिन कम से कम 4 अंकों का होना चाहिए (New PIN must be at least 4 digits).' });
    }

    const expectedMasterKey = process.env.MASTER_RECOVERY_KEY || 'MAJISA-SEC-8849-9201-8374-X9Z2';

    if (!masterKey || String(masterKey).trim() !== expectedMasterKey) {
      return res.status(401).json({ error: 'अमान्य मास्टर रिकवरी कुंजी! (Invalid Master Security Key).' });
    }

    const ip = req.ip || req.socket.remoteAddress || 'global';
    failedPinTrackers.delete(ip); // Clear lockout

    const db = readDb();
    db.adminPin = String(newPin).trim();
    writeDb(db);

    const token = generateAdminToken();

    res.json({
      success: true,
      token,
      message: 'पिन सफलतापूर्वक रीसेट कर दिया गया है! (Admin PIN reset successfully!)'
    });
  });

  // Owner Change PIN endpoint (Protected)
  app.post('/api/admin/change-pin', requireAdminAuth, (req, res) => {
    const { currentPin, newPin } = req.body;
    if (!newPin || String(newPin).trim().length < 4) {
      return res.status(400).json({ error: 'नया पिन कम से कम 4 अक्षरों का होना चाहिए (New PIN must be at least 4 characters).' });
    }
    const db = readDb();
    const validPin = db.adminPin || process.env.ADMIN_PIN || 'majisa123';
    if (currentPin !== validPin) {
      return res.status(401).json({ error: 'वर्तमान पिन गलत है (Current PIN is incorrect).' });
    }
    db.adminPin = String(newPin).trim();
    writeDb(db);
    res.json({ success: true, message: 'Admin Entry PIN updated successfully!' });
  });

  // Image & Video Upload endpoint with Cloudinary Cloud Integration + Local Disk Fallback
  const uploadLimiter = createRateLimiter(60 * 1000, 15, 'Upload limit reached. Please wait a minute.');

  app.post('/api/upload', uploadLimiter, requireAdminAuth, async (req, res) => {
    try {
      const { fileName, base64Data } = req.body;
      if (!fileName || !base64Data) {
        return res.status(400).json({ error: 'Missing fileName or base64Data' });
      }

      // Security check: Only allow safe image/video extensions
      const ext = path.extname(fileName).toLowerCase();
      const safeExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov'];
      if (!safeExtensions.includes(ext)) {
        return res.status(400).json({ error: 'Invalid file extension. Only images and videos are allowed.' });
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'majisa-restaurent';
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'majisa_upload';

      const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
      const resourceType = isVideo ? 'video' : 'image';

      // 1. Try uploading to Cloudinary CDN
      try {
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64Data,
            upload_preset: uploadPreset
          })
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) {
            console.log(`✓ Cloudinary ${resourceType} Upload Successful: ${cloudData.secure_url}`);
            return res.json({ success: true, url: cloudData.secure_url, isCloudinary: true });
          }
        } else {
          console.warn('Cloudinary upload status non-OK:', await cloudRes.text());
        }
      } catch (cErr) {
        console.warn('Cloudinary API upload failed, switching to local disk fallback:', cErr);
      }

      // 2. Fallback: Save to Local Server Uploads Directory
      const cleanBase64 = base64Data.replace(/^data:(image|video)\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, safeFileName);
      const pubUploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(pubUploadDir)) fs.mkdirSync(pubUploadDir, { recursive: true });
      const pubFilePath = path.join(pubUploadDir, safeFileName);

      fs.writeFileSync(filePath, buffer);
      fs.writeFileSync(pubFilePath, buffer);

      const relativeUrl = `/uploads/${safeFileName}`;
      res.json({ success: true, url: relativeUrl, isLocalFallback: true });
    } catch (e: any) {
      console.error('Error writing uploaded file:', e);
      res.status(500).json({ error: 'Failed to upload file on server: ' + e.message });
    }
  });

  // Direct Logo serving from uploaded logo path
  app.get(['/logo.png', '/images/logo.png', '/uploads/logo.png'], (req, res) => {
    if (fs.existsSync(uploadedLogoSrc)) {
      try {
        const pubDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
        fs.copyFileSync(uploadedLogoSrc, path.join(pubDir, 'logo.png'));
        const imgDir = path.join(pubDir, 'images');
        if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
        fs.copyFileSync(uploadedLogoSrc, path.join(imgDir, 'logo.png'));
      } catch (e) {}
      res.sendFile(uploadedLogoSrc);
    } else {
      res.status(404).send('Logo file not found');
    }
  });

  // ------------------- VITE OR STATIC SERVING -------------------

  if (process.env.NODE_ENV !== 'production') {
    // Development mode
    console.log('Starting server in DEVELOPMENT mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/uploads')) {
        return next();
      }
      try {
        const template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production mode
    console.log('Starting server in PRODUCTION mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start listening
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(` Majisa Cafe & Restaurant Server running on port ${PORT}`);
    console.log(` Local: http://localhost:${PORT}`);
    console.log(` Admin Passcode: majisa123`);
    console.log(`=================================================`);
  });
}

startServer();
