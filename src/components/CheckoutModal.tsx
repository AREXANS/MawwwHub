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
  HelpCircle,
  CreditCard,
  Smartphone,
  Building2,
  ChevronDown
} from 'lucide-react';
import { ScriptPackage, Transaction, AppPublicSettings, PaymentMethodConfig } from '../types';

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
  const [channelCategoryFilter, setChannelCategoryFilter] = useState<'all' | 'qris' | 'ewallet' | 'bank'>('all');
  const [showAltQr, setShowAltQr] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
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

  // Available payment methods strictly from backend settings (no hardcoded dummy fallback)
  const paymentMethods: PaymentMethodConfig[] = settings?.paymentMethods || [];

  const activeMethods = paymentMethods.filter(m => m.isActive);

  // Initialize selected channel on load
  useEffect(() => {
    if (activeMethods.length > 0 && !activeMethods.some(m => m.id === paymentChannel || m.code === paymentChannel)) {
      const def = activeMethods.find(m => m.isDefault) || activeMethods[0];
      setPaymentChannel(def.id || def.code);
    } else if (activeMethods.length === 0) {
      setPaymentChannel('');
    }
  }, [activeMethods]);

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Filtered payment methods
  const filteredMethods = activeMethods.filter(m => {
    if (channelCategoryFilter === 'all') return true;
    return m.category === channelCategoryFilter;
  });

  const selectedMethodObj = activeMethods.find(m => m.id === paymentChannel || m.code === paymentChannel) || activeMethods[0];

  // 1. Submit Order to Backend (ArexansPay)
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;

    if (activeMethods.length === 0) {
      setErrorMsg('Metode pembayaran belum tersedia. Developer belum mengisi integrasi Payment Gateway ArexansPay di /dev.');
      return;
    }
    
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

  const copyAccountNumber = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const copyTotalNominal = (amt: number) => {
    navigator.clipboard.writeText(String(amt));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2500);
  };

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!pkg) return null;

  const isBankOrEwallet = selectedMethodObj?.category === 'bank' || selectedMethodObj?.category === 'ewallet';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#100722] border border-purple-700/60 shadow-2xl shadow-purple-900/60 text-white overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 bg-[#160a2f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <CreditCard className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {step === 'form' && 'Pembelian Script MawwwHub'}
                {step === 'payment' && `Pembayaran ${transaction?.bankName || 'ArexansPay'}`}
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

              {/* PAYMENT METHOD SELECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-purple-200">
                    Pilih Metode Pembayaran
                  </label>
                  <span className="text-[10px] text-purple-400 font-mono-code">
                    ArexansPay Multi-Channel
                  </span>
                </div>

                {activeMethods.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/50 text-center space-y-1.5">
                    <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                    <div className="text-xs font-bold text-amber-200">
                      Metode Pembayaran Belum Tersedia
                    </div>
                    <p className="text-[11px] text-amber-300/80 leading-relaxed">
                      Metode pembayaran (QRIS / E-Wallet / Bank) tidak ditampilkan karena Mode Simulasi sedang dinonaktifkan dan integrasi Payment Gateway <b>arexanspay.my.id</b> belum diisi di halaman <code className="text-amber-200 font-mono-code">/dev</code>.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080214] border border-purple-900/60 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setChannelCategoryFilter('all')}
                        className={`flex-1 py-1 rounded-lg font-semibold transition ${
                          channelCategoryFilter === 'all'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-purple-300/70 hover:text-white'
                        }`}
                      >
                        Semua ({activeMethods.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannelCategoryFilter('qris')}
                        className={`flex-1 py-1 rounded-lg font-semibold transition ${
                          channelCategoryFilter === 'qris'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-purple-300/70 hover:text-white'
                        }`}
                      >
                        QRIS
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannelCategoryFilter('ewallet')}
                        className={`flex-1 py-1 rounded-lg font-semibold transition ${
                          channelCategoryFilter === 'ewallet'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-purple-300/70 hover:text-white'
                        }`}
                      >
                        E-Wallet
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannelCategoryFilter('bank')}
                        className={`flex-1 py-1 rounded-lg font-semibold transition ${
                          channelCategoryFilter === 'bank'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-purple-300/70 hover:text-white'
                        }`}
                      >
                        Bank & VA
                      </button>
                    </div>

                    {/* Methods Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {filteredMethods.map((method) => {
                        const isSelected = paymentChannel === method.id || paymentChannel === method.code;
                        return (
                          <div
                            key={method.id}
                            onClick={() => setPaymentChannel(method.id || method.code)}
                            className={`p-3 rounded-xl border cursor-pointer transition text-xs flex items-center gap-2.5 ${
                              isSelected
                                ? 'bg-purple-900/50 border-purple-500 shadow-md shadow-purple-900/40 text-white'
                                : 'bg-purple-950/20 border-purple-900/40 text-purple-300/70 hover:bg-purple-950/40 hover:text-purple-100'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-purple-600 text-white' : 'bg-purple-900/40 text-purple-400'
                            }`}>
                              {method.category === 'qris' && <QrCode className="w-4 h-4" />}
                              {method.category === 'ewallet' && <Smartphone className="w-4 h-4" />}
                              {method.category === 'bank' && <Building2 className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate text-white">{method.name}</div>
                              <div className="text-[10px] text-purple-400/80 truncate">
                                {method.category === 'qris' && 'GPN Semua Aplikasi & Bank'}
                                {method.category === 'ewallet' && (method.accountNumber ? `No: ${method.accountNumber}` : 'Konfirmasi Instan')}
                                {method.category === 'bank' && (method.accountNumber ? `Rek: ${method.accountNumber}` : 'Transfer Bank / VA')}
                              </div>
                            </div>

                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-purple-400 bg-purple-500 text-white' : 'border-purple-800'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || activeMethods.length === 0}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-900/50 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Membuat Tagihan ArexansPay...</span>
                    </>
                  ) : activeMethods.length === 0 ? (
                    <span>Pembayaran Belum Tersedia</span>
                  ) : (
                    <>
                      <span>Lanjut Pembayaran ({formatRupiah(pkg.price)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT SCREEN */}
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

              {/* PAYMENT DETAILS: BANK / E-WALLET DIRECT DETAILS OR QRIS */}
              {isBankOrEwallet && transaction.accountNumber && transaction.accountNumber !== 'QRIS STATIS MAWWWHUB' ? (
                /* Bank Transfer / E-Wallet Container */
                <div className="p-4 rounded-2xl bg-[#090216] border border-purple-600/50 shadow-xl space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-purple-900/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        {selectedMethodObj?.category === 'bank' ? <Building2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          {selectedMethodObj?.category === 'bank' ? 'Transfer Bank' : 'Transfer E-Wallet'}
                        </span>
                        <h4 className="text-sm font-bold text-white">{transaction.bankName}</h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Otomatis
                    </span>
                  </div>

                  {/* Account Number Box */}
                  <div className="p-3 rounded-xl bg-[#110526] border border-purple-800/60">
                    <span className="text-[10px] text-purple-300/80 block mb-1">
                      {selectedMethodObj?.category === 'bank' ? 'Nomor Rekening Tujuan:' : 'Nomor Akun E-Wallet:'}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-code text-lg sm:text-xl font-black text-cyan-300 tracking-wider">
                        {transaction.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyAccountNumber(transaction.accountNumber || '')}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-xs font-bold flex items-center gap-1 transition"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-purple-300/70 block mt-1">
                      Atas Nama: <b className="text-white">{transaction.accountHolder || 'MawwwHub Store'}</b>
                    </span>
                  </div>

                  {/* Optional Barcode Toggle */}
                  {transaction.qrBase64 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAltQr(!showAltQr)}
                        className="text-[11px] text-purple-400 hover:text-purple-200 flex items-center gap-1 font-medium"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{showAltQr ? 'Sembunyikan QRIS Alternatif' : 'Atau Scan Barcode QRIS Alternatif'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showAltQr ? 'rotate-180' : ''}`} />
                      </button>

                      {showAltQr && (
                        <div className="mt-2 p-3 bg-white rounded-xl max-w-[200px] mx-auto text-center border-2 border-purple-500">
                          <img
                            src={transaction.qrBase64}
                            alt="QRIS Alternative"
                            className="w-full h-auto aspect-square object-contain"
                          />
                          <span className="text-[9px] font-bold text-slate-700 block mt-1">QRIS ALL PAYMENT</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* QRIS Mode Container */
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
                      QRIS tidak tersedia
                    </div>
                  )}

                  <div className="text-[11px] font-bold text-slate-800 mt-1 truncate">
                    {transaction.accountHolder || 'MawwwHub Store'}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono-code">
                    {transaction.bankName}
                  </div>
                </div>
              )}

              {/* Amount to pay (Critical Unique Amount) */}
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/60">
                <span className="text-[11px] text-purple-300 block mb-0.5">
                  Total Nominal yang Harus Ditransfer (WAJIB TEPAT):
                </span>
                <div className="text-2xl font-black text-amber-300 font-mono-code flex items-center justify-center gap-2">
                  <span>{formatRupiah(transaction.totalAmount)}</span>
                  <button
                    type="button"
                    onClick={() => copyTotalNominal(transaction.totalAmount)}
                    className="p-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-300 text-[10px] flex items-center gap-1"
                    title="Salin nominal"
                  >
                    {copiedNominal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-sans">{copiedNominal ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-purple-400 block mt-1">
                  (Termasuk 3 digit kode unik Rp {transaction.uniqueCode} untuk auto-konfirmasi ArexansPay)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isCheckingStatus}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-800/80 hover:bg-purple-700 text-white border border-purple-600/50 flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'Mengecek Mutasi...' : 'Saya Sudah Bayar (Cek Status)'}</span>
                </button>

                {/* Simulation Button for fast testing */}
                {(settings?.simulationEnabled ?? false) && (
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full py-2 px-3 rounded-lg text-[11px] font-semibold text-purple-300/80 bg-purple-950/40 hover:bg-purple-900/50 border border-dashed border-purple-700/50 flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ Simulasi Bayar Berhasil (Test Mode Instan)</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-purple-400/80 text-left space-y-1 bg-[#0c051a] p-3 rounded-xl border border-purple-900/30">
                <div className="font-semibold text-purple-300 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-purple-400" />
                  <span>Petunjuk Pembayaran:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  {isBankOrEwallet ? (
                    <>
                      <li>Buka aplikasi Bank atau E-Wallet pilihan Anda ({transaction.bankName}).</li>
                      <li>Transfer ke nomor <b>{transaction.accountNumber}</b> a.n. <b>{transaction.accountHolder}</b>.</li>
                      <li>Masukkan nominal tepat <b>{formatRupiah(transaction.totalAmount)}</b> beserta kode uniknya.</li>
                      <li>Sistem ArexansPay akan otomatis mendeteksi mutasi dan menerbitkan key Anda!</li>
                    </>
                  ) : (
                    <>
                      <li>Buka m-Banking (BCA, Mandiri, BRI, SeaBank) atau E-Wallet (DANA, Gopay, OVO, ShopeePay).</li>
                      <li>Pilih menu <b>Scan QR / QRIS</b> lalu scan barcode di atas atau simpan tangkapan layar.</li>
                      <li>Pastikan nominal transfer sama persis hingga digit terakhir.</li>
                      <li>Setelah transfer berhasil, halaman ini akan otomatis membuka Key & Loadstring Anda!</li>
                    </>
                  )}
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

