import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Maximize2, Sparkles } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

// SVG Car Brand Emblems (Crafted with crisp authentic vectors)
const BrandLogos = () => {
  return (
    <div className="w-full flex flex-col items-center gap-1.5 my-2">
      {/* Row 1: European Luxury & Exotics (7 brands) */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
        {/* Porsche */}
        <div className="w-5 h-6 rounded-sm bg-gradient-to-b from-amber-600 via-amber-400 to-amber-700 p-0.5 shadow-md flex flex-col items-center justify-center border border-amber-300/60" title="Porsche">
          <div className="w-full h-full bg-black/60 rounded-[1px] flex items-center justify-center">
            <span className="text-[6px] font-black text-amber-300 leading-none">P</span>
          </div>
        </div>

        {/* Ferrari */}
        <div className="w-5 h-6 rounded-sm bg-[#ffea00] p-0.5 shadow-md flex flex-col items-center justify-between border border-yellow-300" title="Ferrari">
          <div className="w-full h-0.5 bg-gradient-to-r from-emerald-600 via-white to-red-600" />
          <span className="text-[8px] font-black text-black leading-none my-auto">🐎</span>
        </div>

        {/* BMW */}
        <div className="w-5 h-5 rounded-full bg-zinc-900 border-2 border-zinc-300 shadow-md flex items-center justify-center overflow-hidden" title="BMW">
          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
            <div className="bg-sky-500" />
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-sky-500" />
          </div>
        </div>

        {/* Mercedes-Benz */}
        <div className="w-5 h-5 rounded-full bg-zinc-900 border-2 border-zinc-300 shadow-md flex items-center justify-center" title="Mercedes-Benz">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-zinc-200 stroke-2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="2" />
            <line x1="12" y1="12" x2="3.5" y2="17" />
            <line x1="12" y1="12" x2="20.5" y2="17" />
          </svg>
        </div>

        {/* Lamborghini */}
        <div className="w-5 h-6 rounded-b-md bg-gradient-to-b from-amber-500 to-yellow-600 p-0.5 shadow-md border border-amber-300" title="Lamborghini">
          <div className="w-full h-full bg-black rounded-b-sm flex items-center justify-center">
            <span className="text-[7px] font-black text-amber-400">🐂</span>
          </div>
        </div>

        {/* Maserati / Pagani */}
        <div className="w-5 h-6 rounded-md bg-gradient-to-b from-zinc-800 to-black border border-zinc-400 shadow-md flex items-center justify-center" title="Maserati">
          <span className="text-[9px] text-zinc-200 leading-none">🔱</span>
        </div>

        {/* Renault Sport */}
        <div className="w-5 h-5 flex items-center justify-center" title="Renault">
          <div className="w-3.5 h-4 border-2 border-zinc-200 rotate-45 transform bg-zinc-900 shadow-sm" />
        </div>
      </div>

      {/* Row 2: Historic & Racing Giants (6 brands) */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {/* Shelby Cobra */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-500 to-amber-700 border border-amber-300 shadow-md flex items-center justify-center" title="Shelby">
          <span className="text-[8px] text-black font-black">🐍</span>
        </div>

        {/* Ford */}
        <div className="w-6 h-3.5 rounded-full bg-[#002c6c] border border-blue-300 shadow-md flex items-center justify-center" title="Ford">
          <span className="text-[6px] font-racing italic text-white font-bold tracking-tighter">Ford</span>
        </div>

        {/* Toyota */}
        <div className="w-5 h-4 rounded-full bg-zinc-950 border border-zinc-300 shadow-md flex items-center justify-center" title="Toyota">
          <div className="w-3.5 h-2.5 rounded-full border border-red-500 flex items-center justify-center">
            <div className="w-1.5 h-2 rounded-full border border-zinc-200" />
          </div>
        </div>

        {/* Nissan */}
        <div className="w-5 h-4 flex items-center justify-center relative" title="Nissan">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />
          <div className="absolute w-5 h-1.5 bg-zinc-800 border-y border-zinc-300 flex items-center justify-center">
            <span className="text-[5px] font-racing font-bold text-white tracking-tighter">NISSAN</span>
          </div>
        </div>

        {/* Honda */}
        <div className="w-5 h-4.5 rounded-[3px] bg-zinc-950 border border-zinc-300 shadow-md flex flex-col items-center justify-center" title="Honda">
          <span className="text-[8px] font-black text-white leading-none font-sans">H</span>
        </div>

        {/* Fiat */}
        <div className="w-5 h-5 rounded-full bg-[#8b0000] border-2 border-zinc-300 shadow-md flex items-center justify-center" title="Fiat">
          <span className="text-[6px] font-racing font-black text-white tracking-tighter">FIAT</span>
        </div>
      </div>
    </div>
  );
};

export default function AlbumCoverCard({
  completionPct = 0,
  pastedCount = 0,
  totalCount = 95,
  onOpen,
  isZooming = false
}) {
  return (
    <motion.div
      whileHover={isZooming ? {} : { scale: 1.05, y: -6, rotateY: -5, rotateX: 3 }}
      animate={isZooming ? {
        scale: 2.3,
        y: -30,
        zIndex: 50,
        transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] }
      } : {
        scale: 1,
        y: 0,
        zIndex: 10
      }}
      onMouseEnter={() => sound.playHover()}
      onClick={() => {
        sound.playSelect();
        if (onOpen) onOpen();
      }}
      style={{ perspective: '1400px' }}
      className="relative w-full max-w-[285px] sm:max-w-[315px] aspect-[1/1.32] rounded-2xl overflow-hidden cursor-pointer select-none group shadow-2xl border-2 border-zinc-700/80"
    >
      {/* Main Hardcover Body (Classic Gran Turismo Hardcover) */}
      <div className="relative w-full h-full rounded-2xl bg-[#0b0e14] flex flex-col justify-between overflow-hidden p-3 sm:p-4 text-white">
        
        {/* Carbon Fiber & Asphalt Base Texture */}
        <div className="absolute inset-0 carbon-pattern opacity-85 pointer-events-none" />
        
        {/* Subtle Radial Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />

        {/* Diagonal Tire Skid Marks Overlay (Matching Reference Artwork) */}
        <svg 
          viewBox="0 0 300 400" 
          className="absolute inset-0 w-full h-full opacity-35 mix-blend-screen pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Top tire tread track */}
          <path
            d="M -20 120 Q 80 60 320 80"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="38"
            strokeDasharray="6 4 12 4"
            fill="none"
          />
          <path
            d="M -20 120 Q 80 60 320 80"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="12"
            fill="none"
          />
          {/* Bottom tire tread track */}
          <path
            d="M -20 340 Q 150 310 320 330"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="34"
            strokeDasharray="8 4 14 4"
            fill="none"
          />
        </svg>

        {/* Left Book Spine Curvature (Gives 3D depth to the seamless cover) */}
        <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-30 pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-1 w-0.5 bg-gradient-to-b from-orange-500/40 via-zinc-500/20 to-orange-500/40 z-30 pointer-events-none" />

        {/* Right Page Thickness Edge */}
        <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-gradient-to-l from-white/20 via-black/50 to-transparent z-30 pointer-events-none" />

        {/* ======================================================== */}
        {/* TOP SECTION: DIAMOND EMBLEM & MARTIN WALTAR CREADOR      */}
        {/* ======================================================== */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Top Diamond Pin */}
          <div className="w-3.5 h-3.5 bg-gradient-to-br from-red-600 to-amber-700 border border-white rotate-45 transform shadow-md mb-1" />

          {/* Classic Motorsport Arch Notch */}
          <div className="relative px-5 py-1 rounded-full bg-black/80 border border-amber-600/70 shadow-md flex flex-col items-center">
            <span className="font-mono text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest leading-none drop-shadow">
              MARTIN WALTAR
            </span>
            <span className="font-racing text-[8px] text-amber-400 italic font-bold tracking-widest leading-none mt-0.5">
              CREADOR
            </span>
          </div>

          {/* Clean Border Trim */}
          <div className="w-full flex items-center justify-center my-0.5">
            <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER SECTION: CHROME 3D SPEEDCLUB & BRAND CRESTS       */}
        {/* ======================================================== */}
        <div className="relative z-20 flex flex-col items-center justify-center my-auto py-1">
          {/* The Iconic 3D SPEEDCLUB Chrome Title */}
          <div className="relative py-1">
            {/* Main Chrome Metallic Typography */}
            <h2 
              className="relative font-racing text-3xl sm:text-4xl lg:text-[42px] font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 select-none"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.8)',
                WebkitTextStroke: '1px rgba(217, 119, 6, 0.8)',
              }}
            >
              SPEEDCLUB
            </h2>
          </div>

          {/* Classic Racing Divider Line */}
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mb-1" />

          {/* Grid of 13 Manufacturer Brand Emblems */}
          <BrandLogos />
        </div>

        {/* ======================================================== */}
        {/* BOTTOM SECTION: STICKER ALBUM BADGE & GREEN PERCENTAGE   */}
        {/* ======================================================== */}
        <div className="relative z-20 flex items-end justify-between pt-1">
          {/* Center-left: STICKER ALBUM SpeedClub Badge */}
          <div className="relative px-3 sm:px-4 py-1 rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-orange-500/70 shadow-metallic flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-mono uppercase text-zinc-300 font-bold tracking-widest leading-none">
              STICKER ALBUM
            </span>
            <span className="font-racing text-xs sm:text-sm text-red-500 italic font-black tracking-wider leading-none mt-0.5 drop-shadow">
              SpeedClub
            </span>
          </div>

          {/* Dynamic Green Ribbon Badge */}
          <div className="relative">
            <div className="relative px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white font-racing text-sm sm:text-base font-black italic shadow-md border border-emerald-400/80 flex items-center justify-center transform -rotate-2 group-hover:scale-105 transition-transform">
              <span>{completionPct}%</span>
            </div>
          </div>
        </div>

        {/* Bottom Integrated Action Bar */}
        <div className="relative z-20 w-full mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{pastedCount}/{totalCount} AUTOS</span>
          </div>
          
          <span className="flex items-center gap-1 text-[11px] font-racing italic font-black text-amber-400 group-hover:text-white transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>ABRIR GARAJE &rarr;</span>
          </span>
        </div>

        {/* Glossy Sheen Sweep Overlay */}
        <div className="absolute inset-0 album-sheen opacity-50 group-hover:opacity-90 pointer-events-none z-10" />
      </div>
    </motion.div>
  );
}
