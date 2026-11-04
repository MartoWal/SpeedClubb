import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../store/useGarageStore';
import confetti from 'canvas-confetti';
import { 
  Box, 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  Car, 
  Coins, 
  Flame, 
  ShieldCheck, 
  RotateCcw,
  BookOpen,
  Plus,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

const tierCardAuras = {
  C: 'border-emerald-600/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500',
  B: 'border-blue-600/70 shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:border-blue-400',
  A: 'border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.35)] hover:border-red-400 ring-1 ring-red-500/50',
  S: 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:border-yellow-300 ring-2 ring-amber-400/80',
};

const tierBadgeStyles = {
  C: { bg: 'bg-zinc-800 text-zinc-200 border-zinc-600', label: 'TIER C' },
  B: { bg: 'bg-amber-950 text-amber-200 border-amber-600/80', label: 'TIER B' },
  A: { bg: 'bg-red-950 text-red-200 border-red-600/80', label: 'TIER A' },
  S: { bg: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black border-amber-300 font-black', label: 'TIER S' },
};

export default function ContainerUnboxingModal() {
  const { 
    isOpeningCrateModalOpen, 
    closeCrateModal, 
    openingCrateType,
    containers, 
    unopenedCrates, 
    racingCredits, 
    openContainer, 
    buyContainer, 
    pastedVehicles,
    enterGarageAlbum,
    catalog
  } = useGarageStore();

  const [selectedType, setSelectedType] = useState('standard');
  const [openingStage, setOpeningStage] = useState('idle'); // 'idle' | 'charging' | 'exploding'
  const isOpening = openingStage !== 'idle';
  const [isBuying, setIsBuying] = useState(false);
  const [revealedCards, setRevealedCards] = useState(null);
  const [openedContainerType, setOpenedContainerType] = useState('standard');
  const [purchaseNotice, setPurchaseNotice] = useState(null); // { type: 'success' | 'error', message: string }

  // Sync selected type when modal is opened from dashboard cards or footer
  useEffect(() => {
    if (openingCrateType) {
      setSelectedType(openingCrateType);
    }
  }, [openingCrateType, isOpeningCrateModalOpen]);

  if (!isOpeningCrateModalOpen) return null;

  const currentAvailable = containers[selectedType] || 0;
  const cost = selectedType === 'premium' ? 500 : 100;
  const hasCredits = (racingCredits || 0) >= cost;
  const pastedIds = new Set((pastedVehicles || []).map((v) => v.id));

  const handleStartOpen = async () => {
    if (currentAvailable <= 0 || isOpening) {
      sound.playSelect();
      return;
    }

    sound.playSelect();
    setOpeningStage('charging');

    // Call backend in background
    const resPromise = openContainer(selectedType);

    // After 1.25s of violent shaking & charge-up, trigger explosive detonation
    setTimeout(async () => {
      setOpeningStage('exploding');
      sound.playExplosion();

      // Launch energetic confetti fireworks
      const isGold = selectedType === 'premium';
      try {
        confetti({
          particleCount: isGold ? 110 : 80,
          spread: 100,
          origin: { y: 0.52 },
          colors: isGold
            ? ['#f59e0b', '#fbbf24', '#ffffff', '#d97706', '#fef08a', '#e11d48']
            : ['#dc2626', '#ef4444', '#f59e0b', '#ffffff', '#7f1d1d', '#f97316'],
          ticks: 220,
          gravity: 1.15,
          scalar: 1.25,
        });
      } catch (e) {}

      const res = await resPromise;

      // Reveal cards after explosion flash
      setTimeout(() => {
        if (res && res.success) {
          setOpenedContainerType(res.containerType);
          setRevealedCards(res.droppedVehicles);
          sound.playReward();

          // Extra golden burst if dropped an S or A tier!
          const hasEpicOrLegendary = res.droppedVehicles?.some((v) => v.tier === 'S' || v.tier === 'A');
          if (hasEpicOrLegendary) {
            setTimeout(() => {
              try {
                confetti({
                  particleCount: 75,
                  spread: 120,
                  origin: { y: 0.35 },
                  colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444'],
                  ticks: 180,
                });
              } catch (e) {}
            }, 300);
          }
        }
        setOpeningStage('idle');
      }, 650);
    }, 1250);
  };

  // Return to containers station (View 2) regardless of whether stock is > 0 or == 0
  const handleReset = () => {
    sound.playSelect();
    setRevealedCards(null);
    setPurchaseNotice(null);
  };

  const handleGoToGarage = () => {
    sound.playSelect();
    closeCrateModal();
    enterGarageAlbum();
  };

  const handleBuyInModal = async (typeToBuy) => {
    if (isBuying) return;
    setIsBuying(true);
    sound.playSelect();

    const res = await buyContainer(typeToBuy);
    setIsBuying(false);

    if (res.success) {
      sound.playReward();
      setPurchaseNotice({
        type: 'success',
        message: `¡Container ${typeToBuy === 'premium' ? 'Premium Dorado' : 'Común'} adquirido con éxito (+1 en inventario)!`
      });
      setTimeout(() => setPurchaseNotice(null), 4000);
    } else {
      setPurchaseNotice({
        type: 'error',
        message: res.message || 'Créditos de Carrera insuficientes para esta compra.'
      });
      setTimeout(() => setPurchaseNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      {/* Full Backdrop Shipping Port Terminal Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-25"
        style={{ backgroundImage: `url('/fondo_containers.webp'), url('/fondo_containers.jpg')` }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full ${revealedCards ? 'max-w-3xl' : 'max-w-2xl'} rounded-2xl bg-zinc-950 border-2 border-zinc-700/80 p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300`}
      >
        {/* Real Container Port Background with matte contrast overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-35"
          style={{ backgroundImage: `url('/fondo_containers.webp'), url('/fondo_containers.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/80 to-zinc-950/95 pointer-events-none" />
        {/* Subtle Carbon Fiber Background */}
        <div className="absolute inset-0 carbon-pattern opacity-30 pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400">
              <Box className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="font-racing text-base sm:text-lg text-white italic font-black uppercase tracking-wide leading-tight">
                ESTACIÓN DE APERTURA // <span className="text-amber-400">SOBRES CONTAINERS</span>
              </h3>
              <span className="text-[9px] font-mono text-zinc-400">
                {unopenedCrates} CONTAINERS TOTALES EN TU PODER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Real-time Pilot Credits Display */}
            <div className="px-3 py-1 rounded-lg bg-black/70 border border-amber-600/50 flex items-center gap-1.5 shadow-inner">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-zinc-400 uppercase hidden sm:inline">SALDO:</span>
                <span className="font-racing text-xs font-black text-amber-300 italic">
                  {racingCredits} CR
                </span>
              </div>
            </div>

            {/* Close Modal Button */}
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playSelect();
                closeCrateModal();
              }}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: REVEALED CARDS AFTER OPENING                     */}
        {/* ======================================================== */}
        {revealedCards ? (
          <div className="relative z-10 flex flex-col items-center py-2">
            <div className="text-center mb-3">
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                ¡{openedContainerType === 'premium' ? 'CONTAINER PREMIUM ORO' : 'CONTAINER ESTÁNDAR'} ABIERTO!
              </span>
              <h2 className="font-racing text-xl sm:text-2xl text-white italic font-black uppercase mt-1">
                FIGURITAS DESENCRIPTADAS
              </h2>
              <p className="text-[10px] font-mono text-zinc-400">
                Estas piezas han sido guardadas en tu inventario y están listas para pegar en el álbum.
              </p>
            </div>

            {/* Revealed Cards Fan / Grid - Spacious Responsive 3-Columns Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 w-full my-2 max-h-[430px] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-zinc-700">
              {revealedCards.map((v, idx) => {
                const tierStyle = tierBadgeStyles[v.tier] || tierBadgeStyles.C;
                const isAlreadyPasted = pastedIds.has(v.id);
                const catItem = catalog?.find((c) => c.id === v.id);
                const imgSrc = v.image || v.image_url || catItem?.image || '';

                return (
                  <motion.div
                    key={`${v.id}-${idx}`}
                    initial={{ opacity: 0, y: 40, scale: 0.6, rotateY: 45 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                    transition={{ delay: idx * 0.14, type: 'spring', damping: 20, stiffness: 250 }}
                    className={`rounded-xl bg-zinc-900/95 border p-3 flex flex-col justify-between shadow-metallic transition-all relative overflow-hidden group/card ${
                      tierCardAuras[v.tier] || tierCardAuras.C
                    }`}
                  >
                    {/* Subtle metallic shine sweep across card */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-40 group-hover/card:opacity-80 transition-opacity" />
                    
                    {/* Card Top: Number + Tier */}
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="bg-black/70 px-2 py-0.5 rounded text-zinc-300 border border-zinc-800 font-bold">
                        BAY #{String(v.id).padStart(2, '0')}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-racing text-[10px] italic border ${tierStyle.bg}`}>
                        {tierStyle.label}
                      </span>
                    </div>

                    {/* Figurine Photo (Spacious & Clean) */}
                    <div className="w-full h-32 sm:h-36 rounded-lg bg-black/70 overflow-hidden flex items-center justify-center border border-zinc-800 relative">
                      <img
                        src={imgSrc}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          if (catItem?.image && e.target.src !== window.location.origin + catItem.image) {
                            e.target.src = catItem.image;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                      {isAlreadyPasted ? (
                        <span className="absolute bottom-1.5 right-1.5 bg-amber-500 text-black text-[9px] font-racing font-black italic px-2 py-0.5 rounded shadow border border-amber-300">
                          REPETIDA
                        </span>
                      ) : (
                        <span className="absolute bottom-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-racing font-black italic px-2 py-0.5 rounded shadow border border-emerald-400">
                          ¡NUEVA!
                        </span>
                      )}
                    </div>

                    {/* Card Details: Full Name & Tech Specs */}
                    <div className="mt-2.5 text-left">
                      <h4 className="font-racing text-xs sm:text-sm text-white italic font-bold leading-snug line-clamp-2">
                        {v.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1 pt-1 border-t border-zinc-800/60">
                        <span className="truncate pr-1 text-zinc-400">{v.category}</span>
                        <span className="text-amber-400 font-bold shrink-0">{v.hp} HP</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="w-full mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Option to return to containers (Always available, with or without containers) */}
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={handleReset}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white font-racing text-xs italic font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {unopenedCrates > 0 
                    ? `ABRIR OTRO SOBRE (${unopenedCrates} LISTOS)` 
                    : 'VOLVER A CONTAINERS // COMPRAR MÁS'}
                </span>
              </button>

              {/* Option to navigate to the album */}
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={handleGoToGarage}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl btn-racing-red text-white font-racing text-xs italic font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>IR AL ÁLBUM A PEGARLAS</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: CONTAINER SELECT & UNBOXING / PURCHASE STAGE     */
          /* ======================================================== */
          <div className="relative z-10 flex flex-col items-center py-2">
            
            {/* Container Type Selector Tabs */}
            <div className="w-full grid grid-cols-2 gap-3 mb-3">
              {/* Common Red Tab */}
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playSelect();
                  setSelectedType('standard');
                  setPurchaseNotice(null);
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                  selectedType === 'standard'
                    ? 'bg-red-950/40 border-red-600/80 shadow-md ring-1 ring-red-600/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-racing text-xs italic font-bold text-white uppercase">
                    CONTAINER COMÚN
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                    (containers.standard || 0) > 0
                      ? 'bg-black/60 border-red-700 text-red-400'
                      : 'bg-black/40 border-zinc-800 text-zinc-500'
                  }`}>
                    {containers.standard || 0} EN PODER
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                  <span>3 Figuritas de Colección</span>
                  <span className="text-amber-400 font-bold">100 CR</span>
                </div>
              </button>

              {/* Premium Gold Tab */}
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playSelect();
                  setSelectedType('premium');
                  setPurchaseNotice(null);
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                  selectedType === 'premium'
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-racing text-xs italic font-bold text-amber-300 uppercase">
                    CONTAINER PREMIUM
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                    (containers.premium || 0) > 0
                      ? 'bg-black/60 border-amber-600 text-amber-400'
                      : 'bg-black/40 border-zinc-800 text-zinc-500'
                  }`}>
                    {containers.premium || 0} EN PODER
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                  <span>5 Figuritas // Tier A & S</span>
                  <span className="text-amber-400 font-bold">500 CR</span>
                </div>
              </button>
            </div>

            {/* In-Modal Purchase Notice Banner */}
            <AnimatePresence>
              {purchaseNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono mb-2 flex items-center justify-between gap-2 shadow-md ${
                    purchaseNotice.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300'
                      : 'bg-red-950/80 border-red-600/80 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {purchaseNotice.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{purchaseNotice.message}</span>
                  </div>

                  <button
                    onClick={() => setPurchaseNotice(null)}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Central 3D Container Display with Explosive Cinematic FX */}
            <div className="relative w-full max-w-sm h-56 sm:h-60 rounded-2xl bg-black/90 border border-zinc-800 flex items-center justify-center p-0 my-1 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

              {/* Glowing Background Radial Beam during Charge-Up */}
              {openingStage === 'charging' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0.3, 0.8, 0.4, 0.9],
                    scale: [0.8, 1.4, 1.1, 1.5],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute w-48 h-48 rounded-full blur-2xl pointer-events-none ${
                    selectedType === 'premium'
                      ? 'bg-gradient-to-r from-amber-500/60 via-yellow-400/80 to-amber-600/60'
                      : 'bg-gradient-to-r from-red-600/60 via-orange-500/80 to-red-700/60'
                  }`}
                />
              )}

              {/* White-Hot Explosive Flash & Shockwave Ring during Explosion */}
              {openingStage === 'exploding' && (
                <>
                  <motion.div
                    initial={{ opacity: 1, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 2.8 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0 bg-white/90 z-30 pointer-events-none rounded-2xl"
                  />
                  <motion.div
                    initial={{ opacity: 1, scale: 0.4 }}
                    animate={{ opacity: 0, scale: 3.2 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className={`absolute w-36 h-36 rounded-full border-4 z-20 pointer-events-none ${
                      selectedType === 'premium' ? 'border-amber-300 shadow-[0_0_50px_#f59e0b]' : 'border-red-400 shadow-[0_0_50px_#ef4444]'
                    }`}
                  />
                </>
              )}

              {/* Container Image - Fills entire container box with smooth explosion (no rotation shake) */}
              <motion.img
                key={selectedType}
                src={
                  selectedType === 'premium'
                    ? '/assets/crates/container_gold.jpg'
                    : '/assets/crates/container_red.jpg'
                }
                alt="Container SpeedClub"
                animate={
                  openingStage === 'charging'
                    ? {
                        scale: [1, 1.03, 1.06, 1.1],
                        filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1.5)', 'brightness(1.8)'],
                      }
                    : openingStage === 'exploding'
                    ? {
                        scale: [1.1, 2.2],
                        opacity: [1, 0],
                        filter: 'blur(16px) brightness(2.5)',
                      }
                    : {
                        y: [0, -4, 0],
                        scale: 1,
                        filter: 'brightness(1)',
                        opacity: 1,
                      }
                }
                transition={
                  openingStage === 'charging'
                    ? { duration: 1.25, ease: 'easeInOut' }
                    : openingStage === 'exploding'
                    ? { duration: 0.55, ease: 'easeOut' }
                    : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
                }
                className="w-full h-full object-cover z-10"
              />

              {/* Tactical Status Overlay during Charge-Up */}
              {openingStage === 'charging' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black/55 z-20 flex flex-col items-center justify-center p-3 text-center"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 mb-1 animate-pulse">
                    <Zap className="w-5 h-5 fill-amber-400" />
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-300">
                      DESPRESURIZACIÓN CRÍTICA
                    </span>
                    <Zap className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-black/95 border border-amber-500/80 text-amber-300 font-racing text-sm italic font-black uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                    ⚡ SOBRECARGA EN PROCESO...
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls: Open or Purchase In-Modal */}
            <div className="w-full mt-3 flex flex-col items-center gap-2">
              {currentAvailable > 0 ? (
                <>
                  {/* Primary Open Button */}
                  <button
                    disabled={isOpening}
                    onMouseEnter={() => sound.playHover()}
                    onClick={handleStartOpen}
                    className={`w-full py-3.5 px-6 rounded-xl font-racing text-sm sm:text-base italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      selectedType === 'premium'
                        ? 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-400 font-black'
                        : 'bg-red-700 hover:bg-red-600 text-white border border-red-500 font-black'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    <span>
                      {isOpening 
                        ? 'DESPRESURIZANDO...' 
                        : `Abrir container ${selectedType === 'premium' ? 'premium' : 'común'} (${currentAvailable})`}
                    </span>
                  </button>

                  {/* Secondary Quick-Buy Button (Allows stocking up without leaving!) */}
                  <button
                    disabled={isBuying || isOpening || !hasCredits}
                    onMouseEnter={() => sound.playHover()}
                    onClick={() => handleBuyInModal(selectedType)}
                    className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-racing text-xs italic font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      COMPRAR OTRO SOBRE {selectedType === 'premium' ? 'PREMIUM' : 'COMÚN'} (+1 POR {cost} CR)
                    </span>
                  </button>
                </>
              ) : (
                /* Empty Stock State: Purchase directly in modal without returning to paddock! */
                <div className="w-full flex flex-col items-center p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-zinc-700 text-zinc-400 font-bold uppercase">
                      0 SOBRES EN INVENTARIO
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">
                      {selectedType === 'premium' 
                        ? '5 figuritas con alta probabilidad Tier A y S' 
                        : '3 figuritas aleatorias del álbum oficial'}
                    </span>
                  </div>

                  <button
                    disabled={isBuying || !hasCredits}
                    onMouseEnter={() => sound.playHover()}
                    onClick={() => handleBuyInModal(selectedType)}
                    className={`w-full mt-2 py-3 px-5 rounded-xl font-racing text-sm italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedType === 'premium'
                        ? 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-400'
                        : 'bg-red-700 hover:bg-red-600 text-white border border-red-500'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>
                      {hasCredits 
                        ? `COMPRAR Y AÑADIR (+1) POR ${cost} CR` 
                        : `CRÉDITOS INSUFICIENTES (${racingCredits} / ${cost} CR)`}
                    </span>
                  </button>

                  <span className="text-[10px] font-mono text-zinc-500 mt-2">
                    Una vez adquirido, el sobre se habilitará instantáneamente para su apertura aquí mismo.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
