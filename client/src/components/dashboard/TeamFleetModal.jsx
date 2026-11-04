import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../store/useGarageStore';
import { 
  X, 
  Car, 
  CheckCircle2, 
  Lock, 
  Users, 
  Sparkles, 
  Zap, 
  Gauge, 
  Box, 
  BookOpen, 
  ShieldCheck, 
  Filter,
  Layers,
  Award,
  ChevronDown,
  ArrowRight,
  Palette,
  Star
} from 'lucide-react';

const tierGlowStyles = {
  C: {
    border: 'border-emerald-500/80',
    shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
  },
  B: {
    border: 'border-blue-500/80',
    shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.25)]',
  },
  A: {
    border: 'border-red-600/80',
    shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.25)]',
  },
  S: {
    border: 'border-amber-400/90',
    shadow: 'shadow-[0_0_60px_rgba(245,158,11,0.35)]',
  },
};
import { sound } from '../../utils/soundEffects';

const tierBadgeStyles = {
  C: { 
    bg: 'bg-emerald-950 text-emerald-300 border-emerald-600', 
    label: 'TIER C',
    desc: 'COMÚN',
    color: 'text-emerald-400' 
  },
  B: { 
    bg: 'bg-blue-950 text-blue-300 border-blue-600', 
    label: 'TIER B',
    desc: 'RARA',
    color: 'text-blue-400' 
  },
  A: { 
    bg: 'bg-red-950 text-red-200 border-red-600', 
    label: 'TIER A',
    desc: 'ÉPICA',
    color: 'text-red-400' 
  },
  S: { 
    bg: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black border-amber-300 font-black', 
    label: 'TIER S',
    desc: 'LEGENDARIA',
    color: 'text-amber-400' 
  },
};

const THEME_SECTIONS = [
  {
    id: 'clasicos',
    categoryName: 'Clásicos Urbanos 90s',
    title: 'CLÁSICOS URBANOS 90s',
    subtitle: 'Hot-Hatches, Tracción Delantera & Leyendas de los 90s',
    badge: '90s STREET DIVISION',
    color: 'from-emerald-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-emerald-700/60',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-600/70',
  },
  {
    id: 'jdm',
    categoryName: 'JDM Legends (Initial D)',
    title: 'JDM LEGENDS (INITIAL D)',
    subtitle: 'Touge Drift Division & Alta Gama Japonesa 90s',
    badge: 'TOUGE RACING DIVISION',
    color: 'from-amber-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-amber-600/60',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-950 text-amber-300 border-amber-600/70',
  },
  {
    id: 'wrc',
    categoryName: 'WRC Championship',
    title: 'WRC CHAMPIONSHIP',
    subtitle: 'Homologación de Rally & Tracción Total Turbo',
    badge: 'WORLD RALLY ARCHIVE',
    color: 'from-blue-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-blue-700/60',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-600/70',
  },
  {
    id: 'porsche',
    categoryName: 'Porsche GT Team',
    title: 'PORSCHE GT TEAM',
    subtitle: 'Ingeniería Motorsport Stuttgart & Boxer Turbo',
    badge: 'STUTTGART MOTORSPORT',
    color: 'from-red-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-red-600/60',
    accentText: 'text-red-400',
    badgeBg: 'bg-red-950 text-red-300 border-red-600/70',
  },
  {
    id: 'ferrari',
    categoryName: 'Scuderia Ferrari',
    title: 'SCUDERIA FERRARI',
    subtitle: 'Il Cavallino Rampante, F40 Biturbo & Pura Sangre V12',
    badge: 'MARANELLO CORSE',
    color: 'from-red-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-red-700/60',
    accentText: 'text-red-400',
    badgeBg: 'bg-red-950 text-red-300 border-red-600/70',
  },
  {
    id: 'f1',
    categoryName: 'Fórmula 1 Histórica',
    title: 'FÓRMULA 1 HISTÓRICA',
    subtitle: 'Monoplazas Legendarios, Turbo Era & Reyes de la Pista',
    badge: 'GRAND PRIX ARCHIVE',
    color: 'from-blue-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-blue-700/60',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-600/70',
  },
  {
    id: 'spoon',
    categoryName: 'Spoon Team Racing',
    title: 'SPOON TEAM RACING',
    subtitle: 'Preparación de Circuito Type-R Monocasco VTEC',
    badge: 'TYPE-R DIVISION',
    color: 'from-yellow-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-yellow-600/60',
    accentText: 'text-yellow-400',
    badgeBg: 'bg-yellow-950 text-yellow-300 border-yellow-600/70',
  },
  {
    id: 'ff',
    categoryName: 'Fast & Furious Heroes',
    title: 'FAST & FURIOUS HEROES',
    subtitle: 'Íconos del Cuarto de Milla & Street Kings',
    badge: '1/4 MILE LEGENDS',
    color: 'from-amber-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-amber-700/60',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-950 text-amber-300 border-amber-600/70',
  },
  {
    id: 'enfierrados',
    categoryName: 'Enfierrados & 1/4 Milla',
    title: 'ENFIERRADOS & 1/4 MILLA',
    subtitle: 'Picadas del Gálvez, Pista Nacional & Armado Turbo',
    badge: 'DRAG & TURBO POWER',
    color: 'from-red-950/40 via-zinc-950 to-zinc-950',
    borderColor: 'border-red-700/60',
    accentText: 'text-red-400',
    badgeBg: 'bg-red-950 text-red-300 border-red-600/70',
  },
];

