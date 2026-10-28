import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Share2, 
  ArrowRight, 
  Box, 
  Sparkles, 
  CheckCircle2, 
  Award,
  Zap
} from 'lucide-react';
import CrateBox3D from '../components/CrateBox3D';
import { sound } from '../utils/soundEffects';

export default function RewardModal({ onClose }) {
  const { claimRewardAndGoToDashboard, pilot } = useGarageStore();

  useEffect(() => {
    sound.playSelect();
    // Launch celebratory confetti with classic racing red, gold and amber colors
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#e10600', '#f59e0b', '#d97706', '#ffffff'],
      });
    } catch (e) {}
  }, []);

  const handleShare = () => {
    sound.playSelect();
    if (navigator.share) {
      navigator.share({
        title: 'SpeedClub Paddock License',
        text: '¡Acabo de obtener mi licencia oficial en SpeedClub y recibí 2 Sobres Containers de cortesía!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert("¡Enlace de telemetría copiado al portapapeles! Compártelo con tu escudería.");
    }
  };

  const handleAccept = () => {
    claimRewardAndGoToDashboard();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Light beam & radial glow in background (Matching Reference 4 sunburst rays) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-racing-red/20 via-zinc-950/70 to-black pointer-events-none" />

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-zinc-950 border-2 border-zinc-700/80 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center overflow-hidden"
      >
        {/* Carbon fiber pattern background */}
        <div className="absolute inset-0 carbon-pattern opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/80 pointer-events-none" />

        {/* Top Official Seal Badge (Replacing Panini Soccer Ball Seal) */}
        <div className="relative z-10 -mt-2 mb-3 flex items-center justify-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-racing-red via-zinc-900 to-black p-1 shadow-md flex items-center justify-center border border-red-500/70">
            <div className="w-full h-full rounded-full bg-telemetry-950 flex flex-col items-center justify-center text-white">
              <Award className="w-8 h-8 text-amber-400 mb-0.5" />
              <span className="text-[7px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
                VERIFICADO
              </span>
            </div>
            <div className="absolute -bottom-1 bg-amber-500 text-black text-[9px] font-racing italic px-2 py-0.2 rounded-full font-bold shadow-md">
              OFICIAL
            </div>
          </div>
        </div>

        {/* Modal Text Required by Specification */}
        <div className="relative z-10 flex flex-col items-center max-w-lg mb-6">
          <h2 className="font-racing text-2xl sm:text-4xl text-white italic tracking-wide font-black uppercase">
            ¡LICENCIA <span className="text-racing-red">APROBADA!</span>
          </h2>
          <p className="mt-1 font-telemetry text-sm sm:text-base text-zinc-300">
            ¡Gracias por registrarte! Recibe estos sobres containers por cortesía del Paddock.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-amber-400 font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>TU RECOMPENSA: 2 CONTAINERS + 200 CR DE BONO</span>
          </div>
        </div>

        {/* Center: 2 Mechanical Tokyo Spec Import Crates (Replacing Paper Packs) */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 my-2">
          {/* Crate 1: Standard Tokyo Spec */}
          <CrateBox3D 
            type="standard" 
            title="CRATE STANDARD"
            subtitle="5 PIEZAS // JDM & CLÁSICOS"
            badge="IMPORT #01"
            onClick={handleAccept}
          />

          {/* Crate 2: Deluxe Supercar Pack */}
          <CrateBox3D 
            type="premium" 
            title="CRATE DELUXE"
            subtitle="5 PIEZAS // SUPERCAR & TIER S"
            badge="PADDOCK SPECIAL"
            onClick={handleAccept}
          />
        </div>

        {/* Action Buttons: Stylized with angular chamfered edges (Telemetry Panel style) */}
        <div className="relative z-10 w-full mt-6 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Share Button with Angular Cuts */}
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={handleShare}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-lg btn-metallic flex items-center justify-center gap-2 group select-none cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-zinc-300 group-hover:text-amber-400 transition-colors" />
            <span className="font-racing text-sm text-zinc-200 group-hover:text-white uppercase italic font-bold tracking-wider">
              COMPARTIR TELEMETRÍA
            </span>
          </button>

          {/* Primary Accept Button */}
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={handleAccept}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-lg btn-racing-red flex items-center justify-center gap-2 group select-none shadow-md cursor-pointer"
          >
            <span className="font-racing text-base text-white uppercase italic font-black tracking-wider">
              ACEPTAR Y ENTRAR AL PADDOCK
            </span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Footer info note */}
        <span className="relative z-10 mt-3 text-[10px] font-mono text-zinc-500">
          * Los containers se agregarán automáticamente a tu inventario.
        </span>
      </motion.div>
    </div>
  );
}
