import React from 'react';
import { ExternalLink, Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { AdBannerConfig } from '../types';

interface AdBannerProps {
  banner?: AdBannerConfig;
}

export const AdBanner: React.FC<AdBannerProps> = ({ banner }) => {
  if (!banner || !banner.enabled || !banner.mediaUrl) {
    return null;
  }

  // Convert standard YouTube watch/shorts URLs to embed format if needed
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/embed/')) return url;
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
      }
    } catch (e) {
      // fallback to original
    }
    return url;
  };

  const isYouTube = banner.type === 'youtube' || banner.mediaUrl.includes('youtube.com') || banner.mediaUrl.includes('youtu.be');
  const isVideo = banner.type === 'video' && !isYouTube;
  const isImage = banner.type === 'image' || (!isVideo && !isYouTube);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="relative rounded-2xl overflow-hidden border border-purple-600/40 bg-gradient-to-r from-purple-950/60 via-[#160a2c]/80 to-purple-950/60 shadow-2xl shadow-purple-950/60 group">
        
        {/* Glowing aura */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-violet-500/10 pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-5 sm:p-7">
          
          {/* Media Player / Banner Image container */}
          <div className="w-full lg:w-3/5 rounded-xl overflow-hidden border border-purple-700/50 bg-black/60 shadow-inner flex items-center justify-center relative min-h-[220px] max-h-[360px]">
            
            {/* Top Badge */}
            {banner.badge && (
              <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-purple-900/90 border border-purple-400/50 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-purple-200 flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{banner.badge}</span>
              </div>
            )}

            {/* 1. Image Banner */}
            {isImage && (
              <a
                href={banner.targetUrl || '#'}
                target={banner.targetUrl?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="w-full h-full block group-hover:scale-[1.02] transition-transform duration-500"
              >
                <img
                  src={banner.mediaUrl}
                  alt={banner.title || 'MawwwHub Promotion'}
                  className="w-full h-full object-cover max-h-[340px] rounded-lg"
                />
              </a>
            )}

            {/* 2. Direct Video (MP4 / WebM) */}
            {isVideo && (
              <video
                src={banner.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover max-h-[340px] rounded-lg"
              />
            )}

            {/* 3. YouTube Embed */}
            {isYouTube && (
              <div className="w-full aspect-video min-h-[240px]">
                <iframe
                  src={getYouTubeEmbedUrl(banner.mediaUrl)}
                  title={banner.title || 'MawwwHub Showcase'}
                  className="w-full h-full border-0 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Ad Info & CTA */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center space-y-3">
            {banner.badge && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 font-mono-code flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{banner.badge}</span>
              </span>
            )}

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {banner.title || 'Promo & Showcase MawwwHub'}
            </h3>

            {banner.description && (
              <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                {banner.description}
              </p>
            )}

            {banner.targetUrl && (
              <div className="pt-2">
                <a
                  href={banner.targetUrl}
                  target={banner.targetUrl.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 transition transform hover:-translate-y-0.5"
                >
                  <span>{banner.buttonText || 'Lihat Selengkapnya'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