export default function TeamFleetModal() {
  const { 
    isTeamModalOpen, 
    closeTeamModal, 
    catalog, 
    pastedVehicles, 
    inventory, 
    pilot, 
    unopenedCrates,
    openCrateModal,
    enterGarageAlbum
  } = useGarageStore();

  // Primary Status View: 'UNLOCKED' (Default: only unlocked in possession) | 'ALL' (Full album showcase) | 'LOCKED' (Missing)
  const [viewMode, setViewMode] = useState('UNLOCKED');
  
  // Automatic Quality / Tier Filter: 'ALL' | 'S' | 'A' | 'B' | 'C'
  const [tierFilter, setTierFilter] = useState('ALL');

  // Selected Vehicle for Closeup Spotlight Modal
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('speedclub_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (vehicleId) => {
    sound.playSelect();
    setFavorites(prev => {
      const next = prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId];
      try {
        localStorage.setItem('speedclub_favorites', JSON.stringify(next));
      } catch (err) {
        console.error('Error saving favorites:', err);
      }
      return next;
    });
  };

  // Close spotlight on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedVehicle) {
        setSelectedVehicle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVehicle]);

  // Compute unlock & copy counts for all 28 vehicles
  const fleetData = useMemo(() => {
    const pastedSet = new Set(pastedVehicles.map(v => v.id));
    const invMap = new Map();
    inventory.forEach(item => {
      invMap.set(item.id, (invMap.get(item.id) || 0) + (item.count || 1));
    });

    let totalUnlocked = 0;
    let totalCopies = 0;

    const vehicles = catalog.map(v => {
      const isPasted = pastedSet.has(v.id);
      const inventoryCount = invMap.get(v.id) || 0;
      const totalCount = (isPasted ? 1 : 0) + inventoryCount;
      const isUnlocked = totalCount > 0;
      const isFavorite = favorites.includes(v.id);

      if (isUnlocked) totalUnlocked++;
      totalCopies += totalCount;

      return {
        ...v,
        isPasted,
        inventoryCount,
        totalCount,
        isUnlocked,
        isFavorite,
      };
    });

    const totalFavorites = vehicles.filter(v => v.isFavorite).length;

    return {
      vehicles,
      totalUnlocked,
      totalLocked: catalog.length - totalUnlocked,
      totalCopies,
      totalFavorites,
    };
  }, [catalog, pastedVehicles, inventory, favorites]);

  // Filtered favorite vehicles matching active quality tier
  const favoriteVehicles = useMemo(() => {
    return fleetData.vehicles.filter(v => {
      if (!v.isFavorite) return false;
      if (tierFilter !== 'ALL' && v.tier !== tierFilter) return false;
      return true;
    });
  }, [fleetData.vehicles, tierFilter]);

  // Compute tier counts dynamically for the active view mode
  const tierCounts = useMemo(() => {
    const baseList = fleetData.vehicles.filter(v => {
      if (viewMode === 'FAVORITES') return v.isFavorite;
      if (viewMode === 'UNLOCKED') return v.isUnlocked;
      if (viewMode === 'LOCKED') return !v.isUnlocked;
      return true;
    });

    return {
      ALL: baseList.length,
      S: baseList.filter(v => v.tier === 'S').length,
      A: baseList.filter(v => v.tier === 'A').length,
      B: baseList.filter(v => v.tier === 'B').length,
      C: baseList.filter(v => v.tier === 'C').length,
    };
  }, [fleetData.vehicles, viewMode]);

  if (!isTeamModalOpen) return null;

  const unlockedPct = Math.round((fleetData.totalUnlocked / catalog.length) * 100);

  const handleOpenContainers = () => {
    sound.playSelect();
    closeTeamModal();
    openCrateModal();
  };

  const handleGoToAlbum = () => {
    sound.playSelect();
    closeTeamModal();
    enterGarageAlbum();
  };

  const scrollToTheme = (themeId) => {
    sound.playSelect();
    const elem = document.getElementById(`theme-section-${themeId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden select-none">
      {/* Full Backdrop Racetrack Fleet Wallpaper */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-20"
        style={{ backgroundImage: `url('/fondo_escuderia.webp'), url('/fondo_escuderia.jpg')` }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="relative w-full max-w-7xl h-[94vh] rounded-2xl bg-zinc-950 border-2 border-zinc-700/80 p-3 sm:p-5 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Racetrack Fleet Background with matte vignette */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30"
          style={{ backgroundImage: `url('/fondo_escuderia.webp'), url('/fondo_escuderia.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/75 to-zinc-950/90 pointer-events-none" />
        {/* Carbon fiber pattern background */}
        <div className="absolute inset-0 carbon-pattern opacity-35 pointer-events-none" />

        {/* ======================================================== */}
        {/* HEADER: TITLE, PILOT BADGE & SUMMARY TELEMETRY           */}
        {/* ======================================================== */}
        <div className="relative z-10 pb-3 border-b border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-600 via-zinc-900 to-black border border-red-500/60 shadow-md flex items-center justify-center text-white flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-racing text-lg sm:text-2xl text-white italic font-black uppercase tracking-wide leading-none">
                    MI ESCUDERÍA // <span className="text-amber-400">FLOTA DE FIGURITAS</span>
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300 font-bold">
                    {pilot.team}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-zinc-400 mt-0.5">
                  Visualiza todas las figuritas en tu poder separadas por temática y organizadas por calidad.
                </span>
              </div>
            </div>

            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playSelect();
                closeTeamModal();
              }}
              className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Telemetry Strip Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">DESBLOQUEADAS:</span>
              <span className="font-racing text-sm text-amber-300 font-bold italic">
                {fleetData.totalUnlocked} / {catalog.length} ({unlockedPct}%)
              </span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">EN ÁLBUM:</span>
              <span className="font-racing text-sm text-emerald-400 font-bold italic">
                {pastedVehicles.length} PEGADAS
              </span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">EN SOBRES:</span>
              <span className="font-racing text-sm text-zinc-200 font-bold italic">
                {inventory.reduce((acc, i) => acc + (i.count || 1), 0)} REPETIDAS
              </span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">COPIAS TOTALES:</span>
              <span className="font-racing text-sm text-amber-400 font-bold italic">
                {fleetData.totalCopies} FIGURITAS
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CONTROLS: VIEW MODE TABS + AUTOMATIC QUALITY FILTER      */}
          {/* ======================================================== */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-1">
            
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-racing italic overflow-x-auto scrollbar-none">
              <button
                onClick={() => { sound.playSelect(); setViewMode('UNLOCKED'); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'UNLOCKED'
                    ? 'bg-emerald-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>FIGURITAS DESBLOQUEADAS ({fleetData.totalUnlocked})</span>
              </button>

              <button
                onClick={() => { sound.playSelect(); setViewMode('FAVORITES'); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'FAVORITES'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-md'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${viewMode === 'FAVORITES' ? 'fill-black text-black' : 'fill-amber-400 text-amber-400'}`} />
                <span>FAVORITOS ({fleetData.totalFavorites})</span>
              </button>

              <button
                onClick={() => { sound.playSelect(); setViewMode('ALL'); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'ALL'
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>COLECCIÓN COMPLETA ({catalog.length})</span>
              </button>

              <button
                onClick={() => { sound.playSelect(); setViewMode('LOCKED'); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'LOCKED'
                    ? 'bg-zinc-800 text-amber-300 font-black shadow border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>POR DESBLOQUEAR ({fleetData.totalLocked})</span>
              </button>
            </div>

            {/* Automatic Quality / Tier Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-[11px] font-mono">
              <span className="text-zinc-500 font-bold uppercase text-[10px] mr-1 hidden sm:inline flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" />
                CALIDAD:
              </span>
              
              <button
                onClick={() => { sound.playSelect(); setTierFilter('ALL'); }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-racing italic text-xs ${
                  tierFilter === 'ALL'
                    ? 'bg-zinc-200 text-black font-black shadow'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                TODAS ({tierCounts.ALL})
              </button>

              <button
                onClick={() => { sound.playSelect(); setTierFilter('S'); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-racing italic text-xs flex items-center gap-1 ${
                  tierFilter === 'S'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow'
                    : 'bg-amber-950/70 text-amber-300 border border-amber-600/60 hover:text-amber-200'
                }`}
              >
                <span>TIER S</span>
                <span className="text-[10px] font-mono font-bold bg-black/40 px-1 rounded">({tierCounts.S})</span>
              </button>

              <button
                onClick={() => { sound.playSelect(); setTierFilter('A'); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-racing italic text-xs flex items-center gap-1 ${
                  tierFilter === 'A'
                    ? 'bg-red-600 text-white font-black shadow'
                    : 'bg-red-950/70 text-red-300 border border-red-600/60 hover:text-red-200'
                }`}
              >
                <span>TIER A</span>
                <span className="text-[10px] font-mono font-bold bg-black/40 px-1 rounded">({tierCounts.A})</span>
              </button>

              <button
                onClick={() => { sound.playSelect(); setTierFilter('B'); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-racing italic text-xs flex items-center gap-1 ${
                  tierFilter === 'B'
                    ? 'bg-blue-600 text-white font-black shadow'
                    : 'bg-blue-950/70 text-blue-300 border border-blue-600/60 hover:text-blue-200'
                }`}
              >
                <span>TIER B</span>
                <span className="text-[10px] font-mono font-bold bg-black/40 px-1 rounded">({tierCounts.B})</span>
              </button>

              <button
                onClick={() => { sound.playSelect(); setTierFilter('C'); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-racing italic text-xs flex items-center gap-1 ${
                  tierFilter === 'C'
                    ? 'bg-emerald-600 text-white font-black shadow'
                    : 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/60 hover:text-emerald-200'
                }`}
              >
                <span>TIER C</span>
                <span className="text-[10px] font-mono font-bold bg-black/40 px-1 rounded">({tierCounts.C})</span>
              </button>
            </div>
          </div>

          {/* Quick Thematic Jump Navigation Strip */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono border-t border-zinc-800/60 pt-1.5">
            <span className="text-zinc-500 font-bold uppercase text-[9px] mr-1 hidden md:inline">IR A TEMÁTICA:</span>
            {fleetData.totalFavorites > 0 && (
              <button
                onClick={() => scrollToTheme('favorites')}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 font-bold"
              >
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>★ FAVORITOS ({fleetData.totalFavorites})</span>
              </button>
            )}
            {THEME_SECTIONS.map(theme => (
              <button
                key={theme.id}
                onClick={() => scrollToTheme(theme.id)}
                className="px-2 py-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {theme.title}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: SCROLLABLE SECTIONS SEPARATED BY THEME         */}
        {/* ======================================================== */}
        <div className="relative z-10 flex-1 overflow-y-auto px-1 sm:px-2 py-3 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-950">
          
          {/* ======================================================== */}
          {/* DEDICATED FAVORITES SECTION: PINNED OR FILTER ACTIVE     */}
          {/* ======================================================== */}
          {(viewMode === 'FAVORITES' || (fleetData.totalFavorites > 0 && viewMode !== 'LOCKED')) && (
            <section
              id="theme-section-favorites"
              className="rounded-2xl bg-zinc-950/90 border border-amber-500/40 p-3 sm:p-4 shadow-[0_0_30px_rgba(245,158,11,0.08)]"
            >
              {/* Thematic Header Plaque: Favorites VIP */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/50 via-zinc-950 to-zinc-950 border border-amber-500/60 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black/70 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-racing text-base sm:text-lg text-white italic font-black uppercase tracking-wider leading-none">
                        MIS FAVORITOS // <span className="text-amber-400">ESCUDERÍA DESTACADA</span>
                      </h3>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border bg-amber-950 text-amber-300 border-amber-600/70">
                        ★ PILOT SELECTION
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      Selección personal de vehículos destacados en tu flota de competición
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono self-end sm:self-auto">
                  <span className="text-zinc-400">FAVORITOS MOSTRADOS:</span>
                  <span className="font-racing text-sm text-amber-300 font-bold italic bg-black/60 px-2 py-0.5 rounded border border-amber-500/40">
                    {favoriteVehicles.length} / {fleetData.totalFavorites}
                  </span>
                </div>
              </div>

              {/* Empty state within favorites filter if quality tier matched 0 */}
              {favoriteVehicles.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center bg-zinc-900/40 rounded-xl border border-zinc-900">
                  <Star className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-zinc-400 font-mono text-xs italic">
                    {fleetData.totalFavorites === 0
                      ? 'No posees figuritas marcadas en favoritos aún.'
                      : `No hay figuritas favoritas con la calidad seleccionada (${tierFilter}).`}
                  </p>
                  {fleetData.totalFavorites === 0 && (
                    <button
                      onClick={() => { sound.playSelect(); setViewMode('UNLOCKED'); }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 text-xs font-racing italic"
                    >
                      Explorar Desbloqueadas
                    </button>
                  )}
                </div>
              ) : (
                /* Favorite Vehicles Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {favoriteVehicles.map(vehicle => {
                    const tierStyle = tierBadgeStyles[vehicle.tier] || tierBadgeStyles.C;
                    return (
                      <motion.div
                        key={`fav-${vehicle.id}`}
                        whileHover={{ scale: 1.02, y: -3 }}
                        onClick={() => {
                          sound.playSelect();
                          setSelectedVehicle(vehicle);
                        }}
                        title="Haz clic para ver en primer plano"
                        className="rounded-xl bg-zinc-900/95 border border-amber-500/40 hover:border-amber-400 p-3 flex flex-col justify-between shadow-metallic transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 carbon-pattern opacity-30 pointer-events-none" />

                        {/* Top Card Header */}
                        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-300 bg-black/70 px-2 py-0.5 rounded border border-zinc-800">
                              BAY #{String(vehicle.id).padStart(2, '0')}
                            </span>
                            <span className="p-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-sm" title="Favorito">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-racing text-[10px] italic border ${tierStyle.bg}`}>
                            {tierStyle.label} // {tierStyle.desc}
                          </span>
                        </div>

                        {/* Photo */}
                        <div className="relative z-10 w-full h-36 sm:h-40 rounded-lg overflow-hidden bg-black/80 border border-zinc-800 flex items-center justify-center my-1 group-hover:border-zinc-600 transition-colors">
                          <img
                            src={vehicle.image || vehicle.image_url}
                            alt={vehicle.name}
                            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-2 text-center">
                            <Car className="w-10 h-10 text-racing-red mb-1" />
                            <span className="text-xs font-racing italic">{vehicle.name}</span>
                          </div>

                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
                            {vehicle.isPasted && (
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-racing text-[9px] italic font-black shadow-md flex items-center gap-1 border border-emerald-400/50">
                                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                <span>PEGADA EN ÁLBUM</span>
                              </span>
                            )}
                            {vehicle.inventoryCount > 0 && (
                              <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-racing text-[9px] italic font-black shadow-md border border-amber-300">
                                +{vehicle.inventoryCount} EN SOBRES
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="relative z-10 flex flex-col text-left mt-2">
                          <h4 className="font-racing text-sm sm:text-base text-white italic font-black leading-tight group-hover:text-amber-300 transition-colors">
                            {vehicle.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                            {vehicle.category}
                          </span>
                        </div>

                        {/* Specs */}
                        <div className="relative z-10 pt-2 mt-2 border-t border-zinc-800 grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>{vehicle.hp} HP</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Gauge className="w-3 h-3 text-red-400" />
                            <span>{vehicle.topSpeed} KM/H</span>
                          </div>
                          {vehicle.color && (
                            <div className="col-span-2 flex items-center gap-1 text-zinc-400 text-[9px] truncate pt-0.5">
                              <Palette className="w-2.5 h-2.5 text-zinc-500" />
                              <span className="truncate">{vehicle.color}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Regular Thematic Sections (only shown if not in exclusive FAVORITES mode) */}
          {viewMode !== 'FAVORITES' && THEME_SECTIONS.map(theme => {
            // Filter vehicles for this specific theme
            const themeVehicles = fleetData.vehicles.filter(v => {
              if (v.category !== theme.categoryName) return false;
              if (viewMode === 'UNLOCKED' && !v.isUnlocked) return false;
              if (viewMode === 'LOCKED' && v.isUnlocked) return false;
              if (tierFilter !== 'ALL' && v.tier !== tierFilter) return false;
              return true;
            });

            // Count total unlocked in this theme regardless of tierFilter
            const themeAllUnlocked = fleetData.vehicles.filter(v => v.category === theme.categoryName && v.isUnlocked).length;
            const themeTotalSlots = fleetData.vehicles.filter(v => v.category === theme.categoryName).length;

            if (themeVehicles.length === 0 && viewMode === 'UNLOCKED') {
              // If user selected "Unlocked" and has 0 in this theme, don't show an empty clutter section
              return null;
            }

            return (
              <section 
                key={theme.id}
                id={`theme-section-${theme.id}`}
                className="rounded-2xl bg-zinc-950/80 border border-zinc-800/90 p-3 sm:p-4 shadow-xl"
              >
                {/* Thematic Header Plaque */}
                <div className={`p-3 rounded-xl bg-gradient-to-r ${theme.color} border ${theme.borderColor} mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black/60 border border-zinc-700 flex items-center justify-center text-amber-400 shadow">
                      <Car className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-racing text-base sm:text-lg text-white italic font-black uppercase tracking-wider leading-none">
                          {theme.title}
                        </h3>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badgeBg}`}>
                          {theme.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        {theme.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono self-end sm:self-auto">
                    <span className="text-zinc-400">DESBLOQUEADAS EN TEMÁTICA:</span>
                    <span className="font-racing text-sm text-amber-300 font-bold italic bg-black/60 px-2 py-0.5 rounded border border-zinc-800">
                      {themeAllUnlocked} / {themeTotalSlots}
                    </span>
                  </div>
                </div>

                {/* If filter matched nothing in this theme */}
                {themeVehicles.length === 0 ? (
                  <div className="py-6 text-center text-zinc-500 font-mono text-xs italic bg-zinc-900/40 rounded-xl border border-zinc-900">
                    No hay figuritas con los filtros seleccionados en esta temática.
                  </div>
                ) : (
                  /* Figurine Cards Grid: Spacious, Complete, and Fully Responsive */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {themeVehicles.map(vehicle => {
                      const tierStyle = tierBadgeStyles[vehicle.tier] || tierBadgeStyles.C;

                      if (vehicle.isUnlocked) {
                        // ====================================================
                        // TARJETA DESBLOQUEADA COMPLETA
                        // ====================================================
                        return (
                          <motion.div
                            key={vehicle.id}
                            whileHover={{ scale: 1.02, y: -3 }}
                            onClick={() => {
                              sound.playSelect();
                              setSelectedVehicle(vehicle);
                            }}
                            title="Haz clic para ver en primer plano"
                            className="rounded-xl bg-zinc-900/95 border border-zinc-700/80 hover:border-amber-500/80 p-3 flex flex-col justify-between shadow-metallic transition-all cursor-pointer group relative overflow-hidden"
                          >
                            {/* Subtle Carbon Pattern */}
                            <div className="absolute inset-0 carbon-pattern opacity-30 pointer-events-none" />

                            {/* Top Card Header: Bay # + Tier Badge + Favorite Star */}
                            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-300 bg-black/70 px-2 py-0.5 rounded border border-zinc-800">
                                  BAY #{String(vehicle.id).padStart(2, '0')}
                                </span>
                                {vehicle.isFavorite && (
                                  <span className="p-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-sm" title="Marcado como Favorito">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded font-racing text-[10px] italic border ${tierStyle.bg}`}>
                                {tierStyle.label} // {tierStyle.desc}
                              </span>
                            </div>

                            {/* Complete Vehicle Photo (Spacious & Clean) */}
                            <div className="relative z-10 w-full h-36 sm:h-40 rounded-lg overflow-hidden bg-black/80 border border-zinc-800 flex items-center justify-center my-1 group-hover:border-zinc-600 transition-colors">
                              <img
                                src={vehicle.image || vehicle.image_url}
                                alt={vehicle.name}
                                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-2 text-center">
                                <Car className="w-10 h-10 text-racing-red mb-1" />
                                <span className="text-xs font-racing italic">{vehicle.name}</span>
                              </div>

                              {/* Dynamic Possession Badges */}
                              <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
                                {vehicle.isPasted && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-racing text-[9px] italic font-black shadow-md flex items-center gap-1 border border-emerald-400/50">
                                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                    <span>PEGADA EN ÁLBUM</span>
                                  </span>
                                )}
                                {vehicle.inventoryCount > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-racing text-[9px] italic font-black shadow-md border border-amber-300">
                                    +{vehicle.inventoryCount} EN SOBRES
                                  </span>
                                )}
                              </div>


                            </div>

                            {/* Vehicle Title & Info */}
                            <div className="relative z-10 flex flex-col text-left mt-2">
                              <h4 className="font-racing text-sm sm:text-base text-white italic font-black leading-tight group-hover:text-amber-300 transition-colors">
                                {vehicle.name}
                              </h4>
                              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                {vehicle.category}
                              </span>
                            </div>

                            {/* Vehicle Technical Specs Strip */}
                            <div className="relative z-10 pt-2 mt-2 border-t border-zinc-800 grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-300">
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>{vehicle.hp} HP</span>
                              </div>
                              <div className="flex items-center gap-1.5 justify-end">
                                <Gauge className="w-3 h-3 text-red-400" />
                                <span>{vehicle.topSpeed} KM/H</span>
                              </div>
                              {vehicle.color && (
                                <div className="col-span-2 flex items-center gap-1 text-zinc-400 text-[9px] truncate pt-0.5">
                                  <Palette className="w-2.5 h-2.5 text-zinc-500" />
                                  <span className="truncate">{vehicle.color}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      } else {
                        // ====================================================
                        // TARJETA BLOQUEADA EN FORMATO OSCURO
                        // ====================================================
                        return (
                          <div
                            key={vehicle.id}
                            className="rounded-xl bg-zinc-950/90 border border-dashed border-zinc-800/80 p-3 flex flex-col justify-between opacity-65 hover:opacity-85 transition-opacity select-none relative overflow-hidden"
                          >
                            {/* Dark Card Header: Bay # + Muted Tier */}
                            <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                              <span className="font-bold text-zinc-600 bg-black/60 px-2 py-0.5 rounded border border-zinc-900">
                                BAY #{String(vehicle.id).padStart(2, '0')}
                              </span>
                              <span className="px-2 py-0.5 rounded font-racing text-[9px] italic border bg-zinc-900 text-zinc-600 border-zinc-800">
                                TIER {vehicle.tier} // BLOQUEADO
                              </span>
                            </div>

                            {/* Dark Format Silhouette with Lock Plaque */}
                            <div className="w-full h-36 sm:h-40 rounded-lg overflow-hidden bg-black/90 border border-zinc-900 flex flex-col items-center justify-center my-1 relative">
                              <img
                                src={vehicle.image || vehicle.image_url}
                                alt="Bloqueado"
                                className="w-full h-full object-cover filter grayscale contrast-125 brightness-[0.16] pointer-events-none"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              {/* Centered Lock Overlay */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/60">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-1.5 shadow">
                                  <Lock className="w-5 h-5 text-zinc-500" />
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                                  FIGURITA BLOQUEADA
                                </span>
                                <span className="text-[8px] font-mono text-zinc-600 mt-0.5">
                                  Abre containers para desbloquear
                                </span>
                              </div>
                            </div>

                            {/* Muted Vehicle Info */}
                            <div className="flex flex-col text-left mt-2">
                              <span className="font-racing text-sm text-zinc-500 italic font-bold leading-tight">
                                {vehicle.name}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-600 mt-0.5">
                                {vehicle.category}
                              </span>
                            </div>

                            {/* Bottom locked note */}
                            <div className="pt-2 mt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono text-zinc-600">
                              <span>SIN COPIAS EN PODER</span>
                              <Lock className="w-3 h-3 text-zinc-700" />
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </section>
            );
          })}

          {/* If the user has 0 unlocked in entire fleet */}
          {fleetData.totalUnlocked === 0 && viewMode === 'UNLOCKED' && (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mb-3">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="font-racing text-lg text-white italic font-black uppercase">
                AÚN NO TIENES FIGURITAS DESBLOQUEADAS
              </h3>
              <p className="text-xs font-mono text-zinc-400 max-w-md mt-1 mb-4">
                Abre sobres containers para conseguir tus primeros vehículos y comenzar a llenar tu escudería.
              </p>
              <button
                onClick={handleOpenContainers}
                className="py-2.5 px-6 rounded-xl btn-racing-red text-white font-racing text-xs italic font-black uppercase cursor-pointer"
              >
                ABRIR SOBRES AHORA
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER ACTIONS                                           */}
        {/* ======================================================== */}
        <div className="relative z-10 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-racing italic">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>
              Mostrando <strong className="text-white">{tierCounts[tierFilter]}</strong> figuritas con los filtros actuales.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={handleOpenContainers}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl btn-metallic text-amber-300 font-racing text-xs italic font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>ABRIR SOBRES CONTAINERS ({unopenedCrates})</span>
            </button>

            <button
              onMouseEnter={() => sound.playHover()}
              onClick={handleGoToAlbum}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl btn-racing-red text-white font-racing text-xs italic font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>IR AL ÁLBUM</span>
            </button>
          </div>
        </div>

      </motion.div>

      {/* ======================================================== */}
      {/* SPOTLIGHT / PRIMER PLANO MODAL FOR SELECTED FIGURITA     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVehicle(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl bg-zinc-950 rounded-2xl p-4 sm:p-6 border-2 ${
                tierGlowStyles[selectedVehicle.tier]?.border || 'border-zinc-700'
              } ${
                tierGlowStyles[selectedVehicle.tier]?.shadow || 'shadow-2xl'
              } flex flex-col gap-4 overflow-hidden`}
            >
              {/* Carbon pattern background in spotlight */}
              <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none" />

              {/* Spotlight Header */}
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs font-mono text-zinc-300 bg-black/80 px-2.5 py-1 rounded-lg border border-zinc-700 shadow-sm">
                    BAY #{String(selectedVehicle.id).padStart(2, '0')}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg font-racing text-xs italic border shadow-sm ${
                      tierBadgeStyles[selectedVehicle.tier]?.bg || tierBadgeStyles.C.bg
                    }`}
                  >
                    {tierBadgeStyles[selectedVehicle.tier]?.label || 'TIER C'} // {tierBadgeStyles[selectedVehicle.tier]?.desc || 'COMÚN'}
                  </span>
                </div>

                <button
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    sound.playSelect();
                    setSelectedVehicle(null);
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Cerrar vista en primer plano"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Vehicle Image in High Resolution Display with Ambient Glow */}
              <div className="relative z-10 w-full h-60 sm:h-80 rounded-xl overflow-hidden bg-black/95 border border-zinc-800 flex items-center justify-center shadow-inner group/spotlight">
                {/* Ambient blur backdrop */}
                <img
                  src={selectedVehicle.image || selectedVehicle.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 pointer-events-none scale-110"
                />

                {/* High quality vehicle display */}
                <img
                  src={selectedVehicle.image || selectedVehicle.image_url}
                  alt={selectedVehicle.name}
                  className="relative z-10 max-h-full max-w-full object-contain p-2 rounded-lg transition-transform duration-500 group-hover/spotlight:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-4 text-center">
                  <Car className="w-12 h-12 text-racing-red mb-2" />
                  <span className="text-sm font-racing italic">{selectedVehicle.name}</span>
                </div>

                {/* Dynamic Possession Badges */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none z-20">
                  {selectedVehicle.isPasted && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-racing text-[10px] italic font-black shadow-lg flex items-center gap-1.5 border border-emerald-400/50">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>PEGADA EN ÁLBUM</span>
                    </span>
                  )}
                  {selectedVehicle.inventoryCount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-racing text-[10px] italic font-black shadow-lg border border-amber-300">
                      +{selectedVehicle.inventoryCount} EN SOBRES
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle Title & Temática */}
              <div className="relative z-10 flex flex-col text-left">
                <h3 className="font-racing text-xl sm:text-2xl text-white italic font-black leading-tight">
                  {selectedVehicle.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-zinc-400">
                    Temática: <strong className="text-zinc-200">{selectedVehicle.category}</strong>
                  </span>
                </div>
              </div>

              {/* Technical Telemetry Specs */}
              <div className="relative z-10 grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] text-zinc-400">POTENCIA</span>
                  </div>
                  <span className="font-racing text-sm sm:text-base text-white font-bold italic">
                    {selectedVehicle.hp} HP
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-red-400 mb-0.5">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-[10px] text-zinc-400">VEL. MÁX</span>
                  </div>
                  <span className="font-racing text-sm sm:text-base text-white font-bold italic">
                    {selectedVehicle.topSpeed} KM/H
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-blue-400 mb-0.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span className="text-[10px] text-zinc-400">COLOR</span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-zinc-200 font-bold truncate max-w-full">
                    {selectedVehicle.color || 'Serie Motorsport'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Favoritos + Cerrar */}
              <div className="relative z-10 pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
                <button
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => toggleFavorite(selectedVehicle.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-racing italic font-bold uppercase transition-all cursor-pointer border ${
                    favorites.includes(selectedVehicle.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      favorites.includes(selectedVehicle.id)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-400'
                    }`}
                  />
                  <span>
                    {favorites.includes(selectedVehicle.id)
                      ? 'EN FAVORITOS'
                      : 'AGREGAR A FAVORITOS'}
                  </span>
                </button>

                <button
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    sound.playSelect();
                    setSelectedVehicle(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-racing italic font-bold uppercase cursor-pointer transition-colors"
                >
                  CERRAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
