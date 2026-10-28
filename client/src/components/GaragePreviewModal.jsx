import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import { 
  X, 
  Car, 
  CheckCircle2, 
  Lock, 
  Flame, 
  Zap, 
  Gauge, 
  Award,
  Filter
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function GaragePreviewModal({ isOpen, onClose }) {
  const { catalog, pastedVehicles } = useGarageStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'Clásicos Urbanos', 'JDM Legends', 'Muscle Cars', 'Supercars & Hyper'];

  const filtered = selectedCategory === 'ALL' 
    ? catalog 
    : catalog.filter(c => c.category === selectedCategory);

  const pastedIds = new Set(pastedVehicles.map(v => v.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-5xl h-[88vh] rounded-2xl bg-zinc-950 border-2 border-zinc-700 p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Carbon fiber pattern */}
        <div className="absolute inset-0 carbon-pattern opacity-60 pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-14 rounded-lg bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-orange-500/80 shadow-md flex flex-col items-center justify-between p-1 flex-shrink-0 relative overflow-hidden">
              <div className="w-2 h-2 bg-gradient-to-br from-red-600 to-amber-600 rotate-45 transform shadow" />
              <span className="font-racing text-[9px] italic font-black text-white tracking-wider leading-none">SPEED</span>
              <span className="text-[7px] font-mono text-emerald-400 font-bold bg-black/80 px-1 rounded">2026</span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-racing text-xl sm:text-2xl text-white italic font-black uppercase">
                  TU GARAJE // <span className="text-racing-red">ÁLBUM DE COLECCIÓN</span>
                </h2>
                <span className="text-[10px] font-mono bg-zinc-800 text-amber-300 px-2 py-0.5 rounded border border-amber-600/30">
                  {pastedVehicles.length} / {catalog.length} AUTOS
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                PADDOCK MOTORSPORT ARCHIVE // EDICIÓN 2026
              </span>
            </div>
          </div>

          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="relative z-10 my-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playSelect();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded text-xs font-racing italic whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-racing-red text-white shadow-md font-bold'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat === 'ALL' ? 'TODAS LAS CATEGORÍAS' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Vehicles Grid (20 Vehicles Slots) */}
        <div className="relative z-10 flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 py-2">
          {filtered.map((vehicle) => {
            const isCollected = pastedIds.has(vehicle.id);
            return (
              <div
                key={vehicle.id}
                className={`relative rounded-xl p-2.5 border transition-all flex flex-col justify-between ${
                  isCollected
                    ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-red-500/50 shadow-metallic group hover:border-red-400'
                    : 'bg-zinc-950/80 border-dashed border-zinc-800 opacity-60'
                }`}
              >
                {/* Slot index */}
                <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                  <span className="text-zinc-400">SLOT #{String(vehicle.id).padStart(2, '0')}</span>
                  {isCollected ? (
                    <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      EN GARAJE
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-zinc-600">
                      <Lock className="w-3 h-3" />
                      BLOQUEADO
                    </span>
                  )}
                </div>

                {/* Car visual container */}
                <div className="w-full h-24 rounded bg-black/50 border border-zinc-800/80 flex items-center justify-center overflow-hidden my-1 relative">
                  {isCollected ? (
                    <img 
                      src={vehicle.image || vehicle.image_url} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-700">
                      <Car className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-mono">CRATE REQUERIDA</span>
                    </div>
                  )}

                  {/* Tier pill */}
                  <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-racing font-bold bg-black/80 text-amber-300 border border-amber-600/30">
                    TIER {vehicle.tier}
                  </span>
                </div>

                {/* Car name & category */}
                <div className="flex flex-col text-left mt-1">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase truncate">
                    {vehicle.category}
                  </span>
                  <span className="font-racing text-xs text-white italic truncate font-bold leading-tight">
                    {vehicle.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Progreso del Álbum: {Math.round((pastedVehicles.length / catalog.length) * 100)}%</span>
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg btn-metallic font-racing italic text-zinc-200 hover:text-white cursor-pointer"
          >
            VOLVER AL PADDOCK
          </button>
        </div>
      </motion.div>
    </div>
  );
}
