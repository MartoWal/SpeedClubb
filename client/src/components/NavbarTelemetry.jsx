import React from 'react';
import { useGarageStore } from '../store/useGarageStore';
import { 
  Gauge, 
  Volume2, 
  VolumeX, 
  Box, 
  Coins, 
  ShieldCheck, 
  LogOut, 
  Radio, 
  ArrowLeftRight 
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function NavbarTelemetry() {
  const { 
    pilot, 
    racingCredits, 
    unopenedCrates, 
    soundEnabled, 
    toggleSound, 
    setCurrentScreen,
    addCredits,
    openCrateModal,
    openTeamModal,
    openTvModal,
    enterSpeedClubTv,
    openTradeModal,
    logout,
    isAuthenticated
  } = useGarageStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-telemetry-950/95 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
      {/* Top telemetry ticker strip */}
      <div className="hidden sm:flex justify-between items-center px-4 py-0.5 bg-black/60 text-[10px] text-zinc-400 font-mono tracking-wider border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            PADDOCK SERVER ONLINE
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">LATENCY: <strong className="text-zinc-200">{pilot.ping}ms</strong></span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">ECU TELEMETRY: <strong className="text-amber-400">ACTIVE</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">TEMPORADA 2026 // <strong className="text-zinc-200">WORLD CUP EDITION</strong></span>
          <span className="text-zinc-500">|</span>
          <span className="text-racing-red font-semibold">SPEEDCLUB OFFICIAL PROTOCOL</span>
        </div>
      </div>

      {/* Main Console Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            sound.playSelect();
            setCurrentScreen('LOGIN');
          }}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-racing-red via-zinc-900 to-black p-0.5 border border-red-700/60 shadow-md group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-telemetry-950 rounded-md flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-racing-red/20 scanlines opacity-50" />
              <Gauge className="w-6 h-6 text-racing-red group-hover:text-red-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-racing text-2xl tracking-tighter text-white italic drop-shadow-md">
                SPEED<span className="text-racing-red">CLUB</span>
              </span>
              <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-700/60 font-mono px-1 py-0.2 rounded font-bold uppercase">
                GR.1
              </span>
            </div>
            <span className="text-[9px] tracking-widest text-zinc-400 uppercase font-mono -mt-1 hidden sm:block">
              Paddock Garage & Collector
            </span>
          </div>
        </div>

        {/* Telemetry Pilot & Wallet Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button with Arcade hover/select */}
          <button
            onClick={() => {
              toggleSound();
              sound.playSelect();
            }}
            onMouseEnter={() => sound.playHover()}
            title={soundEnabled ? "Silenciar FX de menú" : "Activar FX de menú"}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-zinc-800 text-amber-400 border-amber-500/40'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* SpeedClub TV Quick Access */}
          <button
            onClick={() => {
              sound.playSelect();
              enterSpeedClubTv();
            }}
            onMouseEnter={() => sound.playHover()}
            title="Sintonizar SpeedClub TV (Gana hasta 300 CR)"
            className="hidden sm:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-red-700/80 hover:border-red-600 text-zinc-200 font-mono text-xs cursor-pointer shadow-metallic transition-all group"
          >
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span className="font-racing italic tracking-wider text-white">SPEEDCLUB TV</span>
            <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.2 rounded font-bold font-mono">+300 CR</span>
          </button>

          {/* Intercambios Quick Access */}
          <button
            onClick={() => {
              sound.playSelect();
              openTradeModal();
            }}
            onMouseEnter={() => sound.playHover()}
            title="Stand de Intercambios (Permutas 1 a 1)"
            className="hidden lg:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-amber-600/80 hover:border-amber-500 text-zinc-200 font-mono text-xs cursor-pointer shadow-metallic transition-all group"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-racing italic tracking-wider text-white">INTERCAMBIOS</span>
          </button>

          {/* Crate / Container Count Badge (Opens Container Unboxing Modal) */}
          <div 
            onClick={() => {
              sound.playSelect();
              openCrateModal();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-1.5 bg-zinc-900/90 hover:bg-zinc-800 px-2.5 sm:px-3 py-1.5 rounded-lg border border-zinc-700/80 hover:border-amber-500/60 cursor-pointer shadow-metallic transition-all group"
            title="Haz click aquí para abrir tus sobres containers"
          >
            <div className="relative">
              <Box className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-mono text-zinc-400 leading-none">CONTAINERS</span>
              <span className="font-racing text-sm text-amber-300 leading-none font-bold">
                {unopenedCrates} <span className="text-[10px] text-zinc-400 font-mono">LISTOS</span>
              </span>
            </div>
          </div>

          {/* Racing Credits (Wallet) with Arcade hover/select */}
          <div 
            onClick={() => {
              sound.playSelect();
              addCredits(100);
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 hover:to-amber-900/60 px-3 py-1.5 rounded-lg border border-amber-500/40 cursor-pointer shadow-metallic group transition-all"
            title="Haz click para recargar créditos (+100 CR)"
          >
            <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-mono text-amber-400/80 leading-none">CRÉDITOS</span>
              <span className="font-mono text-sm text-amber-300 font-black leading-none flex items-center gap-1">
                {racingCredits} <span className="text-[10px] text-amber-400/80">CR</span>
                <span className="text-xs text-amber-400 bg-amber-400/10 rounded px-1 group-hover:bg-amber-400 group-hover:text-black transition-colors font-bold">+</span>
              </span>
            </div>
          </div>

          {/* Pilot Badge - Opens Mi Escudería */}
          <div 
            onClick={() => {
              sound.playSelect();
              openTeamModal();
            }}
            onMouseEnter={() => sound.playHover()}
            className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Ver Mi Escudería (Colección de Figuritas)"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-racing-red to-zinc-700 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-racing text-white">
                08
              </div>
            </div>
            <div className="flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-racing text-xs text-white uppercase italic group-hover:text-amber-300 transition-colors">{pilot.name}</span>
                <ShieldCheck className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-[9px] text-zinc-400 font-mono tracking-wider">
                {pilot.license}
              </span>
            </div>
          </div>

          {/* Logout button (Active Pilot Session) */}
          {isAuthenticated && (
            <button
              onClick={logout}
              onMouseEnter={() => sound.playHover()}
              title="Cerrar Sesión de Piloto y volver a la pantalla de acceso"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950/80 border border-zinc-800 hover:border-red-600/70 text-zinc-400 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
