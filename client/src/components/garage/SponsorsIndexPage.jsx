import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  Tv, 
  Car,
  Flame,
  Award
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

const sponsors = [
  {
    name: 'PIRELLI P-ZERO',
    category: 'NEUMÁTICOS DE ULTRA ALTO RENDIMIENTO',
    tagline: 'Power is nothing without control',
    color: 'from-yellow-500/20 to-black',
    border: 'border-yellow-500/50',
    accent: 'text-yellow-400',
  },
  {
    name: 'BREMBO RACING',
    category: 'FRENOS CARBOCERÁMICOS GR.1',
    tagline: 'Maximum deceleration from 350 km/h',
    color: 'from-red-600/20 to-black',
    border: 'border-red-600/50',
    accent: 'text-red-400',
  },
  {
    name: 'MOTUL 300V',
    category: 'LUBRICANTE SINTÉTICO ESTER CORE',
    tagline: '100% Synthetic Motorsport Line',
    color: 'from-amber-600/20 to-black',
    border: 'border-amber-500/50',
    accent: 'text-amber-400',
  },
  {
    name: 'MOBIL 1 MOTOR OIL',
    category: 'PROTECCIÓN TÉRMICA DE COMPETENCIA',
    tagline: 'Official Motor Oil of Champions',
    color: 'from-blue-600/20 to-black',
    border: 'border-blue-500/50',
    accent: 'text-blue-400',
  },
  {
    name: 'SHELL V-POWER',
    category: 'COMBUSTIBLE DE ALTO OCTANAJE',
    tagline: 'Unleash pure horsepower',
    color: 'from-yellow-400/20 to-black',
    border: 'border-yellow-400/50',
    accent: 'text-yellow-300',
  },
  {
    name: 'BILSTEIN SUSPENSION',
    category: 'AMORTIGUACIÓN DE CIRCUITO MDS',
    tagline: 'Precision handling on the Nordschleife',
    color: 'from-amber-600/20 to-black',
    border: 'border-amber-500/50',
    accent: 'text-amber-400',
  },
];

