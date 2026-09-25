import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Key,
  CheckCircle2,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { ScriptPackage, Transaction, AppPublicSettings } from '../types';

interface CheckoutModalProps {
  pkg: ScriptPackage | null;
  onClose: () => void;
  apiBase: string;
  settings?: AppPublicSettings | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  pkg,
  onClose,
  apiBase,
  settings
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [paymentChannel, setPaymentChannel] = useState('qris');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Transaction state
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [issuedKey, setIssuedKey] = useState<string>('');
  const [loadstring, setLoadstring] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 mins in sec
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // 1. Submit Order to Backend (ArexansPay)
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    
    // Only require username if enabled in /dev
    if (settings?.enableOrderUsername && !robloxUsername.trim()) {
      setErrorMsg('Mohon isi Username Roblox Anda untuk verifikasi kepemilikan script.');
      return;
    }

    // Only require WhatsApp if enabled in /dev and user hasn't filled it
    if (settings?.enableOrderWhatsapp && !customerContact.trim()) {
      setErrorMsg('Mohon isi Nomor WhatsApp Anda untuk penerimaan notifikasi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          robloxUsername: robloxUsername.trim() || 'Guest',
          customerContact: customerContact.trim() || '',
          paymentChannel,
          customKey: customKey.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTransaction(data.data);
        setStep('payment');
        // calculate remaining seconds
        const expireTime = new Date(data.data.expiredAt).getTime();
        const diff = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
        setTimeLeft(diff > 0 ? diff : 15 * 60);
      } else {
        setErrorMsg(data.message || 'Gagal membuat tagihan transaksi');
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server pembayaran: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Poll Status Timer
  useEffect(() => {
    if (step !== 'payment' || !transaction) return;

    // Countdown interval
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto check status every 4 seconds
    const statusInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transactions/${transaction.id}/status`);
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.status === 'success') {
            setIssuedKey(data.data.issuedKey);
            setLoadstring(data.data.loadstring);
            setTransaction(data.data.transaction);
            setStep('success');
            clearInterval(statusInterval);
            clearInterval(timer);
          } else if (data.data.status === 'expired') {
            setErrorMsg('Waktu pembayaran telah habis (Expired). Silakan buat transaksi baru.');
          }
        }
      } catch (err) {
        // quiet error
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, [step, transaction]);

  // 3. Manual Check Status
  const handleManualCheck = async () => {
    if (!transaction) return;
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/status`);
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.status === 'success') {
          setIssuedKey(data.data.issuedKey);
          setLoadstring(data.data.loadstring);
          setTransaction(data.data.transaction);
          setStep('success');
        } else {
          alert('Status saat ini: ' + data.data.status.toUpperCase() + '\nPembayaran belum terdeteksi pada sistem mutasi ArexansPay.');
        }
      }
    } catch (err: any) {
      alert('Gagal mengecek status: ' + err.message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 4. Simulate Payment (Test Mode)
  const handleSimulatePayment = async () => {
    if (!transaction) return;
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/simulate-pay`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIssuedKey(data.data.issuedKey);
        setLoadstring(data.data.loadstring);
        setTransaction(data.data.transaction);
        setStep('success');
      } else {
        alert(data.message || 'Gagal simulasi');
      }
    } catch (e: any) {
      alert('Error simulasi: ' + e.message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getCleanLoadstring = () => {
    const currentOrigin = window.location.origin;
    if (!loadstring) {
      return `_G.MawwwHubKey = "${issuedKey}"\nloadstring(game:HttpGet("${currentOrigin}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`;
    }
    return loadstring.replace(/https?:\/\/[a-zA-Z0-9.\-_:]+(?=\/api\/raw)/g, currentOrigin);
  };

  const handleCopyKey = () => {
    if (!issuedKey) return;
    navigator.clipboard.writeText(issuedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyLoadstring = () => {
    const textToCopy = getCleanLoadstring();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#100722] border border-purple-700/60 shadow-2xl shadow-purple-900/60 text-white overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 bg-[#160a2f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <QrCode className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {step === 'form' && 'Pembelian Script MawwwHub'}
                {step === 'payment' && 'Pembayaran ArexansPay QRIS'}
                {step === 'success' && 'Pembayaran Berhasil! Key MawwwHub'}
              </h3>
              <p className="text-[11px] text-purple-300/70 font-mono-code">
                {pkg.name} ({pkg.durationLabel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 flex items-center justify-center text-purple-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM */}
          {step === 'form' && (
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/80">Paket Pilihan:</span>
                  <span className="font-bold text-white">{pkg.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/80">Masa Aktif Key:</span>
                  <span className="font-bold text-purple-300 font-mono-code">{pkg.durationLabel}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-purple-900/30">
                  <span className="text-purple-200">Harga Paket:</span>
                  <span className="font-extrabold text-base text-purple-300">{formatRupiah(pkg.price)}</span>
                </div>
              </div>

              {settings?.enableOrderUsername && (
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Username Roblox Anda <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mawww_Player01"
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c051a] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white placeholder-purple-400/40"
                  />
                  <span className="text-[11px] text-purple-400/60 mt-1 block">
                    Digunakan untuk mengikat status VIP dan hak milik key.
                  </span>
                </div>
              )}

              {settings?.enableOrderWhatsapp && (
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Nomor WhatsApp Pembeli <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c051a] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white placeholder-purple-400/40"
                  />
                  <span className="text-[11px] text-purple-400/60 mt-1 block">
                    Untuk notifikasi bukti transaksi dan cadangan key.
                  </span>
                </div>
              )}

              {(settings?.enableCustomKeyOrder ?? true) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-purple-200">
                      Custom License Key (Opsional)
                    </label>
                    <span className="text-[10px] text-purple-400/80 font-medium">Bebas Buat Nama Key</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: VIP-RAFI-2026 atau MWH-SULTAN"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    maxLength={32}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c051a] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs font-mono-code text-purple-200 placeholder-purple-400/30 uppercase"
                  />
                  <span className="text-[11px] text-purple-400/60 mt-1 block">
                    Bebas atur nama key sendiri! Kosongkan jika ingin key acak otomatis (MWH-XXXX).
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => setPaymentChannel('qris')}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition text-xs ${
                      paymentChannel === 'qris'
                        ? 'bg-purple-900/40 border-purple-500 text-white'
                        : 'bg-purple-950/20 border-purple-900/50 text-purple-300/70 hover:bg-purple-950/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      checked={paymentChannel === 'qris'}
                      onChange={() => setPaymentChannel('qris')}
                      className="hidden"
                    />
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-bold">QRIS GPN Otomatis</div>
                      <div className="text-[10px] text-purple-400/70">BCA, Dana, Gopay, Ovo, dll</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentChannel('bank_seabank')}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition text-xs ${
                      paymentChannel === 'bank_seabank'
                        ? 'bg-purple-900/40 border-purple-500 text-white'
                        : 'bg-purple-950/20 border-purple-900/50 text-purple-300/70 hover:bg-purple-950/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      checked={paymentChannel === 'bank_seabank'}
                      onChange={() => setPaymentChannel('bank_seabank')}
                      className="hidden"
                    />
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold">Transfer Bank / SeaBank</div>
                      <div className="text-[10px] text-purple-400/70">Verifikasi kode unik</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-900/50 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Membuat Tagihan ArexansPay...</span>
                    </>
                  ) : (
                    <>
                      <span>Lanjut Pembayaran ({formatRupiah(pkg.price)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT WITH AREXANSPAY QRIS */}
          {step === 'payment' && transaction && (
            <div className="space-y-4 text-center">
              
              {/* Countdown and Status */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-mono-code font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sisa Waktu: {formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[11px] font-semibold">Menunggu Transfer...</span>
                </div>
              </div>

              {/* QRIS Display Container */}
              <div className="p-4 rounded-2xl bg-white text-slate-900 shadow-xl max-w-[270px] mx-auto border-4 border-purple-500/40">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  QRIS STANDAR PEMBAYARAN NASIONAL
                </div>

                {transaction.qrBase64 ? (
                  <img
                    src={transaction.qrBase64}
                    alt="ArexansPay QRIS"
                    className="w-full h-auto aspect-square rounded-lg object-contain mx-auto"
                  />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Memuat Barcode...
                  </div>
                )}

                <div className="text-[11px] font-bold text-slate-800 mt-1 truncate">
                  {transaction.accountHolder || 'MawwwHub Store'}
                </div>
                <div className="text-[9px] text-slate-500 font-mono-code">
                  NMID: ID1020021590123 / {transaction.bankName}
                </div>
              </div>

              {/* Amount to pay (Critical Unique Amount) */}
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/60">
                <span className="text-[11px] text-purple-300 block mb-0.5">
                  Total Nominal yang Harus Ditransfer (WAJIB TEPAT):
                </span>
                <div className="text-2xl font-black text-amber-300 font-mono-code flex items-center justify-center gap-2">
                  <span>{formatRupiah(transaction.totalAmount)}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(transaction.totalAmount));
                      alert(`Nominal ${transaction.totalAmount} disalin!`);
                    }}
                    className="p-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-300 text-[10px]"
                    title="Salin nominal"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-purple-400 block mt-1">
                  (Termasuk 3 digit kode unik Rp {transaction.uniqueCode} untuk auto-konfirmasi ArexansPay)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleManualCheck}
                  disabled={isCheckingStatus}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-800/80 hover:bg-purple-700 text-white border border-purple-600/50 flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'Mengecek Mutasi...' : 'Saya Sudah Bayar (Cek Status)'}</span>
                </button>

                {/* Simulation Button for fast testing */}
                {(settings?.simulationEnabled ?? true) && (
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full py-2 px-3 rounded-lg text-[11px] font-semibold text-purple-300/80 bg-purple-950/40 hover:bg-purple-900/50 border border-dashed border-purple-700/50 flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simulasi Bayar Berhasil (Test Mode Instan)</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-purple-400/80 text-left space-y-1 bg-[#0c051a] p-3 rounded-xl border border-purple-900/30">
                <div className="font-semibold text-purple-300 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-purple-400" />
                  <span>Instruksi Pembayaran:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  <li>Buka m-Banking (BCA, Mandiri, BRI, SeaBank) atau E-Wallet (DANA, Gopay, OVO, ShopeePay).</li>
                  <li>Pilih menu <b>Scan QR / QRIS</b> lalu scan barcode di atas atau simpan tangkapan layar.</li>
                  <li>Pastikan nominal transfer sama persis hingga digit terakhir.</li>
                  <li>Setelah transfer berhasil, halaman ini akan otomatis membuka Key & Loadstring Anda!</li>
                </ol>
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESS & LOADSTRING DISPLAY */}
          {step === 'success' && (
            <div className="space-y-4">
              
              {/* Confetti Banner */}
              <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-purple-900/50 to-emerald-950/30 border border-emerald-500/40 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-extrabold text-white">
                  Pembayaran Terverifikasi!
                </h4>
                <p className="text-xs text-purple-200/80">
                  Key MawwwHub dan Loadstring Script Anda telah berhasil dibuat secara otomatis.
                </p>
              </div>

              {/* Issued Key Box */}
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>License Key MawwwHub:</span>
                  </span>
                  <span className="text-[10px] font-mono-code text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Aktif
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={issuedKey}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0b0416] border border-purple-800 text-xs font-mono-code text-purple-200 select-all"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Loadstring Ready to Execute */}
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Script Loadstring (Key Sudah Terpasang):</span>
                  </span>
                  <button
                    onClick={handleCopyLoadstring}
                    className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Tersalin!' : 'Copy Script'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070210] border border-purple-900/80 font-mono-code text-[11px] text-purple-200 overflow-x-auto custom-scrollbar select-all">
                  <pre className="whitespace-pre-wrap break-all">{getCleanLoadstring()}</pre>
                </div>
              </div>

              {/* How to use */}
              <div className="p-3 rounded-xl bg-[#0c051a] border border-purple-900/40 text-[11px] text-purple-300/80 space-y-1">
                <span className="font-bold text-purple-200 block">Cara Menjalankan Script:</span>
                <p>1. Salin teks Script Loadstring di atas.</p>
                <p>2. Buka Roblox dan jalankan executor (Delta, Codex, Arceus X, Solara, Wave, dll).</p>
                <p>3. Tempel (Paste) script pada tab executor lalu klik <b>Execute</b>.</p>
                <p>4. MawwwHub GUI akan langsung muncul di layar game Anda!</p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 transition"
              >
                Selesai & Tutup
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
