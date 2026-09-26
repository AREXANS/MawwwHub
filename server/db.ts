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

export const DUMMY_ACCOUNT_NUMBERS = [
  '081234567890',
  '8735091823',
  '012901092839501',
  '1370019284950',
  '0981726481',
  '901928475829',
  '7192837495',
  '49281729384'
];

export const DUMMY_API_KEY = 'arexanspay_07365360dc0f8af09d084ae8be829ce8499eca3f95c33bb0cfe3608e4aea9a44';
export const DUMMY_QRIS_ID = 'axspay-na49b8c-ec96-41dc-a4e2-1293e755a81h';
export const DUMMY_DEV_KEY = 'MWH-DEMO-LIFETIME-DEVKEY';

export const defaultDemoKey: IssuedKey = {
  key: DUMMY_DEV_KEY,
  packageId: 'pkg-perm',
  packageName: 'Paket Lifetime (Permanen)',
  durationDays: -1,
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: null,
  status: 'active',
  hwid: null,
  customerNote: 'Default Demo Key untuk Testing Admin',
  robloxUsername: 'Mawww_Admin'
};

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
    title: 'Violence District VIP',
    description: 'Eksklusif untuk Roblox Violence District, support PC & Mobile.'
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
  tagline: "The #1 Roblox Violence District Script Hub & Auto Delivery Store",
  heroHeadline: "MawwwHub VIP - Violence District Script",
  heroSubheadline: "Script resmi Roblox Violence District terlengkap: Auto Scavenge Scrap, ESP Monster & Loot, Combat Silent Aim, Infinite Stamina, dan 100% Undetected.",
  statusBadgeText: "Violence District Hub: Undetected & Online",
  statusBadgeType: "online",
  statusSubtext: "VIP Script Undetected",
  heroPills: defaultHeroPills,
  adBanner: defaultAdBanner,
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
  // Clean protected loadstring: DOES NOT leak raw HWID to public!
  loadstringTemplate: `_G.MawwwHubKey = "{KEY}"
loadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  rawScriptBody: `-- [[ MawwwHub Official Script Hub - Violence District VIP Edition ]] --
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

-- VIP Hub Load Notification
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "MawwwHub Loaded!",
        Text = "Violence District VIP Hub aktif! Klik icon 💜 untuk buka menu.",
        Duration = 6
    })
end)

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

