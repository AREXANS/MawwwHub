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
  enableOrderUsername?: boolean;
  enableOrderWhatsapp?: boolean;
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
  enableOrderUsername: false,
  enableOrderWhatsapp: false,
  loadstringTemplate: `_G.MawwwHubKey = "{KEY}"
loadstring(game:HttpGet("{API_BASE}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`,
  rawScriptBody: `-- [[ MawwwHub Official Script Hub - Premium Edition ]] --
-- Realtime Key Duration & Auto Sync HUD System
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local HttpService = game:GetService("HttpService")
local UserInputService = game:GetService("UserInputService")

local Key = "{KEY}"
local ApiBase = "{API_BASE}"
local BrandName = "{BRAND_NAME}"
local PackageName = "{PACKAGE}"
local ExpireTimestamp = {EXPIRES_AT_TIMESTAMP} -- Unix seconds (0 = Lifetime)

print("[MawwwHub] Key verified successfully for: " .. LocalPlayer.Name)

-- Notify Player on execution
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "💜 " .. BrandName .. " VIP Active",
        Text = "Key terverifikasi! Durasi realtime aktif di pojok layar.",
        Duration = 5
    })
end)

-- Remove existing HUD if present
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

-- Main Floating Transparent Card (Positioned top-right corner)
local Card = Instance.new("Frame")
Card.Name = "DurationCard"
Card.Size = UDim2.new(0, 260, 0, 80)
Card.Position = UDim2.new(1, -275, 0, 20)
Card.BackgroundColor3 = Color3.fromRGB(15, 6, 32)
Card.BackgroundTransparency = 0.35 -- Transparan di pojok layar
Card.BorderSizePixel = 0
Card.Active = true
Card.ClipsDescendants = false
Card.Parent = ScreenGui

-- Rounded Corners
local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 12)
UICorner.Parent = Card

-- Glowing Purple Stroke Border
local UIStroke = Instance.new("UIStroke")
UIStroke.Color = Color3.fromRGB(168, 85, 247)
UIStroke.Transparency = 0.35
UIStroke.Thickness = 1.6
UIStroke.Parent = Card

-- Header Bar
local Header = Instance.new("Frame")
Header.Size = UDim2.new(1, 0, 0, 24)
Header.BackgroundTransparency = 1
Header.Parent = Card

-- Status Indicator Dot (Glowing Green)
local Dot = Instance.new("Frame")
Dot.Size = UDim2.new(0, 8, 0, 8)
Dot.Position = UDim2.new(0, 12, 0.5, -4)
Dot.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
Dot.BorderSizePixel = 0
Dot.Parent = Header

local DotCorner = Instance.new("UICorner")
DotCorner.CornerRadius = UDim.new(1, 0)
DotCorner.Parent = Dot

-- Title Brand
local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -75, 1, 0)
Title.Position = UDim2.new(0, 25, 0, 0)
Title.BackgroundTransparency = 1
Title.Text = BrandName .. " VIP"
Title.TextColor3 = Color3.fromRGB(243, 232, 255)
Title.Font = Enum.Font.GothamBold
Title.TextSize = 12
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

-- Package Badge
local Badge = Instance.new("TextLabel")
Badge.Size = UDim2.new(0, 56, 0, 16)
Badge.Position = UDim2.new(1, -66, 0.5, -8)
Badge.BackgroundColor3 = Color3.fromRGB(126, 34, 206)
Badge.BackgroundTransparency = 0.3
Badge.Text = "ACTIVE"
Badge.TextColor3 = Color3.fromRGB(255, 255, 255)
Badge.Font = Enum.Font.GothamBold
Badge.TextSize = 9
Badge.Parent = Header

local BadgeCorner = Instance.new("UICorner")
BadgeCorner.CornerRadius = UDim.new(0, 4)
BadgeCorner.Parent = Badge

-- Divider
local Line = Instance.new("Frame")
Line.Size = UDim2.new(1, -20, 0, 1)
Line.Position = UDim2.new(0, 10, 0, 26)
Line.BackgroundColor3 = Color3.fromRGB(147, 51, 234)
Line.BackgroundTransparency = 0.6
Line.BorderSizePixel = 0
Line.Parent = Card

-- Realtime Key Label
local KeyLabel = Instance.new("TextLabel")
KeyLabel.Size = UDim2.new(1, -24, 0, 18)
KeyLabel.Position = UDim2.new(0, 12, 0, 31)
KeyLabel.BackgroundTransparency = 1
KeyLabel.Text = "🔑 " .. Key
KeyLabel.TextColor3 = Color3.fromRGB(216, 180, 254)
KeyLabel.Font = Enum.Font.Code
KeyLabel.TextSize = 10
KeyLabel.TextXAlignment = Enum.TextXAlignment.Left
KeyLabel.Parent = Card

-- Realtime Duration Countdown Label
local DurationLabel = Instance.new("TextLabel")
DurationLabel.Size = UDim2.new(1, -24, 0, 22)
DurationLabel.Position = UDim2.new(0, 12, 0, 51)
DurationLabel.BackgroundTransparency = 1
DurationLabel.Text = "⏳ Menghitung durasi..."
DurationLabel.TextColor3 = Color3.fromRGB(253, 224, 71)
DurationLabel.Font = Enum.Font.GothamBold
DurationLabel.TextSize = 11
DurationLabel.TextXAlignment = Enum.TextXAlignment.Left
DurationLabel.Parent = Card

-- Draggable implementation for Mobile & PC
local dragging, dragInput, dragStart, startPos
Card.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = input.Position
        startPos = Card.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
        end)
    end
end)
Card.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        dragInput = input
    end
end)
UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        local delta = input.Position - dragStart
        Card.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
    end
end)

-- Format remaining time function
local function formatRemaining(seconds)
    if seconds <= 0 then
        return "⚠️ MASA AKTIF HABIS (EXPIRED)"
    end
    local days = math.floor(seconds / 86400)
    local hours = math.floor((seconds % 86400) / 3600)
    local mins = math.floor((seconds % 3600) / 60)
    local secs = math.floor(seconds % 60)
    if days > 0 then
        return string.format("⏳ Sisa: %dH %dJ %dM %dS", days, hours, mins, secs)
    elseif hours > 0 then
        return string.format("⏳ Sisa: %dJ %dM %dS", hours, mins, secs)
    else
        return string.format("⏳ Sisa: %dM %dS", mins, secs)
    end
end

-- Live Countdown Routine
local isLifetime = (ExpireTimestamp == 0)
task.spawn(function()
    while ScreenGui.Parent do
        if isLifetime then
            DurationLabel.Text = "⏳ Sisa: PERMANEN (LIFETIME)"
            DurationLabel.TextColor3 = Color3.fromRGB(52, 211, 153)
        else
            local now = os.time()
            local diff = ExpireTimestamp - now
            if diff <= 0 then
                DurationLabel.Text = "⚠️ KEY KEDALUWARSA"
                DurationLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
                Dot.BackgroundColor3 = Color3.fromRGB(239, 68, 68)
                Badge.Text = "EXPIRED"
                Badge.BackgroundColor3 = Color3.fromRGB(220, 38, 38)
            else
                DurationLabel.Text = formatRemaining(diff)
                DurationLabel.TextColor3 = Color3.fromRGB(253, 224, 71)
            end
        end
        task.wait(1)
    end
end)

-- Realtime Web API Sync (Fetches live verification from web every 60s)
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
                        Badge.Text = string.upper(data.status or "EXPIRED")
                        Badge.BackgroundColor3 = Color3.fromRGB(220, 38, 38)
                        DurationLabel.Text = "⚠️ " .. (data.message or "Key tidak aktif!")
                        DurationLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
                    elseif isLifetime or (data.data and data.data.durationDays == -1) then
                        DurationLabel.Text = "⏳ Sisa: PERMANEN (LIFETIME)"
                    end
                end
            end
        end)
    end
end)

print("[MawwwHub] Realtime duration HUD initialized successfully.")`,
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
      if (!data.settings.rawScriptBody || data.settings.rawScriptBody.includes("MawwwHub_Indicator")) {
        data.settings.rawScriptBody = defaultSettings.rawScriptBody;
      }
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
