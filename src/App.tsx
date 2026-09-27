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

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname.toLowerCase();
  });
  const [settings, setSettings] = useState<AppPublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch Public Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Realtime polling every 3 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
      }
    }, 3000);

    // Listen to local update events (e.g. from /dev in same window)
    const handleLocalUpdate = () => {
      fetchSettings();
    };
    window.addEventListener('mawwwhub_settings_updated', handleLocalUpdate);

    // Listen to cross-tab storage sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mawwwhub_settings_ts') {
        fetchSettings();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Listen to BroadcastChannel across tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('mawwwhub_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SETTINGS_UPDATED') {
          fetchSettings();
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

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsKeyCheckerOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-xs font-semibold text-purple-200 transition"
              >
                {settings?.quickToolsBtn1Text || "Cek Validasi Key"}
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-md shadow-purple-900/40"
              >
                {settings?.quickToolsBtn2Text || "Tutorial Executor"}
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
