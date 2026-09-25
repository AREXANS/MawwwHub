import React from 'react';
import { X, Terminal, Smartphone, Monitor, ShieldCheck, Check } from 'lucide-react';

interface ExecutorGuideModalProps {
  onClose: () => void;
}

export const ExecutorGuideModal: React.FC<ExecutorGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#100722] border border-purple-700/60 shadow-2xl shadow-purple-900/60 text-white overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 bg-[#160a2f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <Terminal className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Panduan Penggunaan Script Executor</h3>
              <p className="text-[11px] text-purple-300/70">MawwwHub Support Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 flex items-center justify-center text-purple-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-purple-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Untuk Pengguna Mobile (Android & iOS)</span>
            </h4>
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-1.5 text-purple-300/80 leading-relaxed">
              <p>• <b>Executor yang didukung:</b> Delta Mobile, Codex, Arceus X Neo, Hydrogen, Fluxus.</p>
              <p>• Buka aplikasi Roblox yang sudah terpasang executor.</p>
              <p>• Masuk ke game Roblox: <b>Violence District</b>.</p>
              <p>• Buka menu Executor floating icon, buat tab baru.</p>
              <p>• Paste script loadstring MawwwHub yang sudah berisi key Anda.</p>
              <p>• Klik <b>Execute</b> atau tombol play.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-purple-200 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Untuk Pengguna PC (Windows)</span>
            </h4>
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-1.5 text-purple-300/80 leading-relaxed">
              <p>• <b>Executor yang didukung:</b> Solara, Wave, Swift, Codex PC, Synapse Z.</p>
              <p>• Buka Roblox dan masuk ke game <b>Violence District</b>, lalu buka executor Anda.</p>
              <p>• Klik <b>Attach / Inject</b> pada executor.</p>
              <p>• Paste script loadstring MawwwHub pada editor.</p>
              <p>• Klik <b>Execute</b>. GUI MawwwHub akan langsung muncul di pojok layar.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Keamanan MawwwHub:</span>
              <p className="text-[11px] text-emerald-300/80">
                Script dilengkapi proteksi anti-tamper dan bypass anti-cheat game Violence District, sehingga aman dari banned akun reguler. Gunakan fitur dengan wajar untuk pengalaman bermain terbaik.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition"
          >
            Mengerti & Tutup
          </button>

        </div>

      </div>
    </div>
  );
};
