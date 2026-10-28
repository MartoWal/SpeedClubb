import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import { Gauge, Radio, Flame, Sparkles, FastForward } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function ConnectingScreen() {
  const { finishConnecting } = useGarageStore();
  const [lightsCount, setLightsCount] = useState(0);

  useEffect(() => {
    // Sequence starting lights 1..5
    const lightInterval = setInterval(() => {
      setLightsCount(prev => (prev < 5 ? prev + 1 : prev));
    }, 450);

    // Auto transition to Screen 3 (Assembly)
    const timer = setTimeout(() => {
      finishConnecting();
    }, 2800);

    return () => {
      clearInterval(lightInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center text-white select-none overflow-hidden p-6 bg-transparent">
      {/* Starting Grid Lights Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 p-3 bg-black/80 rounded-2xl border border-zinc-800 shadow-2xl flex items-center gap-3 sm:gap-4"
      >
        {[1, 2, 3, 4, 5].map((idx) => {
          const isLit = lightsCount >= idx;
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div 
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-zinc-700 transition-all duration-200 ${
                  isLit 
                    ? 'bg-red-600 border-red-500 shadow-sm' 
                    : 'bg-zinc-900'
                }`} 
              />
              <span className="text-[8px] font-mono text-zinc-500">{idx}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Main Central Heading with Chromatic Aberration & animate-pulse */}
      <div className="relative z-10 text-center flex flex-col items-center max-w-xl">
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative inline-block"
        >
          <h1 
            className="font-racing text-3xl sm:text-5xl md:text-6xl text-racing-red italic tracking-wider font-black drop-shadow-md"
          >
            CALENTANDO MOTORES...
          </h1>
        </motion.div>

        {/* Telemetry subline */}
        <p className="mt-4 font-mono text-xs sm:text-sm text-racing-red font-bold tracking-widest uppercase flex items-center gap-2 drop-shadow-sm">
          <Radio className="w-4 h-4 animate-spin text-racing-red" />
          <span>SINCRONIZANDO ECU // CONEXIÓN DIRECTA AL PIT WALL</span>
        </p>

        {/* Telemetry diagnostics stream */}
        <div className="mt-6 w-full max-w-md p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 font-mono text-[11px] text-zinc-400 flex flex-col gap-1 text-left shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">&gt; Presión de Inyección de Combustible:</span>
            <span className="text-emerald-400 font-bold">250 BAR [ÓPTIMO]</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">&gt; Temperatura de Neumáticos (Slicks):</span>
            <span className="text-amber-400 font-bold">85°C [EN ZONA]</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">&gt; Paddock Security Token:</span>
            <span className="text-amber-400 font-bold">ACID-LOCK VALIDADO</span>
          </div>
        </div>

        {/* Skip button for evaluator */}
        <button
          onMouseEnter={() => sound.playHover()}
          onClick={() => {
            sound.playSelect();
            finishConnecting();
          }}
          className="mt-8 flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs font-racing italic text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>AVANZAR A ENSAMBLE</span>
        </button>
      </div>
    </div>
  );
}
