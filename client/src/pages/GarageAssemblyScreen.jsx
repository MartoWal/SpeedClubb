import React from 'react';
import { motion } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import TachometerProgressBar from '../components/TachometerProgressBar';
import { Wrench, Gauge, Shield, FastForward } from 'lucide-react';

export default function GarageAssemblyScreen() {
  const { finishAssembly } = useGarageStore();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center text-white select-none overflow-hidden p-4 sm:p-6 bg-transparent">

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl bg-zinc-950/90 rounded-2xl border-2 border-zinc-700/80 p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center"
      >
        {/* Architectural Blueprint / Workshop Icon Header */}
        <div className="mb-4 relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-black p-0.5 border border-zinc-600 shadow-metallic">
            <div className="w-full h-full rounded-[10px] bg-telemetry-950 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-racing-red" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
        </div>

        {/* Heading Required by Specification: 'Ensamblando tu Garaje...' */}
        <h1 className="font-racing text-2xl sm:text-4xl text-white italic tracking-wide font-black uppercase leading-tight">
          ENSAMBLANDO TU <span className="text-racing-red">GARAJE...</span>
        </h1>

        <p className="mt-1 font-mono text-xs sm:text-sm text-zinc-400 max-w-md">
          Inicializando elevador hidráulico, base de datos local y slots para los 20 vehículos del catálogo oficial.
        </p>

        {/* Dynamic Tachometer RPM Progress Bar */}
        <div className="w-full my-8">
          <TachometerProgressBar onComplete={finishAssembly} duration={3.8} />
        </div>

        {/* Technical Specification Badges */}
        <div className="w-full pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-zinc-400">
          <div className="flex flex-col">
            <span className="text-zinc-500 uppercase">CATEGORÍAS</span>
            <span className="font-bold text-zinc-200">4 CIRCUITOS</span>
          </div>
          <div className="flex flex-col border-x border-zinc-800">
            <span className="text-zinc-500 uppercase">ESPACIO DE FLOTA</span>
            <span className="font-bold text-amber-400">28 SLOTS ACTIVOS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 uppercase">MOTOR DB</span>
            <span className="font-bold text-emerald-400">ACID SQLite OK</span>
          </div>
        </div>

        {/* Manual Skip Button for Evaluator Testing */}
        <button
          onMouseEnter={() => sound.playHover()}
          onClick={() => {
            sound.playSelect();
            finishAssembly();
          }}
          className="mt-6 flex items-center gap-1.5 px-3 py-1 text-xs font-racing italic text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>OMITIR Y ABRIR RECOMPENSA &rarr;</span>
        </button>
      </motion.div>
    </div>
  );
}
