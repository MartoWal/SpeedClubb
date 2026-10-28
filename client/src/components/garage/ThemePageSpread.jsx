import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Shield, Flag, Award, BookOpen, Activity } from 'lucide-react';
import VehicleSlot from './VehicleSlot';

export default function ThemePageSpread({
  theme,
  vehicles = [],
  pastedIds = new Set(),
  inventoryMap = new Map(),
  onSlotPasteClick,
  customRightComponent = null
}) {
  // Split the vehicles of this theme evenly across the left and right pages
  const mid = Math.ceil(vehicles.length / 2);
  const leftVehicles = vehicles.slice(0, mid);
  const rightVehicles = vehicles.slice(mid);

  const leftPastedCount = leftVehicles.filter(v => pastedIds.has(v.id)).length;
  const rightPastedCount = rightVehicles.filter(v => pastedIds.has(v.id)).length;
  const totalThemePasted = leftPastedCount + rightPastedCount;

  return (
    <div className="relative w-full rounded-2xl bg-zinc-950 border-4 border-zinc-800 shadow-2xl p-2 sm:p-4 select-none overflow-hidden">
      {/* 3D Binder Center Spine Crease (Realistic open book center fold) */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/80 via-black/30 to-black/80 z-30 pointer-events-none" />
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-zinc-700/60 z-30 pointer-events-none" />

      {/* Thematic Background with High-Fidelity Motorsport Tone */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
        <img
          src={theme.bgImage}
          alt={theme.title}
          className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.08] saturate-[1.12] scale-[1.01]"
        />
        {/* Balanced contrast overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-zinc-950/45 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(9,9,11,0.6)_100%)]" />
      </div>

      {/* Open Book: Two Pages Spread (Grid 1 column on mobile, 2 columns on desktop) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
        
        {/* ======================================================== */}
        {/* PÁGINA IZQUIERDA (LEFT PAGE)                             */}
        {/* ======================================================== */}
        <div className="flex flex-col justify-between rounded-xl bg-zinc-950/85 border border-zinc-800/90 p-3 sm:p-4 backdrop-blur-md shadow-2xl min-h-[580px] relative overflow-hidden">
          {/* Page Top Thematic Banner in Full Color */}
          <div className="absolute top-0 inset-x-0 h-20 opacity-30 pointer-events-none overflow-hidden">
            <img src={theme.bgImage} alt="" className="w-full h-full object-cover object-top filter brightness-[0.85]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/70 to-zinc-950" />
          </div>
          {/* Page Top Header */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
                <Flag className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="font-racing text-sm sm:text-base text-white italic font-black uppercase tracking-wider leading-none">
                  {theme.title}
                </h3>
                <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  DIVISIÓN OFICIAL 1 // {leftPastedCount} de {leftVehicles.length} PEGADAS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 border border-zinc-700 text-zinc-300">
                PÁG. {theme.pageLeftNum}
              </span>
            </div>
          </div>

          {/* Left Page Grid of Vehicles (Homogeneous, Identical Slot Heights) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 content-start">
            {leftVehicles.map((vehicle) => (
              <VehicleSlot
                key={vehicle.id}
                vehicle={vehicle}
                isPasted={pastedIds.has(vehicle.id)}
                hasInInventory={inventoryMap.has(vehicle.id)}
                inventoryCount={inventoryMap.get(vehicle.id) || 0}
                onPasteClick={onSlotPasteClick}
              />
            ))}
          </div>

          {/* Left Page Bottom Lore / Technical Specification Strip */}
          <div className="mt-3 rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-800/80 text-[9px] font-mono">
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                {theme.leftLore.badge}
              </span>
              <span className="text-zinc-500">SPEEDCLUB HOMOLOGATION</span>
            </div>
            <h4 className="font-racing text-xs italic font-bold text-white leading-tight">
              {theme.leftLore.title}
            </h4>
            <p className="text-[10px] font-mono text-zinc-300 mt-1 leading-snug">
              {theme.leftLore.desc}
            </p>
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 mt-1.5 pt-1 border-t border-zinc-800/60 uppercase">
              <span>{theme.leftLore.footer}</span>
              <span className="text-amber-400 font-bold">EDICIÓN 2026</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PÁGINA DERECHA (RIGHT PAGE)                              */}
        {/* ======================================================== */}
        <div className="flex flex-col justify-between rounded-xl bg-zinc-950/85 border border-zinc-800/90 p-3 sm:p-4 backdrop-blur-md shadow-2xl min-h-[580px] relative overflow-hidden">
          {/* Page Top Thematic Banner in Full Color */}
          <div className="absolute top-0 inset-x-0 h-20 opacity-30 pointer-events-none overflow-hidden">
            <img src={theme.bgImage} alt="" className="w-full h-full object-cover object-top filter brightness-[0.85]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/70 to-zinc-950" />
          </div>
          {/* Page Top Header */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="font-racing text-sm sm:text-base text-white italic font-black uppercase tracking-wider leading-none">
                  {theme.title}
                </h3>
                <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  DIVISIÓN OFICIAL 2 // {rightPastedCount} de {rightVehicles.length} PEGADAS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 border border-zinc-700 text-zinc-300">
                PÁG. {theme.pageRightNum}
              </span>
            </div>
          </div>

          {/* Right Page Grid of Vehicles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 content-start">
            {rightVehicles.map((vehicle) => (
              <VehicleSlot
                key={vehicle.id}
                vehicle={vehicle}
                isPasted={pastedIds.has(vehicle.id)}
                hasInInventory={inventoryMap.has(vehicle.id)}
                inventoryCount={inventoryMap.get(vehicle.id) || 0}
                onPasteClick={onSlotPasteClick}
              />
            ))}

            {/* If custom component provided (e.g. Salón de la Fama), place cleanly in slot area */}
            {customRightComponent && (
              <div className="col-span-1 sm:col-span-1">
                {customRightComponent}
              </div>
            )}
          </div>

          {/* Right Page Bottom Lore / Advertising & Sponsor Strip */}
          <div className="mt-3 rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-800/80 text-[9px] font-mono">
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                {theme.rightLore.badge}
              </span>
              <span className="text-zinc-500">PADDOCK PARTNERS</span>
            </div>
            <h4 className="font-racing text-xs italic font-bold text-white leading-tight">
              {theme.rightLore.title}
            </h4>
            <p className="text-[10px] font-mono text-zinc-300 mt-1 leading-snug">
              {theme.rightLore.desc}
            </p>
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 mt-1.5 pt-1 border-t border-zinc-800/60 uppercase">
              <span>{theme.rightLore.footer}</span>
              <span className="text-amber-400 font-bold">TOTAL SECCIÓN: {totalThemePasted}/{vehicles.length}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
