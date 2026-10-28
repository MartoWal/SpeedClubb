import React from 'react';
import { motion } from 'framer-motion';
import { Box, Lock, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function CrateBox3D({ 
  type = 'standard', // 'standard' | 'premium'
  title = 'IMPORT CRATE',
  subtitle = '5 VEHÍCULOS GARANTIZADOS',
  badge = 'TOKYO SPEC GR.1',
  onClick,
  isOpening = false
}) {
  const isPremium = type === 'premium';

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -6 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => sound.playHover()}
      onClick={() => {
        sound.playSelect();
        if (onClick) onClick();
      }}
      className="relative w-56 sm:w-64 cursor-pointer select-none group shadow-2xl"
    >
      {/* Main Container Body */}
      <div className="relative rounded-xl bg-zinc-950 border border-zinc-700/80 p-4 overflow-hidden shadow-metallic flex flex-col justify-between group-hover:border-zinc-500 transition-colors">
        {/* Carbon fiber & metallic background */}
        <div className="absolute inset-0 carbon-pattern opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/80 pointer-events-none" />

        {/* Hazard Stripes Banner at Top */}
        <div className="relative z-10 -mx-4 -mt-4 mb-3 px-3 py-1 bg-amber-500/20 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>PADDOCK LOGISTICS</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-black/60 rounded text-zinc-300 border border-zinc-700">
            {badge}
          </span>
        </div>

        {/* Center Container 3D Graphic */}
        <div className="relative z-10 my-2 w-full h-32 rounded-xl overflow-hidden border border-zinc-700/80 shadow-inner flex items-center justify-center bg-black/60 group-hover:border-zinc-500 transition-colors">
          <img
            src={isPremium ? '/assets/crates/container_gold.jpg' : '/assets/crates/container_red.jpg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          
          {/* Status Badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] font-mono">
            <span className={`px-1.5 py-0.2 rounded font-bold ${
              isPremium ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50' : 'bg-red-950/80 text-red-300 border border-red-600/50'
            }`}>
              {isPremium ? 'SPEEDCLUB GOLD' : 'SPEEDCLUB RED'}
            </span>
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SELLADO</span>
            </div>
          </div>
        </div>

        {/* Details & Stencil Text */}
        <div className="relative z-10 text-center flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-center gap-1">
            <span className={`font-racing text-base sm:text-lg italic tracking-wider leading-tight ${
              isPremium ? 'text-amber-300' : 'text-red-400'
            }`}>
              {title}
            </span>
            {isPremium && <Sparkles className="w-4 h-4 text-amber-400" />}
          </div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            {subtitle}
          </span>

          {/* Action trigger button */}
          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-racing italic">
            <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
              PULL LOCK PIN
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              isPremium 
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-racing-red text-white shadow-md'
            }`}>
              ABRIR CRATE &rarr;
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
