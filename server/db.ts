import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

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
  arexanspayTrxId?: string;
}

export interface AppSettings {
  brandName: string;
  logoUrl?: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  gameName: string;
  scriptDescription: string;
  scriptFeatures: string[];
  discordUrl: string;
  telegramUrl: string;
  whatsappContact: string;
  announcementText: string;
  // Loadstring & Raw Code settings
  loadstringTemplate: string;
  rawScriptBody: string;
  rawLoaderTemplate: string;
  maxHwidPerKey: number;
  enableHwidLock: boolean;
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
  loadstringTemplate: `_G.MawwwHubKey = "{KEY}"
loadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  rawScriptBody: `-- [[ MawwwHub Official Script Hub - Premium Edition ]] --
-- Protected & Managed by MawwwHub Authentication System
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local TweenService = game:GetService("TweenService")
local HttpService = game:GetService("HttpService")

print("[MawwwHub] Key verified successfully for: " .. LocalPlayer.Name)

-- Notify Player
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "💜 MawwwHub VIP Active",
        Text = "Selamat datang! Key aktif. Menyiapkan GUI...",
        Duration = 6
    })
end)

-- Main Hub Engine
local MawwwHub = {
    Version = "v3.8.4",
    Key = "{KEY}",
    ExpiresAt = "{EXPIRES_AT}",
    Status = "Authorized"
}

-- Create UI Notification Banner
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "MawwwHub_Indicator"
pcall(function()
    ScreenGui.Parent = game:GetService("CoreGui")
end)
if not ScreenGui.Parent then
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
end

local MainBadge = Instance.new("Frame")
MainBadge.Size = UDim2.new(0, 220, 0, 42)
MainBadge.Position = UDim2.new(1, -230, 0, 15)
MainBadge.BackgroundColor3 = Color3.fromRGB(24, 10, 45)
MainBadge.BorderSizePixel = 0
MainBadge.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 8)
UICorner.Parent = MainBadge

local UIGradient = Instance.new("UIGradient")
UIGradient.Color = ColorSequence.new{
    ColorSequenceKeypoint.new(0, Color3.fromRGB(147, 51, 234)),
    ColorSequenceKeypoint.new(1, Color3.fromRGB(88, 28, 135))
}
UIGradient.Parent = MainBadge

local TitleLabel = Instance.new("TextLabel")
TitleLabel.Size = UDim2.new(1, -10, 1, 0)
TitleLabel.Position = UDim2.new(0, 10, 0, 0)
TitleLabel.BackgroundTransparency = 1
TitleLabel.Text = "💜 MawwwHub: Authenticated"
TitleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
TitleLabel.Font = Enum.Font.GothamBold
TitleLabel.TextSize = 13
TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
TitleLabel.Parent = MainBadge

print("[MawwwHub] Script fully loaded & operational.")`,
  rawLoaderTemplate: `-- [[ MawwwHub Loader ]] --
-- Paste kode ini di Executor Anda (Delta, Codex, Solara, Wave, dll):
_G.MawwwHubKey = "{KEY}"
loadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  maxHwidPerKey: 1,
  enableHwidLock: false,
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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDatabase(): DatabaseSchema {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
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
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    // ensure required fields exist
    if (!data.settings) data.settings = defaultSettings;
    if (!data.keys) data.keys = [];
    if (!data.transactions) data.transactions = [];
    if (!data.adminTokens) data.adminTokens = ["mawwwhub-permanent-session-token"];
    return data;
  } catch (err) {
    console.error("Error reading database, creating default:", err);
    return {
      settings: defaultSettings,
      keys: [],
      transactions: [],
      adminTokens: ["mawwwhub-permanent-session-token"]
    };
  }
}

export function writeDatabase(db: DatabaseSchema): void {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
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