print("[MawwwHub] Violence District VIP script loaded successfully.")`,
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
      let modified = false;
      if (!data.settings) {
        data.settings = JSON.parse(JSON.stringify(defaultSettings));
        modified = true;
      }
      if (data.settings.enableOrderUsername === undefined) data.settings.enableOrderUsername = false;
      if (data.settings.enableOrderWhatsapp === undefined) data.settings.enableOrderWhatsapp = false;
      if (data.settings.enableCustomKeyOrder === undefined) data.settings.enableCustomKeyOrder = true;
      if (data.settings.enableHwidLock === undefined) data.settings.enableHwidLock = true;
      if (data.settings.maxHwidPerKey === undefined) data.settings.maxHwidPerKey = 1;
      if (!data.settings.rawScriptBody || data.settings.rawScriptBody.includes("MawwwHub_Indicator") || data.settings.rawScriptBody.includes("DurationCard")) {
        data.settings.rawScriptBody = defaultSettings.rawScriptBody;
        modified = true;
      }
      // Sanitize old loadstring template that leaked raw HWID to public
      if (!data.settings.loadstringTemplate || data.settings.loadstringTemplate.includes("gethwid") || data.settings.loadstringTemplate.includes("getgenv") || data.settings.loadstringTemplate.includes("RbxAnalyticsService")) {
        data.settings.loadstringTemplate = defaultSettings.loadstringTemplate;
        modified = true;
      }
      if (!data.settings.paymentMethods || !Array.isArray(data.settings.paymentMethods) || data.settings.paymentMethods.length === 0) {
        data.settings.paymentMethods = JSON.parse(JSON.stringify(defaultPaymentMethods));
        modified = true;
      } else {
        const hasAnyAccountNumber = data.settings.paymentMethods.some(
          (m: PaymentMethodConfig) => m.category !== 'qris' && m.accountNumber && m.accountNumber.trim().length > 0
        );
        if (!hasAnyAccountNumber) {
          data.settings.paymentMethods = JSON.parse(JSON.stringify(defaultPaymentMethods));
          modified = true;
        }
      }

      if (!data.settings.arexanspay) {
        data.settings.arexanspay = JSON.parse(JSON.stringify(defaultSettings.arexanspay));
        modified = true;
      } else {
        if (!data.settings.arexanspay.apiUrl) {
          data.settings.arexanspay.apiUrl = defaultSettings.arexanspay.apiUrl;
          modified = true;
        }
        if (!data.settings.arexanspay.apiKey && !data.settings.arexanspay.qrisId && !data.settings.arexanspay.webhookSecret) {
          data.settings.arexanspay = JSON.parse(JSON.stringify(defaultSettings.arexanspay));
          modified = true;
        }
        if (data.settings.arexanspay.enableSimulation === undefined) {
          data.settings.arexanspay.enableSimulation = true;
          modified = true;
        }
      }

      if (!data.settings.packages || !Array.isArray(data.settings.packages) || data.settings.packages.length === 0) {
        data.settings.packages = JSON.parse(JSON.stringify(defaultSettings.packages));
        modified = true;
      }
      if (!data.settings.scriptFeatures || !Array.isArray(data.settings.scriptFeatures) || data.settings.scriptFeatures.length === 0) {
        data.settings.scriptFeatures = JSON.parse(JSON.stringify(defaultSettings.scriptFeatures));
        modified = true;
      }
      if (!data.settings.adBanner) {
        data.settings.adBanner = defaultAdBanner;
      }
      if (!data.settings.heroPills || !Array.isArray(data.settings.heroPills) || data.settings.heroPills.length === 0) {
        data.settings.heroPills = defaultHeroPills;
      }
      if (!data.settings.brandName) data.settings.brandName = defaultSettings.brandName;
      if (!data.settings.gameName) data.settings.gameName = defaultSettings.gameName;
      if (!data.settings.heroHeadline) data.settings.heroHeadline = defaultSettings.heroHeadline;
      if (!data.settings.heroSubheadline) data.settings.heroSubheadline = defaultSettings.heroSubheadline;
      if (!data.settings.scriptDescription) data.settings.scriptDescription = defaultSettings.scriptDescription;
      if (!data.settings.announcementText) data.settings.announcementText = defaultSettings.announcementText;
      if (!data.settings.discordUrl) data.settings.discordUrl = defaultSettings.discordUrl;
      if (!data.settings.telegramUrl) data.settings.telegramUrl = defaultSettings.telegramUrl;
      if (!data.settings.whatsappContact) data.settings.whatsappContact = defaultSettings.whatsappContact;
      if (!data.settings.statusBadgeText) data.settings.statusBadgeText = defaultSettings.statusBadgeText;
      if (!data.settings.statusBadgeType) data.settings.statusBadgeType = defaultSettings.statusBadgeType;
      if (!data.settings.statusSubtext) data.settings.statusSubtext = defaultSettings.statusSubtext;
      if (!data.settings.quickToolsTitle) data.settings.quickToolsTitle = defaultSettings.quickToolsTitle;
      if (!data.settings.quickToolsDesc) data.settings.quickToolsDesc = defaultSettings.quickToolsDesc;
      if (!data.settings.quickToolsBtn1Text) data.settings.quickToolsBtn1Text = defaultSettings.quickToolsBtn1Text;
      if (!data.settings.quickToolsBtn2Text) data.settings.quickToolsBtn2Text = defaultSettings.quickToolsBtn2Text;
      if (!data.settings.footerText) data.settings.footerText = defaultSettings.footerText;
      if (!data.keys || !Array.isArray(data.keys) || data.keys.length === 0) {
        data.keys = [JSON.parse(JSON.stringify(defaultDemoKey))];
        modified = true;
      }
      if (!data.transactions || !Array.isArray(data.transactions)) data.transactions = [];
      if (!data.adminTokens) data.adminTokens = ["mawwwhub-permanent-session-token"];
      inMemoryDb = data;
      if (modified) {
        writeDatabase(data);
      }
      return data;
    } catch (err) {
      console.error("Error reading database, creating default:", err);
    }
  }

  // Create initial default DB (preserves /dev settings, no old order data)
  const initialDb: DatabaseSchema = {
    settings: JSON.parse(JSON.stringify(defaultSettings)),
    keys: [JSON.parse(JSON.stringify(defaultDemoKey))],
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

export function resetAllDatabaseData(): DatabaseSchema {
  const current = readDatabase();
  // Hanya hapus data bekas orderan (transactions & keys dari orderan), jangan hapus data pengaturan di /dev
  const nonOrderKeys = (current.keys || []).filter(k => {
    if (k.transactionId) return false;
    const note = (k.customerNote || '').toLowerCase();
    if (
      note.includes('trx-') ||
      note.includes('simulated') ||
      note.includes('arexanspay') ||
      note.includes('auto issued') ||
      note.includes('custom key approved')
    ) {
      return false;
    }
    return true;
  });

  const cleanDb: DatabaseSchema = {
    settings: current.settings,
    keys: nonOrderKeys.length > 0 ? nonOrderKeys : [JSON.parse(JSON.stringify(defaultDemoKey))],
    transactions: [],
    adminTokens: current.adminTokens || ["mawwwhub-permanent-session-token"]
  };
  writeDatabase(cleanDb);
  return cleanDb;
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
