import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Sparkles } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export default function TradeCard({
  unseenTradesCount = 0,
  onClick
}) {
  const hasUnseen = unseenTradesCount > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6, rotateY: 5, rotateX: -3 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => sound.playHover()}
      onClick={() => {
        sound.playSelect();
        if (onClick) onClick();
      }}
      style={{ perspective: '1200px' }}
      className={`relative w-full max-w-[185px] sm:max-w-[205px] aspect-[571/1024] rounded-2xl cursor-pointer select-none group shadow-2xl transition-all duration-300 ${
        hasUnseen ? 'ring-2 ring-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.5)]' : ''
      }`}
    >
      {/* Main Trading Card Body - Borderless, 100% full-bleed image */}
      <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl border transition-colors ${
        hasUnseen 
          ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
          : 'border-zinc-800/80 group-hover:border-zinc-500/80'
      }`}>
        {/* Full-Bleed Card Artwork Image */}
        <img
          src="/assets/cards/tarjeta_intercambio.jpg"
          alt="SpeedClub Intercambio de Figuritas"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dynamic subtle sheen overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />

        {/* Ultra-subtle glass reflection edge */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />

        {/* Top Floating Notification Pills */}
        <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-600/60 text-amber-300 font-mono text-[8px] sm:text-[9px] font-bold shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            SWAP RACK
          </span>

          {hasUnseen ? (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-racing text-[8.5px] sm:text-[9.5px] italic font-black shadow-[0_0_15px_rgba(16,185,129,0.9)] animate-pulse border border-emerald-300 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              <span>(+{unseenTradesCount}) ACEPTADA</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-zinc-700/80 text-zinc-300 font-mono text-[8px] sm:text-[8.5px] font-bold shadow-sm">
              STAND ACTIVO
            </span>
          )}
        </div>

        {/* Bottom Interactive Action Banner */}
        <div className="relative z-10 p-2 sm:p-2.5 mt-auto">
          <div className={`w-full py-1.5 px-2 rounded-xl backdrop-blur-md shadow-xl flex items-center justify-center gap-1.5 transition-all ${
            hasUnseen
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border border-emerald-400 font-racing shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-black/80 border border-zinc-700/80 group-hover:border-amber-500/80'
          }`}>
            <ArrowLeftRight className={`w-3.5 h-3.5 ${hasUnseen ? 'text-white animate-spin' : 'text-amber-400 group-hover:rotate-180'} transition-transform duration-500`} style={{ animationDuration: '4s' }} />
            <span className={`font-racing text-[10px] sm:text-[11px] italic font-bold uppercase tracking-wider ${
              hasUnseen ? 'text-white' : 'text-white group-hover:text-amber-300 transition-colors'
            }`}>
              {hasUnseen ? `VER INTERCAMBIO (+${unseenTradesCount})` : 'INTERCAMBIAR'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
