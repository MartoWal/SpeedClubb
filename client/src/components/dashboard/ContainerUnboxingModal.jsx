import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../store/useGarageStore';
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
  AlertTriangle
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

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
  const [isOpening, setIsOpening] = useState(false);
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

  const handleStartOpen = () => {
    if (currentAvailable <= 0) {
      sound.playSelect();
      return;
    }

    sound.playSelect();
    setIsOpening(true);

    setTimeout(async () => {
      const res = await openContainer(selectedType);
      if (res.success) {
        setOpenedContainerType(res.containerType);
        setRevealedCards(res.droppedVehicles);
      }
      setIsOpening(false);
    }, 1200);
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border-2 border-zinc-700/80 p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Subtle Carbon Fiber Background */}
        <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

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

            {/* Revealed Cards Fan / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-2 max-h-[360px] overflow-y-auto px-1">
              {revealedCards.map((v, idx) => {
                const tierStyle = tierBadgeStyles[v.tier] || tierBadgeStyles.C;
                const isAlreadyPasted = pastedIds.has(v.id);
                const catItem = catalog?.find((c) => c.id === v.id);
                const imgSrc = v.image || v.image_url || catItem?.image || '';

                return (
                  <motion.div
                    key={`${v.id}-${idx}`}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.12 }}
                    className="rounded-xl bg-zinc-900/95 border border-zinc-700/80 p-2.5 flex flex-col justify-between shadow-metallic hover:border-zinc-500 transition-colors"
                  >
                    {/* Card Top: Number + Tier */}
                    <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
                      <span className="bg-black/60 px-1.5 py-0.2 rounded text-zinc-400 border border-zinc-800">
                        #{String(v.id).padStart(2, '0')}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-racing text-[9px] italic border ${tierStyle.bg}`}>
                        {tierStyle.label}
                      </span>
                    </div>

                    {/* Figurine Photo */}
                    <div className="w-full h-28 rounded-lg bg-black/60 overflow-hidden flex items-center justify-center border border-zinc-800 relative">
                      <img
                        src={imgSrc}
                        alt={v.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (catItem?.image && e.target.src !== window.location.origin + catItem.image) {
                            e.target.src = catItem.image;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                      {isAlreadyPasted ? (
                        <span className="absolute bottom-1 right-1 bg-amber-500 text-black text-[8px] font-racing font-bold italic px-1.5 py-0.2 rounded shadow">
                          REPETIDA
                        </span>
                      ) : (
                        <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[8px] font-racing font-bold italic px-1.5 py-0.2 rounded shadow">
                          ¡NUEVA!
                        </span>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="mt-2 text-left">
                      <h4 className="font-racing text-xs text-white italic font-bold truncate">
                        {v.name}
                      </h4>
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mt-0.5">
                        <span className="truncate">{v.category}</span>
                        <span className="text-zinc-300 font-bold">{v.hp} HP</span>
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

            {/* Central 3D Container Display */}
            <div className="relative w-full max-w-sm h-52 sm:h-56 rounded-2xl bg-black/70 border border-zinc-800 flex items-center justify-center p-4 my-1 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

              <motion.img
                key={selectedType}
                src={
                  selectedType === 'premium'
                    ? '/assets/crates/container_gold.jpg'
                    : '/assets/crates/container_red.jpg'
                }
                alt="Container SpeedClub"
                animate={
                  isOpening
                    ? {
                        rotate: [-3, 3, -4, 4, -2, 2, 0],
                        scale: [1, 1.08, 1.02, 1.1, 1],
                      }
                    : {
                        y: [0, -6, 0],
                      }
                }
                transition={
                  isOpening
                    ? { duration: 1.2, ease: 'easeInOut' }
                    : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
                }
                className="max-h-44 sm:max-h-48 object-contain drop-shadow-2xl"
              />

              {isOpening && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-black/90 border border-amber-500 text-amber-300 font-racing text-sm italic font-black uppercase tracking-wider animate-pulse">
                    DESENCRIPTANDO CONTENIDO...
                  </div>
                </div>
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
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-950/50'
                        : 'btn-racing-red text-white shadow-red-950/50'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    <span>
                      {isOpening 
                        ? 'ABRIENDO...' 
                        : `ABRIR SOBRE ${selectedType === 'premium' ? 'PREMIUM (5 FIGURITAS)' : 'COMÚN (3 FIGURITAS)'} // ${currentAvailable} DISPONIBLES`}
                    </span>
                  </button>

                  {/* Secondary Quick-Buy Button (Allows stocking up without leaving!) */}
                  <button
                    disabled={isBuying || isOpening || !hasCredits}
                    onMouseEnter={() => sound.playHover()}
                    onClick={() => handleBuyInModal(selectedType)}
                    className="w-full py-2 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-racing text-xs italic font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      COMPRAR OTRO SOBRE {selectedType === 'premium' ? 'PREMIUM' : 'COMÚN'} (+1 POR {cost} CR)
                    </span>
                  </button>
                </>
              ) : (
                /* Empty Stock State: Purchase directly in modal without returning to paddock! */
                <div className="w-full flex flex-col items-center p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
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
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-950/40'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40'
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
