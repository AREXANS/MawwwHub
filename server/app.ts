import express, { Request, Response } from 'express';
import QRCode from 'qrcode';
import {
  readDatabase,
  writeDatabase,
  resetAllDatabaseData,
  generateKeyString,
  Transaction,
  IssuedKey,
  AppSettings,
  PaymentMethodConfig,
  DUMMY_ACCOUNT_NUMBERS,
  DUMMY_API_KEY,
  DUMMY_QRIS_ID
} from './db';

const ADMIN_USER = "mawwwhub";
const ADMIN_PASS = "mawwwhub201122@";
const ADMIN_FIXED_TOKEN = "mawwwhub_auth_permanent_key_201122";

export function isArexansPayConfigured(arexanspay?: AppSettings['arexanspay']): boolean {
  if (!arexanspay) return false;
  const apiUrl = (arexanspay.apiUrl || '').trim();
  const apiKey = (arexanspay.apiKey || '').trim();
  if (!apiUrl || !apiKey) return false;
  if (apiKey === DUMMY_API_KEY) return false;
  return true;
}

export function getPublicPaymentMethods(settings: AppSettings): PaymentMethodConfig[] {
  const simulationEnabled = settings.arexanspay?.enableSimulation ?? false;
  const gatewayReady = isArexansPayConfigured(settings.arexanspay);
  const qrisIdReady = Boolean(
    settings.arexanspay?.qrisId &&
    settings.arexanspay.qrisId.trim().length > 0 &&
    settings.arexanspay.qrisId.trim() !== DUMMY_QRIS_ID
  );

  // Jika simulasi dinonaktifkan dan dev belum mengisi integrasi payment gateway ArexansPay di /dev,
  // metode pembayaran (QRIS / E-Wallet / Bank) tidak boleh muncul sama sekali
  if (!simulationEnabled && !gatewayReady) {
    return [];
  }

  return (settings.paymentMethods || []).filter(m => {
    if (!m.isActive) return false;

    if (simulationEnabled) {
      return true;
    }

    // Saat simulasi dinonaktifkan, hanya tampilkan metode yang benar-benar sudah dikonfigurasi di /dev
    if (m.category === 'qris') {
      return gatewayReady && qrisIdReady;
    }

    const cleanAcc = (m.accountNumber || '').trim();
    const hasValidAccount = cleanAcc.length > 0;
    return gatewayReady && hasValidAccount;
  });
}

export function getAppBaseUrl(req: Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string'
    ? forwardedProto.split(',')[0].trim()
    : (req.protocol === 'https' ? 'https' : 'http');

  const forwardedHost = req.headers['x-forwarded-host'];
  const host = typeof forwardedHost === 'string'
    ? forwardedHost.split(',')[0].trim()
    : (req.get('host') || 'localhost:3000');

  return `${proto}://${host}`.replace(/\/$/, '');
}

