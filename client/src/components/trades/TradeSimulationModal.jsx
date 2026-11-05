import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  Sparkles, 
  BookOpen, 
  X, 
  Trophy, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Zap,
  Repeat,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useGarageStore } from '../../store/useGarageStore';

const TIER_CONFIG = {
  S: {
    label: 'TIER S // LEYENDA',
    borderColor: 'border-amber-400',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
    glowShadow: 'shadow-[0_0_35px_rgba(251,191,36,0.6)]',
    accentColor: 'text-amber-300'
  },
  A: {
    label: 'TIER A // SUPERCAR',
    borderColor: 'border-red-500',
    badgeBg: 'bg-gradient-to-r from-red-600 to-rose-600 text-white',
    glowShadow: 'shadow-[0_0_35px_rgba(239,68,68,0.6)]',
    accentColor: 'text-red-400'
  },
  B: {
    label: 'TIER B // SPORT',
    borderColor: 'border-blue-500',
    badgeBg: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
    glowShadow: 'shadow-[0_0_35px_rgba(59,130,246,0.6)]',
    accentColor: 'text-blue-400'
  },
  C: {
    label: 'TIER C // STREET',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white',
    glowShadow: 'shadow-[0_0_35px_rgba(16,185,129,0.5)]',
    accentColor: 'text-emerald-400'
  }
};

