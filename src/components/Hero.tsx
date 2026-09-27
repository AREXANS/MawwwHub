import React from 'react';
import { Sparkles, ShieldCheck, Zap, ChevronDown, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
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
  const statusBadgeText = settings?.statusBadgeText || "MawwwHub Status: Undetected & Online";
  const statusBadgeType = settings?.statusBadgeType || "online";
  const statusSubtext = settings?.statusSubtext || "ArexansPay Multi-Payment Aktif";

  const defaultPills = [
    {
      id: 'pill-1',
      icon: 'zap' as const,
      title: 'Instan Delivery',
      description: 'Key & loadstring langsung terbit hitungan detik setelah bayar.'
    },
    {
      id: 'pill-2',
      icon: 'shield' as const,
      title: 'Bypass Anti-Cheat',
      description: 'Perlindungan keamanan tinggi aman dari ban Roblox.'
    },
    {
      id: 'pill-3',
      icon: 'check' as const,
      title: 'Multi-Payment Otomatis',
      description: 'Mendukung QRIS, DANA, GoPay, OVO, BCA, BRI, Mandiri, SeaBank.'
    },
    {
      id: 'pill-4',
      icon: 'sparkles' as const,
      title: 'Violence District VIP',
      description: 'Eksklusif untuk Roblox Violence District, support PC & Mobile.'
    }
  ];

  const pills = (settings?.heroPills && settings.heroPills.length > 0) ? settings.heroPills : defaultPills;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'check':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'zap':
      default:
        return <Zap className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusDotColor = () => {
    if (statusBadgeType === 'updating') return 'bg-amber-400';
    if (statusBadgeType === 'maintenance') return 'bg-red-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      
      {/* Background Decorative Purple Radial Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-1/4 w-[280px] h-[280px] bg-violet-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/60 shadow-lg shadow-purple-950/50 mb-6 animate-fade-in">
          <span className={`w-2 h-2 rounded-full ${getStatusDotColor()} animate-pulse`} />
          <span className="text-xs font-semibold text-purple-200">
            {statusBadgeText}
          </span>
          {statusSubtext && (
            <>
              <span className="text-purple-400 text-xs">•</span>
              <span className="text-xs text-purple-300/80">{statusSubtext}</span>
            </>
          )}
        </div>

        {/* Announcement Banner if any */}
        {announcement && (
          <div className="mb-4 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-center justify-center gap-2 max-w-xl mx-auto">
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="truncate">{announcement}</span>
          </div>
        )}

        {/* Violence District Target Game Badge */}
        <div className="mb-6 inline-flex items-center">
          <a
            href="https://www.roblox.com/id/games/93978595733734/Violence-District"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 hover:bg-purple-800/70 border border-purple-500/50 text-xs font-semibold text-purple-200 transition shadow-lg shadow-purple-950/50 group"
          >
            <span className="text-sm">🎮</span>
            <span>Khusus Game: <strong className="text-white">Violence District</strong></span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-white transition" />
          </a>
        </div>

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

        {/* Clean Call to Action Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onExplorePackages}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 shadow-xl shadow-purple-900/50 hover:shadow-purple-700/50 border border-purple-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Pilih Paket Script</span>
            <ChevronDown className="w-4 h-4 text-purple-200" />
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-14 pt-8 border-t border-purple-900/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {pills.map((pill) => (
            <div key={pill.id} className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
              <div className="flex items-center gap-2 mb-1">
                {renderIcon(pill.icon)}
                <span className="text-xs font-bold text-white">{pill.title}</span>
              </div>
              <p className="text-[11px] text-purple-300/70">{pill.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