export function createExpressApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

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

  // --- API HANDLERS ---
  const api = express.Router();

  // 1. Admin Login
  api.post('/admin/login', (req: Request, res: Response) => {
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
  api.get('/admin/verify-session', (req: Request, res: Response) => {
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
  api.get('/settings', (req: Request, res: Response) => {
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
        statusBadgeText: s.statusBadgeText,
        statusBadgeType: s.statusBadgeType,
        statusSubtext: s.statusSubtext,
        heroPills: s.heroPills,
        adBanner: s.adBanner,
        quickToolsTitle: s.quickToolsTitle,
        quickToolsDesc: s.quickToolsDesc,
        quickToolsBtn1Text: s.quickToolsBtn1Text,
        quickToolsBtn2Text: s.quickToolsBtn2Text,
        footerText: s.footerText,
        gameName: s.gameName,
        scriptDescription: s.scriptDescription,
        scriptFeatures: s.scriptFeatures,
        discordUrl: s.discordUrl,
        telegramUrl: s.telegramUrl,
        whatsappContact: s.whatsappContact,
        announcementText: s.announcementText,
        enableOrderUsername: s.enableOrderUsername ?? false,
        enableOrderWhatsapp: s.enableOrderWhatsapp ?? false,
        enableCustomKeyOrder: s.enableCustomKeyOrder ?? true,
        packages: s.packages.filter(p => p.isActive),
        paymentMethods: getPublicPaymentMethods(s),
        defaultChannel: s.arexanspay.defaultChannel || 'qris',
        simulationEnabled: s.arexanspay.enableSimulation ?? false,
        gatewayConfigured: isArexansPayConfigured(s.arexanspay),
        apiBase: baseUrl
      }
    });
  });

  // 4. Admin Get Full Settings
  api.get('/admin/settings', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    return res.json({
      success: true,
      data: db.settings
    });
  });

  // 5. Admin Update Settings
  api.post('/admin/settings', requireAdmin, (req: Request, res: Response) => {
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
  api.post('/admin/upload-logo', requireAdmin, (req: Request, res: Response) => {
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

  // 5c. Admin Reset / Hapus Data Bekas Orderan
  api.post('/admin/reset-data', requireAdmin, (_req: Request, res: Response) => {
    const cleanDb = resetAllDatabaseData();
    return res.json({
      success: true,
      message: "Semua data bekas orderan (Riwayat Transaksi & Key Orderan) berhasil dihapus! Data pengaturan di /dev tetap aman.",
      data: cleanDb.settings
    });
  });

  // 6. Admin Stats
  api.get('/admin/stats', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    const now = new Date().getTime();
    
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
  api.get('/admin/keys', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    return res.json({
      success: true,
      data: db.keys
    });
  });

  api.delete('/admin/keys', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    db.keys = [];
    writeDatabase(db);
    return res.json({
      success: true,
      message: "Semua data key berhasil dihapus!"
    });
  });

  api.post('/admin/keys/generate', requireAdmin, (req: Request, res: Response) => {
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

  api.post('/admin/keys/:key/reset-hwid', requireAdmin, (req: Request, res: Response) => {
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

  api.delete('/admin/keys/:key', requireAdmin, (req: Request, res: Response) => {
    const { key } = req.params;
    const db = readDatabase();
    const index = db.keys.findIndex(k => k.key.toUpperCase() === key.toUpperCase());
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Key tidak ditemukan" });
    }
    db.keys.splice(index, 1);
    writeDatabase(db);
    return res.json({ success: true, message: `Key ${key} berhasil dihapus.` });
  });

  // 8. Admin Transaction Management
  api.get('/admin/transactions', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    return res.json({
      success: true,
      data: db.transactions
    });
  });

  api.delete('/admin/transactions', requireAdmin, (_req: Request, res: Response) => {
    const db = readDatabase();
    db.transactions = [];
    writeDatabase(db);
    return res.json({
      success: true,
      message: "Semua riwayat transaksi berhasil dihapus!"
    });
  });

  api.post('/admin/transactions/:id/manual-approve', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDatabase();
    const trx = db.transactions.find(t => t.id === id);
    if (!trx) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    if (trx.status === 'success' && trx.issuedKey) {
      return res.json({ success: true, message: "Transaksi sudah berhasil sebelumnya", transaction: trx });
    }

    const now = new Date();
    let expiresAt: string | null = null;
    if (trx.durationDays > 0) {
      expiresAt = new Date(now.getTime() + trx.durationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const isCustomUnique = trx.requestedCustomKey && !db.keys.some(k => k.key.toUpperCase() === trx.requestedCustomKey!.toUpperCase());
    const issuedKey = isCustomUnique ? trx.requestedCustomKey! : generateKeyString("MWH");
    const keyRecord: IssuedKey = {
      key: issuedKey,
      packageId: trx.packageId,
      packageName: trx.packageName,
      durationDays: trx.durationDays,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'active',
      hwid: null,
      customerNote: trx.requestedCustomKey ? `Custom Key Approved: ${trx.id}` : `Auto Issued from TRX: ${trx.id}`,
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
  api.post('/arexanspay/test', requireAdmin, async (req: Request, res: Response) => {
    const { apiUrl, apiKey } = req.body;
    const targetUrl = (apiUrl || "https://arexanspay.my.id").replace(/\/$/, '') + '/api/payments';
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey || '',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
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

  // 10. Public Create Transaction
  api.post('/transactions/create', async (req: Request, res: Response) => {
    try {
      const { packageId, robloxUsername, customerContact, paymentChannel, customKey } = req.body;
      const db = readDatabase();
      const pkg = db.settings.packages.find(p => p.id === packageId && p.isActive);

      if (!pkg) {
        return res.status(404).json({ success: false, message: "Paket script tidak ditemukan atau sedang nonaktif." });
      }

      const arexConfig = db.settings.arexanspay;
      const simulationEnabled = arexConfig?.enableSimulation ?? false;
      const gatewayConfigured = isArexansPayConfigured(arexConfig);

      // Wajib tolak jika simulasi dinonaktifkan dan dev belum mengisi integrasi ArexansPay di /dev
      if (!simulationEnabled && !gatewayConfigured) {
        return res.status(400).json({
          success: false,
          message: "Metode pembayaran belum tersedia. Developer belum mengonfigurasi integrasi Payment Gateway ArexansPay (arexanspay.my.id) di /dev."
        });
      }

      const availableMethods = getPublicPaymentMethods(db.settings);
      if (availableMethods.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada metode pembayaran yang aktif. Silakan konfigurasi integrasi ArexansPay & nomor rekening/e-wallet di /dev."
        });
      }

      const channel = paymentChannel || 'qris';
      const selectedMethod = availableMethods.find(m => m.id === channel || m.code === channel);

      if (!selectedMethod) {
        return res.status(400).json({
          success: false,
          message: "Metode pembayaran yang dipilih tidak aktif atau belum dikonfigurasi di /dev."
        });
      }

      let cleanCustomKey: string | undefined = undefined;
      if (customKey && typeof customKey === 'string' && customKey.trim().length > 0) {
        cleanCustomKey = customKey.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (cleanCustomKey.length < 3 || cleanCustomKey.length > 32) {
          return res.status(400).json({ success: false, message: "Custom key harus terdiri dari 3 hingga 32 karakter (alfanumerik, tanda minus, underscore)." });
        }
        if (db.keys.some(k => k.key.toUpperCase() === cleanCustomKey)) {
          return res.status(400).json({ success: false, message: `Custom key '${cleanCustomKey}' sudah digunakan oleh orang lain. Silakan pilih custom key lain yang unik.` });
        }
      }

      const uniqueCode = Math.floor(Math.random() * 250) + 1;
      const totalAmount = pkg.price + uniqueCode;
      const trxId = `TRX-MWH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const expiredAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

      let qrBase64 = '';
      let qrPayload = '';
      let arexanspayTrxId = '';
      let bankName = selectedMethod.name;
      let accountNumber = (selectedMethod.accountNumber || '').trim();
      let accountHolder = (selectedMethod.accountHolder || '').trim() || db.settings.brandName || 'MawwwHub Store';
      let usedRealGateway = false;

      if (gatewayConfigured) {
        try {
          const createUrl = arexConfig.apiUrl.replace(/\/$/, '') + '/api/v1/create';
          const payload = {
            base_amount: pkg.price,
            payment_channel: selectedMethod.code || channel,
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
            signal: AbortSignal.timeout(5000)
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
          console.warn("ArexansPay call failed:", gatewayErr);
        }
      }

      if (!simulationEnabled) {
        // MODE LIVE (Simulasi Dinonaktifkan):
        // Dilarang keras menampilkan QRIS palsu atau nomor e-wallet/bank palsu!
        if (selectedMethod.category === 'qris') {
          if (qrPayload && !qrBase64) {
            try {
              qrBase64 = await QRCode.toDataURL(qrPayload, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 320,
                color: { dark: '#1e0836', light: '#ffffff' }
              });
            } catch (e) {}
          }
          if (!qrBase64) {
            return res.status(400).json({
              success: false,
              message: "Gagal menerbitkan QRIS dari Payment Gateway ArexansPay (arexanspay.my.id). Pastikan API Key & QRIS ID di /dev sudah valid dan server ArexansPay aktif."
            });
          }
        } else {
          // E-Wallet atau Bank Transfer pada Mode Live: wajib memiliki nomor tujuan
          if (!accountNumber) {
            return res.status(400).json({
              success: false,
              message: "Nomor rekening / e-wallet untuk metode ini belum diisi oleh developer di /dev."
            });
          }
        }
      } else {
        // MODE SIMULASI (Uji Coba Aktif):
        if (selectedMethod.category === 'qris' && !qrBase64) {
          const simPayload = qrPayload || `SIMULASI-QRIS-MAWWWHUB-${trxId}-${totalAmount}`;
          qrPayload = simPayload;
          try {
            qrBase64 = await QRCode.toDataURL(simPayload, {
              errorCorrectionLevel: 'H',
              margin: 2,
              width: 320,
              color: { dark: '#1e0836', light: '#ffffff' }
            });
          } catch (e) {}
        } else if (selectedMethod.category !== 'qris' && !accountNumber) {
          accountNumber = 'SIMULASI-TEST-ONLY';
          accountHolder = 'Mode Simulasi (Jangan Transfer)';
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
        requestedCustomKey: cleanCustomKey,
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
  api.get('/transactions/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDatabase();
    const trx = db.transactions.find(t => t.id === id);

    if (!trx) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    const baseUrl = getAppBaseUrl(req);

    if (trx.status === 'success') {
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

    if (trx.arexanspayTrxId && db.settings.arexanspay.apiUrl) {
      try {
        const statusUrl = `${db.settings.arexanspay.apiUrl.replace(/\/$/, '')}/api/status/${trx.arexanspayTrxId}`;
        const checkRes = await fetch(statusUrl, { signal: AbortSignal.timeout(3500) });
        if (checkRes.ok) {
          const checkData: any = await checkRes.json();
          if (checkData.success && checkData.data && checkData.data.status === 'success') {
            const now = new Date();
            let expiresAt: string | null = null;
            if (trx.durationDays > 0) {
              expiresAt = new Date(now.getTime() + trx.durationDays * 24 * 60 * 60 * 1000).toISOString();
            }
            const isCustomUnique = trx.requestedCustomKey && !db.keys.some(k => k.key.toUpperCase() === trx.requestedCustomKey!.toUpperCase());
            const keyString = isCustomUnique ? trx.requestedCustomKey! : generateKeyString("MWH");
            const keyRecord: IssuedKey = {
              key: keyString,
              packageId: trx.packageId,
              packageName: trx.packageName,
              durationDays: trx.durationDays,
              createdAt: now.toISOString(),
              expiresAt,
              status: 'active',
              hwid: null,
              customerNote: trx.requestedCustomKey ? `ArexansPay Custom Key: ${trx.id}` : `ArexansPay Verified: ${trx.id}`,
              transactionId: trx.id,
              robloxUsername: trx.robloxUsername || "Buyer"
            };

            db.keys.unshift(keyRecord);
            trx.status = 'success';
            trx.paidAt = now.toISOString();
            trx.issuedKey = keyString;
            writeDatabase(db);

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
      } catch (e) {}
    }

    return res.json({
      success: true,
      data: {
        status: trx.status,
        transaction: trx
      }
    });
  });

  // 12. Simulate Payment Success
  api.post('/transactions/:id/simulate-pay', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDatabase();

    if (!(db.settings.arexanspay?.enableSimulation ?? false)) {
      return res.status(403).json({
        success: false,
        message: "Mode Simulasi sedang dinonaktifkan oleh developer di /dev."
      });
    }

    const trx = db.transactions.find(t => t.id === id);

    if (!trx) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    const baseUrl = getAppBaseUrl(req);

    if (trx.status === 'success' && trx.issuedKey) {
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

    const isCustomUnique = trx.requestedCustomKey && !db.keys.some(k => k.key.toUpperCase() === trx.requestedCustomKey!.toUpperCase());
    const keyString = isCustomUnique ? trx.requestedCustomKey! : generateKeyString("MWH");
    const keyRecord: IssuedKey = {
      key: keyString,
      packageId: trx.packageId,
      packageName: trx.packageName,
      durationDays: trx.durationDays,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'active',
      hwid: null,
      customerNote: trx.requestedCustomKey ? `Simulated Custom Key: ${trx.id}` : `Simulated/Test Payment for ${trx.id}`,
      transactionId: trx.id,
      robloxUsername: trx.robloxUsername || "Buyer"
    };

    db.keys.unshift(keyRecord);
    trx.status = 'success';
    trx.paidAt = now.toISOString();
    trx.issuedKey = keyString;
    writeDatabase(db);

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

  // 13. Public Key Verification
  api.get('/key/verify', (req: Request, res: Response) => {
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

  // 13b. Device HWID & Roblox Username Realtime Sync Endpoint
  api.get('/key/sync-device', (req: Request, res: Response) => {
    const key = (req.query.key as string || '').trim().toUpperCase();
    const player = (req.query.player as string || req.headers['roblox-username'] as string || '').trim();
    const hwid = (req.query.hwid as string || req.headers['roblox-hwid'] as string || '').trim();

    if (!key) {
      return res.status(400).json({ success: false, message: "Parameter key diperlukan" });
    }

    const db = readDatabase();
    const keyObj = db.keys.find(k => k.key.toUpperCase() === key);
    if (!keyObj) {
      return res.status(404).json({ success: false, message: "Key tidak ditemukan" });
    }

    if (keyObj.expiresAt && new Date(keyObj.expiresAt).getTime() < Date.now()) {
      keyObj.status = 'expired';
      writeDatabase(db);
      return res.status(403).json({ success: false, error: "expired", message: "Key telah kedaluwarsa." });
    }

    // HWID Lock: Only 1 device allowed
    if (db.settings.enableHwidLock && hwid) {
      if (keyObj.hwid && keyObj.hwid !== hwid) {
        return res.status(403).json({
          success: false,
          error: "hwid_mismatch",
          message: `Key '${key}' terkunci pada HWID lain! Hanya 1 perangkat yang diizinkan terhubung. Silakan hubungi admin di ${getAppBaseUrl(req)} untuk reset HWID.`
        });
      }
      if (!keyObj.hwid) {
        keyObj.hwid = hwid;
      }
    }

    // Auto-detect & record Roblox Username into key and linked transaction
    if (player && player !== "Guest" && player !== "User" && player.length > 0) {
      keyObj.robloxUsername = player;
      if (keyObj.transactionId) {
        const trx = db.transactions.find(t => t.id === keyObj.transactionId);
        if (trx) trx.robloxUsername = player;
      }
    }

    keyObj.lastUsedAt = new Date().toISOString();
    writeDatabase(db);

    return res.json({
      success: true,
      hwid: keyObj.hwid,
      robloxUsername: keyObj.robloxUsername
    });
  });

  // 14. RAW CODE KEY DURATION INTEGRATION ENDPOINT
  // When clicked in a web browser directly -> Returns 404 Error Page!
  // When executed inside Roblox executor (game:HttpGet) -> Executes and returns Lua script!
  api.get('/raw/:scriptId', (req: Request, res: Response) => {
    const { scriptId } = req.params;
    const key = (req.query.key as string || '').trim().toUpperCase();
    const hwid = (req.query.hwid as string || req.headers['roblox-hwid'] as string || '').trim();
    const playerParam = (req.query.player as string || req.headers['roblox-username'] as string || '').trim();
    const baseUrl = getAppBaseUrl(req);

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const acceptHeader = (req.headers['accept'] || '').toLowerCase();
    const secFetchDest = req.headers['sec-fetch-dest'];
    const isExplicitExecutor = req.query.executor === '1' || req.headers['x-requested-by'] === 'MawwwHubExecutor';

    // Check if this is a standard web browser clicking the link
    // Standard web browsers request text/html or sec-fetch-dest: document
    const isBrowserNavigation = (
      secFetchDest === 'document' ||
      acceptHeader.includes('text/html') ||
      (userAgent.includes('mozilla') && !userAgent.includes('roblox') && !userAgent.includes('synapse') && !userAgent.includes('delta') && !userAgent.includes('codex') && !userAgent.includes('fluxus') && !userAgent.includes('solara') && !userAgent.includes('wave') && !userAgent.includes('hydrogen') && !userAgent.includes('curl'))
    );

    // If user clicked the link directly in a browser without executor header/flag -> return 404 page!
    if (isBrowserNavigation && !isExplicitExecutor) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <style>
    body {
      background-color: #04010a;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      max-width: 480px;
      padding: 36px 28px;
      border-radius: 20px;
      background: #0d061c;
      border: 1px solid rgba(147, 51, 234, 0.25);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(126, 34, 206, 0.15);
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 900;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #c084fc, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #e9d5ff;
      background: rgba(147, 51, 234, 0.2);
      border: 1px solid rgba(168, 85, 247, 0.35);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    p {
      color: #94a3b8;
      font-size: 0.92rem;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .code-box {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 0.78rem;
      color: #cbd5e1;
      background: #06020d;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(139, 92, 246, 0.2);
      word-break: break-all;
    }
    .footer-note {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 18px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">404 NOT_FOUND</div>
    <h1>404</h1>
    <p>Halaman tidak ditemukan. Tautan loadstring ini hanya dapat dieksekusi secara terproteksi melalui Roblox Executor (<code>game:HttpGet</code>) dan tidak dapat dibuka langsung di peramban web.</p>
    <div class="code-box">ERROR_404_EXECUTION_ONLY_ENDPOINT</div>
    <div class="footer-note">MawwwHub Security Shield & Anti-Tamper System</div>
  </div>
</body>
</html>`);
    }

    // EXECUTOR CALL (Roblox / game:HttpGet / testing)
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

    // Protected Loader Mode:
    // When executed via the clean public loadstring (_G.MawwwHubKey = "KEY"; loadstring(game:HttpGet(...))()),
    // no raw HWID is exposed in public. The server returns this internal loader that computes HWID in memory
    // and fetches the secured payload seamlessly.
    if (!hwid && req.query.sec !== '1') {
      const loaderCode = `-- [[ MawwwHub Protected Roblox Script Loader ]] --
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local LocalPlayer = Players.LocalPlayer

local function getExecutorHwid()
    local id = ""
    pcall(function()
        if gethwid then
            id = gethwid()
        elseif getgenv and getgenv().gethwid then
            id = getgenv().gethwid()
        elseif identifyexecutor then
            local exec = identifyexecutor()
            local cid = ""
            pcall(function() cid = game:GetService("RbxAnalyticsService"):GetClientId() end)
            id = exec .. "_" .. (cid ~= "" and cid or tostring(LocalPlayer.UserId))
        else
            pcall(function() id = game:GetService("RbxAnalyticsService"):GetClientId() end)
            if not id or id == "" then
                id = "RBX_" .. tostring(LocalPlayer.UserId)
            end
        end
    end)
    return (id and id ~= "") and id or ("RBX_ID_" .. tostring(LocalPlayer.UserId))
end

local h = getExecutorHwid()
local pName = (LocalPlayer and LocalPlayer.Name) or "User"
local secUrl = "${baseUrl}/api/raw/mawwwhub?key=${encodeURIComponent(keyObj.key)}&hwid=" .. HttpService:UrlEncode(h) .. "&player=" .. HttpService:UrlEncode(pName) .. "&sec=1"
local ok, payload = pcall(function() return game:HttpGet(secUrl) end)
if ok and payload and not string.find(payload, "MawwwHub Security Error") then
    loadstring(payload)()
elseif payload then
    loadstring(payload)()
else
    warn("[MawwwHub] Gagal mengunduh modul proteksi script.")
end`;
      return res.status(200).send(loaderCode);
    }

    // HWID Enforcement: Strictly 1 device only
    if (db.settings.enableHwidLock && hwid) {
      if (keyObj.hwid && keyObj.hwid !== hwid) {
        return res.status(403).send(
          `-- [MawwwHub Security Error]\nerror("[MawwwHub] Key '${key}' terkunci pada HWID lain! Hanya 1 perangkat yang diizinkan terhubung. Silakan hubungi admin di ${baseUrl} untuk reset HWID.")`
        );
      }
      if (!keyObj.hwid) {
        keyObj.hwid = hwid;
      }
    }

    // Auto-detect & record Roblox Username upon script execution
    if (playerParam && playerParam !== "Guest" && playerParam !== "User" && playerParam.length > 0) {
      keyObj.robloxUsername = playerParam;
      if (keyObj.transactionId) {
        const trx = db.transactions.find(t => t.id === keyObj.transactionId);
        if (trx) trx.robloxUsername = playerParam;
      }
    }

    keyObj.lastUsedAt = new Date().toISOString();
    writeDatabase(db);

    const expTimestamp = keyObj.expiresAt ? Math.floor(new Date(keyObj.expiresAt).getTime() / 1000) : 0;
    let scriptOutput = db.settings.rawScriptBody
      .replace(/{KEY}/g, keyObj.key)
      .replace(/{EXPIRES_AT}/g, keyObj.expiresAt ? new Date(keyObj.expiresAt).toLocaleString('id-ID') : 'Lifetime')
      .replace(/{EXPIRES_AT_TIMESTAMP}/g, String(expTimestamp))
      .replace(/{BRAND_NAME}/g, db.settings.brandName || "MawwwHub")
      .replace(/{PACKAGE}/g, keyObj.packageName)
      .replace(/{API_BASE}/g, baseUrl);

    return res.status(200).send(scriptOutput);
  });

  // 15. Tasker / ArexansPay Webhook Listener
  api.post('/webhook', (req: Request, res: Response) => {
    const { app: appName, title, text, secret } = req.body;
    const db = readDatabase();

    if (db.settings.arexanspay.webhookSecret && secret !== db.settings.arexanspay.webhookSecret) {
      return res.status(401).json({ success: false, message: "Invalid webhook secret" });
    }

    console.log(`[ArexansPay Webhook Received] App: ${appName}, Title: ${title}, Text: ${text}`);

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
        const isCustomUnique = pendingTrx.requestedCustomKey && !db.keys.some(k => k.key.toUpperCase() === pendingTrx.requestedCustomKey!.toUpperCase());
        const keyString = isCustomUnique ? pendingTrx.requestedCustomKey! : generateKeyString("MWH");
        const keyRecord: IssuedKey = {
          key: keyString,
          packageId: pendingTrx.packageId,
          packageName: pendingTrx.packageName,
          durationDays: pendingTrx.durationDays,
          createdAt: now.toISOString(),
          expiresAt,
          status: 'active',
          hwid: null,
          customerNote: pendingTrx.requestedCustomKey ? `Webhook Custom Key Rp ${cleanNominal}` : `Webhook Tasker verified Rp ${cleanNominal}`,
          transactionId: pendingTrx.id,
          robloxUsername: pendingTrx.robloxUsername || "Buyer"
        };

        db.keys.unshift(keyRecord);
        pendingTrx.status = 'success';
        pendingTrx.paidAt = now.toISOString();
        pendingTrx.issuedKey = keyString;
        writeDatabase(db);
        console.log(`[ArexansPay Webhook] Matched transaction ${pendingTrx.id} and issued key ${keyString}`);
      }
    }

    return res.json({ success: true, message: "Webhook processed" });
  });

  // Mount API router to both '/api' and '/' for complete Vercel & Express compatibility
  app.use('/api', api);
  app.use(api);

  return app;
}

export const app = createExpressApp();
export default app;
