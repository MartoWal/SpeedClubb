import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export default function TradeCard({
  duplicatesCount = 2,
  onClick
}) {
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
      className="relative w-full max-w-[185px] sm:max-w-[205px] aspect-[571/1024] rounded-2xl cursor-pointer select-none group shadow-2xl"
    >
      {/* Main Trading Card Body - Borderless, 100% full-bleed image */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl border border-zinc-800/80 group-hover:border-zinc-500/80 transition-colors">
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
          {duplicatesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-700 text-white font-racing text-[8px] sm:text-[9px] italic font-black shadow-md">
              {duplicatesCount} REPETIDAS
            </span>
          )}
        </div>

        {/* Bottom Interactive Action Banner */}
        <div className="relative z-10 p-2 sm:p-2.5 mt-auto">
          <div className="w-full py-1.5 px-2 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-700/80 group-hover:border-amber-500/80 shadow-xl flex items-center justify-center gap-1.5 transition-all">
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-racing text-[10px] sm:text-[11px] text-white italic font-bold uppercase tracking-wider group-hover:text-amber-300 transition-colors">
              INTERCAMBIAR
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
