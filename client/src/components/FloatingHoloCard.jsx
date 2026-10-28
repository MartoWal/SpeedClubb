import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Sparkles } from 'lucide-react';
import { sound } from '../utils/soundEffects';

const tierConfig = {
  C: {
    label: 'COMÚN',
    color: 'from-emerald-600 to-teal-800',
    border: 'border-emerald-500/60',
    glow: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700',
  },
  B: {
    label: 'RARO',
    color: 'from-blue-600 to-indigo-900',
    border: 'border-blue-500/60',
    glow: 'rgba(59, 130, 246, 0.4)',
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-700',
  },
  A: {
    label: 'ÉPICO',
    color: 'from-purple-600 to-pink-900',
    border: 'border-purple-500/60',
    glow: 'rgba(168, 85, 247, 0.4)',
    badgeBg: 'bg-purple-950 text-purple-300 border-purple-700',
  },
  S: {
    label: 'LEGENDARIO',
    color: 'from-amber-400 via-yellow-500 to-orange-700',
    border: 'border-yellow-400',
    glow: 'rgba(245, 158, 11, 0.6)',
    badgeBg: 'bg-amber-950 text-yellow-300 border-yellow-500',
  },
};

export default function FloatingHoloCard({ 
  vehicle, 
  rotation = 0, 
  scale = 1,
  className = '',
  showStats = true 
}) {
  const tier = tierConfig[vehicle.tier] || tierConfig.C;

  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 30 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      onMouseEnter={() => sound.playHover()}
      onClick={() => sound.playSelect()}
      style={{ rotate: `${rotation}deg` }}
      className={`relative w-44 sm:w-52 h-64 sm:h-72 rounded-xl p-0.5 cursor-pointer select-none group shadow-xl ${className}`}
    >
      {/* Card Body */}
      <div className={`relative w-full h-full rounded-lg bg-zinc-950 border ${tier.border} p-2 flex flex-col justify-between overflow-hidden shadow-metallic group-hover:border-zinc-400 transition-colors`}>
        {/* Subtle Shimmer lines */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

        {/* Top Header info */}
        <div className="relative z-10 flex items-center justify-between">
          <span className={`text-[10px] font-racing px-1.5 py-0.5 rounded border ${tier.badgeBg} uppercase italic font-bold`}>
            TIER {vehicle.tier} // {tier.label}
          </span>
          <span className="font-mono text-[10px] text-zinc-400 font-bold">
            #{String(vehicle.id).padStart(2, '0')}
          </span>
        </div>

        {/* Vehicle Image Container */}
        <div className="relative z-10 my-auto w-full h-28 sm:h-32 rounded bg-zinc-900/90 border border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-zinc-700 transition-colors">
          <img
            src={vehicle.image || vehicle.image_url}
            alt={vehicle.name}
            onError={(e) => {
              // High tech vehicle silhouette fallback
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Fallback silhouette if image fails */}
          <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 p-2 text-center">
            <Gauge className="w-8 h-8 text-racing-red mb-1" />
            <span className="text-[10px] font-racing text-zinc-300 italic">{vehicle.name}</span>
          </div>

          {/* Hologram badge icon for tier S */}
          {vehicle.tier === 'S' && (
            <div className="absolute top-1 right-1 bg-yellow-500/90 text-black p-0.5 rounded-full shadow-lg">
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
          )}
        </div>

        {/* Bottom Specs */}
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono text-zinc-400 truncate">
              {vehicle.category}
            </span>
            <h4 className="font-racing text-xs sm:text-sm text-white italic truncate leading-tight group-hover:text-amber-300 transition-colors">
              {vehicle.name}
            </h4>
          </div>

          {showStats && (
            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-zinc-800 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-zinc-300">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span>{vehicle.hp || 300} HP</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-300 justify-end">
                <Gauge className="w-2.5 h-2.5 text-amber-400" />
                <span>{vehicle.topSpeed || 250} KM/H</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