export const THEME_SECTIONS = [
  {
    id: 'clasicos',
    pageTarget: 1,
    name: 'Clásicos Urbanos 90s',
    displayName: 'CLÁSICOS URBANOS 90s',
    subtitle: 'Hot-Hatches & Leyendas Nacionales y Europeas',
    slots: 'BAYS #01 - #11',
    total: 11,
    tag: 'TURISMO // 90s',
    color: 'from-emerald-950/70 to-zinc-950/90',
    border: 'border-emerald-600/60',
    accent: 'text-emerald-400',
    bgImage: '/assets/backgrounds/Fondos-clasicos-90s/fondo-clasicos-90s.jpg',
  },
  {
    id: 'jdm',
    pageTarget: 2,
    name: 'JDM Legends (Initial D)',
    displayName: 'JDM LEGENDS (INITIAL D)',
    subtitle: 'Touge Drift & Akina Mountain 11.000 RPM',
    slots: 'BAYS #12 - #22',
    total: 11,
    tag: 'INITIAL D // TOUGE',
    color: 'from-amber-950/70 to-zinc-950/90',
    border: 'border-amber-600/60',
    accent: 'text-amber-400',
    bgImage: '/assets/backgrounds/fondos-INITIAL-D/Fondo-Initial-D-Supra-RX7.jpg',
  },
  {
    id: 'wrc',
    pageTarget: 3,
    name: 'WRC Championship',
    displayName: 'WRC CHAMPIONSHIP',
    subtitle: 'Grupo A, Grupo B & Reyes del Rally Mundial FIA',
    slots: 'BAYS #23 - #32',
    total: 10,
    tag: 'FIA WORLD RALLY',
    color: 'from-sky-950/70 to-zinc-950/90',
    border: 'border-sky-600/60',
    accent: 'text-sky-400',
    bgImage: '/assets/backgrounds/Fondos-WRC/fondo-WRC-cars.jpg',
  },
  {
    id: 'porsche',
    pageTarget: 4,
    name: 'Porsche GT Team',
    displayName: 'PORSCHE GT TEAM',
    subtitle: 'Stuttgart Motorsport & Carrera GT Le Mans',
    slots: 'BAYS #33 - #44',
    total: 12,
    tag: 'STUTTGART // GT',
    color: 'from-amber-950/70 to-zinc-950/90',
    border: 'border-amber-600/60',
    accent: 'text-amber-400',
    bgImage: '/assets/backgrounds/Fondos-Porsche-Team/Fondo-Porsche-Team-Oficial.jfif',
  },
  {
    id: 'ferrari',
    pageTarget: 5,
    name: 'Scuderia Ferrari',
    displayName: 'SCUDERIA FERRARI',
    subtitle: 'Il Cavallino Rampante, F40 Biturbo & Enzo V12',
    slots: 'BAYS #45 - #55',
    total: 11,
    tag: 'MARANELLO // CORSE',
    color: 'from-red-950/70 to-zinc-950/90',
    border: 'border-red-600/60',
    accent: 'text-red-400',
    bgImage: '/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp',
  },
  {
    id: 'f1',
    pageTarget: 6,
    name: 'Fórmula 1 Histórica',
    displayName: 'FÓRMULA 1 HISTÓRICA',
    subtitle: 'Senna, Fangio, Schumacher & Campeones Mundiales',
    slots: 'BAYS #56 - #64',
    total: 9,
    tag: 'FIA F1 // GRAND PRIX',
    color: 'from-blue-950/70 to-zinc-950/90',
    border: 'border-blue-600/60',
    accent: 'text-blue-400',
    bgImage: '/assets/backgrounds/Fondos-F1/Fondo-F1.jfif',
  },
  {
    id: 'spoon',
    pageTarget: 7,
    name: 'Spoon Team Racing',
    displayName: 'SPOON TEAM RACING',
    subtitle: 'Type-R VTEC & Tsukuba Time Attack Blue/Yellow',
    slots: 'BAYS #65 - #75',
    total: 11,
    tag: 'SPOON SPORTS // VTEC',
    color: 'from-yellow-950/70 to-zinc-950/90',
    border: 'border-yellow-600/60',
    accent: 'text-yellow-400',
    bgImage: '/assets/backgrounds/Fondos-Spoon-team/Fondo-Spoo-Racing.jfif',
  },
  {
    id: 'ff',
    pageTarget: 8,
    name: 'Fast & Furious Heroes',
    displayName: 'FAST & FURIOUS HEROES',
    subtitle: '1/4 de Milla, Óxido Nitroso & Autos de Película',
    slots: 'BAYS #76 - #85',
    total: 10,
    tag: 'STREET RACING // NOS',
    color: 'from-red-950/70 to-zinc-950/90',
    border: 'border-red-600/60',
    accent: 'text-racing-red',
    bgImage: '/assets/backgrounds/Fondos-F&F/mitsubishi-eclipse-F&F.jpg',
  },
  {
    id: 'enfierrados',
    pageTarget: 9,
    name: 'Enfierrados & 1/4 Milla',
    displayName: 'ENFIERRADOS & 1/4 MILLA',
    subtitle: 'Picadas del Gálvez, Motores Forjados & 2-Step',
    slots: 'BAYS #86 - #95',
    total: 10,
    tag: 'GÁLVEZ // FUELTECH',
    color: 'from-orange-950/70 to-zinc-950/90',
    border: 'border-orange-600/60',
    accent: 'text-orange-400',
    bgImage: '/assets/backgrounds/Fondos-Enfierrados/Fondo-enfierrados-web.jpg',
  },
];

