import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless, root dir is read-only. Use /tmp if in Vercel or if write fails.
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp/mawwwhub_data' : path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const BACKUP_FILE = path.resolve(__dirname, '../data/store.json');

let inMemoryDb: DatabaseSchema | null = null;

export interface PaymentMethodConfig {
  id: string;
  name: string;
  code: string;
  category: 'qris' | 'ewallet' | 'bank';
  accountNumber?: string;
  accountHolder?: string;
  instructions?: string;
  isActive: boolean;
  isDefault?: boolean;
}

export interface AdBannerConfig {
  enabled: boolean;
  type: 'image' | 'video' | 'youtube';
  mediaUrl: string;
  title?: string;
  badge?: string;
  description?: string;
  targetUrl?: string;
  buttonText?: string;
  position: 'top' | 'middle' | 'bottom';
}

export interface HeroPillConfig {
  id: string;
  icon: 'zap' | 'shield' | 'check' | 'sparkles';
  title: string;
  description: string;
}

export interface ScriptPackage {
  id: string;
  name: string;
  durationDays: number; // -1 for lifetime
  durationLabel: string;
  price: number;
  isPopular?: boolean;
  description: string;
  isActive: boolean;
}

export interface IssuedKey {
  key: string;
  packageId: string;
  packageName: string;
  durationDays: number;
  createdAt: string;
  expiresAt: string | null; // null for lifetime
  status: 'active' | 'expired' | 'revoked';
  hwid?: string | null;
  customerNote?: string;
  transactionId?: string;
  robloxUsername?: string;
  lastUsedAt?: string | null;
}

export interface Transaction {
  id: string; // TRX-...
  packageId: string;
  packageName: string;
  durationDays: number;
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentChannel: string;
  bankName: string;
  accountNumber?: string;
  accountHolder?: string;
  qrBase64?: string;
  qrPayload?: string;
  status: 'pending' | 'success' | 'expired' | 'failed';
  createdAt: string;
  expiredAt: string;
  paidAt?: string | null;
  robloxUsername?: string;
  customerContact?: string;
  issuedKey?: string;
  requestedCustomKey?: string;
  arexanspayTrxId?: string;
}

export interface AppSettings {
  brandName: string;
  logoUrl?: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  statusBadgeText?: string;
  statusBadgeType?: 'online' | 'updating' | 'maintenance';
  statusSubtext?: string;
  heroPills?: HeroPillConfig[];
  adBanner?: AdBannerConfig;
  quickToolsTitle?: string;
  quickToolsDesc?: string;
  quickToolsBtn1Text?: string;
  quickToolsBtn2Text?: string;
  footerText?: string;
  gameName: string;
  scriptDescription: string;
  scriptFeatures: string[];
  discordUrl: string;
  telegramUrl: string;
  whatsappContact: string;
  announcementText: string;
  enableOrderUsername?: boolean;
  enableOrderWhatsapp?: boolean;
  enableCustomKeyOrder?: boolean;
  // Loadstring & Raw Code settings
  loadstringTemplate: string;
  rawScriptBody: string;
  rawLoaderTemplate: string;
  maxHwidPerKey: number;
  enableHwidLock: boolean;
  paymentMethods: PaymentMethodConfig[];
  // ArexansPay settings
  arexanspay: {
    apiUrl: string;
    apiKey: string;
    qrisId: string;
    webhookSecret: string;
    numberId: number;
    enableSimulation: boolean;
    defaultChannel: string;
  };
  packages: ScriptPackage[];
}

