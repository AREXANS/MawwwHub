import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  Save,
  Plus,
  Trash2,
  Edit2,
  Key,
  CreditCard,
  FileCode,
  Layers,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowLeft,
  Sliders,
  DollarSign,
  TrendingUp,
  Cpu,
  Info,
  Upload,
  Image as ImageIcon,
  Tv,
  Video,
  Smartphone,
  Building2,
  QrCode,
  Megaphone,
  Radio,
  Play,
  Sparkles,
  HelpCircle,
  Layout,
  ListPlus
} from 'lucide-react';
import {
  FullAdminSettings,
  ScriptPackage,
  IssuedKey,
  Transaction,
  AdminStats,
  PaymentMethodConfig,
  AdBannerConfig,
  HeroPillConfig
} from '../types';

interface DevDashboardProps {
  onBackToHome: () => void;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'qris', name: 'QRIS All Payment (GPN)', code: 'qris', category: 'qris', instructions: 'Scan QRIS dengan GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, BRI, BNI atau aplikasi m-Banking manapun.', isActive: true, isDefault: true },
  { id: 'dana', name: 'DANA Instant', code: 'dana', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer ke nomor akun DANA di atas. Masukkan nominal tepat beserta kode unik agar otomatis terkonfirmasi.', isActive: true },
  { id: 'gopay', name: 'GoPay / Gojek', code: 'gopay', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer saldo GoPay ke nomor di atas. Pembayaran terverifikasi otomatis.', isActive: true },
  { id: 'ovo', name: 'OVO Cash', code: 'ovo', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Buka aplikasi OVO dan transfer ke nomor di atas sesuai total pembayaran.', isActive: true },
  { id: 'shopeepay', name: 'ShopeePay', code: 'shopeepay', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer ShopeePay ke nomor di atas dengan nominal yang tepat.', isActive: true },
  { id: 'linkaja', name: 'LinkAja', code: 'linkaja', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer via aplikasi LinkAja ke nomor tertera.', isActive: false },
  { id: 'bank_bca', name: 'Bank Central Asia (BCA)', code: 'bca', category: 'bank', accountNumber: '8735091823', accountHolder: 'MawwwHub Store', instructions: 'Transfer via m-BCA atau KlikBCA. Wajib transfer sesuai nominal hingga 3 digit kode unik.', isActive: true },
  { id: 'bank_bri', name: 'Bank Rakyat Indonesia (BRI)', code: 'bri', category: 'bank', accountNumber: '012901092839501', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BRImo atau ATM BRI dengan nominal pas termasuk kode unik.', isActive: true },
  { id: 'bank_mandiri', name: 'Bank Mandiri (Livin)', code: 'mandiri', category: 'bank', accountNumber: '1370019284950', accountHolder: 'MawwwHub Store', instructions: 'Transfer via Livin by Mandiri. Transfer tepat sesuai kode unik.', isActive: true },
  { id: 'bank_bni', name: 'Bank Negara Indonesia (BNI)', code: 'bni', category: 'bank', accountNumber: '0981726481', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BNI Mobile Banking dengan nominal tepat.', isActive: true },
  { id: 'bank_seabank', name: 'SeaBank (Transfer Gratis)', code: 'seabank', category: 'bank', accountNumber: '901928475829', accountHolder: 'MawwwHub Store', instructions: 'Bebas biaya admin transfer dari e-wallet/bank lain ke rekening SeaBank ini.', isActive: true },
  { id: 'bank_bsi', name: 'Bank Syariah Indonesia (BSI)', code: 'bsi', category: 'bank', accountNumber: '7192837495', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BSI Mobile. Transfer nominal tepat untuk aktivasi instan.', isActive: true },
  { id: 'bank_permata', name: 'Bank Permata', code: 'permata', category: 'bank', accountNumber: '49281729384', accountHolder: 'MawwwHub Store', instructions: 'Transfer via PermataMobile X atau ATM Permata.', isActive: false }
];

const DEFAULT_LUA_SCRIPT = `-- [[ MawwwHub Official Script Hub - Violence District VIP Edition ]] --
-- Place ID: 93978595733734 (Violence District)
local TARGET_PLACE_ID = 93978595733734
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local HttpService = game:GetService("HttpService")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")

local Key = "{KEY}"
local ApiBase = "{API_BASE}"
local BrandName = "{BRAND_NAME}"
local PackageName = "{PACKAGE}"
local ExpireTimestamp = {EXPIRES_AT_TIMESTAMP} -- Unix seconds (0 = Lifetime)

print("[MawwwHub] Violence District VIP script loaded successfully.")`;

const DEFAULT_ADMIN_SETTINGS: FullAdminSettings = {
  brandName: "MawwwHub",
  logoUrl: "",
  tagline: "The #1 Roblox Violence District Script Hub & Auto Delivery Store",
  heroHeadline: "MawwwHub VIP - Violence District Script",
  heroSubheadline: "Script resmi Roblox Violence District terlengkap: Auto Scavenge Scrap, ESP Monster & Loot, Combat Silent Aim, Infinite Stamina, dan 100% Undetected.",
  statusBadgeText: "Violence District Hub: Undetected & Online",
  statusBadgeType: "online",
  statusSubtext: "VIP Script Undetected",
  heroPills: [
    { id: 'pill-1', icon: 'zap', title: 'Instan Delivery', description: 'Key & loadstring langsung terbit hitungan detik setelah bayar.' },
    { id: 'pill-2', icon: 'shield', title: 'Bypass Anti-Cheat', description: 'Perlindungan keamanan tinggi aman dari ban Roblox.' },
    { id: 'pill-3', icon: 'check', title: 'Multi-Payment Otomatis', description: 'Mendukung QRIS, DANA, GoPay, OVO, BCA, BRI, Mandiri, SeaBank.' },
    { id: 'pill-4', icon: 'sparkles', title: 'Violence District VIP', description: 'Eksklusif untuk Roblox Violence District, support PC & Mobile.' }
  ],
  adBanner: {
    enabled: false,
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    title: '🔥 Promo Spesial MawwwHub VIP Script',
    badge: 'OFFICIAL UPDATE',
    description: 'Dapatkan akses eksklusif auto-farm dan fitur premium dengan diskon terbatas!',
    targetUrl: '#packages-section',
    buttonText: 'Beli Key Sekarang',
    position: 'middle'
  },
  quickToolsTitle: "Sudah Punya Key MawwwHub?",
  quickToolsDesc: "Cek sisa masa aktif key Anda atau pelajari cara eksekusi script Violence District di HP Android dan PC.",
  quickToolsBtn1Text: "Cek Validasi Key",
  quickToolsBtn2Text: "Tutorial Executor",
  footerText: "MawwwHub Violence District Edition • Powered by ArexansPay Multi-Bank & QRIS Automation",
  gameName: "Violence District",
  scriptDescription: "MawwwHub Violence District Edition dikembangkan khusus dan eksklusif untuk game Roblox Violence District. Dilengkapi fitur Auto Scavenge Scrap & Crates, ESP Lengkap (Entity, Enemies, Players, Items), Combat Hitbox Expander, Fullbright tanpa kegelapan, Infinite Stamina, serta GUI in-game responsif untuk Mobile (Delta/Codex) & PC (Solara/Wave).",
  scriptFeatures: [
    "⚡ Auto Scavenge Scrap & Crate Opener Instan",
    "👁️ ESP Lengkap (Monsters, Killers, Survivors, Scraps & Items)",
    "🎯 Combat Mods: Silent Aim, Hitbox Expander & Fast Attack",
    "🛡️ 100% Undetected & Anti-Ban Violence District Bypass",
    "🔦 Fullbright & Anti-Fog (Tembus Gelap Total & Malam Hari)",
    "⚡ Infinite Stamina & Speed Multiplier (Lari Tanpa Batas)",
    "🚀 Instant Safehouse / Extraction Safezone Teleport",
    "📱 Support Mobile (Delta, Codex, Arceus X) & PC (Solara, Wave)"
  ],
  discordUrl: "https://discord.gg/mawwwhub",
  telegramUrl: "https://t.me/mawwwhub",
  whatsappContact: "https://wa.me/6281234567890",
  announcementText: "🔥 VIOLENCE DISTRICT VIP: Auto farm scrap, ESP monster & fullbright aktif! Diskon 30% hari ini!",
  enableOrderUsername: false,
  enableOrderWhatsapp: false,
  enableCustomKeyOrder: true,
  loadstringTemplate: `_G.MawwwHubKey = "{KEY}"\nloadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  rawScriptBody: DEFAULT_LUA_SCRIPT,
  rawLoaderTemplate: `-- [[ MawwwHub Loader ]] --\n-- Paste kode ini di Executor Anda (Delta, Codex, Solara, Wave, dll):\n_G.MawwwHubKey = "{KEY}"\nloadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  maxHwidPerKey: 1,
  enableHwidLock: true,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  arexanspay: {
    apiUrl: "https://arexanspay.my.id",
    apiKey: "arexanspay_07365360dc0f8af09d084ae8be829ce8499eca3f95c33bb0cfe3608e4aea9a44",
    qrisId: "axspay-na49b8c-ec96-41dc-a4e2-1293e755a81h",
    webhookSecret: "WEBHOOK_KEY_TOKO_ANDA",
    numberId: 1,
    enableSimulation: true,
    defaultChannel: "qris"
  },
  packages: [
    {
      id: "pkg-1d",
      name: "Paket 1 Hari",
      durationDays: 1,
      durationLabel: "1 Hari (24 Jam)",
      price: 5000,
      isPopular: false,
      description: "Akses 24 jam penuh untuk uji coba fitur VIP",
      isActive: true
    },
    {
      id: "pkg-7d",
      name: "Paket 7 Hari (1 Minggu)",
      durationDays: 7,
      durationLabel: "7 Hari (1 Minggu)",
      price: 15000,
      isPopular: true,
      description: "Paket paling diminati! Pas untuk grinding mingguan",
      isActive: true
    },
    {
      id: "pkg-30d",
      name: "Paket 30 Hari (1 Bulan)",
      durationDays: 30,
      durationLabel: "30 Hari (1 Bulan)",
      price: 35000,
      isPopular: false,
      description: "Akses eksklusif 1 bulan penuh tanpa hambatan",
      isActive: true
    },
    {
      id: "pkg-perm",
      name: "Paket Lifetime (Permanen)",
      durationDays: -1,
      durationLabel: "Lifetime / Permanen",
      price: 75000,
      isPopular: false,
      description: "Akses selamanya termasuk semua update patch masa depan",
      isActive: true
    }
  ]
};

const DEFAULT_DEMO_KEY: IssuedKey = {
  key: "MWH-DEMO-LIFETIME-DEVKEY",
  packageId: "pkg-perm",
  packageName: "Paket Lifetime (Permanen)",
  durationDays: -1,
  createdAt: "2026-01-01T00:00:00.000Z",
  expiresAt: null,
  status: "active",
  hwid: null,
  customerNote: "Default Demo Key untuk Testing Admin",
  robloxUsername: "Mawww_Admin"
};

export const DevDashboard: React.FC<DevDashboardProps> = ({ onBackToHome }) => {
  // Auth state
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('mawwwhub_admin_token') || '';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: 'stats', 'packages', 'ads', 'arexanspay', 'keys', 'script', 'loadstring'
  const [activeTab, setActiveTab] = useState<'stats' | 'packages' | 'ads' | 'arexanspay' | 'keys' | 'script' | 'loadstring'>('stats');

  // Data states (initialized with defaults so /dev is never blank)
  const [settings, setSettings] = useState<FullAdminSettings | null>(DEFAULT_ADMIN_SETTINGS);
  const [keys, setKeys] = useState<IssuedKey[]>([DEFAULT_DEMO_KEY]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AdminStats | null>({
    totalKeys: 1,
    activeKeys: 1,
    totalTransactions: 0,
    successTransactions: 0,
    totalRevenue: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Key Generator form
  const [genDuration, setGenDuration] = useState('7');
  const [genUsername, setGenUsername] = useState('');
  const [genNote, setGenNote] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // Package edit state
  const [editingPkg, setEditingPkg] = useState<ScriptPackage | null>(null);
  const [isNewPkgModalOpen, setIsNewPkgModalOpen] = useState(false);
  const [pkgFormData, setPkgFormData] = useState<Partial<ScriptPackage>>({
    name: '',
    durationDays: 7,
    durationLabel: '7 Hari',
    price: 15000,
    isPopular: false,
    description: '',
    isActive: true
  });

  // ArexansPay Test state
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingGateway, setIsTestingGateway] = useState(false);

  // Test Raw Loader Endpoint
  const [rawTestKey, setRawTestKey] = useState('');
  const [rawTestOutput, setRawTestOutput] = useState('');
  const [isTestingRaw, setIsTestingRaw] = useState(false);

  // Logo file upload state
  const [logoUploadMsg, setLogoUploadMsg] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 5MB!");
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSettings({ ...settings, logoUrl: base64 });
        setLogoUploadMsg(`File "${file.name}" berhasil dimuat! Klik "Simpan Perubahan" untuk menyimpan permanen.`);
        setTimeout(() => setLogoUploadMsg(''), 5000);
      }
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      alert("Gagal membaca file gambar.");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (!settings) return;
    setSettings({ ...settings, logoUrl: '' });
    setLogoUploadMsg('Logo custom dihapus. Icon default akan digunakan.');
    setTimeout(() => setLogoUploadMsg(''), 4000);
  };

  // Payment Method Modal State
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [adminMethodFilter, setAdminMethodFilter] = useState<'all' | 'qris' | 'ewallet' | 'bank'>('all');
  const [methodFormData, setMethodFormData] = useState<Partial<PaymentMethodConfig>>({
    id: '',
    name: '',
    code: '',
    category: 'ewallet',
    accountNumber: '',
    accountHolder: '',
    instructions: '',
    isActive: true,
    isDefault: false
  });

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const currentMethods = settings.paymentMethods || [];

    if (editingMethod) {
      const updated = currentMethods.map(m => m.id === editingMethod.id ? { ...m, ...methodFormData } as PaymentMethodConfig : m);
      setSettings({ ...settings, paymentMethods: updated });
    } else {
      const cleanCode = (methodFormData.code || methodFormData.id || 'method').toLowerCase().replace(/[^a-z0-9_]/g, '');
      const newMethod: PaymentMethodConfig = {
        id: methodFormData.id || cleanCode || `m-${Date.now().toString(36)}`,
        name: methodFormData.name || 'Metode Pembayaran',
        code: cleanCode || 'qris',
        category: (methodFormData.category as any) || 'ewallet',
        accountNumber: methodFormData.accountNumber || '',
        accountHolder: methodFormData.accountHolder || '',
        instructions: methodFormData.instructions || '',
        isActive: methodFormData.isActive ?? true,
        isDefault: !!methodFormData.isDefault
      };
      setSettings({ ...settings, paymentMethods: [...currentMethods, newMethod] });
    }

    setIsMethodModalOpen(false);
    setEditingMethod(null);
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (!settings) return;
    if (confirm("Hapus metode pembayaran ini dari daftar toko?")) {
      const updated = (settings.paymentMethods || []).filter(m => m.id !== methodId);
      setSettings({ ...settings, paymentMethods: updated });
    }
  };

  const handleToggleMethodActive = (methodId: string) => {
    if (!settings) return;
    const updated = (settings.paymentMethods || []).map(m => {
      if (m.id === methodId) {
        return { ...m, isActive: !m.isActive };
      }
      return m;
    });
    setSettings({ ...settings, paymentMethods: updated });
  };

  const handleSetDefaultMethod = (methodId: string) => {
    if (!settings) return;
    const updated = (settings.paymentMethods || []).map(m => {
      return { ...m, isDefault: m.id === methodId };
    });
    setSettings({
      ...settings,
      paymentMethods: updated,
      arexanspay: {
        ...settings.arexanspay,
        defaultChannel: methodId
      }
    });
  };

  const handleResetDefaultMethods = () => {
    if (!settings) return;
    if (confirm("Kembalikan daftar metode pembayaran ke saluran standar ArexansPay?")) {
      const defaultMethods: PaymentMethodConfig[] = [
        { id: 'qris', name: 'QRIS All Payment (GPN)', code: 'qris', category: 'qris', instructions: 'Scan QRIS dengan GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, BRI, BNI atau aplikasi m-Banking manapun.', isActive: true, isDefault: true },
        { id: 'dana', name: 'DANA Instant', code: 'dana', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer ke nomor akun DANA di atas. Masukkan nominal tepat beserta kode unik agar otomatis terkonfirmasi.', isActive: true },
        { id: 'gopay', name: 'GoPay / Gojek', code: 'gopay', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer saldo GoPay ke nomor di atas. Pembayaran terverifikasi otomatis.', isActive: true },
        { id: 'ovo', name: 'OVO Cash', code: 'ovo', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Buka aplikasi OVO dan transfer ke nomor di atas sesuai total pembayaran.', isActive: true },
        { id: 'shopeepay', name: 'ShopeePay', code: 'shopeepay', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer ShopeePay ke nomor di atas dengan nominal yang tepat.', isActive: true },
        { id: 'linkaja', name: 'LinkAja', code: 'linkaja', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer via aplikasi LinkAja ke nomor tertera.', isActive: false },
        { id: 'bank_bca', name: 'Bank Central Asia (BCA)', code: 'bca', category: 'bank', accountNumber: '8735091823', accountHolder: 'MawwwHub Store', instructions: 'Transfer via m-BCA atau KlikBCA. Wajib transfer sesuai nominal hingga 3 digit kode unik.', isActive: true },
        { id: 'bank_bri', name: 'Bank Rakyat Indonesia (BRI)', code: 'bri', category: 'bank', accountNumber: '012901092839501', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BRImo atau ATM BRI dengan nominal pas termasuk kode unik.', isActive: true },
        { id: 'bank_mandiri', name: 'Bank Mandiri (Livin)', code: 'mandiri', category: 'bank', accountNumber: '1370019284950', accountHolder: 'MawwwHub Store', instructions: 'Transfer via Livin by Mandiri. Transfer tepat sesuai kode unik.', isActive: true },
        { id: 'bank_bni', name: 'Bank Negara Indonesia (BNI)', code: 'bni', category: 'bank', accountNumber: '0981726481', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BNI Mobile Banking dengan nominal tepat.', isActive: true },
        { id: 'bank_seabank', name: 'SeaBank (Transfer Gratis)', code: 'seabank', category: 'bank', accountNumber: '901928475829', accountHolder: 'MawwwHub Store', instructions: 'Bebas biaya admin transfer dari e-wallet/bank lain ke rekening SeaBank ini.', isActive: true },
        { id: 'bank_bsi', name: 'Bank Syariah Indonesia (BSI)', code: 'bsi', category: 'bank', accountNumber: '7192837495', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BSI Mobile. Transfer nominal tepat untuk aktivasi instan.', isActive: true },
        { id: 'bank_permata', name: 'Bank Permata', code: 'permata', category: 'bank', accountNumber: '49281729384', accountHolder: 'MawwwHub Store', instructions: 'Transfer via PermataMobile X atau ATM Permata.', isActive: false }
      ];
      setSettings({
        ...settings,
        paymentMethods: defaultMethods
      });
      alert("Metode pembayaran telah dikembalikan ke daftar standar. Klik 'Simpan Gateway' untuk menyimpan perubahan.");
    }
  };

  // Ads / Promotional Banner Upload helper
  const [adImageUploadMsg, setAdImageUploadMsg] = useState('');
  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 8MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSettings({
          ...settings,
          adBanner: {
            ...(settings.adBanner || {
              enabled: true,
              type: 'image',
              mediaUrl: '',
              position: 'middle'
            }),
            type: 'image',
            mediaUrl: base64
          }
        });
        setAdImageUploadMsg(`File "${file.name}" berhasil dimuat!`);
        setTimeout(() => setAdImageUploadMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Feature Points helper
  const [newFeatureText, setNewFeatureText] = useState('');
  const handleAddFeature = () => {
    if (!settings || !newFeatureText.trim()) return;
    const current = settings.scriptFeatures || [];
    setSettings({ ...settings, scriptFeatures: [...current, newFeatureText.trim()] });
    setNewFeatureText('');
  };
  const handleRemoveFeature = (idx: number) => {
    if (!settings) return;
    const current = [...(settings.scriptFeatures || [])];
    current.splice(idx, 1);
    setSettings({ ...settings, scriptFeatures: current });
  };

  const handleApplyViolenceDistrictPreset = () => {
    if (!settings) return;
    if (confirm("Terapkan preset lengkap Violence District? Ini akan memperbarui teks judul, deskripsi, fitur, dan highlight.")) {
      setSettings({
        ...settings,
        gameName: "Violence District",
        heroHeadline: "MawwwHub VIP - Violence District Script",
        heroSubheadline: "Script resmi Roblox Violence District terlengkap: Auto Scavenge Scrap, ESP Monster & Loot, Combat Silent Aim, Infinite Stamina, dan 100% Undetected.",
        tagline: "The #1 Roblox Violence District Script Hub & Auto Delivery Store",
        statusBadgeText: "Violence District Hub: Undetected & Online",
        statusBadgeType: "online",
        statusSubtext: "VIP Script Undetected",
        scriptDescription: "MawwwHub Violence District Edition dikembangkan khusus dan eksklusif untuk game Roblox Violence District. Dilengkapi fitur Auto Scavenge Scrap & Crates, ESP Lengkap (Entity, Enemies, Players, Items), Combat Hitbox Expander, Fullbright tanpa kegelapan, Infinite Stamina, serta GUI in-game responsif untuk Mobile (Delta/Codex) & PC (Solara/Wave).",
        announcementText: "🔥 VIOLENCE DISTRICT VIP: Auto farm scrap, ESP monster & fullbright aktif! Diskon 30% hari ini!",
        scriptFeatures: [
          "⚡ Auto Scavenge Scrap & Crate Opener Instan",
          "👁️ ESP Lengkap (Monsters, Killers, Survivors, Scraps & Items)",
          "🎯 Combat Mods: Silent Aim, Hitbox Expander & Fast Attack",
          "🛡️ 100% Undetected & Anti-Ban Violence District Bypass",
          "🔦 Fullbright & Anti-Fog (Tembus Gelap Total & Malam Hari)",
          "⚡ Infinite Stamina & Speed Multiplier (Lari Tanpa Batas)",
          "🚀 Instant Safehouse / Extraction Safezone Teleport",
          "📱 Support Mobile (Delta, Codex, Arceus X) & PC (Solara, Wave)"
        ],
        heroPills: [
          { id: 'pill-1', icon: 'zap', title: 'Instan Delivery', description: 'Key & loadstring langsung terbit hitungan detik setelah bayar.' },
          { id: 'pill-2', icon: 'shield', title: 'Bypass Anti-Cheat', description: 'Perlindungan keamanan tinggi aman dari ban Roblox.' },
          { id: 'pill-3', icon: 'check', title: 'Multi-Payment Otomatis', description: 'Mendukung QRIS, DANA, GoPay, OVO, BCA, BRI, Mandiri, SeaBank.' },
          { id: 'pill-4', icon: 'sparkles', title: 'Violence District VIP', description: 'Eksklusif untuk Roblox Violence District, support PC & Mobile.' }
        ]
      });
      alert("Preset Violence District telah dimuat ke form! Klik tombol hijau 'Simpan Perubahan' di atas untuk menyimpan permanen.");
    }
  };

  const handleResetViolenceDistrictScript = () => {
    if (!settings) return;
    if (confirm("Reset kode mentah Lua ke script resmi Violence District VIP Hub?")) {
      const violenceDistrictLua = `-- [[ MawwwHub Official Script Hub - Violence District VIP Edition ]] --
-- Place ID: 93978595733734 (Violence District)
local TARGET_PLACE_ID = 93978595733734
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local HttpService = game:GetService("HttpService")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")

local Key = "{KEY}"
local ApiBase = "{API_BASE}"
local BrandName = "{BRAND_NAME}"
local PackageName = "{PACKAGE}"
local ExpireTimestamp = {EXPIRES_AT_TIMESTAMP} -- Unix seconds (0 = Lifetime)

-- Extract Executor HWID
local function getExecutorHwid()
    local hwid = ""
    pcall(function()
        if gethwid then
            hwid = gethwid()
        elseif getgenv and getgenv().gethwid then
            hwid = getgenv().gethwid()
        elseif identifyexecutor then
            local exec = identifyexecutor()
            local cid = ""
            pcall(function() cid = game:GetService("RbxAnalyticsService"):GetClientId() end)
            hwid = exec .. "_" .. (cid ~= "" and cid or tostring(LocalPlayer.UserId))
        else
            pcall(function() hwid = game:GetService("RbxAnalyticsService"):GetClientId() end)
            if not hwid or hwid == "" then
                hwid = "RBX_" .. tostring(LocalPlayer.UserId)
            end
        end
    end)
    return (hwid and hwid ~= "") and hwid or ("RBX_ID_" .. tostring(LocalPlayer.UserId))
end

local DetectedHwid = getExecutorHwid()

-- Background Sync HWID & Roblox Username to Web API
task.spawn(function()
    pcall(function()
        local syncUrl = ApiBase .. "/api/key/sync-device?key=" .. Key .. "&player=" .. HttpService:UrlEncode(LocalPlayer.Name) .. "&hwid=" .. HttpService:UrlEncode(DetectedHwid)
        local rawRes = game:HttpGet(syncUrl)
        if rawRes then
            local res = HttpService:JSONDecode(rawRes)
            if res and res.error == "hwid_mismatch" then
                pcall(function()
                    local oldGui = (game:GetService("CoreGui"):FindFirstChild("MawwwHub_VIP_HUD") or LocalPlayer:FindFirstChild("PlayerGui"):FindFirstChild("MawwwHub_VIP_HUD"))
                    if oldGui then oldGui:Destroy() end
                end)
                error("[MawwwHub] " .. (res.message or "Key terkunci pada HWID lain!"))
            end
        end
    end)
end)

-- Place ID Check for Violence District
local currentPlace = game.PlaceId
local currentGame = game.GameId
if currentPlace ~= TARGET_PLACE_ID and currentGame ~= TARGET_PLACE_ID then
    pcall(function()
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = "MawwwHub Notice",
            Text = "Script ini khusus Violence District (Place ID: " .. tostring(TARGET_PLACE_ID) .. ")!",
            Duration = 7
        })
    end)
else
    pcall(function()
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = "MawwwHub Loaded!",
            Text = "Violence District VIP Hub aktif! Klik icon 💜 untuk buka menu.",
            Duration = 6
        })
    end)
end

-- Clean old instances
pcall(function()
    local old = (game:GetService("CoreGui"):FindFirstChild("MawwwHub_VIP_HUD") or LocalPlayer:FindFirstChild("PlayerGui"):FindFirstChild("MawwwHub_VIP_HUD"))
    if old then old:Destroy() end
end)

-- ScreenGui Setup
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "MawwwHub_VIP_HUD"
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

pcall(function()
    ScreenGui.Parent = game:GetService("CoreGui")
end)
if not ScreenGui.Parent then
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
end

-- Mini Floating HUD Card
local Card = Instance.new("Frame")
Card.Name = "MiniHUD"
Card.Size = UDim2.new(0, 240, 0, 30)
Card.Position = UDim2.new(1, -255, 0, 16)
Card.BackgroundColor3 = Color3.fromRGB(15, 6, 30)
Card.BackgroundTransparency = 0.25
Card.BorderSizePixel = 0
Card.Active = true
Card.Parent = ScreenGui

local CardCorner = Instance.new("UICorner")
CardCorner.CornerRadius = UDim.new(0, 15)
CardCorner.Parent = Card

local CardStroke = Instance.new("UIStroke")
CardStroke.Color = Color3.fromRGB(168, 85, 247)
CardStroke.Transparency = 0.35
CardStroke.Thickness = 1.3
CardStroke.Parent = Card

local Dot = Instance.new("Frame")
Dot.Size = UDim2.new(0, 7, 0, 7)
Dot.Position = UDim2.new(0, 10, 0.5, -3.5)
Dot.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
Dot.BorderSizePixel = 0
Dot.Parent = Card

local DotCorner = Instance.new("UICorner")
DotCorner.CornerRadius = UDim.new(1, 0)
DotCorner.Parent = Dot

local InfoLabel = Instance.new("TextLabel")
InfoLabel.Size = UDim2.new(1, -75, 1, 0)
InfoLabel.Position = UDim2.new(0, 22, 0, 0)
InfoLabel.BackgroundTransparency = 1
InfoLabel.Text = "💜 Violence District VIP"
InfoLabel.TextColor3 = Color3.fromRGB(243, 232, 255)
InfoLabel.Font = Enum.Font.GothamBold
InfoLabel.TextSize = 10
InfoLabel.TextXAlignment = Enum.TextXAlignment.Left
InfoLabel.Parent = Card

local MenuBtn = Instance.new("TextButton")
MenuBtn.Size = UDim2.new(0, 22, 0, 22)
MenuBtn.Position = UDim2.new(1, -48, 0.5, -11)
MenuBtn.BackgroundColor3 = Color3.fromRGB(88, 28, 135)
MenuBtn.Text = "☰"
MenuBtn.TextColor3 = Color3.fromRGB(243, 232, 255)
MenuBtn.Font = Enum.Font.GothamBold
MenuBtn.TextSize = 11
MenuBtn.Parent = Card

local MenuBtnCorner = Instance.new("UICorner")
MenuBtnCorner.CornerRadius = UDim.new(0, 6)
MenuBtnCorner.Parent = MenuBtn

local HideBtn = Instance.new("TextButton")
HideBtn.Size = UDim2.new(0, 20, 0, 20)
HideBtn.Position = UDim2.new(1, -24, 0.5, -10)
HideBtn.BackgroundColor3 = Color3.fromRGB(50, 20, 85)
HideBtn.Text = "✕"
HideBtn.TextColor3 = Color3.fromRGB(216, 180, 254)
HideBtn.Font = Enum.Font.GothamBold
HideBtn.TextSize = 9
HideBtn.Parent = Card

local HideBtnCorner = Instance.new("UICorner")
HideBtnCorner.CornerRadius = UDim.new(0, 10)
HideBtnCorner.Parent = HideBtn

-- Floating Mini Pill (When minimized)
local MiniPill = Instance.new("TextButton")
MiniPill.Name = "MiniPill"
MiniPill.Size = UDim2.new(0, 32, 0, 32)
MiniPill.Position = UDim2.new(1, -42, 0, 16)
MiniPill.BackgroundColor3 = Color3.fromRGB(20, 8, 40)
MiniPill.BackgroundTransparency = 0.25
MiniPill.Text = "💜"
MiniPill.TextSize = 14
MiniPill.Visible = false
MiniPill.Active = true
MiniPill.Parent = ScreenGui

local PillCorner = Instance.new("UICorner")
PillCorner.CornerRadius = UDim.new(1, 0)
PillCorner.Parent = MiniPill

local PillStroke = Instance.new("UIStroke")
PillStroke.Color = Color3.fromRGB(168, 85, 247)
PillStroke.Transparency = 0.3
PillStroke.Thickness = 1.3
PillStroke.Parent = MiniPill

-- Violence District Main GUI Window
local MainWindow = Instance.new("Frame")
MainWindow.Name = "ViolenceDistrictHub"
MainWindow.Size = UDim2.new(0, 360, 0, 380)
MainWindow.Position = UDim2.new(0.5, -180, 0.5, -190)
MainWindow.BackgroundColor3 = Color3.fromRGB(13, 5, 25)
MainWindow.BorderSizePixel = 0
MainWindow.Visible = false
MainWindow.Active = true
MainWindow.ClipsDescendants = true
MainWindow.Parent = ScreenGui

local MainCorner = Instance.new("UICorner")
MainCorner.CornerRadius = UDim.new(0, 14)
MainCorner.Parent = MainWindow

local MainStroke = Instance.new("UIStroke")
MainStroke.Color = Color3.fromRGB(147, 51, 234)
MainStroke.Thickness = 1.5
MainStroke.Parent = MainWindow

-- Window Header
local Header = Instance.new("Frame")
Header.Size = UDim2.new(1, 0, 0, 42)
Header.BackgroundColor3 = Color3.fromRGB(22, 10, 42)
Header.BorderSizePixel = 0
Header.Parent = MainWindow

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -70, 0, 20)
Title.Position = UDim2.new(0, 14, 0, 4)
Title.BackgroundTransparency = 1
Title.Text = "MawwwHub VIP • Violence District"
Title.TextColor3 = Color3.fromRGB(243, 232, 255)
Title.Font = Enum.Font.GothamBold
Title.TextSize = 12
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

local SubTitle = Instance.new("TextLabel")
SubTitle.Size = UDim2.new(1, -70, 0, 16)
SubTitle.Position = UDim2.new(0, 14, 0, 22)
SubTitle.BackgroundTransparency = 1
SubTitle.Text = "Place: 93978595733734 | Status: Undetected"
SubTitle.TextColor3 = Color3.fromRGB(192, 132, 252)
SubTitle.Font = Enum.Font.Gotham
SubTitle.TextSize = 10
SubTitle.TextXAlignment = Enum.TextXAlignment.Left
SubTitle.Parent = Header

local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.new(0, 24, 0, 24)
CloseBtn.Position = UDim2.new(1, -32, 0.5, -12)
CloseBtn.BackgroundColor3 = Color3.fromRGB(50, 15, 80)
CloseBtn.Text = "✕"
CloseBtn.TextColor3 = Color3.fromRGB(230, 200, 255)
CloseBtn.Font = Enum.Font.GothamBold
CloseBtn.TextSize = 11
CloseBtn.Parent = Header

local CloseCorner = Instance.new("UICorner")
CloseCorner.CornerRadius = UDim.new(0, 7)
CloseCorner.Parent = CloseBtn

-- Scroll container for toggles
local Scroll = Instance.new("ScrollingFrame")
Scroll.Size = UDim2.new(1, -20, 1, -54)
Scroll.Position = UDim2.new(0, 10, 0, 48)
Scroll.BackgroundTransparency = 1
Scroll.BorderSizePixel = 0
Scroll.CanvasSize = UDim2.new(0, 0, 0, 480)
Scroll.ScrollBarThickness = 4
Scroll.ScrollBarImageColor3 = Color3.fromRGB(147, 51, 234)
Scroll.Parent = MainWindow

local Layout = Instance.new("UIListLayout")
Layout.Padding = UDim.new(0, 8)
Layout.SortOrder = Enum.SortOrder.LayoutOrder
Layout.Parent = Scroll

-- Feature Toggle Helper
local function createFeatureToggle(name, desc, onToggle)
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, -6, 0, 48)
    frame.BackgroundColor3 = Color3.fromRGB(20, 9, 38)
    frame.BorderSizePixel = 0
    frame.Parent = Scroll

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 8)
    corner.Parent = frame

    local titleLbl = Instance.new("TextLabel")
    titleLbl.Size = UDim2.new(1, -65, 0, 18)
    titleLbl.Position = UDim2.new(0, 10, 0, 6)
    titleLbl.BackgroundTransparency = 1
    titleLbl.Text = name
    titleLbl.TextColor3 = Color3.fromRGB(243, 232, 255)
    titleLbl.Font = Enum.Font.GothamBold
    titleLbl.TextSize = 11
    titleLbl.TextXAlignment = Enum.TextXAlignment.Left
    titleLbl.Parent = frame

    local descLbl = Instance.new("TextLabel")
    descLbl.Size = UDim2.new(1, -65, 0, 16)
    descLbl.Position = UDim2.new(0, 10, 0, 24)
    descLbl.BackgroundTransparency = 1
    descLbl.Text = desc
    descLbl.TextColor3 = Color3.fromRGB(192, 132, 252)
    descLbl.Font = Enum.Font.Gotham
    descLbl.TextSize = 9
    descLbl.TextXAlignment = Enum.TextXAlignment.Left
    descLbl.Parent = frame

    local toggleBtn = Instance.new("TextButton")
    toggleBtn.Size = UDim2.new(0, 44, 0, 22)
    toggleBtn.Position = UDim2.new(1, -50, 0.5, -11)
    toggleBtn.BackgroundColor3 = Color3.fromRGB(45, 20, 75)
    toggleBtn.Text = "OFF"
    toggleBtn.TextColor3 = Color3.fromRGB(168, 85, 247)
    toggleBtn.Font = Enum.Font.GothamBold
    toggleBtn.TextSize = 9
    toggleBtn.Parent = frame

    local btnCorner = Instance.new("UICorner")
    btnCorner.CornerRadius = UDim.new(0, 11)
    btnCorner.Parent = toggleBtn

    local enabled = false
    toggleBtn.MouseButton1Click:Connect(function()
        enabled = not enabled
        if enabled then
            toggleBtn.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
            toggleBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
            toggleBtn.Text = "ON"
        else
            toggleBtn.BackgroundColor3 = Color3.fromRGB(45, 20, 75)
            toggleBtn.TextColor3 = Color3.fromRGB(168, 85, 247)
            toggleBtn.Text = "OFF"
        end
        pcall(function() onToggle(enabled) end)
    end)
    return frame
end

-- 1. Fullbright (Violence District Anti-Darkness)
local originalAmbient = Lighting.Ambient
local originalFogEnd = Lighting.FogEnd
createFeatureToggle("🔦 Fullbright & No Fog", "Hapus kegelapan & kabut hitam di Violence District", function(state)
    if state then
        Lighting.Ambient = Color3.fromRGB(255, 255, 255)
        Lighting.FogEnd = 100000
        Lighting.Brightness = 2
    else
        Lighting.Ambient = originalAmbient
        Lighting.FogEnd = originalFogEnd
        Lighting.Brightness = 1
    end
end)

-- 2. ESP Enemies & Monsters
local espMonstersEnabled = false
createFeatureToggle("👁️ ESP Monsters / Enemies", "Highlight musuh, killers, dan zombie sekitar", function(state)
    espMonstersEnabled = state
    pcall(function()
        for _, obj in pairs(workspace:GetDescendants()) do
            if obj:IsA("Humanoid") and obj.Parent and obj.Parent ~= LocalPlayer.Character then
                local char = obj.Parent
                if not Players:GetPlayerFromCharacter(char) then
                    local existing = char:FindFirstChild("MawwwMonsterESP")
                    if state and not existing then
                        local hl = Instance.new("Highlight")
                        hl.Name = "MawwwMonsterESP"
                        hl.FillColor = Color3.fromRGB(239, 68, 68)
                        hl.OutlineColor = Color3.fromRGB(255, 255, 255)
                        hl.FillTransparency = 0.5
                        hl.Parent = char
                    elseif not state and existing then
                        existing:Destroy()
                    end
                end
            end
        end
    end)
end)

-- 3. ESP Players / Survivors
local espPlayersEnabled = false
createFeatureToggle("👥 ESP Survivors / Players", "Lihat posisi player lain menembus dinding", function(state)
    espPlayersEnabled = state
    pcall(function()
        for _, p in pairs(Players:GetPlayers()) do
            if p ~= LocalPlayer and p.Character then
                local existing = p.Character:FindFirstChild("MawwwPlayerESP")
                if state and not existing then
                    local hl = Instance.new("Highlight")
                    hl.Name = "MawwwPlayerESP"
                    hl.FillColor = Color3.fromRGB(168, 85, 247)
                    hl.OutlineColor = Color3.fromRGB(255, 255, 255)
                    hl.FillTransparency = 0.5
                    hl.Parent = p.Character
                elseif not state and existing then
                    existing:Destroy()
                end
            end
        end
    end)
end)

-- 4. Auto Scavenge Scrap & Items
local autoScrap = false
createFeatureToggle("⚡ Auto Scavenge Scrap", "Ambil scrap dan item sekitar secara instan", function(state)
    autoScrap = state
    task.spawn(function()
        while autoScrap do
            pcall(function()
                local char = LocalPlayer.Character
                local hrp = char and char:FindFirstChild("HumanoidRootPart")
                if hrp then
                    for _, item in pairs(workspace:GetDescendants()) do
                        if item:IsA("ProximityPrompt") and item.Enabled then
                            local part = item.Parent
                            if part and part:IsA("BasePart") then
                                local dist = (part.Position - hrp.Position).Magnitude
                                if dist < 25 then
                                    fireproximityprompt(item, 0)
                                end
                            end
                        end
                    end
                end
            end)
            task.wait(0.5)
        end
    end)
end)

-- 5. Hitbox Expander / Silent Aim for Violence District
local hitboxEnabled = false
createFeatureToggle("🎯 Hitbox Expander (Combat)", "Perbesar hitbox kepala musuh untuk kill mudah", function(state)
    hitboxEnabled = state
    pcall(function()
        for _, obj in pairs(workspace:GetDescendants()) do
            if obj:IsA("Humanoid") and obj.Parent and obj.Parent ~= LocalPlayer.Character then
                local root = obj.Parent:FindFirstChild("HumanoidRootPart") or obj.Parent:FindFirstChild("Head")
                if root then
                    if state then
                        root.Size = Vector3.new(9, 9, 9)
                        root.Transparency = 0.7
                        root.CanCollide = false
                    else
                        root.Size = Vector3.new(2, 2, 1)
                        root.Transparency = 0
                    end
                end
            end
        end
    end)
end)

-- 6. Infinite Stamina
local infStamina = false
createFeatureToggle("🏃 Infinite Stamina", "Lari tanpa kehabisan stamina di Violence District", function(state)
    infStamina = state
    task.spawn(function()
        while infStamina do
            pcall(function()
                local char = LocalPlayer.Character
                if char then
                    local stamina = char:FindFirstChild("Stamina") or LocalPlayer:FindFirstChild("Stamina")
                    if stamina and stamina:IsA("NumberValue") then
                        stamina.Value = 100
                    end
                    local hum = char:FindFirstChildOfClass("Humanoid")
                    if hum and hum.WalkSpeed < 24 then
                        hum.WalkSpeed = 24
                    end
                end
            end)
            task.wait(0.2)
        end
    end)
end)

-- Window / Pill toggle interactions
MenuBtn.MouseButton1Click:Connect(function()
    MainWindow.Visible = not MainWindow.Visible
end)

CloseBtn.MouseButton1Click:Connect(function()
    MainWindow.Visible = false
end)

HideBtn.MouseButton1Click:Connect(function()
    Card.Visible = false
    MiniPill.Visible = true
end)

MiniPill.MouseButton1Click:Connect(function()
    MiniPill.Visible = false
    Card.Visible = true
end)

-- Draggable implementation
local function makeDraggable(guiObject)
    local dragging, dragInput, dragStart, startPos
    guiObject.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = guiObject.Position
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)
    guiObject.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
            dragInput = input
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then
            local delta = input.Position - dragStart
            guiObject.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)
end

makeDraggable(Card)
makeDraggable(MiniPill)
makeDraggable(MainWindow)

-- Expiration Countdown
local isLifetime = (ExpireTimestamp == 0)
task.spawn(function()
    while ScreenGui.Parent do
        if isLifetime then
            InfoLabel.Text = "💜 VIP: PERMANEN (Violence District)"
            InfoLabel.TextColor3 = Color3.fromRGB(52, 211, 153)
        else
            local now = os.time()
            local diff = ExpireTimestamp - now
            if diff <= 0 then
                InfoLabel.Text = "⚠️ KEY EXPIRED"
                InfoLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
                Dot.BackgroundColor3 = Color3.fromRGB(239, 68, 68)
            else
                local m = math.floor((diff % 3600) / 60)
                local s = math.floor(diff % 60)
                local h = math.floor(diff / 3600)
                InfoLabel.Text = string.format("⏳ %02d:%02d:%02d • Violence District", h, m, s)
                InfoLabel.TextColor3 = Color3.fromRGB(253, 224, 71)
            end
        end
        task.wait(1)
    end
end)

print("[MawwwHub] Violence District VIP script loaded successfully.")`;
      setSettings({
        ...settings,
        rawScriptBody: violenceDistrictLua
      });
      alert("Kode mentah Lua telah di-reset ke Violence District VIP Hub! Klik tombol hijau 'Simpan Kode Mentah' untuk menyimpan.");
    }
  };

  // Check login on mount
  useEffect(() => {
    if (token) {
      loadAllAdminData(token);
    }
  }, [token]);

  const loadAllAdminData = async (authToken: string) => {
    setIsLoadingData(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-admin-token': authToken
      };

      const [resSettings, resKeys, resTrx, resStats] = await Promise.all([
        fetch('/api/admin/settings', { headers }).catch(() => null),
        fetch('/api/admin/keys', { headers }).catch(() => null),
        fetch('/api/admin/transactions', { headers }).catch(() => null),
        fetch('/api/admin/stats', { headers }).catch(() => null)
      ]);

      if (resSettings && resSettings.status === 401) {
        localStorage.removeItem('mawwwhub_admin_token');
        setToken('');
        setLoginError('Sesi login telah kedaluwarsa. Silakan masuk kembali.');
        setIsLoadingData(false);
        return;
      }

      const dataSettings = resSettings ? await resSettings.json().catch(() => null) : null;
      const dataKeys = resKeys ? await resKeys.json().catch(() => null) : null;
      const dataTrx = resTrx ? await resTrx.json().catch(() => null) : null;
      const dataStats = resStats ? await resStats.json().catch(() => null) : null;

      if (dataSettings && dataSettings.success && dataSettings.data) {
        const s = dataSettings.data;
        setSettings({
          ...DEFAULT_ADMIN_SETTINGS,
          ...s,
          packages: Array.isArray(s.packages) && s.packages.length > 0 ? s.packages : DEFAULT_ADMIN_SETTINGS.packages,
          paymentMethods: Array.isArray(s.paymentMethods) && s.paymentMethods.length > 0 ? s.paymentMethods : DEFAULT_ADMIN_SETTINGS.paymentMethods,
          scriptFeatures: Array.isArray(s.scriptFeatures) && s.scriptFeatures.length > 0 ? s.scriptFeatures : DEFAULT_ADMIN_SETTINGS.scriptFeatures,
          heroPills: Array.isArray(s.heroPills) && s.heroPills.length > 0 ? s.heroPills : DEFAULT_ADMIN_SETTINGS.heroPills,
          adBanner: s.adBanner ? { ...DEFAULT_ADMIN_SETTINGS.adBanner, ...s.adBanner } : DEFAULT_ADMIN_SETTINGS.adBanner,
          arexanspay: {
            ...DEFAULT_ADMIN_SETTINGS.arexanspay,
            ...(s.arexanspay || {}),
            apiUrl: s.arexanspay?.apiUrl || DEFAULT_ADMIN_SETTINGS.arexanspay.apiUrl,
            apiKey: s.arexanspay?.apiKey || DEFAULT_ADMIN_SETTINGS.arexanspay.apiKey,
            qrisId: s.arexanspay?.qrisId || DEFAULT_ADMIN_SETTINGS.arexanspay.qrisId,
            webhookSecret: s.arexanspay?.webhookSecret || DEFAULT_ADMIN_SETTINGS.arexanspay.webhookSecret
          }
        });
      }
      if (dataKeys && dataKeys.success && Array.isArray(dataKeys.data)) {
        setKeys(dataKeys.data);
      }
      if (dataTrx && dataTrx.success && Array.isArray(dataTrx.data)) {
        setTransactions(dataTrx.data);
      }
      if (dataStats && dataStats.success && dataStats.data) {
        setStats(dataStats.data);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('mawwwhub_admin_token', data.token);
        setToken(data.token);
        loadAllAdminData(data.token);
      } else {
        setLoginError(data.message || 'Login gagal. Periksa username dan password.');
      }
    } catch (err: any) {
      setLoginError('Gagal menghubungkan ke server: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout dari MawwwHub /dev?')) {
      localStorage.removeItem('mawwwhub_admin_token');
      setToken('');
      setSettings(DEFAULT_ADMIN_SETTINGS);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Pengaturan MawwwHub berhasil disimpan secara permanen!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setSaveErrorMsg(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err: any) {
      setSaveErrorMsg('Error menyimpan: ' + err.message);
    }
  };

  // Key generation
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({
          durationDays: genDuration,
          robloxUsername: genUsername || 'Buyer',
          customerNote: genNote || 'Manual Key Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setGenUsername('');
        setGenNote('');
        loadAllAdminData(token);
        alert(`Key baru berhasil diterbitkan: ${data.data.key}`);
      } else {
        alert(data.message || 'Gagal menerbitkan key');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Reset HWID
  const handleResetHwid = async (keyString: string) => {
    if (!confirm(`Reset HWID untuk key ${keyString}? Pengguna akan dapat login dari device baru.`)) return;
    try {
      const res = await fetch(`/api/admin/keys/${keyString}/reset-hwid`, {
        method: 'POST',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      alert(data.message);
      loadAllAdminData(token);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Revoke Key
  const handleRevokeKey = async (keyString: string) => {
    if (!confirm(`Cabut (Revoke) key ${keyString}? Script tidak akan dapat digunakan lagi dengan key ini.`)) return;
    try {
      const res = await fetch(`/api/admin/keys/${keyString}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      alert(data.message);
      loadAllAdminData(token);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Manual Approve Transaction
  const handleApproveTransaction = async (trxId: string) => {
    if (!confirm(`Approve transaksi ${trxId} secara manual dan terbitkan key sekarang?`)) return;
    try {
      const res = await fetch(`/api/admin/transactions/${trxId}/manual-approve`, {
        method: 'POST',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      alert(data.message);
      loadAllAdminData(token);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Clear All Transactions
  const handleClearAllTransactions = async () => {
    if (!confirm('Hapus SEMUA riwayat transaksi pembelian? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions([]);
        loadAllAdminData(token);
        setSaveSuccessMsg(data.message || 'Semua transaksi berhasil dihapus!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setSaveErrorMsg(data.message || 'Gagal menghapus transaksi');
      }
    } catch (e: any) {
      setSaveErrorMsg('Error: ' + e.message);
    }
  };

  // Clear All Keys
  const handleClearAllKeys = async () => {
    if (!confirm('Hapus SEMUA license key yang telah diterbitkan? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      if (data.success) {
        setKeys([]);
        loadAllAdminData(token);
        setSaveSuccessMsg(data.message || 'Semua license key berhasil dihapus!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setSaveErrorMsg(data.message || 'Gagal menghapus key');
      }
    } catch (e: any) {
      setSaveErrorMsg('Error: ' + e.message);
    }
  };

  // Reset Order History Data Only (Keep /dev Settings Intact)
  const handleResetAllData = async () => {
    if (!confirm('Hapus semua data bekas orderan (riwayat transaksi & key hasil orderan)? Seluruh data pengaturan di /dev akan tetap aman dan tidak dihapus.')) return;
    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions([]);
        loadAllAdminData(token);
        setSaveSuccessMsg(data.message || 'Data bekas orderan berhasil dihapus bersih!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setSaveErrorMsg(data.message || 'Gagal menghapus data orderan');
      }
    } catch (e: any) {
      setSaveErrorMsg('Error: ' + e.message);
    }
  };

  // Test ArexansPay Gateway connection
  const handleTestArexansPay = async () => {
    if (!settings) return;
    setIsTestingGateway(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/arexanspay/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({
          apiUrl: settings.arexanspay.apiUrl,
          apiKey: settings.arexanspay.apiKey
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingGateway(false);
    }
  };

  // Test Raw Loader Endpoint
  const handleTestRawLoader = async () => {
    setIsTestingRaw(true);
    try {
      const res = await fetch(`/api/raw/mawwwhub?key=${encodeURIComponent(rawTestKey.trim())}&executor=1`, {
        headers: { 'X-Requested-By': 'MawwwHubExecutor' }
      });
      const text = await res.text();
      setRawTestOutput(text);
    } catch (err: any) {
      setRawTestOutput('Gagal request raw script: ' + err.message);
    } finally {
      setIsTestingRaw(false);
    }
  };

  // Package Management
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (editingPkg) {
      // update
      const updated = settings.packages.map(p => p.id === editingPkg.id ? { ...p, ...pkgFormData } as ScriptPackage : p);
      setSettings({ ...settings, packages: updated });
    } else {
      // add new
      const newPkg: ScriptPackage = {
        id: `pkg-${Date.now().toString(36)}`,
        name: pkgFormData.name || 'Paket Baru',
        durationDays: Number(pkgFormData.durationDays) || 7,
        durationLabel: pkgFormData.durationLabel || `${pkgFormData.durationDays} Hari`,
        price: Number(pkgFormData.price) || 10000,
        isPopular: !!pkgFormData.isPopular,
        description: pkgFormData.description || '',
        isActive: pkgFormData.isActive ?? true
      };
      setSettings({ ...settings, packages: [...settings.packages, newPkg] });
    }
    setIsNewPkgModalOpen(false);
    setEditingPkg(null);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (!settings) return;
    if (confirm('Hapus paket ini?')) {
      const updated = settings.packages.filter(p => p.id !== pkgId);
      setSettings({ ...settings, packages: updated });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2500);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (if not logged in)
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0416]">
        <div className="w-full max-w-md rounded-2xl bg-[#120726] border border-purple-700/60 p-8 shadow-2xl shadow-purple-900/60 text-white">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-500 p-0.5 mx-auto mb-4 shadow-lg shadow-purple-600/40 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d071a] rounded-[14px] flex items-center justify-center">
                <Lock className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-200 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              MawwwHub Admin Portal
            </h2>
            <p className="text-xs text-purple-300/70 mt-1 font-mono-code">
              Endpoints Pengaturan: /dev
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Username Admin
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mawwwhub"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070210] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Password Admin
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070210] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white font-mono-code"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-[11px] text-purple-300/80">
              <span className="font-semibold text-purple-200">Sistem Sesi Permanen:</span>
              <p>Anda cukup login 1 kali. Sesi admin akan tersimpan permanen di browser ini sampai Anda menekan tombol logout.</p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-900/50 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Masuk ke Pengaturan /dev</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToHome}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Utama</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080214] text-slate-100 pb-20">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 border-b border-purple-900/60 bg-[#0e051e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 text-purple-300 hover:text-white transition"
              title="Kembali ke Web Publik"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">MawwwHub</span>
              <span className="px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase tracking-wider bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-md">
                Admin /dev
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {saveSuccessMsg && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tersimpan</span>
              </span>
            )}

            <button
              onClick={handleResetAllData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-700/50 transition active:scale-95"
              title="Hapus Data Bekas Orderan (Pengaturan /dev Tetap Aman)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Hapus Data Orderan</span>
            </button>

            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 transition"
              title="Logout Sesi Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {saveSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 mb-6 border-b border-purple-900/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ringkasan & Transaksi</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'packages'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Paket Durasi & Harga</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'ads'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-300" />
            <span>Iklan & Banner Media</span>
          </button>

          <button
            onClick={() => setActiveTab('arexanspay')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'arexanspay'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gateway & Metode Pembayaran</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'script'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-purple-400" />
            <span>Editor Beranda & Konten</span>
          </button>

          <button
            onClick={() => setActiveTab('loadstring')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'loadstring'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Loadstring Proteksi & Lua</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'keys'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Integrasi Key Durasi</span>
          </button>
        </div>

        {/* TAB 1: RINGKASAN & TRANSAKSI */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Total Omset Penjualan</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono-code">
                  {formatRupiah(stats?.totalRevenue || 0)}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">Pembayaran Sukses</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Total Key Aktif</span>
                <span className="text-xl sm:text-2xl font-black text-purple-200 font-mono-code">
                  {stats?.activeKeys || 0}
                </span>
                <span className="text-[11px] text-purple-400/70 block mt-1">Dari {stats?.totalKeys || 0} total key</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Transaksi Berhasil</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-code">
                  {stats?.successTransactions || 0}
                </span>
                <span className="text-[11px] text-purple-400/70 block mt-1">Auto issued key</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Total Transaksi Dibuat</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono-code">
                  {stats?.totalTransactions || 0}
                </span>
                <span className="text-[11px] text-purple-400/70 block mt-1">Semua tagihan</span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Transaksi Pembelian Terbaru</h3>
                  <p className="text-xs text-purple-300/70">Dipantau real time melalui payment listener ArexansPay</p>
                </div>
                <div className="flex items-center gap-2">
                  {transactions.length > 0 && (
                    <button
                      onClick={handleClearAllTransactions}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-800/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Semua Transaksi</span>
                    </button>
                  )}
                  <button
                    onClick={() => loadAllAdminData(token)}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-800/40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-purple-400/60">
                  Belum ada transaksi pembelian. Tagihan baru akan muncul di sini secara otomatis.
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-900/50 text-purple-300 font-mono-code">
                        <th className="py-2.5 px-3">ID Transaksi</th>
                        <th className="py-2.5 px-3">Paket</th>
                        <th className="py-2.5 px-3">Username Roblox</th>
                        <th className="py-2.5 px-3">Nominal (+Unik)</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Key Diterbitkan</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-purple-950/20">
                          <td className="py-3 px-3 font-mono-code text-purple-200">{t.id}</td>
                          <td className="py-3 px-3 font-semibold text-white">{t.packageName}</td>
                          <td className="py-3 px-3">
                            {t.robloxUsername && t.robloxUsername !== 'Guest' && t.robloxUsername !== 'User' ? (
                              <div className="flex items-center gap-1.5 font-semibold text-white">
                                <span className="text-purple-400">🎮</span>
                                <span>{t.robloxUsername}</span>
                              </div>
                            ) : (
                              <span className="text-purple-400/50 italic text-[11px]">Belum execute</span>
                            )}
                            {t.requestedCustomKey && (
                              <div className="text-[10px] text-amber-300 font-mono-code mt-0.5">
                                Req: {t.requestedCustomKey}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono-code font-bold text-amber-300">
                            {formatRupiah(t.totalAmount || t.baseAmount)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.status === 'success'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                : t.status === 'pending'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                                : 'bg-red-950/70 text-red-400 border border-red-500/30'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono-code text-[11px] text-purple-200">
                            {t.issuedKey || '-'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {t.status === 'pending' && (
                              <button
                                onClick={() => handleApproveTransaction(t.id)}
                                className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow transition"
                              >
                                Approve Manual
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PAKET DURASI & HARGA SCRIPT */}
        {activeTab === 'packages' && settings && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Manajemen Paket Pembelian & Durasi Script</h3>
                <p className="text-xs text-purple-300/70">
                  Atur paket durasi (1 Hari, 7 Hari, 30 Hari, Lifetime) dan harga yang tampil di halaman utama.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPkg(null);
                  setPkgFormData({
                    name: 'Paket Baru',
                    durationDays: 7,
                    durationLabel: '7 Hari',
                    price: 15000,
                    isPopular: false,
                    description: 'Akses script VIP',
                    isActive: true
                  });
                  setIsNewPkgModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-purple-900/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Paket Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-5 rounded-2xl bg-[#120726] border transition flex flex-col justify-between ${
                    pkg.isActive ? 'border-purple-800/60' : 'border-purple-950/40 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono-code font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/40">
                        {pkg.durationLabel || (pkg.durationDays > 0 ? `${pkg.durationDays} Hari` : 'Permanen')}
                      </span>
                      <div className="flex items-center gap-1">
                        {pkg.isPopular && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                            Populer
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          pkg.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-white mb-1">{pkg.name}</h4>
                    <div className="text-xl font-black text-amber-300 font-mono-code mb-2">
                      {formatRupiah(pkg.price)}
                    </div>
                    <p className="text-xs text-purple-200/70 mb-4">{pkg.description}</p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between">
                    <span className="text-[11px] text-purple-400/60 font-mono-code">{pkg.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPkg(pkg);
                          setPkgFormData({ ...pkg });
                          setIsNewPkgModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 transition"
                        title="Edit Paket"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 transition"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Tambah/Edit Paket */}
            {isNewPkgModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-[#120726] border border-purple-700/60 p-6 text-white shadow-2xl">
                  <h4 className="text-base font-bold mb-4">
                    {editingPkg ? 'Edit Paket Script' : 'Tambah Paket Durasi Baru'}
                  </h4>

                  <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">Nama Paket</label>
                      <input
                        type="text"
                        required
                        value={pkgFormData.name || ''}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, name: e.target.value })}
                        placeholder="Contoh: Paket 7 Hari (1 Minggu)"
                        className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-purple-200 font-semibold mb-1">Durasi Hari (-1 = Lifetime)</label>
                        <input
                          type="number"
                          required
                          value={pkgFormData.durationDays ?? 7}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, durationDays: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 font-semibold mb-1">Label Durasi</label>
                        <input
                          type="text"
                          required
                          value={pkgFormData.durationLabel || ''}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, durationLabel: e.target.value })}
                          placeholder="7 Hari"
                          className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">Harga (IDR)</label>
                      <input
                        type="number"
                        required
                        value={pkgFormData.price ?? 15000}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, price: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white font-mono-code"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">Deskripsi Paket</label>
                      <textarea
                        rows={2}
                        value={pkgFormData.description || ''}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, description: e.target.value })}
                        placeholder="Deskripsi singkat keunggulan paket"
                        className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!pkgFormData.isPopular}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, isPopular: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span>Tandai Sebagai "Populer"</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgFormData.isActive ?? true}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, isActive: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span>Status Aktif</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-purple-900/40">
                      <button
                        type="button"
                        onClick={() => setIsNewPkgModalOpen(false)}
                        className="px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md"
                      >
                        Simpan Paket
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB: IKLAN & BANNER MEDIA PROMO (ADS) */}
        {activeTab === 'ads' && settings && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-300" />
                    <span>Manajemen Iklan Banner & Video Beranda</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Pasang materi iklan promo, banner gambar, direct MP4 video, atau showcase YouTube di halaman depan toko.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan Iklan</span>
                </button>
              </div>

              {/* Master Switch */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.adBanner?.enabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-purple-900/30 text-purple-400 border border-purple-800'}`}>
                    <Radio className={`w-5 h-5 ${settings.adBanner?.enabled ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Status Banner Iklan di Beranda</span>
                    <span className="text-xs text-purple-300/70">
                      {settings.adBanner?.enabled ? '🟢 Sedang Aktif & Tampil ke Pengunjung' : '⚪ Dinonaktifkan (Disembunyikan)'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!settings.adBanner?.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || {
                          type: 'image',
                          mediaUrl: '',
                          position: 'middle'
                        }),
                        enabled: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-amber-500"></div>
                </label>
              </div>

              {/* Ad Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Media Type */}
                <div>
                  <label className="block text-purple-200 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tipe Media Iklan</span>
                  </label>
                  <select
                    value={settings.adBanner?.type || 'image'}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, mediaUrl: '', position: 'middle' }),
                        type: e.target.value as any
                      }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-medium"
                  >
                    <option value="image">🖼️ Gambar / Banner (JPG, PNG, WebP, GIF)</option>
                    <option value="video">🎬 Video Langsung (MP4 / WebM Autoplay Loop)</option>
                    <option value="youtube">▶️ YouTube Video Showcase (Embed)</option>
                  </select>
                </div>

                {/* Banner Position */}
                <div>
                  <label className="block text-purple-200 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-purple-400" />
                    <span>Posisi Tampilan di Beranda</span>
                  </label>
                  <select
                    value={settings.adBanner?.position || 'middle'}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, type: 'image', mediaUrl: '' }),
                        position: e.target.value as any
                      }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-medium"
                  >
                    <option value="top">🔝 Posisi Atas (Tepat di bawah Header Hero)</option>
                    <option value="middle">🎯 Posisi Tengah (Antara Hero dan Daftar Paket)</option>
                    <option value="bottom">🔽 Posisi Bawah (Di bawah Daftar Paket)</option>
                  </select>
                </div>

                {/* Media URL & Upload */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-purple-200 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>URL File Media (Gambar / Video / YouTube Link)</span>
                    </span>
                    <span className="text-[10px] text-purple-400 font-normal">
                      Mendukung URL https:// atau Upload Langsung
                    </span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={settings.adBanner?.mediaUrl || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        adBanner: {
                          ...(settings.adBanner || { enabled: true, type: 'image', position: 'middle' }),
                          mediaUrl: e.target.value
                        }
                      })}
                      placeholder={settings.adBanner?.type === 'youtube' ? 'Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ' : 'https://images.unsplash.com/... atau URL file mp4'}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code text-[11px]"
                    />

                    {settings.adBanner?.type !== 'youtube' && (
                      <label className="px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition flex-shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept={settings.adBanner?.type === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                          onChange={handleAdImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {adImageUploadMsg && (
                    <span className="text-[11px] text-emerald-400 font-medium block">
                      ✓ {adImageUploadMsg}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    Judul Promo / Headline Banner
                  </label>
                  <input
                    type="text"
                    value={settings.adBanner?.title || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, type: 'image', mediaUrl: '', position: 'middle' }),
                        title: e.target.value
                      }
                    })}
                    placeholder="Contoh: 🔥 Promo Spesial MawwwHub VIP Script"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                  />
                </div>

                {/* Badge text */}
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    Label Badge / Tag (Pojok Kiri)
                  </label>
                  <input
                    type="text"
                    value={settings.adBanner?.badge || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, type: 'image', mediaUrl: '', position: 'middle' }),
                        badge: e.target.value
                      }
                    })}
                    placeholder="Contoh: OFFICIAL UPDATE atau DISKON 50%"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white uppercase text-[11px]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-purple-200 font-semibold mb-1">
                    Deskripsi Singkat Iklan
                  </label>
                  <textarea
                    rows={2}
                    value={settings.adBanner?.description || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, type: 'image', mediaUrl: '', position: 'middle' }),
                        description: e.target.value
                      }
                    })}
                    placeholder="Jelaskan penawaran atau informasi update yang menarik bagi pengunjung..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white"
                  />
                </div>

                {/* Button text & Target Url */}
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    Teks Tombol Aksi (CTA)
                  </label>
                  <input
                    type="text"
                    value={settings.adBanner?.buttonText || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, type: 'image', mediaUrl: '', position: 'middle' }),
                        buttonText: e.target.value
                      }
                    })}
                    placeholder="Beli Key Sekarang"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    Link Tujuan Tombol (URL / Anchor)
                  </label>
                  <input
                    type="text"
                    value={settings.adBanner?.targetUrl || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      adBanner: {
                        ...(settings.adBanner || { enabled: true, type: 'image', mediaUrl: '', position: 'middle' }),
                        targetUrl: e.target.value
                      }
                    })}
                    placeholder="#packages-section atau https://wa.me/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code text-[11px]"
                  />
                </div>

              </div>

              {/* Live Preview Box */}
              <div className="pt-4 border-t border-purple-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
                  Preview Tampilan Iklan di Beranda:
                </span>
                
                {settings.adBanner?.mediaUrl ? (
                  <div className="rounded-2xl border border-purple-600/50 bg-gradient-to-r from-purple-950/70 via-[#160a2c] to-purple-950/70 p-5 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-5">
                      <div className="w-full md:w-1/2 aspect-video max-h-56 bg-black/60 rounded-xl overflow-hidden border border-purple-700 flex items-center justify-center relative">
                        {settings.adBanner.badge && (
                          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-purple-900/90 border border-purple-400/50 text-[9px] font-bold text-purple-200 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>{settings.adBanner.badge}</span>
                          </span>
                        )}

                        {settings.adBanner.type === 'youtube' ? (
                          <div className="w-full h-full flex items-center justify-center text-red-400 gap-2 font-mono-code text-xs">
                            <Play className="w-6 h-6 fill-red-500" />
                            <span>YouTube Embed Aktif</span>
                          </div>
                        ) : settings.adBanner.type === 'video' ? (
                          <video
                            src={settings.adBanner.mediaUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={settings.adBanner.mediaUrl}
                            alt="Preview Ad"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="w-full md:w-1/2 space-y-2 text-left">
                        {settings.adBanner.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono-code">
                            {settings.adBanner.badge}
                          </span>
                        )}
                        <h4 className="text-lg font-black text-white">
                          {settings.adBanner.title || 'Judul Promo Banner'}
                        </h4>
                        <p className="text-xs text-purple-200/80">
                          {settings.adBanner.description || 'Deskripsi iklan akan tampil di sini.'}
                        </p>
                        {settings.adBanner.buttonText && (
                          <div className="pt-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-xs flex items-center gap-1.5"
                            >
                              <span>{settings.adBanner.buttonText}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[#090214] border border-dashed border-purple-800 text-center text-purple-400/60 text-xs">
                    Belum ada gambar atau video iklan. Masukkan URL atau upload file di atas untuk melihat preview.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: LOADSTRING & KODE MENTAH LUA */}
        {activeTab === 'loadstring' && settings && (
          <div className="space-y-6">
            
            {/* Loadstring Configuration */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Template Loadstring Pembayaran Berhasil</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    String script ini yang akan otomatis didapatkan dan disalin oleh pembeli saat pembayaran mereka diverifikasi.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Template</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Template Loadstring (Variabel tersedia: <code className="text-amber-300">{`{KEY}`}</code>, <code className="text-cyan-300">{`{API_BASE}`}</code>)
                </label>
                <textarea
                  rows={3}
                  value={settings.loadstringTemplate}
                  onChange={(e) => setSettings({ ...settings, loadstringTemplate: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080214] border border-purple-800 font-mono-code text-xs text-purple-200 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Live Preview of Loadstring */}
              <div className="p-3.5 rounded-xl bg-[#0a0318] border border-purple-900/60">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                  Preview Tampilan Loadstring Pembeli:
                </span>
                <pre className="text-xs font-mono-code text-cyan-300 break-all whitespace-pre-wrap">
                  {settings.loadstringTemplate
                    .replace(/{KEY}/g, 'MWH-SAMPLE-KEY-9999')
                    .replace(/{API_BASE}/g, window.location.origin)}
                </pre>
              </div>
            </div>

            {/* Raw Script Body (Kode Mentah Lua) Configuration */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Kode Mentah Script Roblox (Raw Lua Script Body)</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Kode ini dieksekusi di Roblox ketika executor memanggil endpoint <code>/api/raw/:scriptId?key=...</code> setelah key diverifikasi aktif.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetViolenceDistrictScript}
                    className="px-3 py-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-600/50 text-xs font-semibold transition flex items-center gap-1.5"
                    title="Reset isi script ke versi resmi Violence District VIP"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
                    <span>Reset ke Script Violence District</span>
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Kode Mentah</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Isi Script Lua Mentah (Mendukung: <code className="text-amber-300">{`{KEY}`}</code>, <code className="text-cyan-300">{`{EXPIRES_AT}`}</code>, <code className="text-purple-300">{`{PACKAGE}`}</code>, <code className="text-emerald-300">{`{API_BASE}`}</code>)
                </label>
                <textarea
                  rows={14}
                  value={settings.rawScriptBody}
                  onChange={(e) => setSettings({ ...settings, rawScriptBody: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080214] border border-purple-800 font-mono-code text-xs text-purple-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* HWID Lock settings */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">Proteksi HWID Lock (Hardware ID Device)</span>
                  <span className="text-[11px] text-purple-300/70">
                    Kunci key ke device pertama kali yang mengeksekusi script agar tidak bisa disebarluaskan.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-200">
                  <input
                    type="checkbox"
                    checked={settings.enableHwidLock}
                    onChange={(e) => setSettings({ ...settings, enableHwidLock: e.target.checked })}
                    className="rounded text-purple-600 w-4 h-4"
                  />
                  <span>Aktifkan HWID Lock</span>
                </label>
              </div>

              {/* Test Raw Script Endpoint Tool */}
              <div className="p-4 rounded-xl bg-[#0a0316] border border-purple-800/60 space-y-3">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Uji Live Endpoint Raw Script (/api/raw/mawwwhub)</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rawTestKey}
                    onChange={(e) => setRawTestKey(e.target.value)}
                    placeholder="Masukkan Key untuk tes"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#05010d] border border-purple-800 text-xs font-mono-code text-white"
                  />
                  <button
                    onClick={handleTestRawLoader}
                    disabled={isTestingRaw}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition disabled:opacity-50"
                  >
                    {isTestingRaw ? 'Memanggil...' : 'Tes Endpoint'}
                  </button>
                </div>

                {rawTestOutput && (
                  <div className="mt-2 p-3 rounded-lg bg-[#05010d] border border-purple-900 text-[11px] font-mono-code text-purple-200 overflow-x-auto max-h-48 custom-scrollbar">
                    <pre className="whitespace-pre-wrap">{rawTestOutput}</pre>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: AREXANSPAY GATEWAY INTEGRATION */}
        {activeTab === 'arexanspay' && settings && (
          <div className="space-y-6">
            
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Konfigurasi Payment Gateway ArexansPay</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Sesuai dokumentasi resmi <code>https://arexanspay.my.id/docs</code> untuk QRIS otomatis & Bank Transfer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://arexanspay.my.id/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/40 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Buka Dokumentasi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleSaveSettings}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Gateway</span>
                  </button>
                </div>
              </div>

              {/* Status Integrasi ArexansPay Banner */}
              {(() => {
                const isGatewayReady = Boolean(
                  settings.arexanspay.apiUrl?.trim() &&
                  settings.arexanspay.apiKey?.trim() &&
                  settings.arexanspay.apiKey.trim() !== 'arexanspay_07365360dc0f8af09d084ae8be829ce8499eca3f95c33bb0cfe3608e4aea9a44' &&
                  settings.arexanspay.apiKey.trim().length >= 10
                );
                const isSim = Boolean(settings.arexanspay.enableSimulation);
                return (
                  <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                    isGatewayReady
                      ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200'
                      : isSim
                      ? 'bg-amber-950/30 border-amber-600/50 text-amber-200'
                      : 'bg-rose-950/40 border-rose-600/50 text-rose-200'
                  }`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">
                        {isGatewayReady
                          ? '✓ Integrasi ArexansPay Aktif & Terkonfigurasi'
                          : isSim
                          ? 'Mode Simulasi Aktif (Integrasi ArexansPay Belum Diisi)'
                          : 'Metode Pembayaran Disembunyikan dari Publik (Simulasi Nonaktif & ArexansPay Belum Diisi)'}
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {isGatewayReady
                          ? 'API Key arexanspay.my.id sudah terisi. Metode QRIS akan tampil jika QRIS ID diisi, dan E-Wallet / Bank akan tampil jika nomor rekening/e-wallet tujuan sudah diisi.'
                          : 'Jika Mode Simulasi dinonaktifkan, seluruh metode pembayaran (QRIS, Nomor E-Wallet, dan Rekening Bank) tidak akan muncul di halaman checkout pembeli sampai Anda mengisi API Key integrasi arexanspay.my.id beserta QRIS ID / Nomor Rekening di bawah ini.'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    API Base URL ArexansPay
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.apiUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, apiUrl: e.target.value }
                    })}
                    placeholder="https://arexanspay.my.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Default: https://arexanspay.my.id
                  </span>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    License Key / API Key (X-API-Key)
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.apiKey}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, apiKey: e.target.value }
                    })}
                    placeholder="Masukkan X-API-Key dari dashboard arexanspay.my.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code text-[11px]"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Wajib diisi agar metode pembayaran tampil saat Mode Simulasi nonaktif
                  </span>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    QRIS ID Toko (X-QRIS-ID)
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.qrisId}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, qrisId: e.target.value }
                    })}
                    placeholder="Masukkan X-QRIS-ID dari dashboard arexanspay.my.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Wajib diisi untuk menampilkan metode pembayaran QRIS saat Simulasi nonaktif
                  </span>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    Webhook Secret Key (Tasker Listener)
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.webhookSecret}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, webhookSecret: e.target.value }
                    })}
                    placeholder="WEBHOOK_KEY_TOKO_ANDA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Kunci pengaman webhook Tasker m-Banking Android
                  </span>
                </div>
              </div>

              {/* Mode Simulasi Switch */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">Mode Simulasi / Sandbox (Rekomendasi untuk Uji Coba)</span>
                  <span className="text-[11px] text-purple-300/70">
                    Memungkinkan tombol "Simulasi Bayar Berhasil" di popup pembelian agar Anda dan pembeli bisa menguji alur terbit key instan tanpa harus transfer m-banking sungguhan.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-200">
                  <input
                    type="checkbox"
                    checked={settings.arexanspay.enableSimulation}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, enableSimulation: e.target.checked }
                    })}
                    className="rounded text-purple-600 w-4 h-4"
                  />
                  <span>Aktifkan Mode Uji Coba</span>
                </label>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestArexansPay}
                  disabled={isTestingGateway}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingGateway ? 'animate-spin' : ''}`} />
                  <span>{isTestingGateway ? 'Mengecek Koneksi API...' : 'Tes Koneksi ArexansPay'}</span>
                </button>
                <span className="text-[11px] text-purple-300/70">
                  Menguji endpoint <code>/api/payments</code> dengan X-API-Key Anda
                </span>
              </div>

              {/* Test Result box */}
              {testResult && (
                <div className={`p-4 rounded-xl border text-xs font-mono-code ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{testResult.success ? 'Koneksi Berhasil!' : 'Hasil Pengecekan:'}</span>
                  </div>
                  <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}

              {/* Webhook Endpoint for Tasker HP Android */}
              <div className="p-4 rounded-xl bg-[#090214] border border-purple-900/60 text-xs space-y-2">
                <span className="font-bold text-purple-200 block">
                  Alamat URL Webhook Tasker / HP Android Anda:
                </span>
                <div className="flex items-center gap-2 font-mono-code text-cyan-300 bg-[#05010b] p-2.5 rounded-lg border border-purple-900">
                  <span className="flex-1 break-all">{window.location.origin}/api/webhook</span>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/api/webhook`, 'webhook')}
                    className="px-2 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedText === 'webhook' ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'webhook' ? 'Disalin' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-purple-300/70">
                  Masukkan URL di atas ke profil Tasker AutoNotification HP Anda dengan method POST JSON.
                </p>
              </div>

            </div>

            {/* SEKSI MANAJEMEN METODE PEMBAYARAN AREXANSPAY (ALL EWALLET & BANK) */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>Metode Pembayaran Toko (Semua E-Wallet & Bank ArexansPay)</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Aktifkan atau nonaktifkan pilihan QRIS, E-Wallet (DANA, GoPay, OVO, ShopeePay, LinkAja) dan Rekening Bank (BCA, BRI, Mandiri, BNI, SeaBank, BSI, Permata).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultMethods}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Kembalikan semua daftar bank & ewallet standar ArexansPay"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset ke Standar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingMethod(null);
                      setMethodFormData({
                        id: '',
                        name: '',
                        code: '',
                        category: 'ewallet',
                        accountNumber: '',
                        accountHolder: settings.brandName + ' Store',
                        instructions: '',
                        isActive: true,
                        isDefault: false
                      });
                      setIsMethodModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-900/50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Metode Pembayaran</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAdminMethodFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${adminMethodFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'}`}
                >
                  Semua ({settings.paymentMethods?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMethodFilter('qris')}
                  className={`px-3 py-1.5 rounded-xl transition ${adminMethodFilter === 'qris' ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'}`}
                >
                  QRIS ({settings.paymentMethods?.filter(m => m.category === 'qris').length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMethodFilter('ewallet')}
                  className={`px-3 py-1.5 rounded-xl transition ${adminMethodFilter === 'ewallet' ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'}`}
                >
                  E-Wallet ({settings.paymentMethods?.filter(m => m.category === 'ewallet').length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMethodFilter('bank')}
                  className={`px-3 py-1.5 rounded-xl transition ${adminMethodFilter === 'bank' ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'}`}
                >
                  Bank Transfer & VA ({settings.paymentMethods?.filter(m => m.category === 'bank').length || 0})
                </button>
              </div>

              {/* Methods Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(settings.paymentMethods || [])
                  .filter(m => adminMethodFilter === 'all' || m.category === adminMethodFilter)
                  .map((method) => {
                    const isQris = method.category === 'qris';
                    const isEwallet = method.category === 'ewallet';
                    const isBank = method.category === 'bank';

                    return (
                      <div
                        key={method.id}
                        className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                          method.isActive
                            ? 'bg-[#090216] border-purple-800/80 shadow-md'
                            : 'bg-[#06010f]/60 border-purple-950/50 opacity-60'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300">
                                {isQris && <QrCode className="w-4 h-4 text-purple-400" />}
                                {isEwallet && <Smartphone className="w-4 h-4 text-cyan-400" />}
                                {isBank && <Building2 className="w-4 h-4 text-amber-400" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-white leading-tight">{method.name}</h4>
                                <span className="text-[10px] font-mono-code text-purple-400 uppercase">
                                  {method.category} • {method.code}
                                </span>
                              </div>
                            </div>

                            {/* Status Active Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={method.isActive}
                                onChange={() => handleToggleMethodActive(method.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                           {/* Account details */}
                          {!isQris && (
                            <div className="p-2.5 rounded-lg bg-[#0e0420] border border-purple-900/60 text-[11px] space-y-1">
                              <div className="flex justify-between font-mono-code">
                                <span className="text-purple-400/80">Nomor:</span>
                                <span className={`font-bold ${method.accountNumber ? 'text-cyan-300' : 'text-rose-400 italic'}`}>
                                  {method.accountNumber || 'Belum diisi'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-400/80">Atas Nama:</span>
                                <span className="text-purple-200 truncate max-w-[130px] font-medium">{method.accountHolder || '-'}</span>
                              </div>
                            </div>
                          )}

                          {isQris && (
                            <div className="p-2 rounded-lg bg-[#0e0420] border border-purple-900/60 text-[11px] text-purple-300/80">
                              {settings.arexanspay.qrisId
                                ? `QRIS ID: ${settings.arexanspay.qrisId}`
                                : 'QRIS ID belum diisi di konfigurasi ArexansPay di atas.'}
                            </div>
                          )}

                          {method.instructions && (
                            <p className="text-[10px] text-purple-400/70 line-clamp-2 italic">
                              "{method.instructions}"
                            </p>
                          )}
                        </div>

                        {/* Card bottom actions */}
                        <div className="pt-3 mt-3 border-t border-purple-900/40 flex items-center justify-between text-xs">
                          {method.isDefault ? (
                            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                              ⭐ Pilihan Utama
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultMethod(method.id)}
                              className="text-[10px] text-purple-400 hover:text-purple-200 transition"
                            >
                              Jadikan Utama
                            </button>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMethod(method);
                                setMethodFormData(method);
                                setIsMethodModalOpen(true);
                              }}
                              className="p-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 hover:text-white transition"
                              title="Edit metode ini"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white transition"
                              title="Hapus metode ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>

            {/* MODAL: TAMBAH / EDIT METODE PEMBAYARAN */}
            {isMethodModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-md rounded-2xl bg-[#120726] border border-purple-700/80 p-6 shadow-2xl text-white">
                  <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>{editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}</span>
                  </h3>

                  <form onSubmit={handleSavePaymentMethod} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">
                        Nama Tampilan Metode <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={methodFormData.name || ''}
                        onChange={(e) => setMethodFormData({ ...methodFormData, name: e.target.value })}
                        placeholder="Contoh: DANA Instant, SeaBank, BCA Mobile"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-purple-200 font-semibold mb-1">
                          Kategori Saluran
                        </label>
                        <select
                          value={methodFormData.category || 'ewallet'}
                          onChange={(e) => setMethodFormData({ ...methodFormData, category: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white font-medium"
                        >
                          <option value="qris">QRIS Standar</option>
                          <option value="ewallet">E-Wallet (Dompet Digital)</option>
                          <option value="bank">Bank Transfer / Virtual Account</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-200 font-semibold mb-1">
                          Kode Sistem (ID)
                        </label>
                        <input
                          type="text"
                          required
                          value={methodFormData.code || ''}
                          onChange={(e) => setMethodFormData({ ...methodFormData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                          placeholder="dana / bca / gopay"
                          className="w-full px-3 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                        />
                      </div>
                    </div>

                    {methodFormData.category !== 'qris' && (
                      <>
                        <div>
                          <label className="block text-purple-200 font-semibold mb-1">
                            Nomor Rekening / No. HP E-Wallet <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={methodFormData.accountNumber || ''}
                            onChange={(e) => setMethodFormData({ ...methodFormData, accountNumber: e.target.value })}
                            placeholder="Contoh: 081234567890 atau 8735091823"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                          />
                        </div>

                        <div>
                          <label className="block text-purple-200 font-semibold mb-1">
                            Nama Pemilik Akun (Atas Nama)
                          </label>
                          <input
                            type="text"
                            value={methodFormData.accountHolder || ''}
                            onChange={(e) => setMethodFormData({ ...methodFormData, accountHolder: e.target.value })}
                            placeholder="Contoh: MawwwHub Store / Nama Anda"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">
                        Petunjuk Transfer untuk Pembeli
                      </label>
                      <textarea
                        rows={2}
                        value={methodFormData.instructions || ''}
                        onChange={(e) => setMethodFormData({ ...methodFormData, instructions: e.target.value })}
                        placeholder="Transfer ke rekening di atas dengan nominal pas sesuai kode unik..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080214] border border-purple-800 text-white text-[11px]"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={methodFormData.isActive ?? true}
                          onChange={(e) => setMethodFormData({ ...methodFormData, isActive: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span>Aktifkan Metode Ini</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!methodFormData.isDefault}
                          onChange={(e) => setMethodFormData({ ...methodFormData, isDefault: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span>Jadikan Default</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-purple-900/40">
                      <button
                        type="button"
                        onClick={() => setIsMethodModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md shadow-purple-900/40"
                      >
                        Simpan Metode
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: INTEGRASI KEY DURASI & GENERATOR */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            
            {/* Manual Key Generator Box */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Terbitkan Key Baru Manual (Admin Generator)</span>
              </h3>

              <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Durasi Key</label>
                  <select
                    value={genDuration}
                    onChange={(e) => setGenDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white font-mono-code"
                  >
                    <option value="1">1 Hari (24 Jam)</option>
                    <option value="3">3 Hari</option>
                    <option value="7">7 Hari (1 Minggu)</option>
                    <option value="14">14 Hari (2 Minggu)</option>
                    <option value="30">30 Hari (1 Bulan)</option>
                    <option value="90">90 Hari (3 Bulan)</option>
                    <option value="-1">Lifetime / Permanen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Username Roblox</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mawww_Admin"
                    value={genUsername}
                    onChange={(e) => setGenUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Catatan / Note</label>
                  <input
                    type="text"
                    placeholder="Contoh: Giveaway / VIP User"
                    value={genNote}
                    onChange={(e) => setGenNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isGeneratingKey}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white transition disabled:opacity-50 shadow-md shadow-purple-900/40"
                  >
                    {isGeneratingKey ? 'Membuat...' : '+ Terbitkan Key'}
                  </button>
                </div>
              </form>
            </div>

            {/* Issued Keys Table */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Semua Key yang Diterbitkan</h3>
                  <p className="text-xs text-purple-300/70">Key aktif, kadaluwarsa, dan status HWID pengguna</p>
                </div>
                <div className="flex items-center gap-2">
                  {keys.length > 0 && (
                    <button
                      onClick={handleClearAllKeys}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-800/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Semua Key</span>
                    </button>
                  )}
                  <button
                    onClick={() => loadAllAdminData(token)}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-800/40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {keys.length === 0 ? (
                <div className="text-center py-8 text-xs text-purple-400/60">
                  Belum ada key terdaftar. Terbitkan key pertama Anda di atas.
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-900/50 text-purple-300 font-mono-code">
                        <th className="py-2.5 px-3">License Key</th>
                        <th className="py-2.5 px-3">Durasi</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">User & Note</th>
                        <th className="py-2.5 px-3">Kadaluwarsa</th>
                        <th className="py-2.5 px-3">HWID Lock</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950">
                      {keys.map((k) => (
                        <tr key={k.key} className="hover:bg-purple-950/20">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-mono-code font-bold text-purple-200">
                              <span>{k.key}</span>
                              <button
                                onClick={() => copyToClipboard(k.key, k.key)}
                                className="text-purple-400 hover:text-white"
                                title="Salin Key"
                              >
                                {copiedText === k.key ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {k.durationDays > 0 ? `${k.durationDays} Hari` : 'Permanen'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              k.status === 'active'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-950/70 text-red-400 border border-red-500/30'
                            }`}>
                              {k.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-purple-300">
                            {k.robloxUsername && k.robloxUsername !== 'User' && k.robloxUsername !== 'Guest' ? (
                              <div className="flex items-center gap-1.5 font-semibold text-white">
                                <span className="text-purple-400">🎮</span>
                                <span>{k.robloxUsername}</span>
                              </div>
                            ) : (
                              <span className="text-purple-400/50 italic text-[11px]">Belum execute</span>
                            )}
                            <div className="text-[10px] text-purple-400/60 truncate max-w-[140px] mt-0.5">{k.customerNote || '-'}</div>
                          </td>
                          <td className="py-3 px-3 font-mono-code text-[11px] text-purple-200">
                            {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('id-ID') : 'Lifetime'}
                          </td>
                          <td className="py-3 px-3">
                            {k.hwid ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono-code truncate max-w-[90px]" title={k.hwid}>
                                  🔒 1 Device
                                </span>
                                <button
                                  onClick={() => handleResetHwid(k.key)}
                                  className="px-1.5 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 text-[10px] font-bold transition"
                                  title="Reset kunci HWID agar bisa digunakan di perangkat baru"
                                >
                                  Reset
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-400/80 font-medium">Bebas (Belum Terkunci)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                const loaderCode = `_G.MawwwHubKey = "${k.key}"\nloadstring(game:HttpGet("${window.location.origin}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`;
                                copyToClipboard(loaderCode, `loader-${k.key}`);
                                alert(`Script loader lengkap dengan Key ${k.key} berhasil disalin!`);
                              }}
                              className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded text-[10px] font-semibold mr-1.5 transition"
                              title="Salin Full Loader Script"
                            >
                              Copy Script
                            </button>
                            {k.status === 'active' && (
                              <button
                                onClick={() => handleRevokeKey(k.key)}
                                className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded text-[10px] font-semibold transition"
                                title="Cabut Key"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 6: PENGATURAN UMUM & DESKRIPSI SCRIPT */}
        {activeTab === 'script' && settings && (
          <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Pengaturan Branding & Konten Website</span>
                </h3>
                <p className="text-xs text-purple-300/70">
                  Sesuaikan nama website, teks deskripsi, pengumuman promo, dan link media sosial Anda.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyViolenceDistrictPreset}
                  className="px-3 py-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-600/50 text-xs font-semibold transition flex items-center gap-1.5"
                  title="Otomatis isi form dengan konfigurasi khusus Violence District"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Preset Violence District</span>
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

            {/* Custom Logo Uploader Section */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>Upload Logo Kustom Website</span>
                  </h4>
                  <p className="text-xs text-purple-300/70">
                    Upload file gambar logo Anda (PNG, JPG, WebP, SVG, GIF). Logo akan otomatis tampil di navbar header dan footer.
                  </p>
                </div>
                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Logo Kustom</span>
                  </button>
                )}
              </div>

              {logoUploadMsg && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-xs text-purple-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{logoUploadMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Upload File Input Button */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label
                      htmlFor="logoFileInput"
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600 hover:from-purple-600 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/50 transition active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingLogo ? 'Memproses File...' : 'Pilih File Logo dari Perangkat'}</span>
                    </label>
                    <input
                      id="logoFileInput"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <span className="text-[11px] text-purple-400/80">
                      Format: PNG, JPG, WebP, SVG (Maks. 5 MB)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-purple-300/80 mb-1">
                      Atau Tempel (Paste) URL Gambar Langsung:
                    </label>
                    <input
                      type="text"
                      value={settings.logoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://contoh.com/logo-mawwwhub.png atau data:image/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-xs font-mono-code text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 rounded-xl bg-[#0e0420] border border-purple-900/60 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-2 block">
                    Preview Tampilan Logo
                  </span>
                  
                  {settings.logoUrl ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-500 p-0.5 shadow-xl shadow-purple-600/40 mx-auto overflow-hidden">
                        <img
                          src={settings.logoUrl}
                          alt="Preview Logo"
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold block">
                        ✓ Logo Kustom Terpasang
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-[#14082c] border border-dashed border-purple-700/60 flex items-center justify-center text-purple-400/50 mx-auto">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] text-purple-400/60 block">
                        Menggunakan Icon Terminal Default
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Form & Checkout Settings Section */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Pengaturan Formulir Order & Pembayaran Checkout</span>
                </h4>
                <p className="text-xs text-purple-300/70">
                  Atur apakah pembeli perlu mengisi username Roblox dan nomor WhatsApp saat checkout, serta kontrol tombol simulasi bayar.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Toggle 1: Username Roblox */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Minta Username Roblox Saat Order
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Jika dinonaktifkan (default), pembeli dapat langsung checkout tanpa harus mengetik username Roblox.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={!!settings.enableOrderUsername}
                      onChange={(e) => setSettings({ ...settings, enableOrderUsername: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Toggle 2: WhatsApp Number */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Minta Nomor WhatsApp Saat Order
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Jika dinonaktifkan (default), pembeli tidak perlu mengisi nomor telepon/WhatsApp.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={!!settings.enableOrderWhatsapp}
                      onChange={(e) => setSettings({ ...settings, enableOrderWhatsapp: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Toggle 3: Simulation Payment */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Mode Pembayaran Simulasi (Testing Cepat)
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Tampilkan tombol "⚡ Simulasi Bayar Berhasil" di popup pembayaran agar pembeli/admin dapat menguji aktivasi key tanpa transfer uang asli.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.arexanspay.enableSimulation ?? false}
                      onChange={(e) => setSettings({
                        ...settings,
                        arexanspay: { ...settings.arexanspay, enableSimulation: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Toggle 4: Custom Key Request in Order Form */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Izinkan Pembeli Request Custom Key Sendiri
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Tampilkan kolom input custom key (opsional) saat order, sehingga pembeli bisa membuat nama key VIP mereka sendiri (contoh: VIP-NAME).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.enableCustomKeyOrder ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        enableCustomKeyOrder: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-purple-200 font-semibold mb-1">Nama Website / Hub</label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-purple-200 font-semibold">Target Game Roblox</label>
                  <a
                    href="https://www.roblox.com/id/games/93978595733734/Violence-District"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>Violence District Roblox</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  value={settings.gameName}
                  onChange={(e) => setSettings({ ...settings, gameName: e.target.value })}
                  placeholder="Violence District (Place ID: 93978595733734)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Headline Utama (Hero)</label>
                <input
                  type="text"
                  value={settings.heroHeadline}
                  onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Sub-Headline / Tagline</label>
                <textarea
                  rows={2}
                  value={settings.heroSubheadline}
                  onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Deskripsi Lengkap Script</label>
                <textarea
                  rows={3}
                  value={settings.scriptDescription}
                  onChange={(e) => setSettings({ ...settings, scriptDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Teks Pengumuman / Promo Banner</label>
                <input
                  type="text"
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="🔥 PROMO: Diskon 30% untuk semua paket..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Link Discord Komunitas</label>
                <input
                  type="text"
                  value={settings.discordUrl}
                  onChange={(e) => setSettings({ ...settings, discordUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Link WhatsApp Admin</label>
                <input
                  type="text"
                  value={settings.whatsappContact}
                  onChange={(e) => setSettings({ ...settings, whatsappContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Link Telegram Channel</label>
                <input
                  type="text"
                  value={settings.telegramUrl || ''}
                  onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value })}
                  placeholder="https://t.me/mawwwhub"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Teks Hak Cipta / Footer</label>
                <input
                  type="text"
                  value={settings.footerText || ''}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  placeholder="Powered by ArexansPay Multi-Bank & QRIS Automation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>
            </div>

            {/* STATUS BADGE BAR EDITOR */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Pill / Badge Status Server di Beranda</span>
                </h4>
                <p className="text-xs text-purple-300/70">
                  Label status yang muncul di paling atas hero (contoh: status undetect script dan integrasi payment).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Teks Utama Status</label>
                  <input
                    type="text"
                    value={settings.statusBadgeText || ''}
                    onChange={(e) => setSettings({ ...settings, statusBadgeText: e.target.value })}
                    placeholder="MawwwHub Status: Undetected & Online"
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Warna Lampu Indikator</label>
                  <select
                    value={settings.statusBadgeType || 'online'}
                    onChange={(e) => setSettings({ ...settings, statusBadgeType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  >
                    <option value="online">🟢 Hijau (Online & Undetected)</option>
                    <option value="updating">🟡 Kuning (Sedang Update / Roblox Maintenance)</option>
                    <option value="maintenance">🔴 Merah (Maintenance Sistem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Teks Keterangan Sub</label>
                  <input
                    type="text"
                    value={settings.statusSubtext || ''}
                    onChange={(e) => setSettings({ ...settings, statusSubtext: e.target.value })}
                    placeholder="ArexansPay Multi-Payment Aktif"
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  />
                </div>
              </div>
            </div>

            {/* SCRIPT FEATURES LIST EDITOR */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-purple-400" />
                  <span>Daftar Poin Fitur Unggulan Script</span>
                </h4>
                <p className="text-xs text-purple-300/70">
                  Daftar fitur ini tampil di kotak keterangan di atas tabel paket. Anda bisa menambah atau menghapus poin fitur.
                </p>
              </div>

              {/* Add New Feature */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  placeholder="Ketik poin fitur baru (misal: ⚡ Auto Raid & Fast Dungeon)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Feature Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {(settings.scriptFeatures || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e0420] border border-purple-900/60 text-xs text-purple-200"
                  >
                    <span className="flex-1 mr-2">{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 transition"
                      title="Hapus fitur ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO BENEFIT PILLS EDITOR */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-400" />
                  <span>Kartu Highlight Keunggulan Hero (4 Kotak Bawah)</span>
                </h4>
                <p className="text-xs text-purple-300/70">
                  Ubah judul, icon, dan deskripsi pada 4 kartu highlight di bagian bawah hero.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(settings.heroPills || [
                  { id: 'pill-1', icon: 'zap', title: 'Instan Delivery', description: 'Key & loadstring langsung terbit hitungan detik setelah bayar.' },
                  { id: 'pill-2', icon: 'shield', title: 'Bypass Anti-Cheat', description: 'Perlindungan keamanan tinggi aman dari ban Roblox.' },
                  { id: 'pill-3', icon: 'check', title: 'Multi-Payment Otomatis', description: 'Mendukung QRIS, DANA, GoPay, OVO, BCA, BRI, Mandiri, SeaBank.' },
                  { id: 'pill-4', icon: 'sparkles', title: 'Universal Support', description: 'Lancar untuk Delta, Codex, Arceus X, Solara & Wave.' }
                ]).map((pill, pIdx) => (
                  <div key={pill.id || pIdx} className="p-3.5 rounded-xl bg-[#0e0420] border border-purple-900/60 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <select
                        value={pill.icon}
                        onChange={(e) => {
                          const updated = [...(settings.heroPills || [])];
                          if (updated[pIdx]) {
                            updated[pIdx].icon = e.target.value as any;
                            setSettings({ ...settings, heroPills: updated });
                          }
                        }}
                        className="px-2 py-1 rounded bg-[#06010e] border border-purple-800 text-purple-300 text-[11px]"
                      >
                        <option value="zap">⚡ Zap</option>
                        <option value="shield">🛡️ Shield</option>
                        <option value="check">✓ Check</option>
                        <option value="sparkles">✨ Sparkles</option>
                      </select>

                      <input
                        type="text"
                        value={pill.title}
                        onChange={(e) => {
                          const updated = [...(settings.heroPills || [])];
                          if (updated[pIdx]) {
                            updated[pIdx].title = e.target.value;
                            setSettings({ ...settings, heroPills: updated });
                          }
                        }}
                        placeholder="Judul Keunggulan"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-[#06010e] border border-purple-800 text-white font-bold"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={pill.description}
                      onChange={(e) => {
                        const updated = [...(settings.heroPills || [])];
                        if (updated[pIdx]) {
                          updated[pIdx].description = e.target.value;
                          setSettings({ ...settings, heroPills: updated });
                        }
                      }}
                      placeholder="Deskripsi singkat..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#06010e] border border-purple-800 text-purple-200 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK TOOLS BANNER EDITOR */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Banner Quick Tools (Box Bantuan Bawah Beranda)</span>
                </h4>
                <p className="text-xs text-purple-300/70">
                  Kotak interaktif di bawah katalog yang memuat tombol Cek Validasi Key dan Tutorial Executor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Judul Quick Tools</label>
                  <input
                    type="text"
                    value={settings.quickToolsTitle || ''}
                    onChange={(e) => setSettings({ ...settings, quickToolsTitle: e.target.value })}
                    placeholder="Sudah Punya Key MawwwHub?"
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Deskripsi Box</label>
                  <input
                    type="text"
                    value={settings.quickToolsDesc || ''}
                    onChange={(e) => setSettings({ ...settings, quickToolsDesc: e.target.value })}
                    placeholder="Cek sisa masa aktif key Anda atau pelajari cara eksekusi script di HP Android dan PC."
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Teks Tombol 1 (Cek Key)</label>
                  <input
                    type="text"
                    value={settings.quickToolsBtn1Text || ''}
                    onChange={(e) => setSettings({ ...settings, quickToolsBtn1Text: e.target.value })}
                    placeholder="Cek Validasi Key"
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Teks Tombol 2 (Tutorial)</label>
                  <input
                    type="text"
                    value={settings.quickToolsBtn2Text || ''}
                    onChange={(e) => setSettings({ ...settings, quickToolsBtn2Text: e.target.value })}
                    placeholder="Tutorial Executor"
                    className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
