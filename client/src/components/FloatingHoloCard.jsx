import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Sparkles } from 'lucide-react';
import { sound } from '../utils/soundEffects';

const tierConfig = {
  C: {
    label: 'COMÚN',
    color: 'from-zinc-700 to-zinc-900',
    border: 'border-zinc-700',
    badgeBg: 'bg-zinc-900 text-zinc-300 border-zinc-700',
  },
  B: {
    label: 'RARO',
    color: 'from-blue-900 to-zinc-950',
    border: 'border-blue-900',
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  A: {
    label: 'ÉPICO',
    color: 'from-red-900 to-zinc-950',
    border: 'border-red-900',
    badgeBg: 'bg-red-950 text-red-300 border-red-800',
  },
  S: {
    label: 'LEGENDARIO',
    color: 'from-amber-900 to-zinc-950',
    border: 'border-amber-700',
    badgeBg: 'bg-amber-950 text-amber-300 border-amber-700',
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
      className={`relative w-44 sm:w-52 h-64 sm:h-72 rounded-xl p-0.5 cursor-pointer select-none group shadow-md ${className}`}
    >
      {/* Card Body (Classic Collector Sticker) */}
      <div className={`relative w-full h-full rounded-lg bg-zinc-950 border ${tier.border} p-2 flex flex-col justify-between overflow-hidden group-hover:border-zinc-500 transition-colors`}>
        {/* Subtle Matte Contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/60 pointer-events-none" />

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
        <div className="relative z-10 my-auto w-full h-28 sm:h-32 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-zinc-700 transition-colors">
          <img
            src={vehicle.image || vehicle.image_url}
            alt={vehicle.name}
            onError={(e) => {
              // Classic vehicle silhouette fallback
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Fallback silhouette if image fails */}
          <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 p-2 text-center">
            <Gauge className="w-8 h-8 text-zinc-400 mb-1" />
            <span className="text-[10px] font-racing text-zinc-300 italic">{vehicle.name}</span>
          </div>
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
