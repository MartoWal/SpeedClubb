import React from 'react';
import { motion } from 'framer-motion';
import { Play, Radio, Tv, Flame, Sparkles, ChevronRight } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

/**
 * PaddockTvCard
 * Realistic Pit-Wall Broadcast Monitor for SPEEDCLUB TV.
 * Features carbon fiber bezel, corner hex bolts, live transmission LED,
 * CRT scanlines, curved glass screen, and authentic telemetry HUD chips.
 */
export default function PaddockTvCard({
  onOpen,
  isZooming = false
}) {
  return (
    <motion.div
      animate={{ opacity: isZooming ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[280px] sm:max-w-[305px] flex flex-col items-center justify-center"
    >
      <motion.div
        whileHover={{ scale: 1.04, y: -6, rotateY: 3, rotateX: 2 }}
        onMouseEnter={() => sound.playHover()}
        onClick={() => {
          sound.playSelect();
          if (onOpen) onOpen();
        }}
        style={{ perspective: '1200px' }}
        className="relative w-full aspect-[1/1.32] rounded-2xl overflow-hidden cursor-pointer select-none group shadow-2xl border-2 border-blue-900/70 hover:border-red-600/90 transition-all duration-300 bg-[#0a0c10] flex flex-col justify-between p-3 sm:p-3.5"
      >
        {/* Carbon fiber housing texture */}
        <div className="absolute inset-0 carbon-pattern opacity-70 pointer-events-none" />

        {/* Ambient Screen Glow */}
        <div className="absolute -inset-1 bg-gradient-to-b from-blue-950/30 via-transparent to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* 4 Corner Industrial Hex Bolts */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 shadow-sm z-30 pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 shadow-sm z-30 pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 shadow-sm z-30 pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 shadow-sm z-30 pointer-events-none" />

        {/* CRT Scanline Overlay across entire monitor */}
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-20" />

        {/* ========================================================= */}
        {/* TOP MONITOR HEADER: LIVE STATUS & REWARD PILL            */}
        {/* ========================================================= */}
        <div className="relative z-20 flex items-center justify-between pb-1.5 border-b border-zinc-800/90 text-[10px] font-mono">
          {/* Pulsing Live On-Air Indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,1)]" />
            </span>
            <span className="text-blue-400 group-hover:text-red-400 font-bold tracking-wider uppercase transition-colors">
              SPEEDCLUB TV // LIVE
            </span>
          </div>

          {/* Reward Stamped Digital Pill */}
          <div className="px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/50 text-yellow-300 font-mono font-bold text-[9px] shadow-[0_0_10px_rgba(250,204,21,0.2)]">
            +300 CR
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER MONITOR SCREEN: WIDESCREEN HERO WITH 3D GLASS     */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full flex-1 my-2 rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner group/screen flex items-center justify-center">
          {/* Video Thumbnail */}
          <img
            src="/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp"
            alt="SpeedClub TV Live"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={(e) => { e.target.src = "/assets/backgrounds/Fondos-WRC/fondo-peugeot-WRC.jpg"; }}
          />

          {/* Inner Curvature Vignette (CRT / Pit-Wall Curvature) */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/85 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

          {/* Central 3D Metallic Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-2 border-white/80 p-0.5 shadow-[0_4px_20px_rgba(220,38,38,0.7)] group-hover:scale-115 group-hover:shadow-[0_0_25px_rgba(220,38,38,1)] transition-all duration-300 flex items-center justify-center">
              <Play className="w-5 h-5 fill-white text-white ml-0.5 drop-shadow" />
            </div>
          </div>

          {/* In-Screen Floating Telemetry Chips */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8.5px] font-mono z-20 pointer-events-none">
            <span className="text-zinc-200 font-bold bg-black/85 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-700 shadow-md">
              4 CANALES FIA
            </span>
            <span className="text-yellow-300 font-bold bg-black/85 backdrop-blur-md px-2 py-0.5 rounded border border-yellow-500/50 shadow-md">
              +100 CR / VIDEO
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM METADATA & TELEMETRY ACTION STRIP                 */}
        {/* ========================================================= */}
        <div className="relative z-20 flex flex-col gap-1 text-center w-full">
          <div className="flex items-center justify-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400 group-hover:text-red-400 transition-colors" />
            <h4 className="font-racing text-xs sm:text-sm text-white uppercase italic tracking-wider leading-tight drop-shadow">
              TELEMETRÍA EN DIRECTO
            </h4>
          </div>
          <p className="text-[9px] font-mono text-zinc-400 line-clamp-1">
            Transmisiones oficiales &middot; Gana hasta 300 CR cada 2h
          </p>

          {/* Console Action Bar */}
          <div className="mt-1.5 w-full py-1.5 px-3 rounded-lg btn-metallic flex items-center justify-center gap-1.5 group-hover:border-red-500/80 transition-all shadow-md">
            <Tv className="w-3.5 h-3.5 text-red-400" />
            <span className="font-racing text-[10px] sm:text-[11px] text-white italic font-bold uppercase tracking-wider group-hover:text-red-300 transition-colors">
              SINTONIZAR EN DIRECTO &rarr;
            </span>
          </div>
        </div>

        {/* Dynamic Sheen Sweep Reflection */}
        <div className="absolute inset-0 album-sheen opacity-30 group-hover:opacity-75 pointer-events-none z-30" />
      </motion.div>
    </motion.div>
  );
}
