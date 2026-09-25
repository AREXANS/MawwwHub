import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  Save,
  Plus,
  Trash2,
  Edit2,
  Key,
  CreditCard,
  FileCode,
  Layers,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowLeft,
  Sliders,
  DollarSign,
  TrendingUp,
  Cpu,
  Info,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { FullAdminSettings, ScriptPackage, IssuedKey, Transaction, AdminStats } from '../types';

interface DevDashboardProps {
  onBackToHome: () => void;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({ onBackToHome }) => {
  // Auth state
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('mawwwhub_admin_token') || '';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: 'stats', 'packages', 'script', 'loadstring', 'arexanspay', 'keys', 'transactions'
  const [activeTab, setActiveTab] = useState<'stats' | 'packages' | 'script' | 'loadstring' | 'arexanspay' | 'keys' | 'transactions'>('stats');

  // Data states
  const [settings, setSettings] = useState<FullAdminSettings | null>(null);
  const [keys, setKeys] = useState<IssuedKey[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Key Generator form
  const [genDuration, setGenDuration] = useState('7');
  const [genUsername, setGenUsername] = useState('');
  const [genNote, setGenNote] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // Package edit state
  const [editingPkg, setEditingPkg] = useState<ScriptPackage | null>(null);
  const [isNewPkgModalOpen, setIsNewPkgModalOpen] = useState(false);
  const [pkgFormData, setPkgFormData] = useState<Partial<ScriptPackage>>({
    name: '',
    durationDays: 7,
    durationLabel: '7 Hari',
    price: 15000,
    isPopular: false,
    description: '',
    isActive: true
  });

  // ArexansPay Test state
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingGateway, setIsTestingGateway] = useState(false);

  // Test Raw Loader Endpoint
  const [rawTestKey, setRawTestKey] = useState('MWH-DEMO-LIFETIME-DEVKEY');
  const [rawTestOutput, setRawTestOutput] = useState('');
  const [isTestingRaw, setIsTestingRaw] = useState(false);

  // Logo file upload state
  const [logoUploadMsg, setLogoUploadMsg] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 5MB!");
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSettings({ ...settings, logoUrl: base64 });
        setLogoUploadMsg(`File "${file.name}" berhasil dimuat! Klik "Simpan Perubahan" untuk menyimpan permanen.`);
        setTimeout(() => setLogoUploadMsg(''), 5000);
      }
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      alert("Gagal membaca file gambar.");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (!settings) return;
    setSettings({ ...settings, logoUrl: '' });
    setLogoUploadMsg('Logo custom dihapus. Icon default akan digunakan.');
    setTimeout(() => setLogoUploadMsg(''), 4000);
  };

  // Check login on mount
  useEffect(() => {
    if (token) {
      loadAllAdminData(token);
    }
  }, [token]);

  const loadAllAdminData = async (authToken: string) => {
    setIsLoadingData(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-admin-token': authToken
      };

      const [resSettings, resKeys, resTrx, resStats] = await Promise.all([
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/keys', { headers }),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/admin/stats', { headers })
      ]);

      if (resSettings.status === 401) {
        localStorage.removeItem('mawwwhub_admin_token');
        setToken('');
        setLoginError('Sesi login telah kedaluwarsa. Silakan masuk kembali.');
        setIsLoadingData(false);
        return;
      }

      const dataSettings = await resSettings.json();
      const dataKeys = await resKeys.json();
      const dataTrx = await resTrx.json();
      const dataStats = await resStats.json();

      if (dataSettings.success) setSettings(dataSettings.data);
      if (dataKeys.success) setKeys(dataKeys.data);
      if (dataTrx.success) setTransactions(dataTrx.data);
      if (dataStats.success) setStats(dataStats.data);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('mawwwhub_admin_token', data.token);
        setToken(data.token);
        loadAllAdminData(data.token);
      } else {
        setLoginError(data.message || 'Login gagal. Periksa username dan password.');
      }
    } catch (err: any) {
      setLoginError('Gagal menghubungkan ke server: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout dari MawwwHub /dev?')) {
      localStorage.removeItem('mawwwhub_admin_token');
      setToken('');
      setSettings(null);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Pengaturan MawwwHub berhasil disimpan secara permanen!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setSaveErrorMsg(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err: any) {
      setSaveErrorMsg('Error menyimpan: ' + err.message);
    }
  };

  // Key generation
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({
          durationDays: genDuration,
          robloxUsername: genUsername || 'Buyer',
          customerNote: genNote || 'Manual Key Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setGenUsername('');
        setGenNote('');
        loadAllAdminData(token);
        alert(`Key baru berhasil diterbitkan: ${data.data.key}`);
      } else {
        alert(data.message || 'Gagal menerbitkan key');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Reset HWID
  const handleResetHwid = async (keyString: string) => {
    if (!confirm(`Reset HWID untuk key ${keyString}? Pengguna akan dapat login dari device baru.`)) return;
    try {
      const res = await fetch(`/api/admin/keys/${keyString}/reset-hwid`, {
        method: 'POST',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      alert(data.message);
      loadAllAdminData(token);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Revoke Key
  const handleRevokeKey = async (keyString: string) => {
    if (!confirm(`Cabut (Revoke) key ${keyString}? Script tidak akan dapat digunakan lagi dengan key ini.`)) return;
    try {
      const res = await fetch(`/api/admin/keys/${keyString}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      alert(data.message);
      loadAllAdminData(token);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Manual Approve Transaction
  const handleApproveTransaction = async (trxId: string) => {
    if (!confirm(`Approve transaksi ${trxId} secara manual dan terbitkan key sekarang?`)) return;
    try {
      const res = await fetch(`/api/admin/transactions/${trxId}/manual-approve`, {
        method: 'POST',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      alert(data.message);
      loadAllAdminData(token);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Test ArexansPay Gateway connection
  const handleTestArexansPay = async () => {
    if (!settings) return;
    setIsTestingGateway(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/arexanspay/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({
          apiUrl: settings.arexanspay.apiUrl,
          apiKey: settings.arexanspay.apiKey
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingGateway(false);
    }
  };

  // Test Raw Loader Endpoint
  const handleTestRawLoader = async () => {
    setIsTestingRaw(true);
    try {
      const res = await fetch(`/api/raw/mawwwhub?key=${encodeURIComponent(rawTestKey.trim())}&executor=1`, {
        headers: { 'X-Requested-By': 'MawwwHubExecutor' }
      });
      const text = await res.text();
      setRawTestOutput(text);
    } catch (err: any) {
      setRawTestOutput('Gagal request raw script: ' + err.message);
    } finally {
      setIsTestingRaw(false);
    }
  };

  // Package Management
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (editingPkg) {
      // update
      const updated = settings.packages.map(p => p.id === editingPkg.id ? { ...p, ...pkgFormData } as ScriptPackage : p);
      setSettings({ ...settings, packages: updated });
    } else {
      // add new
      const newPkg: ScriptPackage = {
        id: `pkg-${Date.now().toString(36)}`,
        name: pkgFormData.name || 'Paket Baru',
        durationDays: Number(pkgFormData.durationDays) || 7,
        durationLabel: pkgFormData.durationLabel || `${pkgFormData.durationDays} Hari`,
        price: Number(pkgFormData.price) || 10000,
        isPopular: !!pkgFormData.isPopular,
        description: pkgFormData.description || '',
        isActive: pkgFormData.isActive ?? true
      };
      setSettings({ ...settings, packages: [...settings.packages, newPkg] });
    }
    setIsNewPkgModalOpen(false);
    setEditingPkg(null);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (!settings) return;
    if (confirm('Hapus paket ini?')) {
      const updated = settings.packages.filter(p => p.id !== pkgId);
      setSettings({ ...settings, packages: updated });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2500);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (if not logged in)
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0416]">
        <div className="w-full max-w-md rounded-2xl bg-[#120726] border border-purple-700/60 p-8 shadow-2xl shadow-purple-900/60 text-white">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-500 p-0.5 mx-auto mb-4 shadow-lg shadow-purple-600/40 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d071a] rounded-[14px] flex items-center justify-center">
                <Lock className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-200 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              MawwwHub Admin Portal
            </h2>
            <p className="text-xs text-purple-300/70 mt-1 font-mono-code">
              Endpoints Pengaturan: /dev
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Username Admin
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mawwwhub"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070210] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Password Admin
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070210] border border-purple-800/60 focus:border-purple-400 focus:outline-none text-xs text-white font-mono-code"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-[11px] text-purple-300/80">
              <span className="font-semibold text-purple-200">Sistem Sesi Permanen:</span>
              <p>Anda cukup login 1 kali. Sesi admin akan tersimpan permanen di browser ini sampai Anda menekan tombol logout.</p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-900/50 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Masuk ke Pengaturan /dev</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToHome}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Utama</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080214] text-slate-100 pb-20">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 border-b border-purple-900/60 bg-[#0e051e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 text-purple-300 hover:text-white transition"
              title="Kembali ke Web Publik"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">MawwwHub</span>
              <span className="px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase tracking-wider bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-md">
                Admin /dev
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {saveSuccessMsg && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tersimpan</span>
              </span>
            )}

            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 transition"
              title="Logout Sesi Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {saveSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 mb-6 border-b border-purple-900/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ringkasan & Transaksi</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'packages'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Paket Durasi & Harga</span>
          </button>

          <button
            onClick={() => setActiveTab('loadstring')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'loadstring'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Loadstring & Kode Mentah Lua</span>
          </button>

          <button
            onClick={() => setActiveTab('arexanspay')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'arexanspay'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>ArexansPay Gateway</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'keys'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Integrasi Key Durasi</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'script'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/30 text-purple-300/70 hover:bg-purple-900/40'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Umum & Deskripsi</span>
          </button>
        </div>

        {/* TAB 1: RINGKASAN & TRANSAKSI */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Total Omset Penjualan</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono-code">
                  {formatRupiah(stats?.totalRevenue || 0)}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">Pembayaran Sukses</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Total Key Aktif</span>
                <span className="text-xl sm:text-2xl font-black text-purple-200 font-mono-code">
                  {stats?.activeKeys || 0}
                </span>
                <span className="text-[11px] text-purple-400/70 block mt-1">Dari {stats?.totalKeys || 0} total key</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Transaksi Berhasil</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-code">
                  {stats?.successTransactions || 0}
                </span>
                <span className="text-[11px] text-purple-400/70 block mt-1">Auto issued key</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120726] border border-purple-900/60 shadow-lg">
                <span className="text-xs text-purple-300/70 block mb-1">Total Transaksi Dibuat</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono-code">
                  {stats?.totalTransactions || 0}
                </span>
                <span className="text-[11px] text-purple-400/70 block mt-1">Semua tagihan</span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Transaksi Pembelian Terbaru</h3>
                  <p className="text-xs text-purple-300/70">Dipantau real time melalui payment listener ArexansPay</p>
                </div>
                <button
                  onClick={() => loadAllAdminData(token)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-800/40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-purple-400/60">
                  Belum ada transaksi pembelian. Tagihan baru akan muncul di sini secara otomatis.
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-900/50 text-purple-300 font-mono-code">
                        <th className="py-2.5 px-3">ID Transaksi</th>
                        <th className="py-2.5 px-3">Paket</th>
                        <th className="py-2.5 px-3">Username Roblox</th>
                        <th className="py-2.5 px-3">Nominal (+Unik)</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Key Diterbitkan</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-purple-950/20">
                          <td className="py-3 px-3 font-mono-code text-purple-200">{t.id}</td>
                          <td className="py-3 px-3 font-semibold text-white">{t.packageName}</td>
                          <td className="py-3 px-3">
                            {t.robloxUsername && t.robloxUsername !== 'Guest' && t.robloxUsername !== 'User' ? (
                              <div className="flex items-center gap-1.5 font-semibold text-white">
                                <span className="text-purple-400">🎮</span>
                                <span>{t.robloxUsername}</span>
                              </div>
                            ) : (
                              <span className="text-purple-400/50 italic text-[11px]">Belum execute</span>
                            )}
                            {t.requestedCustomKey && (
                              <div className="text-[10px] text-amber-300 font-mono-code mt-0.5">
                                Req: {t.requestedCustomKey}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono-code font-bold text-amber-300">
                            {formatRupiah(t.totalAmount || t.baseAmount)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.status === 'success'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                : t.status === 'pending'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                                : 'bg-red-950/70 text-red-400 border border-red-500/30'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono-code text-[11px] text-purple-200">
                            {t.issuedKey || '-'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {t.status === 'pending' && (
                              <button
                                onClick={() => handleApproveTransaction(t.id)}
                                className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow transition"
                              >
                                Approve Manual
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PAKET DURASI & HARGA SCRIPT */}
        {activeTab === 'packages' && settings && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Manajemen Paket Pembelian & Durasi Script</h3>
                <p className="text-xs text-purple-300/70">
                  Atur paket durasi (1 Hari, 7 Hari, 30 Hari, Lifetime) dan harga yang tampil di halaman utama.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPkg(null);
                  setPkgFormData({
                    name: 'Paket Baru',
                    durationDays: 7,
                    durationLabel: '7 Hari',
                    price: 15000,
                    isPopular: false,
                    description: 'Akses script VIP',
                    isActive: true
                  });
                  setIsNewPkgModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-purple-900/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Paket Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-5 rounded-2xl bg-[#120726] border transition flex flex-col justify-between ${
                    pkg.isActive ? 'border-purple-800/60' : 'border-purple-950/40 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono-code font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/40">
                        {pkg.durationLabel || (pkg.durationDays > 0 ? `${pkg.durationDays} Hari` : 'Permanen')}
                      </span>
                      <div className="flex items-center gap-1">
                        {pkg.isPopular && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                            Populer
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          pkg.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-white mb-1">{pkg.name}</h4>
                    <div className="text-xl font-black text-amber-300 font-mono-code mb-2">
                      {formatRupiah(pkg.price)}
                    </div>
                    <p className="text-xs text-purple-200/70 mb-4">{pkg.description}</p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between">
                    <span className="text-[11px] text-purple-400/60 font-mono-code">{pkg.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPkg(pkg);
                          setPkgFormData({ ...pkg });
                          setIsNewPkgModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 transition"
                        title="Edit Paket"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 transition"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Tambah/Edit Paket */}
            {isNewPkgModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-[#120726] border border-purple-700/60 p-6 text-white shadow-2xl">
                  <h4 className="text-base font-bold mb-4">
                    {editingPkg ? 'Edit Paket Script' : 'Tambah Paket Durasi Baru'}
                  </h4>

                  <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">Nama Paket</label>
                      <input
                        type="text"
                        required
                        value={pkgFormData.name || ''}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, name: e.target.value })}
                        placeholder="Contoh: Paket 7 Hari (1 Minggu)"
                        className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-purple-200 font-semibold mb-1">Durasi Hari (-1 = Lifetime)</label>
                        <input
                          type="number"
                          required
                          value={pkgFormData.durationDays ?? 7}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, durationDays: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 font-semibold mb-1">Label Durasi</label>
                        <input
                          type="text"
                          required
                          value={pkgFormData.durationLabel || ''}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, durationLabel: e.target.value })}
                          placeholder="7 Hari"
                          className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">Harga (IDR)</label>
                      <input
                        type="number"
                        required
                        value={pkgFormData.price ?? 15000}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, price: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white font-mono-code"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 font-semibold mb-1">Deskripsi Paket</label>
                      <textarea
                        rows={2}
                        value={pkgFormData.description || ''}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, description: e.target.value })}
                        placeholder="Deskripsi singkat keunggulan paket"
                        className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!pkgFormData.isPopular}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, isPopular: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span>Tandai Sebagai "Populer"</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgFormData.isActive ?? true}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, isActive: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span>Status Aktif</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-purple-900/40">
                      <button
                        type="button"
                        onClick={() => setIsNewPkgModalOpen(false)}
                        className="px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md"
                      >
                        Simpan Paket
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: LOADSTRING & KODE MENTAH LUA */}
        {activeTab === 'loadstring' && settings && (
          <div className="space-y-6">
            
            {/* Loadstring Configuration */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Template Loadstring Pembayaran Berhasil</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    String script ini yang akan otomatis didapatkan dan disalin oleh pembeli saat pembayaran mereka diverifikasi.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Template</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Template Loadstring (Variabel tersedia: <code className="text-amber-300">{`{KEY}`}</code>, <code className="text-cyan-300">{`{API_BASE}`}</code>)
                </label>
                <textarea
                  rows={3}
                  value={settings.loadstringTemplate}
                  onChange={(e) => setSettings({ ...settings, loadstringTemplate: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080214] border border-purple-800 font-mono-code text-xs text-purple-200 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Live Preview of Loadstring */}
              <div className="p-3.5 rounded-xl bg-[#0a0318] border border-purple-900/60">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                  Preview Tampilan Loadstring Pembeli:
                </span>
                <pre className="text-xs font-mono-code text-cyan-300 break-all whitespace-pre-wrap">
                  {settings.loadstringTemplate
                    .replace(/{KEY}/g, 'MWH-SAMPLE-KEY-9999')
                    .replace(/{API_BASE}/g, window.location.origin)}
                </pre>
              </div>
            </div>

            {/* Raw Script Body (Kode Mentah Lua) Configuration */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Kode Mentah Script Roblox (Raw Lua Script Body)</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Kode ini dieksekusi di Roblox ketika executor memanggil endpoint <code>/api/raw/:scriptId?key=...</code> setelah key diverifikasi aktif.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kode Mentah</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Isi Script Lua Mentah (Mendukung: <code className="text-amber-300">{`{KEY}`}</code>, <code className="text-cyan-300">{`{EXPIRES_AT}`}</code>, <code className="text-purple-300">{`{PACKAGE}`}</code>, <code className="text-emerald-300">{`{API_BASE}`}</code>)
                </label>
                <textarea
                  rows={14}
                  value={settings.rawScriptBody}
                  onChange={(e) => setSettings({ ...settings, rawScriptBody: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080214] border border-purple-800 font-mono-code text-xs text-purple-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* HWID Lock settings */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">Proteksi HWID Lock (Hardware ID Device)</span>
                  <span className="text-[11px] text-purple-300/70">
                    Kunci key ke device pertama kali yang mengeksekusi script agar tidak bisa disebarluaskan.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-200">
                  <input
                    type="checkbox"
                    checked={settings.enableHwidLock}
                    onChange={(e) => setSettings({ ...settings, enableHwidLock: e.target.checked })}
                    className="rounded text-purple-600 w-4 h-4"
                  />
                  <span>Aktifkan HWID Lock</span>
                </label>
              </div>

              {/* Test Raw Script Endpoint Tool */}
              <div className="p-4 rounded-xl bg-[#0a0316] border border-purple-800/60 space-y-3">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Uji Live Endpoint Raw Script (/api/raw/mawwwhub)</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rawTestKey}
                    onChange={(e) => setRawTestKey(e.target.value)}
                    placeholder="Masukkan Key untuk tes"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#05010d] border border-purple-800 text-xs font-mono-code text-white"
                  />
                  <button
                    onClick={handleTestRawLoader}
                    disabled={isTestingRaw}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition disabled:opacity-50"
                  >
                    {isTestingRaw ? 'Memanggil...' : 'Tes Endpoint'}
                  </button>
                </div>

                {rawTestOutput && (
                  <div className="mt-2 p-3 rounded-lg bg-[#05010d] border border-purple-900 text-[11px] font-mono-code text-purple-200 overflow-x-auto max-h-48 custom-scrollbar">
                    <pre className="whitespace-pre-wrap">{rawTestOutput}</pre>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: AREXANSPAY GATEWAY INTEGRATION */}
        {activeTab === 'arexanspay' && settings && (
          <div className="space-y-6">
            
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Konfigurasi Payment Gateway ArexansPay</span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Sesuai dokumentasi resmi <code>https://arexanspay.my.id/docs</code> untuk QRIS otomatis & Bank Transfer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://arexanspay.my.id/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/40 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Buka Dokumentasi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleSaveSettings}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Gateway</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    API Base URL ArexansPay
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.apiUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, apiUrl: e.target.value }
                    })}
                    placeholder="https://arexanspay.my.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Default: https://arexanspay.my.id atau domain server Anda
                  </span>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    License Key / API Key (X-API-Key)
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.apiKey}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, apiKey: e.target.value }
                    })}
                    placeholder="arexanspay_07365360dc0f8af09d084ae8be829ce8499eca3f95c33bb0cfe3608e4aea9a44"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code text-[11px]"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Header X-API-Key toko Anda dari dashboard ArexansPay
                  </span>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    QRIS ID Toko (X-QRIS-ID)
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.qrisId}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, qrisId: e.target.value }
                    })}
                    placeholder="axspay-na49b8c-ec96-41dc-a4e2-1293e755a81h"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    QRIS ID untuk menerima pembayaran QRIS Statis toko
                  </span>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">
                    Webhook Secret Key (Tasker Listener)
                  </label>
                  <input
                    type="text"
                    value={settings.arexanspay.webhookSecret}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, webhookSecret: e.target.value }
                    })}
                    placeholder="WEBHOOK_KEY_TOKO_ANDA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white font-mono-code"
                  />
                  <span className="text-[10px] text-purple-400/60 mt-1 block">
                    Kunci pengaman webhook Tasker m-Banking Android
                  </span>
                </div>
              </div>

              {/* Mode Simulasi Switch */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">Mode Simulasi / Sandbox (Rekomendasi untuk Uji Coba)</span>
                  <span className="text-[11px] text-purple-300/70">
                    Memungkinkan tombol "Simulasi Bayar Berhasil" di popup pembelian agar Anda dan pembeli bisa menguji alur terbit key instan tanpa harus transfer m-banking sungguhan.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-200">
                  <input
                    type="checkbox"
                    checked={settings.arexanspay.enableSimulation}
                    onChange={(e) => setSettings({
                      ...settings,
                      arexanspay: { ...settings.arexanspay, enableSimulation: e.target.checked }
                    })}
                    className="rounded text-purple-600 w-4 h-4"
                  />
                  <span>Aktifkan Mode Uji Coba</span>
                </label>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestArexansPay}
                  disabled={isTestingGateway}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingGateway ? 'animate-spin' : ''}`} />
                  <span>{isTestingGateway ? 'Mengecek Koneksi API...' : 'Tes Koneksi ArexansPay'}</span>
                </button>
                <span className="text-[11px] text-purple-300/70">
                  Menguji endpoint <code>/api/payments</code> dengan X-API-Key Anda
                </span>
              </div>

              {/* Test Result box */}
              {testResult && (
                <div className={`p-4 rounded-xl border text-xs font-mono-code ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{testResult.success ? 'Koneksi Berhasil!' : 'Hasil Pengecekan:'}</span>
                  </div>
                  <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}

              {/* Webhook Endpoint for Tasker HP Android */}
              <div className="p-4 rounded-xl bg-[#090214] border border-purple-900/60 text-xs space-y-2">
                <span className="font-bold text-purple-200 block">
                  Alamat URL Webhook Tasker / HP Android Anda:
                </span>
                <div className="flex items-center gap-2 font-mono-code text-cyan-300 bg-[#05010b] p-2.5 rounded-lg border border-purple-900">
                  <span className="flex-1 break-all">{window.location.origin}/api/webhook</span>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/api/webhook`, 'webhook')}
                    className="px-2 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedText === 'webhook' ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'webhook' ? 'Disalin' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-purple-300/70">
                  Masukkan URL di atas ke profil Tasker AutoNotification HP Anda dengan method POST JSON.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: INTEGRASI KEY DURASI & GENERATOR */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            
            {/* Manual Key Generator Box */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Terbitkan Key Baru Manual (Admin Generator)</span>
              </h3>

              <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Durasi Key</label>
                  <select
                    value={genDuration}
                    onChange={(e) => setGenDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white font-mono-code"
                  >
                    <option value="1">1 Hari (24 Jam)</option>
                    <option value="3">3 Hari</option>
                    <option value="7">7 Hari (1 Minggu)</option>
                    <option value="14">14 Hari (2 Minggu)</option>
                    <option value="30">30 Hari (1 Bulan)</option>
                    <option value="90">90 Hari (3 Bulan)</option>
                    <option value="-1">Lifetime / Permanen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Username Roblox</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mawww_Admin"
                    value={genUsername}
                    onChange={(e) => setGenUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-semibold mb-1">Catatan / Note</label>
                  <input
                    type="text"
                    placeholder="Contoh: Giveaway / VIP User"
                    value={genNote}
                    onChange={(e) => setGenNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070210] border border-purple-800 text-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isGeneratingKey}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white transition disabled:opacity-50 shadow-md shadow-purple-900/40"
                  >
                    {isGeneratingKey ? 'Membuat...' : '+ Terbitkan Key'}
                  </button>
                </div>
              </form>
            </div>

            {/* Issued Keys Table */}
            <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Semua Key yang Diterbitkan</h3>
                  <p className="text-xs text-purple-300/70">Key aktif, kadaluwarsa, dan status HWID pengguna</p>
                </div>
                <button
                  onClick={() => loadAllAdminData(token)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-800/40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {keys.length === 0 ? (
                <div className="text-center py-8 text-xs text-purple-400/60">
                  Belum ada key terdaftar. Terbitkan key pertama Anda di atas.
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-900/50 text-purple-300 font-mono-code">
                        <th className="py-2.5 px-3">License Key</th>
                        <th className="py-2.5 px-3">Durasi</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">User & Note</th>
                        <th className="py-2.5 px-3">Kadaluwarsa</th>
                        <th className="py-2.5 px-3">HWID Lock</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950">
                      {keys.map((k) => (
                        <tr key={k.key} className="hover:bg-purple-950/20">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-mono-code font-bold text-purple-200">
                              <span>{k.key}</span>
                              <button
                                onClick={() => copyToClipboard(k.key, k.key)}
                                className="text-purple-400 hover:text-white"
                                title="Salin Key"
                              >
                                {copiedText === k.key ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {k.durationDays > 0 ? `${k.durationDays} Hari` : 'Permanen'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              k.status === 'active'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-950/70 text-red-400 border border-red-500/30'
                            }`}>
                              {k.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-purple-300">
                            {k.robloxUsername && k.robloxUsername !== 'User' && k.robloxUsername !== 'Guest' ? (
                              <div className="flex items-center gap-1.5 font-semibold text-white">
                                <span className="text-purple-400">🎮</span>
                                <span>{k.robloxUsername}</span>
                              </div>
                            ) : (
                              <span className="text-purple-400/50 italic text-[11px]">Belum execute</span>
                            )}
                            <div className="text-[10px] text-purple-400/60 truncate max-w-[140px] mt-0.5">{k.customerNote || '-'}</div>
                          </td>
                          <td className="py-3 px-3 font-mono-code text-[11px] text-purple-200">
                            {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('id-ID') : 'Lifetime'}
                          </td>
                          <td className="py-3 px-3">
                            {k.hwid ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono-code truncate max-w-[90px]" title={k.hwid}>
                                  🔒 1 Device
                                </span>
                                <button
                                  onClick={() => handleResetHwid(k.key)}
                                  className="px-1.5 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 text-[10px] font-bold transition"
                                  title="Reset kunci HWID agar bisa digunakan di perangkat baru"
                                >
                                  Reset
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-400/80 font-medium">Bebas (Belum Terkunci)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                const loaderCode = `_G.MawwwHubKey = "${k.key}"\nloadstring(game:HttpGet("${window.location.origin}/api/raw/mawwwhub?key=" .. _G.MawwwHubKey))()`;
                                copyToClipboard(loaderCode, `loader-${k.key}`);
                                alert(`Script loader lengkap dengan Key ${k.key} berhasil disalin!`);
                              }}
                              className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded text-[10px] font-semibold mr-1.5 transition"
                              title="Salin Full Loader Script"
                            >
                              Copy Script
                            </button>
                            {k.status === 'active' && (
                              <button
                                onClick={() => handleRevokeKey(k.key)}
                                className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded text-[10px] font-semibold transition"
                                title="Cabut Key"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 6: PENGATURAN UMUM & DESKRIPSI SCRIPT */}
        {activeTab === 'script' && settings && (
          <div className="rounded-2xl bg-[#120726] border border-purple-900/60 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Pengaturan Branding & Konten Website</span>
                </h3>
                <p className="text-xs text-purple-300/70">
                  Sesuaikan nama website, teks deskripsi, pengumuman promo, dan link media sosial Anda.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>

            {/* Custom Logo Uploader Section */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>Upload Logo Kustom Website</span>
                  </h4>
                  <p className="text-xs text-purple-300/70">
                    Upload file gambar logo Anda (PNG, JPG, WebP, SVG, GIF). Logo akan otomatis tampil di navbar header dan footer.
                  </p>
                </div>
                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Logo Kustom</span>
                  </button>
                )}
              </div>

              {logoUploadMsg && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-xs text-purple-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{logoUploadMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Upload File Input Button */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label
                      htmlFor="logoFileInput"
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600 hover:from-purple-600 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/50 transition active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingLogo ? 'Memproses File...' : 'Pilih File Logo dari Perangkat'}</span>
                    </label>
                    <input
                      id="logoFileInput"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <span className="text-[11px] text-purple-400/80">
                      Format: PNG, JPG, WebP, SVG (Maks. 5 MB)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-purple-300/80 mb-1">
                      Atau Tempel (Paste) URL Gambar Langsung:
                    </label>
                    <input
                      type="text"
                      value={settings.logoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://contoh.com/logo-mawwwhub.png atau data:image/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#06010e] border border-purple-800 text-xs font-mono-code text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 rounded-xl bg-[#0e0420] border border-purple-900/60 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-2 block">
                    Preview Tampilan Logo
                  </span>
                  
                  {settings.logoUrl ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-500 p-0.5 shadow-xl shadow-purple-600/40 mx-auto overflow-hidden">
                        <img
                          src={settings.logoUrl}
                          alt="Preview Logo"
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold block">
                        ✓ Logo Kustom Terpasang
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-[#14082c] border border-dashed border-purple-700/60 flex items-center justify-center text-purple-400/50 mx-auto">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] text-purple-400/60 block">
                        Menggunakan Icon Terminal Default
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Form & Checkout Settings Section */}
            <div className="p-5 rounded-2xl bg-[#090216] border border-purple-800/70 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Pengaturan Formulir Order & Pembayaran Checkout</span>
                </h4>
                <p className="text-xs text-purple-300/70">
                  Atur apakah pembeli perlu mengisi username Roblox dan nomor WhatsApp saat checkout, serta kontrol tombol simulasi bayar.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Toggle 1: Username Roblox */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Minta Username Roblox Saat Order
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Jika dinonaktifkan (default), pembeli dapat langsung checkout tanpa harus mengetik username Roblox.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={!!settings.enableOrderUsername}
                      onChange={(e) => setSettings({ ...settings, enableOrderUsername: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Toggle 2: WhatsApp Number */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Minta Nomor WhatsApp Saat Order
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Jika dinonaktifkan (default), pembeli tidak perlu mengisi nomor telepon/WhatsApp.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={!!settings.enableOrderWhatsapp}
                      onChange={(e) => setSettings({ ...settings, enableOrderWhatsapp: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Toggle 3: Simulation Payment */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Mode Pembayaran Simulasi (Testing Cepat)
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Tampilkan tombol "⚡ Simulasi Bayar Berhasil" di popup pembayaran agar pembeli/admin dapat menguji aktivasi key tanpa transfer uang asli.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.arexanspay.enableSimulation ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        arexanspay: { ...settings.arexanspay, enableSimulation: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Toggle 4: Custom Key Request in Order Form */}
                <div className="p-3.5 rounded-xl bg-[#110526] border border-purple-900/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Izinkan Pembeli Request Custom Key Sendiri
                    </span>
                    <span className="text-[11px] text-purple-300/70">
                      Tampilkan kolom input custom key (opsional) saat order, sehingga pembeli bisa membuat nama key VIP mereka sendiri (contoh: VIP-NAME).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.enableCustomKeyOrder ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        enableCustomKeyOrder: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-purple-200 font-semibold mb-1">Nama Website / Hub</label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Target Game Roblox</label>
                <input
                  type="text"
                  value={settings.gameName}
                  onChange={(e) => setSettings({ ...settings, gameName: e.target.value })}
                  placeholder="Blox Fruits, Blade Ball, All Games"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Headline Utama (Hero)</label>
                <input
                  type="text"
                  value={settings.heroHeadline}
                  onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Sub-Headline / Tagline</label>
                <textarea
                  rows={2}
                  value={settings.heroSubheadline}
                  onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Deskripsi Lengkap Script</label>
                <textarea
                  rows={3}
                  value={settings.scriptDescription}
                  onChange={(e) => setSettings({ ...settings, scriptDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-purple-200 font-semibold mb-1">Teks Pengumuman / Promo Banner</label>
                <input
                  type="text"
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="🔥 PROMO: Diskon 30% untuk semua paket..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Link Discord Komunitas</label>
                <input
                  type="text"
                  value={settings.discordUrl}
                  onChange={(e) => setSettings({ ...settings, discordUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Link WhatsApp Admin</label>
                <input
                  type="text"
                  value={settings.whatsappContact}
                  onChange={(e) => setSettings({ ...settings, whatsappContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080214] border border-purple-800 text-white"
                />
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