export default function TradeSimulationModal() {
  const {
    activeTradeSimulation,
    closeTradeSimulation,
    openTradeModal,
    closeTradeModal,
    enterGarageAlbum
  } = useGarageStore();

  // Phases: 'comparing' (0-1.2s) -> 'swapping' (1.2-2.1s) -> 'revealed' (>= 2.1s)
  const [phase, setPhase] = useState('comparing');
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    if (!activeTradeSimulation) {
      setPhase('comparing');
      setFlashActive(false);
      return;
    }

    // Reset phase when a new simulation starts
    setPhase('comparing');
    setFlashActive(false);

    // Phase 1 -> 2: Auto start swap animation
    const timer1 = setTimeout(() => {
      setPhase('swapping');
      sound.playSwap();
    }, 1200);

    // Flash trigger during card crossing
    const timerFlash = setTimeout(() => {
      setFlashActive(true);
    }, 1750);

    const timerFlashEnd = setTimeout(() => {
      setFlashActive(false);
    }, 2050);

    // Phase 2 -> 3: Reveal close-up of acquired vehicle
    const timer2 = setTimeout(() => {
      setPhase('revealed');
      sound.playReward();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timerFlash);
      clearTimeout(timerFlashEnd);
      clearTimeout(timer2);
    };
  }, [activeTradeSimulation]);

  if (!activeTradeSimulation) return null;

  const {
    given_vehicle,
    received_vehicle,
    partner_name = "Piloto de la Comunidad",
    isCreatorNotification = false
  } = activeTradeSimulation;

  const givenTier = TIER_CONFIG[given_vehicle?.rarity_tier || 'C'] || TIER_CONFIG.C;
  const receivedTier = TIER_CONFIG[received_vehicle?.rarity_tier || 'C'] || TIER_CONFIG.C;

  const handleGoToAlbum = () => {
    closeTradeSimulation();
    closeTradeModal();
    enterGarageAlbum();
  };

  const handleKeepTrading = () => {
    closeTradeSimulation();
    openTradeModal();
  };

  const handleSkipAnimation = () => {
    setPhase('revealed');
    sound.playReward();
  };

  const modalContent = (
    <div 
      style={{ zIndex: 99999 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-hidden select-none"
    >
      {/* Background Ambience Pattern & Radial Spotlight */}
      <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/25 via-black/85 to-black pointer-events-none" />

      {/* Collision Energy Flash Screen Effect */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Top Header Information & Skip / Close Buttons */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-40 text-xs font-mono">
        <div className="flex items-center gap-2 bg-zinc-950/95 border border-zinc-700/80 px-3.5 py-1.5 rounded-full shadow-xl">
          <Repeat className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-racing tracking-wider uppercase text-zinc-300">
            {isCreatorNotification
              ? `¡${partner_name.toUpperCase()} ACEPTÓ TU OFERTA!`
              : `PERMUTA CON ${partner_name.toUpperCase()}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {phase !== 'revealed' && (
            <button
              onClick={handleSkipAnimation}
              className="px-3 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[10px] font-mono uppercase shadow-md"
            >
              Saltar Animación &rarr;
            </button>
          )}

          <button
            onClick={closeTradeSimulation}
            className="p-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shadow-md"
            title="Cerrar y continuar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PHASES 1 & 2: TWO CARDS COMPARING AND SWAPPING           */}
      {/* ========================================================= */}
      {phase !== 'revealed' && (
        <div className="relative z-30 w-full max-w-4xl flex flex-col items-center justify-center py-8">
          
          {/* Subtitle status banner */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <h2 className="font-racing text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-wider text-white">
              {phase === 'comparing' ? 'INICIANDO PROTOCOLO DE INTERCAMBIO' : '¡TRANSFIRIENDO FIGURITAS!'}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
              {phase === 'comparing'
                ? 'Verificación oficial FIA sin intermediarios...'
                : 'Cruce atómico completado con éxito.'}
            </p>
          </motion.div>

          {/* Cards Stage Container */}
          <div className="relative w-full flex items-center justify-center gap-4 sm:gap-12 md:gap-20 min-h-[360px]">
            
            {/* Card Left: GIVEN VEHICLE (TÚ ENTREGAS) */}
            <motion.div
              initial={{ x: -80, opacity: 0, scale: 0.9 }}
              animate={
                phase === 'comparing'
                  ? { x: 0, opacity: 1, scale: 1, rotateY: 5 }
                  : { x: 140, opacity: 0.25, scale: 0.7, rotateY: 25 }
              }
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: '1200px' }}
              className="relative w-48 sm:w-56 md:w-64 aspect-[1/1.4] rounded-2xl p-3 bg-zinc-950 border-2 border-red-700/80 shadow-[0_0_25px_rgba(220,38,38,0.4)] flex flex-col justify-between overflow-hidden"
            >
              {/* Top Label */}
              <div className="flex items-center justify-between pb-1.5 border-b border-red-900/60 text-[9px] font-mono">
                <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded font-racing font-bold tracking-wider">
                  TÚ ENTREGAS
                </span>
                <span className="text-zinc-400 font-mono">#{given_vehicle?.id || '00'}</span>
              </div>

              {/* Image Window */}
              <div className="relative w-full flex-1 my-2 rounded-xl overflow-hidden bg-black border border-zinc-800">
                <img
                  src={given_vehicle?.image_url || given_vehicle?.image}
                  alt={given_vehicle?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/assets/vehicles/Figuritas-clasicos-90s/Ford-falcon-sprint-C90s.jpg"; }}
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-racing font-bold bg-black/85 text-red-400 border border-red-700/60">
                  TIER {given_vehicle?.rarity_tier || 'C'}
                </span>
              </div>

              {/* Vehicle Title */}
              <div className="text-center">
                <h4 className="font-racing text-xs sm:text-sm text-white uppercase italic font-bold truncate">
                  {given_vehicle?.name}
                </h4>
                <span className="text-[9px] font-mono text-zinc-400 block truncate">
                  {given_vehicle?.category}
                </span>
              </div>
            </motion.div>

            {/* Central Energy Swap Emblem */}
            <motion.div
              animate={
                phase === 'comparing'
                  ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }
                  : { scale: [1, 1.8, 0], rotate: 360 }
              }
              transition={{ duration: phase === 'comparing' ? 2 : 0.7, repeat: phase === 'comparing' ? Infinity : 0 }}
              className="z-20 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-600 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center justify-center shrink-0"
            >
              <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
                <ArrowLeftRight className="w-6 sm:w-8 h-6 sm:h-8 text-amber-300 drop-shadow" />
              </div>
            </motion.div>

            {/* Card Right: RECEIVED VEHICLE (TÚ RECIBES) */}
            <motion.div
              initial={{ x: 80, opacity: 0, scale: 0.9 }}
              animate={
                phase === 'comparing'
                  ? { x: 0, opacity: 1, scale: 1, rotateY: -5 }
                  : { x: -140, opacity: 1, scale: 1.15, rotateY: 0, zIndex: 30 }
              }
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: '1200px' }}
              className="relative w-48 sm:w-56 md:w-64 aspect-[1/1.4] rounded-2xl p-3 bg-zinc-950 border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex flex-col justify-between overflow-hidden"
            >
              {/* Top Label */}
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-900/60 text-[9px] font-mono">
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-racing font-bold tracking-wider">
                  TÚ RECIBES
                </span>
                <span className="text-zinc-400 font-mono">#{received_vehicle?.id || '00'}</span>
              </div>

              {/* Image Window */}
              <div className="relative w-full flex-1 my-2 rounded-xl overflow-hidden bg-black border border-zinc-800">
                <img
                  src={received_vehicle?.image_url || received_vehicle?.image}
                  alt={received_vehicle?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/assets/vehicles/Figuritas_ferrari/ferrari-296-gtb.webp"; }}
                />
                <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-racing font-bold ${receivedTier.badgeBg}`}>
                  TIER {received_vehicle?.rarity_tier || 'C'}
                </span>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[7.5px] font-racing font-bold bg-emerald-500 text-black">
                  NUEVA
                </span>
              </div>

              {/* Vehicle Title */}
              <div className="text-center">
                <h4 className="font-racing text-xs sm:text-sm text-white uppercase italic font-bold truncate">
                  {received_vehicle?.name}
                </h4>
                <span className="text-[9px] font-mono text-zinc-400 block truncate">
                  {received_vehicle?.category}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHASE 3: REVEALED CLOSE-UP (PRIMER PLANO DEL NUEVO AUTO)  */}
      {/* ========================================================= */}
      {phase === 'revealed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-30 w-full max-w-lg bg-zinc-950/95 border-2 border-emerald-500/90 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(16,185,129,0.35)] flex flex-col items-center text-center text-white overflow-hidden"
        >
          {/* Subtle top spotlight glow */}
          <div className="absolute inset-0 bg-radial-gradient from-emerald-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Trophy Header Badge */}
          <div className="w-14 h-14 rounded-full bg-emerald-900/30 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-2 shadow-lg">
            <Trophy className="w-7 h-7 drop-shadow" />
          </div>

          <h2 className="font-racing text-xl sm:text-2xl font-black uppercase italic tracking-wider text-white">
            ¡INTERCAMBIO EXITOSO!
          </h2>

          {/* EXACT USER-REQUESTED MESSAGE: Obtuviste X figurita y diste Y figurita */}
          <div className="mt-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/70 text-xs sm:text-sm font-racing italic tracking-wide text-emerald-300">
            Obtuviste <span className="text-white font-bold">{received_vehicle?.name}</span> y diste <span className="text-amber-300 font-bold">{given_vehicle?.name}</span>
          </div>

          {/* ===================================================== */}
          {/* PRIMER PLANO: HIGH-RESOLUTION VEHICLE CARD PREVIEW    */}
          {/* ===================================================== */}
          <div className="relative mt-4 w-full max-w-sm rounded-2xl bg-gradient-to-b from-zinc-900 to-black border-2 border-zinc-700/80 p-3 shadow-2xl flex flex-col items-center group">
            
            {/* Holographic Sheen Sweep */}
            <div className="absolute inset-0 album-sheen opacity-40 rounded-2xl pointer-events-none" />

            {/* Top Spec Strip */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono pb-1.5 border-b border-zinc-800">
              <span className={`px-2 py-0.5 rounded font-racing font-bold ${receivedTier.badgeBg}`}>
                {receivedTier.label}
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>LISTA PARA PEGAR</span>
              </span>
            </div>

            {/* Main Vehicle Image in High Resolution */}
            <div className="relative w-full h-44 sm:h-48 my-2 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner flex items-center justify-center">
              <img
                src={received_vehicle?.image_url || received_vehicle?.image}
                alt={received_vehicle?.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = "/assets/vehicles/Figuritas_ferrari/ferrari-296-gtb.webp"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono">
                <span className="text-zinc-300 font-bold bg-black/80 px-2 py-0.5 rounded border border-zinc-700">
                  COLECCIÓN SPEEDCLUB
                </span>
                <span className="text-amber-300 font-bold bg-black/80 px-2 py-0.5 rounded border border-amber-600/50">
                  # {received_vehicle?.id || '00'}
                </span>
              </div>
            </div>

            {/* Vehicle Title & Category */}
            <h3 className="font-racing text-base sm:text-lg text-white uppercase italic font-black tracking-wider leading-tight">
              {received_vehicle?.name}
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {received_vehicle?.category}
            </span>
          </div>

          {/* ===================================================== */}
          {/* ACTION BUTTONS (PEGAR EN ÁLBUM O SEGUIR INTERCAMBIANDO) */}
          {/* ===================================================== */}
          <div className="mt-5 w-full flex flex-col sm:flex-row gap-2.5">
            {/* Primary Action Button: Go to Album */}
            <button
              onClick={handleGoToAlbum}
              className="flex-1 py-3 px-4 rounded-xl btn-racing-red text-white font-racing text-xs sm:text-sm italic font-black uppercase transition-all shadow-lg hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>IR AL ÁLBUM A PEGARLA &rarr;</span>
            </button>

            {/* Secondary Action Button: Keep Trading or return */}
            <button
              onClick={handleKeepTrading}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-racing text-xs sm:text-sm italic font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
              <span>SEGUIR INTERCAMBIANDO</span>
            </button>
          </div>

        </motion.div>
      )}

    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
