import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Zap, Flame, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function TachometerProgressBar({ onComplete, duration = 3.6 }) {
  const [progress, setProgress] = useState(0);
  const [gear, setGear] = useState('N');

  const steps = [
    { threshold: 10, msg: "Iniciando diagnóstico ECU y telemetría...", gear: '1' },
    { threshold: 30, msg: "Calibrando amortiguadores Bilstein y presión de neumáticos...", gear: '2' },
    { threshold: 60, msg: "Ensamblando elevador hidráulico y chasis de 20 vehículos...", gear: '3' },
    { threshold: 85, msg: "Sincronizando casillero oficial en el Paddock...", gear: '4' },
    { threshold: 100, msg: "¡Garaje ensamblado con éxito! Calentando neumáticos...", gear: '5' },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 40;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 20) setGear('1');
      else if (pct < 45) setGear('2');
      else if (pct < 70) setGear('3');
      else if (pct < 90) setGear('4');
      else setGear('5');

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 600);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration]);

  // Current message based on progress
  const currentStep = steps.slice().reverse().find(s => progress >= s.threshold) || steps[0];
  const rpm = Math.round((progress / 100) * 9000);
  const isRedline = progress > 80;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Digital HUD Readouts */}
      <div className="w-full flex items-end justify-between mb-3 px-2">
        {/* Gear box indicator */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-14 rounded-lg bg-zinc-950 border-2 border-zinc-700 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[8px] font-mono text-zinc-500 uppercase leading-none">GEAR</span>
            <span className={`font-racing text-2xl font-black italic leading-none ${
              isRedline ? 'text-racing-red animate-pulse' : 'text-amber-400'
            }`}>
              {gear}
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono text-zinc-400">TRANSMISIÓN</span>
            <span className="text-xs font-racing italic text-zinc-200">SECUENCIAL GR.1</span>
          </div>
        </div>

        {/* Center Shift Lights (Classic style LED strip: Green -> Amber -> Red) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/80 rounded-full border border-zinc-800">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
            const lit = (progress / 10) >= idx;
            let ledColor = 'bg-zinc-800';
            if (lit) {
              if (idx <= 4) ledColor = 'bg-emerald-500';
              else if (idx <= 7) ledColor = 'bg-amber-500';
              else ledColor = 'bg-red-600 animate-pulse';
            }
            return (
              <span 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-100 ${ledColor}`} 
              />
            );
          })}
        </div>

        {/* RPM readout */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-zinc-400">TACÓMETRO</span>
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${
              isRedline ? 'text-racing-red animate-pulse' : 'text-white'
            }`}>
              {rpm.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 font-bold">RPM</span>
          </div>
        </div>
      </div>

      {/* Main Tachometer Progress Bar */}
      <div className="relative w-full h-8 sm:h-10 bg-zinc-950 rounded-xl p-1 border-2 border-zinc-700 overflow-hidden shadow-2xl">
        {/* RPM Scale tick marks */}
        <div className="absolute inset-0 flex justify-between px-3 items-center z-20 pointer-events-none opacity-40">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
            <div key={k} className="flex flex-col items-center">
              <span className="h-2 w-0.5 bg-zinc-400" />
              <span className="text-[8px] font-mono text-zinc-400">{k}</span>
            </div>
          ))}
        </div>

        {/* Filling progress strip with classic warm automotive gradient */}
        <motion.div
          className={`h-full rounded-lg transition-all duration-75 relative overflow-hidden ${
            isRedline
              ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 shadow-md'
              : 'bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-500 shadow-md'
          }`}
          style={{ width: `${progress}%` }}
        >
          {/* Animated light sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/40" />
          <div className="absolute inset-0 scanlines opacity-40" />
        </motion.div>
      </div>

      {/* Bottom Subtitle / Step Progress */}
      <div className="w-full mt-4 flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-zinc-200 font-medium tracking-wide">
            {currentStep.msg}
          </span>
        </div>
        <span className="font-bold text-amber-400 font-racing italic text-sm">
          {progress}%
        </span>
      </div>
    </div>
  );
}
