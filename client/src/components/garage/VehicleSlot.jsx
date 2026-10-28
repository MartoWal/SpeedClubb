import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Car, Check, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export default function VehicleSlot({ 
  vehicle, 
  isPasted, 
  hasInInventory = false, 
  inventoryCount = 0, 
  onPasteClick 
}) {
  const handleClick = () => {
    if (isPasted) {
      sound.playSelect();
      return;
    }
    sound.playSelect();
    if (onPasteClick) {
      onPasteClick(vehicle);
    }
  };

  return (
    <div 
      className={`relative w-full h-[168px] sm:h-[188px] rounded-xl p-2.5 flex flex-col justify-between overflow-hidden transition-all duration-200 select-none ${
        isPasted 
          ? 'bg-emerald-950 border-2 border-emerald-600 shadow-md text-white' 
          : 'bg-zinc-900 border-2 border-zinc-700/80 hover:border-zinc-500 shadow-sm text-amber-400'
      }`}
    >
      {/* Background subtle texture */}
      <div className="absolute inset-0 carbon-pattern opacity-30 pointer-events-none" />

      {/* Top Header: Bay Number + Tier Pill */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono leading-none">
        <span 
          className={`font-bold px-1.5 py-0.5 rounded ${
            isPasted 
              ? 'bg-emerald-900 text-white border border-emerald-500/70' 
              : 'bg-black/60 text-amber-400 border border-zinc-700/80'
          }`}
        >
          BAY #{String(vehicle.id).padStart(2, '0')}
        </span>

        <span 
          className={`font-racing text-[9px] italic font-black px-1.5 py-0.5 rounded border ${
            isPasted
              ? 'bg-emerald-800 text-white border-emerald-400'
              : 'bg-zinc-800 text-amber-400 border-zinc-600'
          }`}
        >
          TIER {vehicle.tier}
        </span>
      </div>

      {/* Center Bay: Pasted Photo vs Incomplete Silhouette Slot */}
      <div className="relative z-10 my-1 w-full h-[96px] sm:h-[110px] rounded-lg overflow-hidden flex items-center justify-center">
        {isPasted ? (
          /* Pasted Vehicle Card (Fondo verde, foto del auto, marco clásico) */
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full h-full rounded-md overflow-hidden bg-black/60 border border-emerald-500/80 flex items-center justify-center group/card"
          >
            <img
              src={vehicle.image || vehicle.image_url}
              alt={vehicle.name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
            />
            {/* Fallback Graphic */}
            <div className="hidden absolute inset-0 flex-col items-center justify-center bg-zinc-900 text-white p-1 text-center">
              <Car className="w-8 h-8 text-emerald-400 mb-1" />
              <span className="text-[10px] font-racing italic text-white">{vehicle.name}</span>
            </div>

            {/* Checkmark Badge */}
            <div className="absolute top-1 right-1 bg-emerald-500 text-black p-0.5 rounded-full shadow-md">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>

            {/* Subtle gloss reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </motion.div>
        ) : (
          /* Incomplete Slot (Fondo gris oscuro, letras amarillas) */
          <div 
            onClick={handleClick}
            onMouseEnter={() => sound.playHover()}
            className="relative w-full h-full rounded-md border-2 border-dashed border-zinc-700 hover:border-amber-400/80 bg-zinc-950/60 flex flex-col items-center justify-center cursor-pointer transition-colors group/slot"
          >
            {/* Car silhouette */}
            <Car className="w-12 h-12 text-zinc-700 group-hover/slot:text-zinc-600 transition-colors" />

            {/* Plus button */}
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                hasInInventory
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-800 text-zinc-400 group-hover/slot:text-amber-400 border border-zinc-600'
              }`}
            >
              <Plus className={`w-5 h-5 stroke-[3] ${hasInInventory ? 'text-black' : 'text-zinc-400'}`} />
            </motion.div>

            {/* Ready badge if in inventory */}
            {hasInInventory && (
              <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[8px] font-mono font-black uppercase tracking-wider shadow">
                LISTO ({inventoryCount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Info: Name & Specs (White when pasted, Yellow when incomplete) */}
      <div className="relative z-10 flex flex-col text-left">
        <span 
          className={`font-racing text-[11px] sm:text-xs italic truncate font-bold leading-tight ${
            isPasted ? 'text-white' : 'text-amber-400'
          }`}
          title={vehicle.name}
        >
          {vehicle.name}
        </span>
        <div 
          className={`flex items-center justify-between text-[9px] font-mono mt-0.5 ${
            isPasted ? 'text-zinc-200' : 'text-yellow-500/90'
          }`}
        >
          <span className="truncate max-w-[130px]">{vehicle.category}</span>
          <span className="font-bold">{vehicle.hp} HP</span>
        </div>
      </div>
    </div>
  );
}
