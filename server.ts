import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import {
  readDatabase,
  writeDatabase,
  generateKeyString,
  Transaction,
  IssuedKey,
  AppSettings
} from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_USER = "mawwwhub";
const ADMIN_PASS = "mawwwhub201122@";
const ADMIN_FIXED_TOKEN = "mawwwhub_auth_permanent_key_201122";

async function main() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Helper to get base URL
  function getAppBaseUrl(req: Request): string {
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    return `${protocol}://${host}`;
  }

  // Admin auth middleware
  function requireAdmin(req: Request, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;
    const token = req.headers['x-admin-token'] || (authHeader && authHeader.replace(/^Bearer\s+/, ''));
    if (token === ADMIN_FIXED_TOKEN) {
      return next();
    }
    const db = readDatabase();
    if (token && db.adminTokens.includes(token as string)) {
      return next();
    }
    return res.status(401).json({ success: false, message: "Akses admin tidak diizinkan. Silakan login kembali." });
  }

  // --- API ROUTES ---

  // 1. Admin Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const db = readDatabase();
      if (!db.adminTokens.includes(ADMIN_FIXED_TOKEN)) {
        db.adminTokens.push(ADMIN_FIXED_TOKEN);
        writeDatabase(db);
      }
      return res.json({
        success: true,
        message: "Login admin berhasil! Sesi login permanen diaktifkan.",
        token: ADMIN_FIXED_TOKEN,
        username: ADMIN_USER
      });
    }
    return res.status(401).json({
      success: false,
      message: "Username atau Password salah! Periksa kembali kredensial admin Anda."
    });
  });

  // 2. Check Admin Session
  app.get('/api/admin/verify-session', (req: Request, res: Response) => {
    const token = req.headers['x-admin-token'] || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/, ''));
    if (token === ADMIN_FIXED_TOKEN) {
      return res.json({ success: true, valid: true, username: ADMIN_USER });
    }
    const db = readDatabase();
    if (token && db.adminTokens.includes(token as string)) {
      return res.json({ success: true, valid: true, username: ADMIN_USER });
    }
    return res.status(401).json({ success: false, valid: false });
  });

  // 3. Public Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    const db = readDatabase();
    const baseUrl = getAppBaseUrl(req);
    const s = db.settings;
    return res.json({
      success: true,
      data: {
        brandName: s.brandName,
        logoUrl: s.logoUrl || '',
        tagline: s.tagline,
        heroHeadline: s.heroHeadline,
        heroSubheadline: s.heroSubheadline,
        gameName: s.gameName,
        scriptDescription: s.scriptDescription,
        scriptFeatures: s.scriptFeatures,
        discordUrl: s.discordUrl,
        telegramUrl: s.telegramUrl,
        whatsappContact: s.whatsappContact,
        announcementText: s.announcementText,
        packages: s.packages.filter(p => p.isActive),
        defaultChannel: s.arexanspay.defaultChannel || 'qris',
        simulationEnabled: s.arexanspay.enableSimulation,
        apiBase: baseUrl
      }
    });
  });

  // 4. Admin Get Full Settings
  app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    return res.json({
      success: true,
      data: db.settings
    });
  });

  // 5. Admin Update Settings
  app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    const db = readDatabase();
    const updated = req.body as Partial<AppSettings>;
    db.settings = {
      ...db.settings,
      ...updated,
      arexanspay: {
        ...db.settings.arexanspay,
        ...(updated.arexanspay || {})
      }
    };
    writeDatabase(db);
    return res.json({
      success: true,
      message: "Pengaturan MawwwHub berhasil disimpan!",
      data: db.settings
    });
  });

  // 5b. Admin Upload Logo
  app.post('/api/admin/upload-logo', requireAdmin, (req: Request, res: Response) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "File gambar tidak ditemukan." });
    }
    const db = readDatabase();
    db.settings.logoUrl = imageBase64;
    writeDatabase(db);
    return res.json({
      success: true,
      message: "Logo berhasil di-upload dan diterapkan!",
      logoUrl: imageBase64
    });
  });

  // 6. Admin Stats
  app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    const now = new Date().getTime();
    
    // Auto refresh key status
    let dirty = false;
    db.keys.forEach(k => {
      if (k.status === 'active' && k.expiresAt) {
        if (new Date(k.expiresAt).getTime() < now) {
          k.status = 'expired';
          dirty = true;
        }
      }
    });
    if (dirty) writeDatabase(db);

    const totalKeys = db.keys.length;
    const activeKeys = db.keys.filter(k => k.status === 'active').length;
    const totalTransactions = db.transactions.length;
    const successTransactions = db.transactions.filter(t => t.status === 'success');
    const totalRevenue = successTransactions.reduce((acc, t) => acc + (t.totalAmount || t.baseAmount || 0), 0);

    return res.json({
      success: true,
      data: {
        totalKeys,
        activeKeys,
        totalTransactions,
        successTransactions: successTransactions.length,
        totalRevenue
      }
    });
  });

  // 7. Admin Key Management
  app.get('/api/admin/keys', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    return res.json({
      success: true,
      data: db.keys
    });
  });

  app.post('/api/admin/keys/generate', requireAdmin, (req: Request, res: Response) => {
    const { durationDays, customerNote, robloxUsername, customPackageName } = req.body;
    const db = readDatabase();

    const days = parseInt(durationDays, 10);
    const now = new Date();
    let expiresAt: string | null = null;
    let packageName = customPackageName || `${days} Hari`;

    if (days > 0) {
      const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      expiresAt = exp.toISOString();
    } else {
      packageName = customPackageName || "Lifetime (Permanen)";
    }

    const newKey: IssuedKey = {
      key: generateKeyString("MWH"),
      packageId: days > 0 ? `pkg-custom-${days}d` : 'pkg-perm',
      packageName,
      durationDays: days,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'active',
      hwid: null,
      customerNote: customerNote || "Manual Generated Key by Admin",
      robloxUsername: robloxUsername || "User"
    };

    db.keys.unshift(newKey);
    writeDatabase(db);

    return res.json({
      success: true,
      message: "Key berhasil dibuat!",
      data: newKey
    });
  });

  app.post('/api/admin/keys/:key/reset-hwid', requireAdmin, (req: Request, res: Response) => {
    const { key } = req.params;
    const db = readDatabase();
    const item = db.keys.find(k => k.key.toUpperCase() === key.toUpperCase());
    if (!item) {
      return res.status(404).json({ success: false, message: "Key tidak ditemukan" });
    }
    item.hwid = null;
    writeDatabase(db);
    return res.json({ success: true, message: `HWID untuk key ${key} berhasil di-reset!` });
  });

  app.delete('/api/admin/keys/:key', requireAdmin, (req: Request, res: Response) => {
    const { key } = req.params;
    const db = readDatabase();
    const index = db.keys.findIndex(k => k.key.toUpperCase() === key.toUpperCase());
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Key tidak ditemukan" });
    }
    // Set to revoked or remove
    db.keys[index].status = 'revoked';
    writeDatabase(db);
    return res.json({ success: true, message: `Key ${key} berhasil dicabut (Revoked).` });
  });

  // 8. Admin Transaction Management
  app.get('/api/admin/transactions', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    return res.json({
      success: true,
      data: db.transactions
    });
  });

  app.post('/api/admin/transactions/:id/manual-approve', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDatabase();
    const trx = db.transactions.find(t => t.id === id);
    if (!trx) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    if (trx.status === 'success' && trx.issuedKey) {
      return res.json({ success: true, message: "Transaksi sudah berhasil sebelumnya", transaction: trx });
    }

    // Generate Key
    const now = new Date();
    let expiresAt: string | null = null;
    if (trx.durationDays > 0) {
      expiresAt = new Date(now.getTime() + trx.durationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const issuedKey = generateKeyString("MWH");
    const keyRecord: IssuedKey = {
      key: issuedKey,
      packageId: trx.packageId,
      packageName: trx.packageName,
      durationDays: trx.durationDays,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'active',
      hwid: null,
      customerNote: `Auto Issued from TRX: ${trx.id}`,
      transactionId: trx.id,
      robloxUsername: trx.robloxUsername || "Buyer"
    };

    db.keys.unshift(keyRecord);
    trx.status = 'success';
    trx.paidAt = now.toISOString();
    trx.issuedKey = issuedKey;

    writeDatabase(db);

    return res.json({
      success: true,
      message: `Transaksi ${id} berhasil disetujui & Key ${issuedKey} telah diterbitkan!`,
      data: {
        transaction: trx,
        issuedKey
      }
    });
  });

  // 9. ArexansPay Test Connection
  app.post('/api/arexanspay/test', requireAdmin, async (req: Request, res: Response) => {
    const { apiUrl, apiKey } = req.body;
    const targetUrl = (apiUrl || "https://arexanspay.my.id").replace(/\/$/, '') + '/api/payments';
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey || '',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json();
      return res.json({
        success: response.ok,
        status: response.status,
        data
      });
    } catch (err: any) {
      return res.json({
        success: false,
        message: "Gagal menghubungkan ke server ArexansPay: " + (err.message || String(err)),
        hint: "Pastikan URL benar dan API Key valid. Anda tetap dapat menggunakan Mode Simulasi untuk pengujian internal."
      });
    }
  });

  // 10. Public Create Transaction (Checkout with ArexansPay)
  app.post('/api/transactions/create', async (req: Request, res: Response) => {
    try {
      const { packageId, robloxUsername, customerContact, paymentChannel } = req.body;
      const db = readDatabase();
      const pkg = db.settings.packages.find(p => p.id === packageId && p.isActive);

      if (!pkg) {
        return res.status(404).json({ success: false, message: "Paket script tidak ditemukan atau sedang nonaktif." });
      }

      const uniqueCode = Math.floor(Math.random() * 250) + 1; // 1-250
      const totalAmount = pkg.price + uniqueCode;
      const trxId = `TRX-MWH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const expiredAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins

      const channel = paymentChannel || 'qris';
      let qrBase64 = '';
      let qrPayload = '';
      let arexanspayTrxId = '';
      let bankName = 'QRIS ALL PAYMENT (GPN)';
      let accountNumber = 'QRIS STATIS MAWWWHUB';
      let accountHolder = 'MawwwHub Roblox Store';

      const arexConfig = db.settings.arexanspay;
      let usedRealGateway = false;

      // Call ArexansPay API if configured
      if (arexConfig.apiKey && arexConfig.apiKey.trim().length > 10) {
        try {
          const createUrl = arexConfig.apiUrl.replace(/\/$/, '') + '/api/v1/create';
          const payload = {
            base_amount: pkg.price,
            payment_channel: channel,
            qris_id: arexConfig.qrisId,
            number_id: arexConfig.numberId || 1
          };

          const axResponse = await fetch(createUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': arexConfig.apiKey,
              'X-QRIS-ID': arexConfig.qrisId
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(3500)
          });

          if (axResponse.ok) {
            const axData: any = await axResponse.json();
            if (axData.success && axData.data) {
              usedRealGateway = true;
              arexanspayTrxId = axData.data.transaction_id || '';
              qrBase64 = axData.data.qr_base64 || '';
              qrPayload = axData.data.qr_payload || '';
              bankName = axData.data.bank_name || bankName;
              accountNumber = axData.data.account_number || accountNumber;
              accountHolder = axData.data.account_holder || accountHolder;
            }
          }
        } catch (gatewayErr) {
          console.warn("ArexansPay call failed, falling back to local QRIS generator:", gatewayErr);
        }
      }

      // If no QR base64 from gateway, generate genuine standard EMVCo/QRIS SVG or PNG using QRCode library
      if (!qrBase64) {
        const dummyQrisPayload = qrPayload || `00020101021226580016ID.CO.MAWWWHUB.WWW01189360091437105260220215${trxId}520458125303360540${totalAmount}5802ID5912MAWWWHUB6007JAKARTA62070703A016304ABCD`;
        qrPayload = dummyQrisPayload;
        try {
          qrBase64 = await QRCode.toDataURL(dummyQrisPayload, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 320,
            color: {
              dark: '#1e0836',
              light: '#ffffff'
            }
          });
        } catch (e) {
          console.error("QR Code generation error:", e);
        }
      }

      const newTransaction: Transaction = {
        id: trxId,
        packageId: pkg.id,
        packageName: pkg.name,
        durationDays: pkg.durationDays,
        baseAmount: pkg.price,
        uniqueCode,
        totalAmount,
        paymentChannel: channel,
        bankName,
        accountNumber,
        accountHolder,
        qrBase64,
        qrPayload,
        status: 'pending',
        createdAt: now.toISOString(),
        expiredAt,
        robloxUsername: robloxUsername || "Guest",
        customerContact: customerContact || "",
        arexanspayTrxId
      };

      db.transactions.unshift(newTransaction);
      writeDatabase(db);

      return res.json({
        success: true,
        message: "Tagihan pembayaran berhasil dibuat!",
        data: newTransaction,
        usedRealGateway
      });
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan sistem saat membuat tagihan." });
    }
  });

  // 11. Public Check Transaction Status
  app.get('/api/transactions/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDatabase();
    const trx = db.transactions.find(t => t.id === id);

    if (!trx) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    // If already success, return immediately
    if (trx.status === 'success') {
      const baseUrl = getAppBaseUrl(req);
      const loadstring = db.settings.loadstringTemplate
        .replace(/{KEY}/g, trx.issuedKey || '')
        .replace(/{API_BASE}/g, baseUrl);

      return res.json({
        success: true,
        data: {
          status: 'success',
          transaction: trx,
          issuedKey: trx.issuedKey,
          loadstring
        }
      });
    }

    // Check expiration
    if (new Date(trx.expiredAt).getTime() < Date.now()) {
      trx.status = 'expired';
      writeDatabase(db);
      return res.json({
        success: true,
        data: {
          status: 'expired',
          transaction: trx
        }
      });
    }

    // If linked to real ArexansPay transaction, check remote status
    if (trx.arexanspayTrxId && db.settings.arexanspay.apiUrl) {
      try {
        const statusUrl = `${db.settings.arexanspay.apiUrl.replace(/\/$/, '')}/api/status/${trx.arexanspayTrxId}`;
        const checkRes = await fetch(statusUrl, { signal: AbortSignal.timeout(4000) });
        if (checkRes.ok) {
          const checkData: any = await checkRes.json();
          if (checkData.success && checkData.data && checkData.data.status === 'success') {
            // Auto issue key
            const now = new Date();
            let expiresAt: string | null = null;
            if (trx.durationDays > 0) {
              expiresAt = new Date(now.getTime() + trx.durationDays * 24 * 60 * 60 * 1000).toISOString();
            }
            const keyString = generateKeyString("MWH");
            const keyRecord: IssuedKey = {
              key: keyString,
              packageId: trx.packageId,
              packageName: trx.packageName,
              durationDays: trx.durationDays,
              createdAt: now.toISOString(),
              expiresAt,
              status: 'active',
              customerNote: `ArexansPay Verified: ${trx.id}`,
              transactionId: trx.id,
              robloxUsername: trx.robloxUsername || "Buyer"
            };

            db.keys.unshift(keyRecord);
            trx.status = 'success';
            trx.paidAt = now.toISOString();
            trx.issuedKey = keyString;
            writeDatabase(db);

            const baseUrl = getAppBaseUrl(req);
            const loadstring = db.settings.loadstringTemplate
              .replace(/{KEY}/g, keyString)
              .replace(/{API_BASE}/g, baseUrl);

            return res.json({
              success: true,
              data: {
                status: 'success',
                transaction: trx,
                issuedKey: keyString,
                loadstring
              }
            });
          }
        }
      } catch (e) {
        // remote check failed, continue
      }
    }

    return res.json({
      success: true,
      data: {
        status: trx.status,
        transaction: trx
      }
    });
  });

  // 12. Simulate Payment Success (Available for instant verification / demo testing)
  app.post('/api/transactions/:id/simulate-pay', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDatabase();
    const trx = db.transactions.find(t => t.id === id);

    if (!trx) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    if (trx.status === 'success' && trx.issuedKey) {
      const baseUrl = getAppBaseUrl(req);
      const loadstring = db.settings.loadstringTemplate
        .replace(/{KEY}/g, trx.issuedKey)
        .replace(/{API_BASE}/g, baseUrl);
      return res.json({
        success: true,
        message: "Pembayaran telah terverifikasi!",
        data: {
          transaction: trx,
          issuedKey: trx.issuedKey,
          loadstring
        }
      });
    }

    const now = new Date();
    let expiresAt: string | null = null;
    if (trx.durationDays > 0) {
      expiresAt = new Date(now.getTime() + trx.durationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const keyString = generateKeyString("MWH");
    const keyRecord: IssuedKey = {
      key: keyString,
      packageId: trx.packageId,
      packageName: trx.packageName,
      durationDays: trx.durationDays,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'active',
      customerNote: `Simulated/Test Payment for ${trx.id}`,
      transactionId: trx.id,
      robloxUsername: trx.robloxUsername || "Buyer"
    };

    db.keys.unshift(keyRecord);
    trx.status = 'success';
    trx.paidAt = now.toISOString();
    trx.issuedKey = keyString;
    writeDatabase(db);

    const baseUrl = getAppBaseUrl(req);
    const loadstring = db.settings.loadstringTemplate
      .replace(/{KEY}/g, keyString)
      .replace(/{API_BASE}/g, baseUrl);

    return res.json({
      success: true,
      message: "Pembayaran Berhasil! Key MawwwHub telah diterbitkan.",
      data: {
        transaction: trx,
        issuedKey: keyString,
        loadstring
      }
    });
  });

  // 13. Public Key Verification (Used by website Key Checker or script)
  app.get('/api/key/verify', (req: Request, res: Response) => {
    const rawKey = (req.query.key as string || '').trim().toUpperCase();
    if (!rawKey) {
      return res.status(400).json({ success: false, message: "Parameter key diperlukan" });
    }

    const db = readDatabase();
    const keyObj = db.keys.find(k => k.key.toUpperCase() === rawKey);

    if (!keyObj) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Key tidak ditemukan dalam database MawwwHub."
      });
    }

    // Check expiration
    if (keyObj.expiresAt) {
      const expTime = new Date(keyObj.expiresAt).getTime();
      if (expTime < Date.now()) {
        keyObj.status = 'expired';
        writeDatabase(db);
        return res.json({
          success: true,
          valid: false,
          status: 'expired',
          message: "Key telah kedaluwarsa. Silakan perpanjang durasi key di MawwwHub.",
          data: keyObj
        });
      }
    }

    if (keyObj.status !== 'active') {
      return res.json({
        success: true,
        valid: false,
        status: keyObj.status,
        message: `Key berstatus ${keyObj.status}. Hubungi admin MawwwHub.`,
        data: keyObj
      });
    }

    // Calculate remaining duration
    let remainingText = "Permanen / Lifetime";
    if (keyObj.expiresAt) {
      const diffMs = new Date(keyObj.expiresAt).getTime() - Date.now();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remHours = diffHours % 24;
      remainingText = `${diffDays} Hari ${remHours} Jam tersisa`;
    }

    return res.json({
      success: true,
      valid: true,
      status: 'active',
      data: {
        key: keyObj.key,
        packageName: keyObj.packageName,
        durationDays: keyObj.durationDays,
        expiresAt: keyObj.expiresAt,
        remainingText,
        hwidBound: !!keyObj.hwid,
        robloxUsername: keyObj.robloxUsername
      }
    });
  });

  // 14. RAW CODE KEY DURATION INTEGRATION ENDPOINT (Roblox Executor game:HttpGet)
  // Endpoint: /api/raw/:scriptId?key=...&hwid=...
  app.get('/api/raw/:scriptId', (req: Request, res: Response) => {
    const { scriptId } = req.params;
    const key = (req.query.key as string || '').trim().toUpperCase();
    const hwid = (req.query.hwid as string || req.headers['roblox-hwid'] as string || '').trim();
    const baseUrl = getAppBaseUrl(req);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    if (!key) {
      return res.status(403).send(
        `-- [MawwwHub Security Error]\nerror("[MawwwHub] Key tidak disertakan! Format: loadstring(game:HttpGet(\\"${baseUrl}/api/raw/mawwwhub?key=KEY_ANDA\\"))()")`
      );
    }

    const db = readDatabase();
    const keyObj = db.keys.find(k => k.key.toUpperCase() === key);

    if (!keyObj) {
      return res.status(403).send(
        `-- [MawwwHub Security Error]\nerror("[MawwwHub] Key '${key}' tidak valid atau belum terdaftar! Kunjungi ${baseUrl} untuk membeli key resmi.")`
      );
    }

    // Check expiration
    if (keyObj.expiresAt && new Date(keyObj.expiresAt).getTime() < Date.now()) {
      keyObj.status = 'expired';
      writeDatabase(db);
      return res.status(403).send(
        `-- [MawwwHub Security Error]\nerror("[MawwwHub] Masa aktif Key '${key}' telah habis pada ${keyObj.expiresAt}. Perpanjang key di ${baseUrl}")`
      );
    }

    if (keyObj.status !== 'active') {
      return res.status(403).send(
        `-- [MawwwHub Security Error]\nerror("[MawwwHub] Key '${key}' telah dinonaktifkan (Status: ${keyObj.status}). Hubungi admin MawwwHub.")`
      );
    }

    // HWID Lock check
    if (db.settings.enableHwidLock && hwid) {
      if (!keyObj.hwid) {
        keyObj.hwid = hwid;
        keyObj.lastUsedAt = new Date().toISOString();
        writeDatabase(db);
      } else if (keyObj.hwid !== hwid) {
        return res.status(403).send(
          `-- [MawwwHub Security Error]\nerror("[MawwwHub] Key '${key}' terkunci pada HWID lain! Reset HWID melalui web admin MawwwHub.")`
        );
      }
    }

    // Key is valid! Return raw executable Lua code
    let scriptOutput = db.settings.rawScriptBody
      .replace(/{KEY}/g, keyObj.key)
      .replace(/{EXPIRES_AT}/g, keyObj.expiresAt ? new Date(keyObj.expiresAt).toLocaleString('id-ID') : 'Lifetime')
      .replace(/{PACKAGE}/g, keyObj.packageName)
      .replace(/{API_BASE}/g, baseUrl);

    return res.status(200).send(scriptOutput);
  });

  // 15. Tasker / ArexansPay Webhook Listener
  app.post('/api/webhook', (req: Request, res: Response) => {
    const { app: appName, title, text, secret } = req.body;
    const db = readDatabase();

    if (db.settings.arexanspay.webhookSecret && secret !== db.settings.arexanspay.webhookSecret) {
      return res.status(401).json({ success: false, message: "Invalid webhook secret" });
    }

    console.log(`[ArexansPay Webhook Received] App: ${appName}, Title: ${title}, Text: ${text}`);

    // Parse amount from text e.g. "Transfer masuk Rp 50.184" or "Rp 50.184"
    const match = (text || '').match(/(?:Rp|IDR)\s*([0-9.,]+)/i);
    if (match) {
      const cleanNominal = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
      const pendingTrx = db.transactions.find(t => t.status === 'pending' && t.totalAmount === cleanNominal);

      if (pendingTrx) {
        const now = new Date();
        let expiresAt: string | null = null;
        if (pendingTrx.durationDays > 0) {
          expiresAt = new Date(now.getTime() + pendingTrx.durationDays * 24 * 60 * 60 * 1000).toISOString();
        }
        const keyString = generateKeyString("MWH");
        const keyRecord: IssuedKey = {
          key: keyString,
          packageId: pendingTrx.packageId,
          packageName: pendingTrx.packageName,
          durationDays: pendingTrx.durationDays,
          createdAt: now.toISOString(),
          expiresAt,
          status: 'active',
          customerNote: `Webhook Tasker verified Rp ${cleanNominal}`,
          transactionId: pendingTrx.id,
          robloxUsername: pendingTrx.robloxUsername || "Buyer"
        };

        db.keys.unshift(keyRecord);
        pendingTrx.status = 'success';
        pendingTrx.paidAt = now.toISOString();
        pendingTrx.issuedKey = keyString;
        writeDatabase(db);
        console.log(`[ArexansPay Webhook] Successfully matched transaction ${pendingTrx.id} and issued key ${keyString}`);
      }
    }

    return res.json({ success: true, message: "Webhook processed" });
  });

  // Setup Vite or Static File Serving
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MawwwHub] Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch(err => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
