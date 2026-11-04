import React from 'react';
import { motion } from 'framer-motion';
import { Box, Sparkles, Coins, Package, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

/**
 * PaddockContainerCard
 * Ultra-realistic industrial shipping crate module for SpeedClub Paddock.
 * Replaces flat product boxes with a physical heavy-freight vault showcase.
 */
export default function PaddockContainerCard({
  type = 'standard', // 'standard' | 'premium'
  count = 0,
  onBuy,
  onOpen,
  isZooming = false
}) {
  const isPremium = type === 'premium';
  const price = isPremium ? 500 : 100;
  const cardsCount = isPremium ? 5 : 3;

  // Visual Configuration based on container tier
  const config = isPremium
    ? {
        title: 'CONTAINER PREMIUM',
        subtitle: 'PORSCHE, SUPERCARS & EXÓTICOS',
        headerBadge: 'SOBRE VIP ORO',
        icon: Sparkles,
        iconColor: 'text-amber-400',
        badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-600/70',
        borderColor: 'border-2 border-amber-500/80 hover:border-amber-300',
        glowGradient: 'from-amber-950/30 via-transparent to-yellow-950/40',
        imageSrc: '/assets/crates/container_gold.jpg',
        imageAlt: 'SpeedClub Container Premium Dorado',
        primaryBtn: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black shadow-[0_4px_18px_rgba(245,158,11,0.4)]',
        titleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400',
        tiltY: 4
      }
    : {
        title: 'CONTAINER COMÚN',
        subtitle: 'CLÁSICOS, HOT-HATCHES & JDM',
        headerBadge: 'SOBRE COMÚN',
        icon: Box,
        iconColor: 'text-red-400',
        badgeBg: 'bg-red-950/90 text-red-300 border-red-700/70',
        borderColor: 'border-2 border-red-700/80 hover:border-red-500',
        glowGradient: 'from-red-950/30 via-transparent to-red-950/40',
        imageSrc: '/assets/crates/container_red.jpg',
        imageAlt: 'SpeedClub Container Común Rojo',
        primaryBtn: 'btn-racing-red text-white shadow-[0_4px_18px_rgba(220,38,38,0.4)]',
        titleGradient: 'text-white',
        tiltY: -4
      };

  const HeaderIcon = config.icon;

  const handleCardClick = () => {
    sound.playSelect();
    if (count > 0 && onOpen) {
      onOpen();
    } else if (onBuy) {
      onBuy();
    }
  };

  return (
    <motion.div
      animate={{ opacity: isZooming ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[215px] sm:max-w-[230px] flex flex-col items-center justify-center"
    >
      <motion.div
        whileHover={{ scale: 1.05, y: -6, rotateY: config.tiltY, rotateX: 2 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => sound.playHover()}
        style={{ perspective: '1200px' }}
        className={`relative w-full aspect-[1/1.65] rounded-2xl overflow-hidden cursor-pointer select-none group shadow-2xl ${config.borderColor} transition-all duration-300 bg-[#090b10] flex flex-col justify-between p-3`}
      >
        {/* Carbon fiber housing texture underlay */}
        <div className="absolute inset-0 carbon-pattern opacity-70 pointer-events-none" />

        {/* Ambient Warm Volumetric Glow */}
        <div className={`absolute -inset-1 bg-gradient-to-b ${config.glowGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

        {/* 4 Corner Industrial Fasteners */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-500 shadow-xs z-30 pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-500 shadow-xs z-30 pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-500 shadow-xs z-30 pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-500 shadow-xs z-30 pointer-events-none" />

        {/* ========================================================= */}
        {/* TOP HEADER: TIER BADGE & PRICE TAG                        */}
        {/* ========================================================= */}
        <div className="relative z-20 flex items-center justify-between pb-1 border-b border-zinc-800/80 text-[9px] font-mono">
          <span className="flex items-center gap-1 font-bold text-zinc-300">
            <HeaderIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
            <span>{config.headerBadge}</span>
          </span>

          <span className={`${config.badgeBg} border px-2 py-0.5 rounded font-racing font-bold italic shadow-xs`}>
            {price} CR
          </span>
        </div>

        {/* ========================================================= */}
        {/* CENTER HERO: FULL-BLEED 3D REAL SHIPPING CONTAINER        */}
        {/* ========================================================= */}
        <div 
          onClick={handleCardClick}
          className="relative z-10 w-full flex-1 my-1.5 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner group/crate flex items-center justify-center cursor-pointer"
        >
          <img
            src={config.imageSrc}
            alt={config.imageAlt}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600 ease-out"
          />

          {/* Industrial lighting & contact shadows */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

          {/* Bottom In-Crate HUD Chips */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[8px] font-mono z-20 pointer-events-none">
            <span className="text-zinc-200 font-bold bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-zinc-700 shadow-xs">
              {cardsCount} FIGURITAS
            </span>

            <span className="bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-zinc-700 flex items-center gap-1 font-bold shadow-xs">
              {count > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">{count} EN PODER</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400">0 EN PODER</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM METADATA & SMART ACTION BUTTON                     */}
        {/* ========================================================= */}
        <div className="relative z-20 flex flex-col gap-0.5 text-center w-full">
          <h4 className={`font-racing text-xs uppercase italic font-black tracking-wider leading-tight drop-shadow ${config.titleGradient}`}>
            {config.title}
          </h4>
          <span className="text-[8.5px] font-mono text-zinc-400 line-clamp-1">
            {config.subtitle}
          </span>

          {/* Smart Primary Action Button */}
          {count > 0 ? (
            <div className="mt-1 flex flex-col gap-1">
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playSelect();
                  if (onOpen) onOpen();
                }}
                className={`w-full py-1.5 px-2 rounded-lg ${config.primaryBtn} font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1`}
              >
                <Package className="w-3.5 h-3.5 text-current" />
                <span>ABRIR ({count})</span>
              </button>

              <button
                onMouseEnter={() => sound.playHover()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBuy) onBuy();
                }}
                className="text-[8px] font-mono text-zinc-400 hover:text-amber-300 transition-colors py-0.5"
              >
                + Comprar otro (+1 por {price} CR)
              </button>
            </div>
          ) : (
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={(e) => {
                e.stopPropagation();
                if (onBuy) onBuy();
              }}
              className={`mt-1 w-full py-1.5 px-2 rounded-lg ${config.primaryBtn} font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5`}
            >
              <Coins className="w-3.5 h-3.5 text-current" />
              <span>COMPRAR ({price} CR)</span>
            </button>
          )}
        </div>

        {/* Dynamic Sheen Sweep Reflection */}
        <div className="absolute inset-0 album-sheen opacity-40 group-hover:opacity-85 pointer-events-none z-30" />
      </motion.div>
    </motion.div>
  );
}
