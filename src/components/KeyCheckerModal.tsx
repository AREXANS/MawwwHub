import React, { useState } from 'react';
import { X, KeyRound, Search, CheckCircle2, AlertTriangle, XCircle, Clock, Copy, Check, Terminal } from 'lucide-react';

interface KeyCheckerModalProps {
  onClose: () => void;
  apiBase: string;
}

export const KeyCheckerModal: React.FC<KeyCheckerModalProps> = ({ onClose, apiBase }) => {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch(`/api/key/verify?key=${encodeURIComponent(inputKey.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setErrorMsg(data.message || 'Key tidak valid atau belum terdaftar.');
      }
    } catch (err: any) {
      setErrorMsg('Gagal memverifikasi key: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : apiBase;
  const sampleLoader = result
    ? `_G.MawwwHubKey = "${result.key}"\nloadstring(game:HttpGet("${currentOrigin}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`
    : '';

  const handleCopyLoader = () => {
    navigator.clipboard.writeText(sampleLoader);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-[#100722] border border-purple-700/60 shadow-2xl shadow-purple-900/60 text-white overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 bg-[#160a2f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <KeyRound className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Validasi & Cek Masa Aktif Key</h3>
              <p className="text-[11px] text-purple-300/70 font-mono-code">MawwwHub Security Checker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 flex items-center justify-center text-purple-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Masukkan License Key Anda:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Contoh: MWH-XXXX-XXXX-XXXX"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0c051a] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white placeholder-purple-400/40 font-mono-code"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-purple-900/40"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cek</span>
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-200 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-[#150a2c] border border-purple-800/60 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                <span className="text-xs text-purple-300">Status Key:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  result.status === 'active'
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-950/70 text-red-400 border border-red-500/40'
                }`}>
                  {result.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300/80">Paket:</span>
                <span className="font-semibold text-white">{result.packageName}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300/80">Sisa Waktu:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1 font-mono-code">
                  <Clock className="w-3.5 h-3.5" />
                  {result.remainingText}
                </span>
              </div>

              {result.expiresAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300/80">Kadaluwarsa Pada:</span>
                  <span className="text-purple-200 font-mono-code text-[11px]">
                    {new Date(result.expiresAt).toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              {/* Ready to copy script */}
              <div className="pt-2 border-t border-purple-900/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>Script Loader untuk Key ini:</span>
                  </span>
                  <button
                    onClick={handleCopyLoader}
                    className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-[#0a0314] text-[10px] font-mono-code text-purple-200/90 break-all border border-purple-900/50">
                  {sampleLoader}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