export default function SponsorsIndexPage({ 
  onNavigateToPage, 
  pastedVehicles = [], 
  catalog = [] 
}) {
  const getCategoryCount = (categoryName) => {
    return pastedVehicles.filter(v => v.category === categoryName).length;
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden flex flex-col justify-between select-none">
      {/* ============================================================ */}
      {/* RESPONSIVE PADDOCK BACKGROUND FOR SPONSORS & INDEX PAGE       */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
        <img
          src="/assets/backgrounds/paddock_main.jpg"
          alt="SpeedClub Paddock"
          className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.08] scale-[1.01]"
        />
        {/* Soft Glassmorphism Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* 3D Spine Crease */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/60 via-black/85 to-black/60 z-20 pointer-events-none hidden md:block" />
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10 z-20 pointer-events-none hidden md:block" />

      {/* Main 2-Page Layout */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 p-3 sm:p-5 overflow-y-auto">
        
        {/* ============================================================ */}
        {/* PÁGINA IZQUIERDA: PANEL DE PATROCINADORES (Sponsors Wall)     */}
        {/* ============================================================ */}
        <div className="rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800/90 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-red-950 border border-red-600/80 flex items-center justify-center text-racing-red shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="font-racing text-base sm:text-lg text-white italic font-black uppercase tracking-wide leading-tight">
                  PANEL DE PATROCINADORES
                </h3>
                <span className="text-[9px] font-mono text-zinc-400">
                  PADDOCK OFFICIAL COMMERCIAL PARTNERS
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
              SPONSORS 2026
            </span>
          </div>

          {/* Sponsor Brand Tiles Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 my-1">
            {sponsors.map((sp, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playSelect()}
                className={`rounded-xl p-3 bg-gradient-to-br ${sp.color} border ${sp.border} shadow-metallic flex flex-col justify-between cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-racing text-xs sm:text-sm italic font-black tracking-wider ${sp.accent}`}>
                    {sp.name}
                  </span>
                  <Sparkles className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider mt-1">
                  {sp.category}
                </span>
                <p className="text-[9px] font-mono text-zinc-300 italic mt-1 line-clamp-1">
                  "{sp.tagline}"
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom Video Reward Hook */}
          <div className="relative z-10 mt-3 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-300 text-[10px]">
                Ver tráiler patrocinado: <strong className="text-amber-400">+100 CR</strong>
              </span>
            </div>
            <button 
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playSelect();
                alert("Sesión de Tráiler Anti-Cheat inicializada: Se acreditarán 100 CR al finalizar el spot.");
              }}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-racing-red text-white text-[10px] font-racing italic font-bold uppercase transition-colors border border-zinc-700 cursor-pointer"
            >
              VER VIDEO &rarr;
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PÁGINA DERECHA: ÍNDICE DE CLASES (7 Temáticas con Preview)   */}
        {/* ============================================================ */}
        <div className="rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800/90 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-950 border border-amber-500/80 flex items-center justify-center text-amber-400 shadow">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="font-racing text-base sm:text-lg text-white italic font-black uppercase tracking-wide leading-tight">
                  ÍNDICE // 9 TEMÁTICAS DEL ÁLBUM
                </h3>
                <span className="text-[9px] font-mono text-zinc-400">
                  9 SECCIONES // 95 PLAZAS OFICIALES
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-zinc-700 font-bold">
              {pastedVehicles.length} / 95 PEGADOS
            </span>
          </div>

          {/* List of 9 Thematic Sections */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 my-1 overflow-y-auto max-h-[380px] pr-1">
            {THEME_SECTIONS.map((vc) => {
              const pastedCount = getCategoryCount(vc.name);
              return (
                <motion.div
                  key={vc.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    sound.playSelect();
                    if (onNavigateToPage) onNavigateToPage(vc.pageTarget);
                  }}
                  className={`relative rounded-xl p-2.5 bg-gradient-to-br ${vc.color} border ${vc.border} shadow-metallic flex flex-col justify-between cursor-pointer group overflow-hidden`}
                >
                  {/* Subtle Background Preview Thumbnail Layer */}
                  <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity">
                    <img
                      src={vc.bgImage}
                      alt={vc.displayName || vc.name}
                      className="w-full h-full object-cover object-center filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
                        {vc.tag}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-300 font-bold bg-black/80 px-1.5 py-0.2 rounded border border-zinc-700">
                        PÁG. {vc.pageTarget}
                      </span>
                    </div>

                    <h4 className={`font-racing text-xs italic font-black tracking-wider mt-0.5 ${vc.accent}`}>
                      {vc.displayName || vc.name}
                    </h4>
                    <p className="text-[8px] font-mono text-zinc-300 mt-0.5 leading-tight line-clamp-1">
                      {vc.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-zinc-400 text-[8px] truncate">
                      {vc.slots} ({pastedCount}/{vc.total})
                    </span>
                    <span className="flex items-center gap-0.5 font-racing italic font-bold text-white group-hover:text-racing-red transition-colors text-[9px]">
                      ABRIR <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Index Page Footer */}
          <div className="relative z-10 mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-[9px] font-mono text-zinc-400">
            <span>Haz clic en cualquier sección para abrir sus páginas</span>
            <span className="text-amber-400 font-bold">SPEEDCLUB 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
}