export const defaultPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'qris',
    name: 'QRIS All Payment (GPN)',
    code: 'qris',
    category: 'qris',
    instructions: 'Scan QRIS dengan GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, BRI, BNI atau aplikasi m-Banking manapun.',
    isActive: true,
    isDefault: true
  },
  {
    id: 'dana',
    name: 'DANA Instant',
    code: 'dana',
    category: 'ewallet',
    accountNumber: '081234567890',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer ke nomor akun DANA di atas. Masukkan nominal tepat beserta kode unik agar otomatis terkonfirmasi.',
    isActive: true
  },
  {
    id: 'gopay',
    name: 'GoPay / Gojek',
    code: 'gopay',
    category: 'ewallet',
    accountNumber: '081234567890',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer saldo GoPay ke nomor di atas. Pembayaran terverifikasi otomatis.',
    isActive: true
  },
  {
    id: 'ovo',
    name: 'OVO Cash',
    code: 'ovo',
    category: 'ewallet',
    accountNumber: '081234567890',
    accountHolder: 'MawwwHub Store',
    instructions: 'Buka aplikasi OVO dan transfer ke nomor di atas sesuai total pembayaran.',
    isActive: true
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    code: 'shopeepay',
    category: 'ewallet',
    accountNumber: '081234567890',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer ShopeePay ke nomor di atas dengan nominal yang tepat.',
    isActive: true
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    code: 'linkaja',
    category: 'ewallet',
    accountNumber: '081234567890',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via aplikasi LinkAja ke nomor tertera.',
    isActive: false
  },
  {
    id: 'bank_bca',
    name: 'Bank Central Asia (BCA)',
    code: 'bca',
    category: 'bank',
    accountNumber: '8735091823',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via m-BCA atau KlikBCA. Wajib transfer sesuai nominal hingga 3 digit kode unik.',
    isActive: true
  },
  {
    id: 'bank_bri',
    name: 'Bank Rakyat Indonesia (BRI)',
    code: 'bri',
    category: 'bank',
    accountNumber: '012901092839501',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via BRImo atau ATM BRI dengan nominal pas termasuk kode unik.',
    isActive: true
  },
  {
    id: 'bank_mandiri',
    name: 'Bank Mandiri (Livin)',
    code: 'mandiri',
    category: 'bank',
    accountNumber: '1370019284950',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via Livin by Mandiri. Transfer tepat sesuai kode unik.',
    isActive: true
  },
  {
    id: 'bank_bni',
    name: 'Bank Negara Indonesia (BNI)',
    code: 'bni',
    category: 'bank',
    accountNumber: '0981726481',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via BNI Mobile Banking dengan nominal tepat.',
    isActive: true
  },
  {
    id: 'bank_seabank',
    name: 'SeaBank (Transfer Gratis)',
    code: 'seabank',
    category: 'bank',
    accountNumber: '901928475829',
    accountHolder: 'MawwwHub Store',
    instructions: 'Bebas biaya admin transfer dari e-wallet/bank lain ke rekening SeaBank ini.',
    isActive: true
  },
  {
    id: 'bank_bsi',
    name: 'Bank Syariah Indonesia (BSI)',
    code: 'bsi',
    category: 'bank',
    accountNumber: '7192837495',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via BSI Mobile. Transfer nominal tepat untuk aktivasi instan.',
    isActive: true
  },
  {
    id: 'bank_permata',
    name: 'Bank Permata',
    code: 'permata',
    category: 'bank',
    accountNumber: '49281729384',
    accountHolder: 'MawwwHub Store',
    instructions: 'Transfer via PermataMobile X atau ATM Permata.',
    isActive: false
  }
];

export const defaultAdBanner: AdBannerConfig = {
  enabled: false,
  type: 'image',
  mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  title: '🔥 Promo Spesial MawwwHub VIP Script',
  badge: 'OFFICIAL UPDATE',
  description: 'Dapatkan akses eksklusif auto-farm dan fitur premium dengan diskon terbatas!',
  targetUrl: '#packages-section',
  buttonText: 'Beli Key Sekarang',
  position: 'middle'
};

