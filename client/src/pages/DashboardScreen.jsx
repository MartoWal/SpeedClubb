import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import { 
  Box, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Coins, 
  Layers, 
  Radio,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import FooterTelemetry from '../components/FooterTelemetry';
import AlbumCoverCard from '../components/garage/AlbumCoverCard';
import TradeCard from '../components/dashboard/TradeCard';
import { sound } from '../utils/soundEffects';

export default function DashboardScreen() {
  const { 
    catalog, 
    pastedVehicles, 
    containers,
    unopenedCrates, 
    racingCredits, 
    buyContainer,
    openTradeModal,
    inventory,
    eligibleVehicles,
    openCrateModal,
    setCurrentScreen,
    addCredits,
    enterGarageAlbum,
    openTeamModal,
    openTvModal,
    enterSpeedClubTv
  } = useGarageStore();

  const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null);
  const [isZoomingToGarage, setIsZoomingToGarage] = useState(false);

  const completionPct = Math.round((pastedVehicles.length / catalog.length) * 100);
  const duplicatesCount = eligibleVehicles?.duplicates_to_give?.length ?? (inventory || []).filter(i => (i.count || i.unpasted_count) > 1 || i.is_pasted).length;

  const handleEnterGarage = () => {
    sound.playSelect();
    setIsZoomingToGarage(true);
    setTimeout(() => {
      enterGarageAlbum();
      setIsZoomingToGarage(false);
    }, 650);
  };

  const handleBuyCommonContainer = async () => {
    sound.playSelect();
    const res = await buyContainer('standard');
    if (res.success) {
      setActiveBanner({
        message: "¡Container Común adquirido (+1 en tu inventario por 100 CR)!",
        action: {
          label: "ABRIR SOBRE AHORA",
          onClick: () => openCrateModal('standard')
        }
      });
      setTimeout(() => setActiveBanner(null), 5500);
    } else {
      alert(res.message);
    }
  };

  const handleBuyPremiumContainer = async () => {
    sound.playSelect();
    const res = await buyContainer('premium');
    if (res.success) {
      setActiveBanner({
        message: "¡Container Premium Dorado adquirido (+1 en tu inventario por 500 CR)!",
        action: {
          label: "ABRIR SOBRE AHORA",
          onClick: () => openCrateModal('premium')
        }
      });
      setTimeout(() => setActiveBanner(null), 5500);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col justify-between overflow-x-hidden text-white select-none pb-20 bg-transparent">
      

      {/* Floating Alert / Notification Banner */}
      {activeBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 max-w-lg mx-auto mt-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-amber-500/70 text-zinc-200 text-xs font-mono text-center flex items-center justify-between gap-3 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{activeBanner.message || activeBanner}</span>
          </div>
          {activeBanner.action && (
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playSelect();
                activeBanner.action.onClick();
                setActiveBanner(null);
              }}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-racing text-[10px] italic font-black uppercase transition-colors whitespace-nowrap cursor-pointer shadow"
            >
              {activeBanner.action.label}
            </button>
          )}
        </motion.div>
      )}

      {/* Main Central Interactive Pit Lane Carousel / Stage */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center">
          
          {/* Station 1: Left Billboard (Live Paddock Cam / SpeedClub TV) - 3 cols */}
          <motion.div 
            animate={{ opacity: isZoomingToGarage ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-3 flex flex-col items-center"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              onMouseEnter={() => sound.playHover()}
              className="w-full max-w-xs rounded-xl bg-zinc-950 border border-blue-900/60 hover:border-red-600/80 p-3 shadow-md transition-colors flex flex-col relative overflow-hidden group cursor-pointer"
              onClick={() => {
                sound.playSelect();
                enterSpeedClubTv();
              }}
            >
              <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
              
              {/* Screen Top Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping" />
                  SPEEDCLUB TV // LIVE
                </span>
                <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-1.5 py-0.2 rounded font-mono font-bold text-[9px]">
                  +300 CR
                </span>
              </div>

              {/* Video / Broadcast Simulated Visual */}
              <div className="relative w-full h-44 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800">
                <img
                  src="/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp"
                  alt="SpeedClub TV Live"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = "/assets/backgrounds/Fondos-WRC/fondo-peugeot-WRC.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-white font-bold bg-black/80 px-1.5 py-0.5 rounded border border-zinc-700">
                    4 CANALES FIA
                  </span>
                  <span className="text-yellow-400 font-bold bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/40">
                    +100 CR / VIDEO
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <h4 className="font-racing text-xs text-white uppercase italic tracking-wider flex items-center justify-center gap-1">
                  <span>TELEMETRÍA EN DIRECTO</span>
                  <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Mira transmisiones oficiales y gana hasta 300 CR cada 2h
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Station 2: Stand de Intercambio (Full-Bleed Trading Card) - 2 cols */}
          <motion.div 
            animate={{ opacity: isZoomingToGarage ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 flex flex-col items-center justify-center"
          >
            <TradeCard
              duplicatesCount={duplicatesCount}
              onClick={() => {
                sound.playSelect();
                openTradeModal();
              }}
            />
          </motion.div>

          {/* Station 3 (CENTERPIECE): TU GARAJE // ÁLBUM OFICIAL SPEEDCLUB (Seamless Hardcover) */}
          <div className="md:col-span-3 flex flex-col items-center justify-center relative z-20">
            <AlbumCoverCard
              completionPct={completionPct}
              pastedCount={pastedVehicles.length}
              totalCount={catalog.length}
              onOpen={handleEnterGarage}
              isZooming={isZoomingToGarage}
            />
          </div>

          {/* Station 4: Container Común Rojo (Sobre Estándar - 100 CR) - 2 cols */}
          <motion.div 
            animate={{ opacity: isZoomingToGarage ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 flex flex-col items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              onMouseEnter={() => sound.playHover()}
              className="w-full max-w-[220px] rounded-2xl bg-zinc-950 border border-red-700/80 p-3 shadow-md flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Subtle carbon texture */}
              <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

              {/* Header Badges */}
              <div className="relative z-10 w-full flex items-center justify-between text-[9px] font-mono mb-2">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <Box className="w-3 h-3 text-racing-red" />
                  <span>SOBRE COMÚN</span>
                </span>
                <span className="bg-red-950 text-red-300 border border-red-700/60 px-2 py-0.5 rounded font-racing font-bold italic">
                  100 CR
                </span>
              </div>

              {/* 3D Red Container Display */}
              <div 
                onClick={() => {
                  if (containers.standard > 0) {
                    openCrateModal('standard');
                  } else {
                    handleBuyCommonContainer();
                  }
                }}
                className="relative z-10 w-full h-36 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-red-600/70 transition-all cursor-pointer"
              >
                <img
                  src="/assets/crates/container_red.jpg"
                  alt="Container SpeedClub Estándar Rojo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[8px] font-mono">
                  <span className="text-zinc-200 font-bold bg-black/80 px-1.5 py-0.2 rounded border border-zinc-700">
                    3 FIGURITAS
                  </span>
                  <span className="text-amber-400 font-bold">
                    {containers.standard || 0} EN PODER
                  </span>
                </div>
              </div>

              {/* Info & Labels */}
              <div className="relative z-10 mt-2 text-center w-full">
                <h4 className="font-racing text-xs text-white uppercase italic font-black tracking-wider leading-tight">
                  CONTAINER COMÚN
                </h4>
                <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                  CLÁSICOS, HOT-HATCHES & JDM
                </span>
              </div>

              {/* Buy Action Button */}
              <button 
                onMouseEnter={() => sound.playHover()}
                onClick={handleBuyCommonContainer}
                className="relative z-10 w-full mt-2.5 py-2 px-2 rounded-lg btn-racing-red text-white font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-amber-300" />
                <span>COMPRAR SOBRE (100 CR)</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Station 5: Container Premium Dorado (Sobre VIP - 500 CR) - 2 cols */}
          <motion.div 
            animate={{ opacity: isZoomingToGarage ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 flex flex-col items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              onMouseEnter={() => sound.playHover()}
              className="w-full max-w-[220px] rounded-2xl bg-zinc-950 border border-amber-600/80 p-3 shadow-md flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Subtle carbon texture */}
              <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

              {/* Header Badges */}
              <div className="relative z-10 w-full flex items-center justify-between text-[9px] font-mono mb-2">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>SOBRE VIP ORO</span>
                </span>
                <span className="bg-amber-950 text-amber-300 border border-amber-600/60 px-2 py-0.5 rounded font-racing font-bold italic">
                  500 CR
                </span>
              </div>

              {/* 3D Gold Container Display */}
              <div 
                onClick={() => {
                  if (containers.premium > 0) {
                    openCrateModal('premium');
                  } else {
                    handleBuyPremiumContainer();
                  }
                }}
                className="relative z-10 w-full h-36 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-amber-500/70 transition-all cursor-pointer"
              >
                <img
                  src="/assets/crates/container_gold.jpg"
                  alt="Container SpeedClub Premium Dorado"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[8px] font-mono">
                  <span className="text-zinc-200 font-bold bg-black/80 px-1.5 py-0.2 rounded border border-zinc-700">
                    5 FIGURITAS
                  </span>
                  <span className="text-amber-400 font-bold">
                    {containers.premium || 0} EN PODER
                  </span>
                </div>
              </div>

              {/* Info & Labels */}
              <div className="relative z-10 mt-2 text-center w-full">
                <h4 className="font-racing text-xs text-amber-300 uppercase italic font-black tracking-wider leading-tight">
                  CONTAINER PREMIUM
                </h4>
                <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                  PORSCHE, SUPERCARS & EXÓTICOS
                </span>
              </div>

              {/* Buy Action Button */}
              <button 
                onMouseEnter={() => sound.playHover()}
                onClick={handleBuyPremiumContainer}
                className="relative z-10 w-full mt-2.5 py-2 px-2 rounded-lg bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-black" />
                <span>COMPRAR SOBRE (500 CR)</span>
              </button>
            </motion.div>
          </motion.div>

        </div>
      </main>

      {/* Bottom Telemetry Console Footer */}
      <FooterTelemetry />
    </div>
  );
}
