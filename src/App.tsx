import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PackagesList } from './components/PackagesList';
import { AdBanner } from './components/AdBanner';
import { CheckoutModal } from './components/CheckoutModal';
import { KeyCheckerModal } from './components/KeyCheckerModal';
import { ExecutorGuideModal } from './components/ExecutorGuideModal';
import { DevDashboard } from './views/DevDashboard';
import { AppPublicSettings, ScriptPackage } from './types';
import { Terminal, Shield, Lock, ExternalLink, Heart, Sparkles } from 'lucide-react';

const DEFAULT_PUBLIC_SETTINGS: AppPublicSettings = {
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
  packages: [
    { id: "pkg-1d", name: "Paket 1 Hari (Trial)", durationDays: 1, durationLabel: "1 Hari (24 Jam)", price: 5000, isPopular: false, description: "Coba langsung fitur Violence District VIP", isActive: true },
    { id: "pkg-3d", name: "Paket 3 Hari", durationDays: 3, durationLabel: "3 Hari", price: 10000, isPopular: false, description: "Cocok untuk grinding weekend dan event game", isActive: true },
    { id: "pkg-7d", name: "Paket 7 Hari (1 Minggu)", durationDays: 7, durationLabel: "7 Hari (1 Minggu)", price: 18000, isPopular: true, description: "Paket paling diminati! Akses penuh 1 minggu", isActive: true },
    { id: "pkg-30d", name: "Paket 30 Hari (1 Bulan)", durationDays: 30, durationLabel: "30 Hari (1 Bulan)", price: 35000, isPopular: false, description: "Hemat untuk grinding rutin harian", isActive: true },
    { id: "pkg-perm", name: "Paket Lifetime (Permanen)", durationDays: -1, durationLabel: "Lifetime / Permanen", price: 75000, isPopular: false, description: "Akses selamanya termasuk semua update patch masa depan", isActive: true }
  ],
  paymentMethods: [
    { id: 'qris', name: 'QRIS All Payment (GPN)', code: 'qris', category: 'qris', instructions: 'Scan QRIS dengan GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, BRI, BNI atau aplikasi m-Banking manapun.', isActive: true, isDefault: true },
    { id: 'dana', name: 'DANA Instant', code: 'dana', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer ke nomor akun DANA di atas. Masukkan nominal tepat beserta kode unik agar otomatis terkonfirmasi.', isActive: true },
    { id: 'gopay', name: 'GoPay / Gojek', code: 'gopay', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer saldo GoPay ke nomor di atas. Pembayaran terverifikasi otomatis.', isActive: true },
    { id: 'ovo', name: 'OVO Cash', code: 'ovo', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Buka aplikasi OVO dan transfer ke nomor di atas sesuai total pembayaran.', isActive: true },
    { id: 'shopeepay', name: 'ShopeePay', code: 'shopeepay', category: 'ewallet', accountNumber: '081234567890', accountHolder: 'MawwwHub Store', instructions: 'Transfer ShopeePay ke nomor di atas dengan nominal yang tepat.', isActive: true },
    { id: 'bank_bca', name: 'Bank Central Asia (BCA)', code: 'bca', category: 'bank', accountNumber: '8735091823', accountHolder: 'MawwwHub Store', instructions: 'Transfer via m-BCA atau KlikBCA. Wajib transfer sesuai nominal hingga 3 digit kode unik.', isActive: true },
    { id: 'bank_bri', name: 'Bank Rakyat Indonesia (BRI)', code: 'bri', category: 'bank', accountNumber: '012901092839501', accountHolder: 'MawwwHub Store', instructions: 'Transfer via BRImo atau ATM BRI dengan nominal pas termasuk kode unik.', isActive: true },
    { id: 'bank_mandiri', name: 'Bank Mandiri (Livin)', code: 'mandiri', category: 'bank', accountNumber: '1370019284950', accountHolder: 'MawwwHub Store', instructions: 'Transfer via Livin by Mandiri. Transfer tepat sesuai kode unik.', isActive: true },
    { id: 'bank_seabank', name: 'SeaBank (Transfer Gratis)', code: 'seabank', category: 'bank', accountNumber: '901928475829', accountHolder: 'MawwwHub Store', instructions: 'Bebas biaya admin transfer dari e-wallet/bank lain ke rekening SeaBank ini.', isActive: true }
  ],
  defaultChannel: 'qris',
  simulationEnabled: false,
  apiBase: ''
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname.toLowerCase();
  });

  // Zero-flicker immediate state initialization:
  // Reads saved data from localStorage immediately so there is never a blank flash or default flicker!
  const [settings, setSettings] = useState<AppPublicSettings>(() => {
    try {
      const cached = localStorage.getItem('mawwwhub_saved_public_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.brandName || parsed.heroHeadline)) {
          return { ...DEFAULT_PUBLIC_SETTINGS, ...parsed };
        }
      }
    } catch (e) {}
    return DEFAULT_PUBLIC_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [selectedPackage, setSelectedPackage] = useState<ScriptPackage | null>(null);
  const [isKeyCheckerOpen, setIsKeyCheckerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch Public Settings with anti-reversion and zero-flicker validation
  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        const incoming = data.data as AppPublicSettings;
        const incomingTime = Number(incoming.updatedAt) || 0;

        // Check if our local cache is strictly newer than the server (e.g. server restarted or cold started)
        let localCached: AppPublicSettings | null = null;
        try {
          const raw = localStorage.getItem('mawwwhub_saved_public_settings');
          if (raw) localCached = JSON.parse(raw);
        } catch (e) {}

        const localTime = Number(localCached?.updatedAt) || 0;

        if (localCached && localTime > incomingTime) {
          // Client has newer saved data! Keep local settings and restore to server immediately
          setSettings(localCached);
          fetch('/api/settings/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localCached)
          }).catch(() => {});
        } else {
          // Server data is newer or equal, apply and cache it
          setSettings(incoming);
          try {
            localStorage.setItem('mawwwhub_saved_public_settings', JSON.stringify(incoming));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // 1. Instant 0-delay Server-Sent Events stream from backend
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/settings/stream');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.brandName) {
            let localTime = 0;
            try {
              const raw = localStorage.getItem('mawwwhub_saved_public_settings');
              if (raw) localTime = Number(JSON.parse(raw)?.updatedAt) || 0;
            } catch (e) {}

            const incomingTime = Number(payload.updatedAt) || 0;
            if (incomingTime >= localTime) {
              setSettings(payload);
              try {
                localStorage.setItem('mawwwhub_saved_public_settings', JSON.stringify(payload));
              } catch (e) {}
            }
            setIsLoading(false);
          }
        } catch (e) {}
      };
      eventSource.onerror = () => {
        // SSE will automatically retry in background
      };
    } catch (e) {}

    // 2. Realtime polling fallback every 3 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
      }
    }, 3000);

    // 3. Listen to local update events (e.g. from /dev in same window)
    const handleLocalUpdate = (e: any) => {
      if (e?.detail) {
        setSettings(e.detail);
        try {
          localStorage.setItem('mawwwhub_saved_public_settings', JSON.stringify(e.detail));
        } catch (err) {}
      } else {
        fetchSettings();
      }
    };
    window.addEventListener('mawwwhub_settings_updated', handleLocalUpdate);

    // 4. Listen to cross-tab storage sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mawwwhub_settings_ts' || e.key === 'mawwwhub_saved_public_settings') {
        try {
          const raw = localStorage.getItem('mawwwhub_saved_public_settings');
          if (raw) {
            setSettings(JSON.parse(raw));
          }
        } catch (err) {}
        fetchSettings();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 5. Listen to BroadcastChannel across tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('mawwwhub_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SETTINGS_UPDATED') {
          if (event.data.data) {
            setSettings(event.data.data);
            try {
              localStorage.setItem('mawwwhub_saved_public_settings', JSON.stringify(event.data.data));
            } catch (err) {}
          } else {
            fetchSettings();
          }
        }
      };
    } catch (e) {}

    // Refetch when tab becomes active / focused
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
      window.removeEventListener('mawwwhub_settings_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      if (bc) bc.close();
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.toLowerCase());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on /dev path, render DevDashboard
  if (currentPath === '/dev' || currentPath.startsWith('/dev/')) {
    return (
      <DevDashboard
        onBackToHome={() => {
          navigateTo('/');
          fetchSettings();
        }}
      />
    );
  }

  const brandName = settings?.brandName || "MawwwHub";
  const adBanner = settings?.adBanner;

  return (
    <div className="min-h-screen flex flex-col bg-[#080214] text-slate-100 selection:bg-purple-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        settings={settings}
        onOpenKeyChecker={() => setIsKeyCheckerOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Purple Hero Section */}
        <Hero
          settings={settings}
          onExplorePackages={() => {
            const el = document.getElementById('packages-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenKeyChecker={() => setIsKeyCheckerOpen(true)}
        />

        {/* Ad Banner - Top Position */}
        {adBanner?.enabled && adBanner.position === 'top' && (
          <AdBanner banner={adBanner} />
        )}

        {/* Ad Banner - Middle Position (default) */}
        {adBanner?.enabled && (adBanner.position === 'middle' || !adBanner.position) && (
          <AdBanner banner={adBanner} />
        )}

        {/* Script Packages & Catalog */}
        <PackagesList
          settings={settings}
          onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        />

        {/* Ad Banner - Bottom Position */}
        {adBanner?.enabled && adBanner.position === 'bottom' && (
          <AdBanner banner={adBanner} />
        )}

        {/* Interactive Quick Tools Banner */}
        <section className="max-w-5xl mx-auto px-4 py-8 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-violet-900/30 to-purple-950/40 border border-purple-800/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
                <Terminal className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {settings?.quickToolsTitle || "Sudah Punya Key MawwwHub?"}
                </h4>
                <p className="text-xs text-purple-300/80">
                  {settings?.quickToolsDesc || "Cek sisa masa aktif key Anda atau pelajari cara eksekusi script di HP Android dan PC."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-md shadow-purple-900/40 flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-200" />
                <span>{settings?.quickToolsBtn2Text || "Tutorial Executor"}</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-[#060110] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-purple-300/70">
          
          <div className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={brandName}
                className="w-6 h-6 rounded-md object-cover border border-purple-500/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-purple-700 flex items-center justify-center text-white text-[10px] font-black">
                M
              </div>
            )}
            <span className="font-extrabold text-sm text-white">{brandName}</span>
            <span>— Roblox Script Hub & Store</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsKeyCheckerOpen(true)}
              className="hover:text-purple-200 transition"
            >
              Cek Key
            </button>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-purple-200 transition"
            >
              Panduan Executor
            </button>
          </div>

          <div className="text-[11px] text-purple-400/50">
            {settings?.footerText || "Powered by ArexansPay Multi-Bank & QRIS Automation"}
          </div>

        </div>
      </footer>

      {/* Modals */}
      {selectedPackage && (
        <CheckoutModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          apiBase={window.location.origin}
          settings={settings}
        />
      )}

      {isKeyCheckerOpen && (
        <KeyCheckerModal
          onClose={() => setIsKeyCheckerOpen(false)}
          apiBase={window.location.origin}
        />
      )}

      {isGuideOpen && (
        <ExecutorGuideModal
          onClose={() => setIsGuideOpen(false)}
        />
      )}

    </div>
  );
}