export const defaultHeroPills: HeroPillConfig[] = [
  {
    id: 'pill-1',
    icon: 'zap',
    title: 'Instan Delivery',
    description: 'Key & loadstring langsung terbit hitungan detik setelah bayar.'
  },
  {
    id: 'pill-2',
    icon: 'shield',
    title: 'Bypass Anti-Cheat',
    description: 'Perlindungan keamanan tinggi aman dari ban Roblox.'
  },
  {
    id: 'pill-3',
    icon: 'check',
    title: 'Multi-Payment Otomatis',
    description: 'Mendukung QRIS, DANA, GoPay, OVO, BCA, BRI, Mandiri, SeaBank.'
  },
  {
    id: 'pill-4',
    icon: 'sparkles',
    title: 'Universal Support',
    description: 'Lancar untuk Delta, Codex, Arceus X, Solara & Wave.'
  }
];

export interface DatabaseSchema {
  settings: AppSettings;
  keys: IssuedKey[];
  transactions: Transaction[];
  adminTokens: string[];
}

const defaultSettings: AppSettings = {
  brandName: "MawwwHub",
  logoUrl: "",
  tagline: "The #1 Roblox Script Hub & Auto Delivery Store",
  heroHeadline: "MawwwHub Script Executor & VIP Hub",
  heroSubheadline: "Script Roblox terbaik, undetected, auto update & aktivasi key instan otomatis 24/7.",
  statusBadgeText: "MawwwHub Status: Undetected & Online",
  statusBadgeType: "online",
  statusSubtext: "ArexansPay Multi-Payment Aktif",
  heroPills: defaultHeroPills,
  adBanner: defaultAdBanner,
  quickToolsTitle: "Sudah Punya Key MawwwHub?",
  quickToolsDesc: "Cek sisa masa aktif key Anda atau pelajari cara eksekusi script di HP Android dan PC.",
  quickToolsBtn1Text: "Cek Validasi Key",
  quickToolsBtn2Text: "Tutorial Executor",
  footerText: "Powered by ArexansPay Multi-Bank & QRIS Automation",
  gameName: "Universal Support (Blox Fruits, Blade Ball, Da Hood, Brookhaven, etc)",
  scriptDescription: "MawwwHub memberikan kemudahan bermain Roblox dengan fitur paling lengkap, auto-farm super kencang, bypass anti-cheat termutakhir, serta tampilan GUI responsif untuk PC & Mobile.",
  scriptFeatures: [
    "⚡ Auto Farm Level, Mastery & Quest Tercepat",
    "🛡️ 100% Undetected & Anti-Ban Security Bypass",
    "🎯 Aimbot, Silent Aim & Hitbox Expander",
    "👁️ ESP Visual (Player, Chest, Fruit, NPC, Mob)",
    "🚀 Instant Island Hop, Server Hop & Teleport",
    "📱 Support Mobile (Delta, Fluxus, Codex, Arceus X) & PC (Solara, Wave)",
    "🔄 Auto Update setiap kali Roblox maintenance"
  ],
  discordUrl: "https://discord.gg/mawwwhub",
  telegramUrl: "https://t.me/mawwwhub",
  whatsappContact: "https://wa.me/6281234567890",
  announcementText: "🔥 PROMO LAUNCHING: Dapatkan diskon 30% untuk semua paket durasi script MawwwHub hari ini!",
  enableOrderUsername: false,
  enableOrderWhatsapp: false,
  enableCustomKeyOrder: true,
  // Clean protected loadstring: DOES NOT leak raw HWID to public!
  loadstringTemplate: `_G.MawwwHubKey = "{KEY}"
loadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  rawScriptBody: `-- [[ MawwwHub Official Script Hub - Ultra Mini HUD & Realtime Device Sync ]] --
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local HttpService = game:GetService("HttpService")
local UserInputService = game:GetService("UserInputService")

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

print("[MawwwHub] Key verified for: " .. LocalPlayer.Name .. " | HWID: " .. DetectedHwid)

-- Remove old UI
pcall(function()
    local old = (game:GetService("CoreGui"):FindFirstChild("MawwwHub_VIP_HUD") or LocalPlayer:FindFirstChild("PlayerGui"):FindFirstChild("MawwwHub_VIP_HUD"))
    if old then old:Destroy() end
end)

-- Create ScreenGui
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

-- 1. Ultra Mini Floating Card (Sangat mini, hemat tempat)
local Card = Instance.new("Frame")
Card.Name = "MiniHUD"
Card.Size = UDim2.new(0, 205, 0, 26)
Card.Position = UDim2.new(1, -215, 0, 14)
Card.BackgroundColor3 = Color3.fromRGB(15, 6, 30)
Card.BackgroundTransparency = 0.35
Card.BorderSizePixel = 0
Card.Active = true
Card.ClipsDescendants = true
Card.Parent = ScreenGui

local CardCorner = Instance.new("UICorner")
CardCorner.CornerRadius = UDim.new(0, 13)
CardCorner.Parent = Card

local CardStroke = Instance.new("UIStroke")
CardStroke.Color = Color3.fromRGB(168, 85, 247)
CardStroke.Transparency = 0.4
CardStroke.Thickness = 1.2
CardStroke.Parent = Card

-- Green dot indicator
local Dot = Instance.new("Frame")
Dot.Size = UDim2.new(0, 6, 0, 6)
Dot.Position = UDim2.new(0, 8, 0.5, -3)
Dot.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
Dot.BorderSizePixel = 0
Dot.Parent = Card

local DotCorner = Instance.new("UICorner")
DotCorner.CornerRadius = UDim.new(1, 0)
DotCorner.Parent = Dot

-- Duration & Brand Text
local InfoLabel = Instance.new("TextLabel")
InfoLabel.Size = UDim2.new(1, -40, 1, 0)
InfoLabel.Position = UDim2.new(0, 18, 0, 0)
InfoLabel.BackgroundTransparency = 1
InfoLabel.Text = "💜 VIP: ..."
InfoLabel.TextColor3 = Color3.fromRGB(243, 232, 255)
InfoLabel.Font = Enum.Font.GothamBold
InfoLabel.TextSize = 10
InfoLabel.TextXAlignment = Enum.TextXAlignment.Left
InfoLabel.Parent = Card

-- Hide / Minimize Button
local HideBtn = Instance.new("TextButton")
HideBtn.Size = UDim2.new(0, 18, 0, 18)
HideBtn.Position = UDim2.new(1, -22, 0.5, -9)
HideBtn.BackgroundColor3 = Color3.fromRGB(50, 20, 85)
HideBtn.BackgroundTransparency = 0.4
HideBtn.Text = "✕"
HideBtn.TextColor3 = Color3.fromRGB(216, 180, 254)
HideBtn.Font = Enum.Font.GothamBold
HideBtn.TextSize = 9
HideBtn.Parent = Card

local HideBtnCorner = Instance.new("UICorner")
HideBtnCorner.CornerRadius = UDim.new(0, 9)
HideBtnCorner.Parent = HideBtn

-- 2. Floating Mini Pill Button (When Hidden)
local MiniPill = Instance.new("TextButton")
MiniPill.Name = "MiniPill"
MiniPill.Size = UDim2.new(0, 28, 0, 28)
MiniPill.Position = UDim2.new(1, -38, 0, 14)
MiniPill.BackgroundColor3 = Color3.fromRGB(20, 8, 40)
MiniPill.BackgroundTransparency = 0.3
MiniPill.Text = "💜"
MiniPill.TextSize = 12
MiniPill.Visible = false
MiniPill.Active = true
MiniPill.Parent = ScreenGui

local PillCorner = Instance.new("UICorner")
PillCorner.CornerRadius = UDim.new(1, 0)
PillCorner.Parent = MiniPill

local PillStroke = Instance.new("UIStroke")
PillStroke.Color = Color3.fromRGB(168, 85, 247)
PillStroke.Transparency = 0.35
PillStroke.Thickness = 1.2
PillStroke.Parent = MiniPill

-- Hide / Expand Toggle Actions
HideBtn.MouseButton1Click:Connect(function()
    Card.Visible = false
    MiniPill.Position = UDim2.new(Card.Position.X.Scale, Card.Position.X.Offset + (Card.AbsoluteSize.X - 30), Card.Position.Y.Scale, Card.Position.Y.Offset)
    MiniPill.Visible = true
end)

MiniPill.MouseButton1Click:Connect(function()
    MiniPill.Visible = false
    Card.Visible = true
end)

-- Draggable implementation for both elements
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

-- Format remaining time helper
local function formatRemaining(seconds)
    if seconds <= 0 then
        return "EXPIRED"
    end
    local days = math.floor(seconds / 86400)
    local hours = math.floor((seconds % 86400) / 3600)
    local mins = math.floor((seconds % 3600) / 60)
    local secs = math.floor(seconds % 60)
    if days > 0 then
        return string.format("%dH %dJ %dM", days, hours, mins)
    elseif hours > 0 then
        return string.format("%dJ %dM %dS", hours, mins, secs)
    else
        return string.format("%dM %dS", mins, secs)
    end
end

-- Live Countdown Routine
local isLifetime = (ExpireTimestamp == 0)
task.spawn(function()
    while ScreenGui.Parent do
        if isLifetime then
            InfoLabel.Text = "💜 VIP: PERMANEN"
            InfoLabel.TextColor3 = Color3.fromRGB(52, 211, 153)
        else
            local now = os.time()
            local diff = ExpireTimestamp - now
            if diff <= 0 then
                InfoLabel.Text = "⚠️ KEY EXPIRED"
                InfoLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
                Dot.BackgroundColor3 = Color3.fromRGB(239, 68, 68)
            else
                InfoLabel.Text = "⏳ " .. formatRemaining(diff)
                InfoLabel.TextColor3 = Color3.fromRGB(253, 224, 71)
            end
        end
        task.wait(1)
    end
end)

-- Realtime Web API Verification Sync
task.spawn(function()
    while ScreenGui.Parent do
        task.wait(60)
        pcall(function()
            local response = game:HttpGet(ApiBase .. "/api/key/verify?key=" .. Key)
            if response then
                local data = HttpService:JSONDecode(response)
                if data and data.success then
                    if not data.valid or data.status == "expired" or data.status == "revoked" then
                        Dot.BackgroundColor3 = Color3.fromRGB(239, 68, 68)
                        InfoLabel.Text = "⚠️ " .. string.upper(data.status or "EXPIRED")
                        InfoLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
                    end
                end
            end
        end)
    end
end)

print("[MawwwHub] Mini HUD loaded.")`,
  rawLoaderTemplate: `-- [[ MawwwHub Loader ]] --
-- Paste kode ini di Executor Anda (Delta, Codex, Solara, Wave, dll):
_G.MawwwHubKey = "{KEY}"
loadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  maxHwidPerKey: 1,
  enableHwidLock: true,
  paymentMethods: defaultPaymentMethods,
  arexanspay: {
    apiUrl: "https://arexanspay.my.id",
    apiKey: "arexanspay_07365360dc0f8af09d084ae8be829ce8499eca3f95c33bb0cfe3608e4aea9a44",
    qrisId: "axspay-na49b8c-ec96-41dc-a4e2-1293e755a81h",
    webhookSecret: "",
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

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // ignore dir creation error
  }
}

