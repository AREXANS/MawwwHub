export interface ScriptPackage {
  id: string;
  name: string;
  durationDays: number;
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
  expiresAt: string | null;
  status: 'active' | 'expired' | 'revoked';
  hwid?: string | null;
  customerNote?: string;
  transactionId?: string;
  robloxUsername?: string;
  lastUsedAt?: string | null;
}

export interface Transaction {
  id: string;
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

export interface AppPublicSettings {
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
  packages: ScriptPackage[];
  defaultChannel: string;
  simulationEnabled: boolean;
  apiBase: string;
}

export interface FullAdminSettings {
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
  loadstringTemplate: string;
  rawScriptBody: string;
  rawLoaderTemplate: string;
  maxHwidPerKey: number;
  enableHwidLock: boolean;
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

export interface AdminStats {
  totalKeys: number;
  activeKeys: number;
  totalTransactions: number;
  successTransactions: number;
  totalRevenue: number;
}
