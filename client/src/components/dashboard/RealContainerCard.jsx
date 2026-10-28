import React from 'react';
import { motion } from 'framer-motion';
import { Box, Coins, Package, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

/**
 * RealContainerCard
 * Visual industrial ISO freight container component for SpeedClub Paddock.
 * Replaces standard flat cards with an authentic tactile shipping container,
 * featuring corrugated steel panels, locking rods, cam latches, and logistics stencils.
 */
export default function RealContainerCard({
  type = 'standard', // 'standard' | 'premium'
  count = 0,
  onBuy,
  onOpen,
  isZooming = false
}) {
  const isPremium = type === 'premium';
  const price = isPremium ? 500 : 100;
  const cardsCount = isPremium ? 5 : 3;

  // Visual Palette and Configuration
  const config = isPremium
    ? {
        title: 'CONTAINER ORO VIP',
        subtitle: 'CARGAMENTO DE ALTA SEGURIDAD',
        code: 'SCU-500-GOLD // FIA-GR.1',
        description: 'Contenedor VIP blindado. Incluye 5 figuritas de élite con superdeportivos, Ferrari, Porsche y probabilidad aumentada de Tier S.',
        headerBadge: 'VIP 500 CR',
        borderColor: 'border-amber-600/90 hover:border-amber-400',
        outerGradient: 'from-amber-950/60 via-zinc-900 to-black',
        corrugatedBg: 'repeating-linear-gradient(90deg, #78350f 0px, #92400e 4px, #b45309 8px, #d97706 12px, #451a03 16px)',
        doorHighlight: 'rgba(251, 191, 36, 0.15)',
        badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-600/70',
        buyBtnBg: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black',
        openBtnBg: 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600/80',
        payloadText: 'MAX PAYLOAD: 5 PIEZAS // EXCLUSIVAS',
        stampText: 'FIA SEALED GOLD',
        stencilColor: 'text-amber-200',
        accentRing: 'border-amber-500/80'
      }
    : {
        title: 'CONTAINER ROJO COMÚN',
        subtitle: 'SUMINISTRO OFICIAL DE PADDOCK',
        code: 'SCU-100-STD // ISO-6346',
        description: 'Contenedor estándar de competición. Incluye 3 figuritas oficiales con Clásicos Urbanos 90s, Hot-Hatches y leyendas JDM.',
        headerBadge: 'STD 100 CR',
        borderColor: 'border-red-700/90 hover:border-red-500',
        outerGradient: 'from-red-950/60 via-zinc-900 to-black',
        corrugatedBg: 'repeating-linear-gradient(90deg, #991b1b 0px, #b91c1c 4px, #dc2626 8px, #7f1d1d 12px, #450a0a 16px)',
        doorHighlight: 'rgba(239, 68, 68, 0.15)',
        badgeBg: 'bg-red-950/90 text-red-300 border-red-700/70',
        buyBtnBg: 'btn-racing-red text-white',
        openBtnBg: 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/80',
        payloadText: 'MAX PAYLOAD: 3 PIEZAS // CLÁSICOS',
        stampText: 'FIA PADDOCK APPROVED',
        stencilColor: 'text-zinc-200',
        accentRing: 'border-red-500/80'
      };

  return (
    <motion.div
      animate={{ opacity: isZooming ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[245px] sm:max-w-[265px] flex flex-col items-center"
    >
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        onMouseEnter={() => sound.playHover()}
        className={`w-full rounded-2xl bg-zinc-950 border ${config.borderColor} p-3.5 shadow-xl transition-all flex flex-col relative overflow-hidden group select-none`}
      >
        {/* Subtle carbon texture underlay */}
        <div className="absolute inset-0 carbon-pattern opacity-30 pointer-events-none" />

        {/* Top Header Strip: Identification Code & Price Badge */}
        <div className="relative z-10 w-full flex items-center justify-between text-[9px] font-mono mb-2 pb-1.5 border-b border-zinc-800">
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="font-bold text-zinc-300 tracking-wider uppercase truncate">
              {config.code}
            </span>
          </div>
          <span className={`${config.badgeBg} border px-2 py-0.5 rounded font-racing font-bold italic shadow-xs`}>
            {price} CR
          </span>
        </div>

        {/* ========================================================= */}
        {/* PHYSICAL SHIPPING CONTAINER BODY (Realistic Industrial) */}
        {/* ========================================================= */}
        <div 
          onClick={() => {
            sound.playSelect();
            if (onOpen) onOpen();
          }}
          className="relative z-10 w-full h-44 rounded-xl overflow-hidden border-2 border-zinc-700/90 bg-zinc-900 shadow-inner flex flex-col justify-between cursor-pointer group/box transition-all"
        >
          {/* Corrugated Steel Panels (Chapa Acanalada ISO) */}
          <div 
            className="absolute inset-0 opacity-95 transition-opacity"
            style={{ backgroundImage: config.corrugatedBg }}
          />

          {/* Realistic Surface Weathering & Shadow Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

          {/* 4 ISO Heavy-Duty Corner Castings (Cantoneras de elevación con orificio de izaje) */}
          <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-xs bg-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center z-20 pointer-events-none">
            <div className="w-2 h-1 rounded-full bg-black/90" />
          </div>
          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-xs bg-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center z-20 pointer-events-none">
            <div className="w-2 h-1 rounded-full bg-black/90" />
          </div>
          <div className="absolute bottom-1.5 left-1.5 w-4 h-4 rounded-xs bg-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center z-20 pointer-events-none">
            <div className="w-2 h-1 rounded-full bg-black/90" />
          </div>
          <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-xs bg-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center z-20 pointer-events-none">
            <div className="w-2 h-1 rounded-full bg-black/90" />
          </div>

          {/* Center Double-Door Split Seam (Junta de goma vertical entre puertas) */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/90 -translate-x-1/2 z-10 pointer-events-none" />

          {/* Dual Galvanized Steel Locking Bars (Barras cilíndricas de bloqueo de leva) */}
          {/* Left Locking Bar */}
          <div className="absolute top-0 bottom-0 left-[32%] w-1.5 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 shadow-sm z-15 pointer-events-none flex flex-col justify-between py-1 items-center">
            <div className="w-2.5 h-1.5 bg-zinc-800 rounded-xs border border-zinc-400" />
            {/* Center Cam Handle with security seal */}
            <div className="w-4 h-2 bg-zinc-900 border border-zinc-400 rounded-xs -ml-2 shadow-xs" />
            <div className="w-2.5 h-1.5 bg-zinc-800 rounded-xs border border-zinc-400" />
          </div>

          {/* Right Locking Bar */}
          <div className="absolute top-0 bottom-0 right-[32%] w-1.5 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 shadow-sm z-15 pointer-events-none flex flex-col justify-between py-1 items-center">
            <div className="w-2.5 h-1.5 bg-zinc-800 rounded-xs border border-zinc-400" />
            {/* Center Cam Handle with security seal */}
            <div className="w-4 h-2 bg-zinc-900 border border-zinc-400 rounded-xs ml-2 shadow-xs" />
            <div className="w-2.5 h-1.5 bg-zinc-800 rounded-xs border border-zinc-400" />
          </div>

          {/* Container Door Top Stencil Header */}
          <div className="relative z-10 px-2.5 pt-2 flex items-center justify-between text-[8px] font-mono">
            <span className="bg-black/85 text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700 font-bold tracking-wider">
              {config.stampText}
            </span>
            <span className="bg-black/85 text-amber-300 px-1.5 py-0.5 rounded border border-zinc-700 font-bold">
              {cardsCount} CARTAS
            </span>
          </div>

          {/* Industrial CSC Safety / Logistics Stencil Decal */}
          <div className="relative z-10 mx-auto px-3 py-1 bg-black/80 rounded-md border border-zinc-600/80 text-center max-w-[85%] shadow-sm">
            <div className="flex items-center justify-center gap-1 font-racing text-xs italic font-black uppercase text-white tracking-wider">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>{config.title}</span>
            </div>
            <span className="text-[7.5px] font-mono text-zinc-400 block tracking-widest mt-0.5 uppercase">
              {config.payloadText}
            </span>
          </div>

          {/* Container Bottom Status Strip: In-Stock Indicator */}
          <div className="relative z-10 px-2 pb-1.5 flex items-center justify-between text-[8px] font-mono">
            <div className="bg-black/90 px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>ISO 20FT</span>
            </div>
            <div className="bg-black/90 px-1.5 py-0.5 rounded border border-zinc-700 text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>{count > 0 ? `${count} DISPONIBLES` : 'SIN STOCK'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DESCRIPTION & METADATA SECTION                            */}
        {/* ========================================================= */}
        <div className="relative z-10 mt-2.5 text-left w-full flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h4 className="font-racing text-xs text-white uppercase italic font-bold tracking-wider">
              {config.title}
            </h4>
            <span className="text-[9px] font-mono text-zinc-400 font-bold">
              {cardsCount} FIGURITAS
            </span>
          </div>

          <p className="text-[9.5px] font-mono text-zinc-400 leading-tight line-clamp-2">
            {config.description}
          </p>

          {/* Inventory Count Indicator */}
          <div className="mt-1 flex items-center justify-between py-1 px-2 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono">
            <span className="text-zinc-400">EN INVENTARIO:</span>
            <span className={count > 0 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
              {count} {count === 1 ? 'CONTAINER' : 'CONTAINERS'}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ACTION BUTTONS (Buy & Direct Open)                       */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full mt-2.5 flex flex-col gap-1.5">
          {/* Main Buy Button */}
          <button 
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              if (onBuy) onBuy();
            }}
            className={`w-full py-2 px-3 rounded-lg ${config.buyBtnBg} font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5`}
          >
            <Coins className="w-3.5 h-3.5 text-current" />
            <span>COMPRAR ({price} CR)</span>
          </button>

          {/* Direct Open Button to go to the unboxing area */}
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              sound.playSelect();
              if (onOpen) onOpen();
            }}
            className={`w-full py-1.5 px-2 rounded-lg ${config.openBtnBg} font-racing text-[11px] italic font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1`}
          >
            <span>{count > 0 ? `ABRIR SOBRES (${count})` : 'IR A DESEMPAQUE'}</span>
            <ArrowRight className="w-3 h-3 text-current" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