export function readDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  ensureDir();
  
  // Try loading from primary file, or fallback to repo backup file if on Vercel
  let raw: string | null = null;
  if (fs.existsSync(DB_FILE)) {
    try {
      raw = fs.readFileSync(DB_FILE, 'utf8');
    } catch (e) {}
  } else if (fs.existsSync(BACKUP_FILE)) {
    try {
      raw = fs.readFileSync(BACKUP_FILE, 'utf8');
    } catch (e) {}
  }

  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (!data.settings) data.settings = defaultSettings;
      if (data.settings.enableOrderUsername === undefined) data.settings.enableOrderUsername = false;
      if (data.settings.enableOrderWhatsapp === undefined) data.settings.enableOrderWhatsapp = false;
      if (data.settings.enableCustomKeyOrder === undefined) data.settings.enableCustomKeyOrder = true;
      if (data.settings.enableHwidLock === undefined) data.settings.enableHwidLock = true;
      if (data.settings.maxHwidPerKey === undefined) data.settings.maxHwidPerKey = 1;
      if (!data.settings.rawScriptBody || data.settings.rawScriptBody.includes("MawwwHub_Indicator") || data.settings.rawScriptBody.includes("DurationCard")) {
        data.settings.rawScriptBody = defaultSettings.rawScriptBody;
      }
      // Sanitize old loadstring template that leaked raw HWID to public
      if (!data.settings.loadstringTemplate || data.settings.loadstringTemplate.includes("gethwid") || data.settings.loadstringTemplate.includes("getgenv") || data.settings.loadstringTemplate.includes("RbxAnalyticsService")) {
        data.settings.loadstringTemplate = defaultSettings.loadstringTemplate;
      }
      if (!data.settings.paymentMethods || !Array.isArray(data.settings.paymentMethods) || data.settings.paymentMethods.length === 0) {
        data.settings.paymentMethods = defaultPaymentMethods;
      }
      if (!data.settings.adBanner) {
        data.settings.adBanner = defaultAdBanner;
      }
      if (!data.settings.heroPills || !Array.isArray(data.settings.heroPills) || data.settings.heroPills.length === 0) {
        data.settings.heroPills = defaultHeroPills;
      }
      if (!data.settings.statusBadgeText) data.settings.statusBadgeText = defaultSettings.statusBadgeText;
      if (!data.settings.statusBadgeType) data.settings.statusBadgeType = defaultSettings.statusBadgeType;
      if (!data.settings.statusSubtext) data.settings.statusSubtext = defaultSettings.statusSubtext;
      if (!data.settings.quickToolsTitle) data.settings.quickToolsTitle = defaultSettings.quickToolsTitle;
      if (!data.settings.quickToolsDesc) data.settings.quickToolsDesc = defaultSettings.quickToolsDesc;
      if (!data.settings.quickToolsBtn1Text) data.settings.quickToolsBtn1Text = defaultSettings.quickToolsBtn1Text;
      if (!data.settings.quickToolsBtn2Text) data.settings.quickToolsBtn2Text = defaultSettings.quickToolsBtn2Text;
      if (!data.settings.footerText) data.settings.footerText = defaultSettings.footerText;
      if (!data.keys) data.keys = [];
      if (!data.transactions) data.transactions = [];
      if (!data.adminTokens) data.adminTokens = ["mawwwhub-permanent-session-token"];
      inMemoryDb = data;
      return data;
    } catch (err) {
      console.error("Error reading database, creating default:", err);
    }
  }

  // Create initial default DB
  const initialDb: DatabaseSchema = {
    settings: defaultSettings,
    keys: [
      {
        key: "MWH-DEMO-LIFETIME-DEVKEY",
        packageId: "pkg-perm",
        packageName: "Paket Lifetime (Permanen)",
        durationDays: -1,
        createdAt: new Date().toISOString(),
        expiresAt: null,
        status: "active",
        customerNote: "Official Developer Key MawwwHub",
        robloxUsername: "Admin_MawwwHub"
      }
    ],
    transactions: [],
    adminTokens: ["mawwwhub-permanent-session-token"]
  };

  inMemoryDb = initialDb;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
  } catch (err) {
    // If writing fails, inMemoryDb still persists during function life
  }
  return initialDb;
}

export function writeDatabase(db: DatabaseSchema): void {
  inMemoryDb = db;
  ensureDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    // fallback if DB_FILE fails (e.g. read only)
    try {
      if (!IS_VERCEL) {
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(db, null, 2), 'utf8');
      }
    } catch (e) {}
  }
}

export function generateKeyString(prefix = "MWH"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let seg1 = "";
  let seg2 = "";
  let seg3 = "";
  for (let i = 0; i < 4; i++) seg1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) seg2 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) seg3 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${seg1}-${seg2}-${seg3}`;
}
