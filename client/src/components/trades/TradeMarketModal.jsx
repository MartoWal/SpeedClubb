import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  X, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCw,
  Trophy,
  Filter,
  Check,
  UserCheck
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useGarageStore } from '../../store/useGarageStore';

const CATEGORIES = [
  'TODAS',
  'Clásicos Urbanos 90s',
  'JDM Legends (Initial D)',
  'WRC Championship',
  'Porsche GT Team',
  'Scuderia Ferrari',
  'Fórmula 1 Histórica',
  'Spoon Team Racing',
  'Fast & Furious Heroes',
  'Enfierrados & 1/4 Milla'
];

const TIER_COLORS = {
  C: { bg: 'bg-zinc-800 text-zinc-300 border-zinc-600', label: 'COMÚN' },
  B: { bg: 'bg-blue-900/90 text-blue-200 border-blue-600', label: 'RARO' },
  A: { bg: 'bg-purple-900/90 text-purple-200 border-purple-600', label: 'ÉPICO' },
  S: { bg: 'bg-amber-900/90 text-amber-200 border-amber-500', label: 'LEGENDARIO' },
};

export default function TradeMarketModal() {
  const {
    isTradeModalOpen,
    closeTradeModal,
    tradeMarketStatus,
    activeTrades,
    myTrades,
    eligibleVehicles,
    isLoadingTrades,
    tradeSuccessModal,
    dismissTradeSuccessModal,
    createTrade,
    acceptTrade,
    cancelTrade,
    fetchActiveTrades,
    fetchTradeStatus,
    fetchEligibleVehicles,
    fetchMyTrades,
    currentUser,
    pilot,
    enterGarageAlbum
  } = useGarageStore();

  const [activeTab, setActiveTab] = useState('MARKET'); // 'MARKET' | 'MY_TRADES' | 'HISTORY'
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [onlyCanAccept, setOnlyCanAccept] = useState(false);

  // New Trade Creation form state
  const [selectedToGive, setSelectedToGive] = useState(null);
  const [selectedToRequest, setSelectedToRequest] = useState(null);
  const [createSearch, setCreateSearch] = useState('');
  const [createCategory, setCreateCategory] = useState('TODAS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Pending Trade to confirm
  const [tradeToConfirm, setTradeToConfirm] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);

  // Auto-refresh when opening or switching filters
  useEffect(() => {
    if (isTradeModalOpen) {
      fetchActiveTrades({
        category: selectedCategory,
        search: searchQuery,
        onlyCanAccept: onlyCanAccept
      });
    }
  }, [isTradeModalOpen, selectedCategory, searchQuery, onlyCanAccept]);

  if (!isTradeModalOpen) return null;

  const currentUserId = currentUser?.id || pilot?.id || 'pilot-1';
  const canCreate = tradeMarketStatus?.can_create_trade ?? true;
  const tradesToday = tradeMarketStatus?.trades_created_in_window ?? 0;
  const activeCount = tradeMarketStatus?.active_trades_count ?? 0;
  const duplicatesList = eligibleVehicles?.duplicates_to_give || [];
  const missingList = eligibleVehicles?.missing_to_request || [];

  // Filter missing vehicles for trade creation
  const filteredMissing = missingList.filter((v) => {
    const matchCat = createCategory === 'TODAS' || v.category === createCategory;
    const matchSearch = !createSearch || v.name.toLowerCase().includes(createSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenCreate = () => {
    sound.playSelect();
    if (!canCreate) {
      alert(tradeMarketStatus?.message || "Has alcanzado el límite de permutas disponibles.");
      return;
    }
    setSelectedToGive(null);
    setSelectedToRequest(null);
    setFormError(null);
    setIsCreatingTrade(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedToGive || !selectedToRequest) {
      setFormError("Debes seleccionar una figurita repetida para entregar y una figurita faltante para solicitar.");
      return;
    }
    if (selectedToGive.id === selectedToRequest.id) {
      setFormError("No puedes solicitar el mismo vehículo que estás entregando.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    const res = await createTrade(selectedToGive.id, selectedToRequest.id);
    setIsSubmitting(false);

    if (res.success) {
      setIsCreatingTrade(false);
      setSelectedToGive(null);
      setSelectedToRequest(null);
      setActiveTab('MY_TRADES');
    } else {
      setFormError(res.message);
    }
  };

  const handleExecuteTrade = async () => {
    if (!tradeToConfirm) return;
    setIsAccepting(true);
    const res = await acceptTrade(tradeToConfirm.trade_id);
    setIsAccepting(false);
    setTradeToConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 overflow-hidden select-none">
      {/* ============================================================ */}
      {/* THEMED ATMOSPHERIC BACKGROUND (HIGH FIDELITY & RESPONSIVE)   */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.img
          src="/assets/backgrounds/fondo_intercambios.jpg"
          alt="Fondo Intercambios Paddock"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.06] saturate-[1.12]"
        />
        {/* Soft, Light Shading & Vignette matching Album Themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* Main Container Window */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-6xl h-[94vh] max-h-[880px] bg-zinc-950/85 backdrop-blur-xl border-2 border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Thematic Background Underlay inside modal for depth (matching ThemePageSpread) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
          <img
            src="/assets/backgrounds/fondo_intercambios.jpg"
            alt="Interior Ambiance"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.08] saturate-[1.10] scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/80 to-zinc-950/95" />
          <div className="absolute inset-0 carbon-pattern opacity-15" />
        </div>

        {/* Top showroom banner strip in full color (Album Style) */}
        <div className="absolute top-0 inset-x-0 h-28 opacity-25 pointer-events-none overflow-hidden">
          <img
            src="/assets/backgrounds/fondo_intercambios.jpg"
            alt="Showroom Reflection"
            className="w-full h-full object-cover object-top filter brightness-[0.90]"
          />
        </div>

        {/* ========================================================= */}
        {/* TOP TELEMETRY HEADER                                      */}
        {/* ========================================================= */}
        <div className="relative z-10 px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center shadow-md">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-racing text-base sm:text-lg font-black uppercase italic tracking-wider text-white">
                  STAND DE INTERCAMBIO // PADDOCK EXCHANGE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold hidden sm:inline-block">
                  FIA 1-TO-1 SWAP
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                Mercado oficial de permutas. Intercambia figuritas repetidas por piezas faltantes de tu álbum.
              </p>
            </div>
          </div>

          {/* Telemetry Status Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Daily Quota Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 border border-zinc-800 text-[10px] font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-zinc-400">CUOTA 24H:</span>
              <span className={`font-bold ${tradesToday >= 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                {tradesToday}/3
              </span>
            </div>

            {/* Active Listings Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 border border-zinc-800 text-[10px] font-mono">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">ACTIVAS:</span>
              <span className={`font-bold ${activeCount >= 3 ? 'text-amber-400' : 'text-zinc-200'}`}>
                {activeCount}/3
              </span>
            </div>

            {/* Repetidas en Garaje */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 border border-zinc-800 text-[10px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-400">TUS REPETIDAS:</span>
              <span className="font-bold text-amber-300">
                {duplicatesList.length}
              </span>
            </div>

            {/* New Trade Button */}
            <button
              onClick={handleOpenCreate}
              disabled={!canCreate}
              className={`px-3 py-1.5 rounded-lg font-racing text-xs italic font-bold uppercase flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                canCreate
                  ? 'bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NUEVA PERMUTA</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={closeTradeModal}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* NAVIGATION TABS                                           */}
        {/* ========================================================= */}
        <div className="relative z-10 px-4 py-2 bg-zinc-900/75 border-b border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playSelect();
                setActiveTab('MARKET');
                setIsCreatingTrade(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-racing text-xs italic uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'MARKET' && !isCreatingTrade
                  ? 'bg-zinc-800 text-white font-black border border-zinc-600 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MERCADO GLOBAL ({activeTrades.length})
            </button>

            <button
              onClick={() => {
                sound.playSelect();
                setActiveTab('MY_TRADES');
                setIsCreatingTrade(false);
                fetchMyTrades();
              }}
              className={`px-3 py-1.5 rounded-lg font-racing text-xs italic uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'MY_TRADES' && !isCreatingTrade
                  ? 'bg-zinc-800 text-white font-black border border-zinc-600 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MIS PERMUTAS ({myTrades.active.length})
            </button>

            <button
              onClick={() => {
                sound.playSelect();
                setActiveTab('HISTORY');
                setIsCreatingTrade(false);
                fetchMyTrades();
              }}
              className={`px-3 py-1.5 rounded-lg font-racing text-xs italic uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'HISTORY' && !isCreatingTrade
                  ? 'bg-zinc-800 text-white font-black border border-zinc-600 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              HISTORIAL ({myTrades.completed.length})
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-400 hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>PADDOCK EXCHANGE EN VIVO</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY AREA                                            */}
        {/* ========================================================= */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* ========================================================= */}
          {/* VIEW: CREAR NUEVA PERMUTA (WIZARD 2 PASOS)                */}
          {/* ========================================================= */}
          {isCreatingTrade ? (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-racing text-sm text-white uppercase italic font-bold">
                    PUBLICAR NUEVA OFERTA DE PERMUTA
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Paso 1: Selecciona una de tus figuritas repetidas. Paso 2: Selecciona la figurita que te falta en el álbum.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingTrade(false)}
                  className="px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-800 rounded border border-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-700 rounded-lg text-red-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* TWO SELECTION COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* STEP 1: FIGURITAS REPETIDAS (A ENTREGAR) */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                    <span className="font-racing text-xs text-amber-300 uppercase italic font-bold flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] flex items-center justify-center">1</span>
                      TUS REPETIDAS A ENTREGAR
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {duplicatesList.length} DISPONIBLES
                    </span>
                  </div>

                  {duplicatesList.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs font-mono flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-zinc-600" />
                      <span>No posees figuritas repetidas en tu garaje actualmente.</span>
                      <span className="text-[10px] text-zinc-600">Abre contenedores en el Paddock para obtener más piezas.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
                      {duplicatesList.map((item) => {
                        const isSelected = selectedToGive?.id === item.id;
                        const tierCfg = TIER_COLORS[item.tier || item.rarity_tier] || TIER_COLORS.C;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              sound.playSelect();
                              setSelectedToGive(item);
                            }}
                            className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center text-center relative group ${
                              isSelected
                                ? 'bg-amber-950/70 border-amber-500 shadow-md ring-2 ring-amber-500/50'
                                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            <div className="w-full h-20 rounded bg-zinc-900 overflow-hidden relative mb-1.5 border border-zinc-800">
                              <img
                                src={item.image || item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => { e.target.src = "/assets/vehicles/Figuritas-clasicos-90s/Ford-falcon-sprint-C90s.jpg"; }}
                              />
                              <span className={`absolute top-1 left-1 px-1 py-0.2 rounded text-[7.5px] font-racing font-bold ${tierCfg.bg}`}>
                                TIER {item.tier || item.rarity_tier}
                              </span>
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-amber-300 font-mono text-[8px] font-bold">
                                x{item.unpasted_count}
                              </span>
                            </div>

                            <span className="font-racing text-[10.5px] text-zinc-200 uppercase italic font-bold leading-tight line-clamp-2">
                              {item.name}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-400 truncate mt-0.5 max-w-full">
                              {item.category}
                            </span>

                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* STEP 2: FIGURITAS FALTANTES (A RECIBIR) */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                    <span className="font-racing text-xs text-red-400 uppercase italic font-bold flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-[10px] flex items-center justify-center">2</span>
                      FIGURITA QUE DESEAS RECIBIR
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {filteredMissing.length} FALTANTES
                    </span>
                  </div>

                  {/* Filters for Missing */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2.5" />
                      <input
                        type="text"
                        value={createSearch}
                        onChange={(e) => setCreateSearch(e.target.value)}
                        placeholder="Buscar por auto..."
                        className="w-full pl-7 pr-2 py-1 text-xs rounded bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-red-500 outline-none"
                      />
                    </div>
                    <select
                      value={createCategory}
                      onChange={(e) => setCreateCategory(e.target.value)}
                      className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 rounded px-2 py-1 font-mono focus:border-red-500 outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {filteredMissing.map((v) => {
                      const isSelected = selectedToRequest?.id === v.id;
                      const tierCfg = TIER_COLORS[v.tier || v.rarity_tier] || TIER_COLORS.C;
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            sound.playSelect();
                            setSelectedToRequest(v);
                          }}
                          className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center text-center relative group ${
                            isSelected
                              ? 'bg-red-950/70 border-red-500 shadow-md ring-2 ring-red-500/50'
                              : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <div className="w-full h-20 rounded bg-zinc-900 overflow-hidden relative mb-1.5 border border-zinc-800">
                            <img
                              src={v.image || v.image_url}
                              alt={v.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => { e.target.src = "/assets/vehicles/Figuritas_ferrari/ferrari-296-gtb.webp"; }}
                            />
                            <span className={`absolute top-1 left-1 px-1 py-0.2 rounded text-[7.5px] font-racing font-bold ${tierCfg.bg}`}>
                              TIER {v.tier || v.rarity_tier}
                            </span>
                          </div>

                          <span className="font-racing text-[10.5px] text-zinc-200 uppercase italic font-bold leading-tight line-clamp-2">
                            {v.name}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-400 truncate mt-0.5 max-w-full">
                            {v.category}
                          </span>

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SUMMARY & SUBMIT BUTTON */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono">
                    <span className="text-zinc-400">ENTREGAS: </span>
                    <span className="font-bold text-amber-300">
                      {selectedToGive ? selectedToGive.name : '(Ninguna seleccionada)'}
                    </span>
                  </div>
                  <ArrowLeftRight className="w-4 h-4 text-zinc-500 hidden sm:inline-block" />
                  <div className="text-xs font-mono">
                    <span className="text-zinc-400">RECIBES: </span>
                    <span className="font-bold text-red-400">
                      {selectedToRequest ? selectedToRequest.name : '(Ninguna seleccionada)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmCreate}
                  disabled={!selectedToGive || !selectedToRequest || isSubmitting}
                  className={`px-5 py-2 rounded-lg font-racing text-xs italic font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    selectedToGive && selectedToRequest && !isSubmitting
                      ? 'bg-red-700 hover:bg-red-600 border border-red-500 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>{isSubmitting ? 'PUBLICANDO EN PADDOCK...' : 'PUBLICAR PERMUTA OFICIAL'}</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'MARKET' ? (
            /* ========================================================= */
            /* VIEW: MERCADO GLOBAL DE PERMUTAS                          */
            /* ========================================================= */
            <div className="flex flex-col gap-3">
              {/* Filter Toolbar */}
              <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por auto o piloto..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-red-600 outline-none"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 font-mono focus:border-red-600 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 cursor-pointer hover:border-zinc-700 select-none">
                    <input
                      type="checkbox"
                      checked={onlyCanAccept}
                      onChange={(e) => setOnlyCanAccept(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>Solo las que puedo intercambiar</span>
                  </label>

                  <button
                    onClick={() => fetchActiveTrades({ category: selectedCategory, search: searchQuery, onlyCanAccept })}
                    className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Actualizar listado"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trade Cards Grid */}
              {isLoadingTrades ? (
                <div className="py-20 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                  <span>Sincronizando mercado oficial con SQLite...</span>
                </div>
              ) : activeTrades.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                  <ArrowLeftRight className="w-8 h-8 text-zinc-600" />
                  <span className="text-zinc-300 font-bold">No hay permutas disponibles con estos filtros.</span>
                  <span className="text-[11px] text-zinc-500">Sé el primero en levantar una oferta con el botón "+ NUEVA PERMUTA".</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeTrades.map((t) => {
                    const offerTierCfg = TIER_COLORS[t.offer_vehicle.rarity_tier] || TIER_COLORS.C;
                    const reqTierCfg = TIER_COLORS[t.request_vehicle.rarity_tier] || TIER_COLORS.C;

                    return (
                      <div
                        key={t.trade_id}
                        className={`rounded-xl border p-3 flex flex-col justify-between transition-all relative overflow-hidden ${
                          t.is_own_trade
                            ? 'bg-zinc-950/90 border-blue-600/70'
                            : t.can_accept
                            ? 'bg-zinc-950/90 border-emerald-600/80 hover:border-emerald-500 shadow-lg'
                            : 'bg-zinc-950/70 border-zinc-800/80'
                        }`}
                      >
                        {/* Top Identification Header */}
                        <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-2 border-b border-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-bold text-zinc-200">
                              {t.offer_user_name}
                            </span>
                            {t.is_own_trade && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-700 font-bold">
                                TU PERMUTA
                              </span>
                            )}
                          </div>
                          <span className="text-zinc-400">
                            {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Visual 1-to-1 Exchange Spread */}
                        <div className="grid grid-cols-7 gap-2 items-center my-1">
                          
                          {/* Left: Ofrece */}
                          <div className="col-span-3 flex flex-col items-center text-center p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                              ENTREGA
                            </span>
                            <div className="w-full h-20 rounded bg-black/60 overflow-hidden relative mb-1 border border-zinc-800">
                              <img
                                src={t.offer_vehicle.image_url}
                                alt={t.offer_vehicle.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "/assets/vehicles/Figuritas-clasicos-90s/Ford-falcon-sprint-C90s.jpg"; }}
                              />
                              <span className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded text-[7px] font-racing font-bold ${offerTierCfg.bg}`}>
                                TIER {t.offer_vehicle.rarity_tier}
                              </span>
                            </div>
                            <span className="font-racing text-[10.5px] text-zinc-100 uppercase italic font-bold leading-tight line-clamp-1">
                              {t.offer_vehicle.name}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-400 truncate max-w-full">
                              {t.offer_vehicle.category}
                            </span>
                          </div>

                          {/* Center: Swap Connector */}
                          <div className="col-span-1 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-sm">
                              <ArrowLeftRight className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Right: Solicita */}
                          <div className="col-span-3 flex flex-col items-center text-center p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                              SOLICITA A CAMBIO
                            </span>
                            <div className="w-full h-20 rounded bg-black/60 overflow-hidden relative mb-1 border border-zinc-800">
                              <img
                                src={t.request_vehicle.image_url}
                                alt={t.request_vehicle.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "/assets/vehicles/Figuritas-Inital-D/RX7-Initial-D.jpg"; }}
                              />
                              <span className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded text-[7px] font-racing font-bold ${reqTierCfg.bg}`}>
                                TIER {t.request_vehicle.rarity_tier}
                              </span>
                            </div>
                            <span className="font-racing text-[10.5px] text-zinc-100 uppercase italic font-bold leading-tight line-clamp-1">
                              {t.request_vehicle.name}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-400 truncate max-w-full">
                              {t.request_vehicle.category}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Status & Action Strip */}
                        <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                          {t.is_own_trade ? (
                            <>
                              <span className="text-[10px] font-mono text-blue-300">
                                Oferta activa en el mercado global
                              </span>
                              <button
                                onClick={() => cancelTrade(t.trade_id)}
                                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-red-300 text-[11px] font-racing font-bold uppercase transition-colors cursor-pointer border border-zinc-700"
                              >
                                Cancelar Oferta
                              </button>
                            </>
                          ) : t.can_accept ? (
                            <>
                              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>TIENES ESTA PIEZA (x{t.viewer_has_duplicates})</span>
                              </div>
                              <button
                                onClick={() => {
                                  sound.playSelect();
                                  setTradeToConfirm(t);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center gap-1"
                              >
                                <span>INTERCAMBIAR AHORA</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] font-mono text-zinc-400">
                                Te falta esta pieza para realizar el cambio
                              </span>
                              <button
                                disabled
                                className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-racing font-bold uppercase cursor-not-allowed opacity-60"
                              >
                                NO DISPONIBLE
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'MY_TRADES' ? (
            /* ========================================================= */
            /* VIEW: MIS PERMUTAS ACTIVAS Y GESTIÓN                      */
            /* ========================================================= */
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-racing text-sm text-white uppercase italic font-bold">
                    TUS PERMUTAS ACTIVAS ({myTrades.active.length} / 3)
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Puedes cancelar cualquier oferta abierta y recuperar tu figurita inmediatamente en tu garaje.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreate}
                  disabled={!canCreate}
                  className={`px-3 py-1.5 rounded-lg font-racing text-xs italic font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    canCreate
                      ? 'bg-red-700 hover:bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>AGREGAR OTRA PERMUTA</span>
                </button>
              </div>

              {myTrades.active.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                  <Layers className="w-8 h-8 text-zinc-600" />
                  <span className="text-zinc-300 font-bold">No tienes ninguna permuta activa actualmente.</span>
                  <span className="text-[11px] text-zinc-500">Publica una con el botón de "AGREGAR OTRA PERMUTA".</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myTrades.active.map((t) => (
                    <div
                      key={t.trade_id}
                      className="rounded-xl border border-blue-600/60 bg-zinc-950 p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-2 border-b border-zinc-800">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          DISPONIBLE EN EL PADDOCK GLOBAL
                        </span>
                        <span className="text-zinc-400">
                          {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-2 items-center my-1">
                        <div className="col-span-3 flex flex-col items-center text-center p-2 rounded bg-zinc-900 border border-zinc-800">
                          <span className="text-[8px] font-mono text-zinc-400 uppercase mb-1">ENTREGAS</span>
                          <span className="font-racing text-xs text-white uppercase italic font-bold line-clamp-1">{t.offer_vehicle.name}</span>
                          <span className="text-[8px] font-mono text-zinc-400">{t.offer_vehicle.category}</span>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="col-span-3 flex flex-col items-center text-center p-2 rounded bg-zinc-900 border border-zinc-800">
                          <span className="text-[8px] font-mono text-zinc-400 uppercase mb-1">SOLICITAS</span>
                          <span className="font-racing text-xs text-white uppercase italic font-bold line-clamp-1">{t.request_vehicle.name}</span>
                          <span className="text-[8px] font-mono text-zinc-400">{t.request_vehicle.category}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400">
                          ID: {t.trade_id.slice(0, 8)}...
                        </span>
                        <button
                          onClick={() => cancelTrade(t.trade_id)}
                          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-red-300 text-[11px] font-racing font-bold uppercase transition-colors cursor-pointer border border-zinc-700"
                        >
                          Cancelar y recuperar carta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW: HISTORIAL DE INTERCAMBIOS COMPLETADOS               */
            /* ========================================================= */
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                <h3 className="font-racing text-sm text-white uppercase italic font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  HISTORIAL DE TRUEQUES COMPLETADOS CON ÉXITO
                </h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  Registro oficial de todas las permutas finalizadas en tu cuenta de piloto.
                </p>
              </div>

              {myTrades.completed.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                  <Trophy className="w-8 h-8 text-zinc-600" />
                  <span className="text-zinc-300 font-bold">Aún no has completado intercambios.</span>
                  <span className="text-[11px] text-zinc-500">Realiza un trueque en el Mercado Global para sumar piezas a tu garaje.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {myTrades.completed.map((t) => {
                    const iWasCreator = t.is_creator;
                    const gainedVehicle = iWasCreator ? t.request_vehicle : t.offer_vehicle;
                    const lostVehicle = iWasCreator ? t.offer_vehicle : t.request_vehicle;
                    const partnerName = iWasCreator ? (t.acceptor_user_name || "Otro Piloto") : t.offer_user_name;

                    return (
                      <div
                        key={t.trade_id}
                        className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px]">
                            ✓ COMPLETADO
                          </span>
                          <span className="text-zinc-400">Con piloto:</span>
                          <span className="font-bold text-white">{partnerName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Entregaste:</span>
                          <span className="text-amber-300 font-bold">{lostVehicle.name}</span>
                          <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-zinc-400">Obtuviste:</span>
                          <span className="text-emerald-400 font-bold">{gainedVehicle.name}</span>
                        </div>

                        <span className="text-[10px] text-zinc-400">
                          {t.matched_at ? new Date(t.matched_at).toLocaleString() : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* CONFIRMATION DIALOG BEFORE ACCEPTING                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {tradeToConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-zinc-950 border-2 border-zinc-700 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center text-zinc-100"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 mx-auto flex items-center justify-center text-emerald-400 shadow-md">
                <ArrowLeftRight className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-racing text-lg font-black uppercase italic text-white">
                  ¿CONFIRMAS EL INTERCAMBIO?
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Vas a entregar una copia repetida de tu garaje a cambio de una pieza nueva.
                </p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Entregas a {tradeToConfirm.offer_user_name}:</span>
                  <span className="font-bold text-amber-300">{tradeToConfirm.request_vehicle.name}</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-800 pt-1.5">
                  <span className="text-zinc-400">Recibes en tu garaje:</span>
                  <span className="font-bold text-emerald-400">{tradeToConfirm.offer_vehicle.name}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTradeToConfirm(null)}
                  disabled={isAccepting}
                  className="flex-1 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-racing text-xs italic uppercase font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteTrade}
                  disabled={isAccepting}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-racing text-xs italic font-black uppercase cursor-pointer transition-all shadow-md"
                >
                  {isAccepting ? 'PROCESANDO...' : 'SÍ, INTERCAMBIAR'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* CELEBRATION MODAL ON SUCCESSFUL TRADE                     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {tradeSuccessModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-950 border-2 border-emerald-600 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-transparent to-transparent pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <h2 className="font-racing text-xl sm:text-2xl font-black uppercase italic tracking-wider text-white">
                ¡INTERCAMBIO REALIZADO CON ÉXITO!
              </h2>

              <p className="text-xs font-mono text-zinc-300 mt-1 max-w-md">
                {tradeSuccessModal.message}
              </p>

              {/* Vehicle Obtained Card Preview */}
              {tradeSuccessModal.received_vehicle && (
                <div className="mt-4 p-3 bg-zinc-900 border border-emerald-600/70 rounded-2xl w-full max-w-xs flex flex-col items-center shadow-inner">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest mb-1.5">
                    NUEVA PIEZA AGREGADA A TU GARAJE
                  </span>
                  <div className="w-full h-32 rounded-xl bg-black overflow-hidden relative mb-2 border border-zinc-800">
                    <img
                      src={tradeSuccessModal.received_vehicle.image_url}
                      alt={tradeSuccessModal.received_vehicle.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/assets/vehicles/Figuritas_ferrari/ferrari-296-gtb.webp"; }}
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-racing font-bold bg-amber-500 text-black">
                      TIER {tradeSuccessModal.received_vehicle.rarity_tier}
                    </span>
                  </div>
                  <h4 className="font-racing text-sm text-white uppercase italic font-bold">
                    {tradeSuccessModal.received_vehicle.name}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {tradeSuccessModal.received_vehicle.category}
                  </span>
                </div>
              )}

              <div className="mt-5 w-full flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    dismissTradeSuccessModal();
                    closeTradeModal();
                    enterGarageAlbum();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer"
                >
                  IR AL ÁLBUM A PEGARLA →
                </button>
                <button
                  onClick={dismissTradeSuccessModal}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-racing text-xs italic font-bold uppercase transition-colors cursor-pointer"
                >
                  SEGUIR EN EL MERCADO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
