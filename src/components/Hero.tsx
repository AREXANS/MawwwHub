import React from 'react';
import { Sparkles, ShieldCheck, Zap, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { AppPublicSettings } from '../types';

interface HeroProps {
  settings: AppPublicSettings | null;
  onExplorePackages: () => void;
  onOpenKeyChecker: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExplorePackages,
  onOpenKeyChecker
}) => {
  const brandName = settings?.brandName || "MawwwHub";
  const headline = settings?.heroHeadline || "MawwwHub Script Executor & VIP Hub";
  const subheadline = settings?.heroSubheadline || "Script Roblox terbaik, undetected, auto update & aktivasi key instan otomatis 24/7.";
  const announcement = settings?.announcementText;

  return (
    <div className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      
      {/* Background Decorative Purple Radial Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-1/4 w-[280px] h-[280px] bg-violet-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/60 shadow-lg shadow-purple-950/50 mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-200">
            MawwwHub Status: <span className="text-emerald-400 font-bold">Undetected & Online</span>
          </span>
          <span className="text-purple-400 text-xs">•</span>
          <span className="text-xs text-purple-300/80">ArexansPay Gateway Aktif</span>
        </div>

        {/* Announcement Banner if any */}
        {announcement && (
          <div className="mb-6 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-center justify-center gap-2 max-w-xl mx-auto">
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="truncate">{announcement}</span>
          </div>
        )}

        {/* Brand Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Pusat Script Roblox Resmi <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent purple-text-glow">
            {brandName}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-purple-200/80 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          {subheadline}
        </p>

        {/* Clean Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExplorePackages}
            className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 shadow-xl shadow-purple-900/50 hover:shadow-purple-700/50 border border-purple-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Pilih Paket Script</span>
            <ChevronDown className="w-4 h-4 text-purple-200" />
          </button>

          <button
            onClick={onOpenKeyChecker}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm text-purple-200 bg-[#160c2b] hover:bg-[#20103e] border border-purple-700/50 hover:border-purple-500/80 shadow-lg shadow-purple-950/40 transition flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Cek Status / Masa Aktif Key</span>
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-14 pt-8 border-t border-purple-900/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Instan Delivery</span>
            </div>
            <p className="text-[11px] text-purple-300/70">Key & loadstring langsung terbit hitungan detik setelah bayar.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Bypass Anti-Cheat</span>
            </div>
            <p className="text-[11px] text-purple-300/70">Perlindungan keamanan tinggi aman dari ban Roblox.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">ArexansPay QRIS</span>
            </div>
            <p className="text-[11px] text-purple-300/70">Mendukung semua m-Banking BCA, Mandiri, BRI, SeaBank & E-Wallet.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Universal Support</span>
            </div>
            <p className="text-[11px] text-purple-300/70">Lancar untuk Delta, Codex, Arceus X, Solara & Wave.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
