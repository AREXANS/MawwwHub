import React from 'react';
import { Shield, KeyRound, Terminal, Lock, ExternalLink } from 'lucide-react';
import { AppPublicSettings } from '../types';

interface NavbarProps {
  settings: AppPublicSettings | null;
  onOpenKeyChecker: () => void;
  onOpenGuide: () => void;
  onGoDev: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenKeyChecker,
  onOpenGuide,
  onGoDev
}) => {
  const brandName = settings?.brandName || "MawwwHub";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-900/40 bg-[#0c0617]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d071a] rounded-[10px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-200 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                {brandName}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Roblox VIP
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70 font-mono-code -mt-0.5">
              Secure Executor & Key Hub
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onOpenKeyChecker}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 hover:border-purple-600/60 rounded-lg transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Cek Validasi</span> Key
          </button>

          <button
            onClick={onOpenGuide}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200/90 bg-purple-950/30 hover:bg-purple-900/50 border border-purple-900/40 rounded-lg transition"
          >
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            <span>Tutorial Executor</span>
          </button>

          {settings?.discordUrl && (
            <a
              href={settings.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-300 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 rounded-lg transition"
            >
              <span>Discord</span>
              <ExternalLink className="w-3 h-3 text-purple-400" />
            </a>
          )}

          {/* Admin /dev Button */}
          <button
            onClick={onGoDev}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-600 to-violet-600 hover:from-purple-600 hover:to-violet-500 rounded-lg shadow-md shadow-purple-900/40 border border-purple-500/30 transition transform active:scale-95"
            title="Akses Portal Pengaturan Admin /dev"
          >
            <Lock className="w-3.5 h-3.5 text-purple-200" />
            <span>/dev</span>
          </button>
        </div>

      </div>
    </header>
  );
};
