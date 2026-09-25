import React from 'react';
import { Zap, Check, Star, Clock, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { ScriptPackage, AppPublicSettings } from '../types';

interface PackagesListProps {
  settings: AppPublicSettings | null;
  onSelectPackage: (pkg: ScriptPackage) => void;
  onGoDev: () => void;
}

export const PackagesList: React.FC<PackagesListProps> = ({
  settings,
  onSelectPackage,
  onGoDev
}) => {
  const packages = settings?.packages || [];
  const scriptName = settings?.gameName || "MawwwHub Roblox VIP";
  const scriptDesc = settings?.scriptDescription;
  const features = settings?.scriptFeatures || [];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <section id="packages-section" className="py-12 px-4 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-xs font-semibold text-purple-300 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Paket Durasi Key Resmi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Pilihan Paket & Harga MawwwHub
        </h2>
        <p className="text-sm text-purple-300/70">
          Semua paket mendapatkan akses script lengkap tanpa batasan fitur. Key dan link loadstring langsung aktif instan setelah pembayaran terkonfirmasi.
        </p>
      </div>

      {/* Script Highlights Box */}
      {scriptDesc && (
        <div className="mb-12 p-6 rounded-2xl bg-[#110722]/80 border border-purple-900/50 max-w-4xl mx-auto backdrop-blur-sm shadow-xl shadow-purple-950/30">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono-code">
                Target Game & Hub Support
              </span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">{scriptName}</h3>
              <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">{scriptDesc}</p>
            </div>
            {features.length > 0 && (
              <div className="w-full md:w-80 flex-shrink-0 bg-[#160a2e]/90 p-4 rounded-xl border border-purple-800/40">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-2">
                  Fitur Unggulan Script:
                </span>
                <ul className="space-y-1.5">
                  {features.slice(0, 4).map((feat, idx) => (
                    <li key={idx} className="text-xs text-purple-200/90 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#120824]/60 border border-purple-900/40 max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white mb-2">Halaman Utama Bersih / Belum Ada Paket Aktif</h3>
          <p className="text-xs text-purple-300/70 mb-6">
            Anda dapat menambahkan paket durasi (1 Hari, 7 Hari, 30 Hari, Lifetime) dan mengatur harga serta script loadstring di menu /dev.
          </p>
          <button
            onClick={onGoDev}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-900/40"
          >
            Buka Pengaturan /dev
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => {
            const isPopular = pkg.isPopular;
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#220d45] to-[#14062a] border-2 border-purple-500 shadow-2xl shadow-purple-600/30'
                    : 'bg-[#120726]/80 hover:bg-[#180a34]/90 border border-purple-900/50 shadow-xl shadow-purple-950/40'
                }`}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>Paling Rekomendasi</span>
                  </div>
                )}

                <div>
                  {/* Duration Label */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-purple-300 bg-purple-950/70 px-2.5 py-1 rounded-md border border-purple-800/40 flex items-center gap-1.5 font-mono-code">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {pkg.durationLabel || (pkg.durationDays > 0 ? `${pkg.durationDays} Hari` : "Lifetime")}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      Instan Delivery
                    </span>
                  </div>

                  {/* Package Title */}
                  <h3 className="text-lg font-extrabold text-white mb-2">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text">
                      {formatRupiah(pkg.price)}
                    </span>
                    <span className="text-xs text-purple-300/60 block mt-0.5">
                      Pembayaran Sekali Bayar
                    </span>
                  </div>

                  {/* Package Description */}
                  <p className="text-xs text-purple-200/70 mb-6 leading-relaxed min-h-[36px]">
                    {pkg.description || "Akses script Roblox lengkap dengan key eksklusif."}
                  </p>

                  {/* Features list checklist */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-purple-900/40">
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Script Hub Full Unlock</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Support Mobile & PC Executor</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Otomatis Dapat Key & Loadstring</span>
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 ${
                    isPopular
                      ? 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 hover:from-purple-400 hover:to-violet-400 text-white shadow-lg shadow-purple-600/40'
                      : 'bg-purple-900/50 hover:bg-purple-800/70 text-purple-100 border border-purple-700/50'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Beli Sekarang</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
