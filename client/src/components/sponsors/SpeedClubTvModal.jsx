import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGarageStore } from '../../store/useGarageStore';
import { sound } from '../../utils/soundEffects';
import { 
  Radio, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Tv, 
  Trophy, 
  Clock, 
  Coins, 
  Activity, 
  CheckCircle2, 
  Box 
} from 'lucide-react';

const FALLBACK_CHANNELS = [
  {
    id: 'ch-ferrari',
    channel_code: 'CH-01',
    name: 'Canal 01: Scuderia Ferrari',
    brand: 'FERRARI',
    title: 'Scuderia Ferrari // 499P Le Mans & F1 High Speed Attack',
    duration_seconds: 16,
    reward_credits: 100,
    video_url: '/assets/videos/Ferrari.mp4',
    thumbnail_url: '/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp',
    description: 'Sonido puro de competición, aceleración brutal en recta y telemetría oficial de Scuderia Ferrari.',
    badge: 'SCUDERIA CORSE'
  },
  {
    id: 'ch-porsche',
    channel_code: 'CH-02',
    name: 'Canal 02: Porsche Motorsport',
    brand: 'PORSCHE',
    title: 'Porsche Motorsport // 911 GT3 RS & 963 LMDh',
    duration_seconds: 15,
    reward_credits: 100,
    video_url: '/assets/videos/Porsche.mp4',
    thumbnail_url: '/assets/backgrounds/Fondos-Porsche-Team/Fondo-Porsche-Team-Oficial.jfif',
    description: 'Telemetría en directo desde el circuito de Nürburgring Nordschleife con el equipo oficial Porsche GT.',
    badge: 'LE MANS HYPERCAR'
  },
  {
    id: 'ch-wrc',
    channel_code: 'CH-03',
    name: 'Canal 03: WRC FIA Rally',
    brand: 'WRC RALLY',
    title: 'FIA WRC Championship // Tramos Alpinos & Gravilla',
    duration_seconds: 18,
    reward_credits: 100,
    video_url: '/assets/videos/WRC.mp4',
    thumbnail_url: '/assets/backgrounds/Fondos-WRC/fondo-WRC-cars.jpg',
    description: 'Saltos a 180 km/h y tracción integral en los tramos más desafiantes del Campeonato Mundial FIA.',
    badge: 'STAGE CAM'
  },
  {
    id: 'ch-jdm',
    channel_code: 'CH-04',
    name: 'Canal 04: Gran Turismo Touge',
    brand: 'JDM TOUGE',
    title: 'Gran Turismo JDM Touge // Batalla en Mount Akina',
    duration_seconds: 17,
    reward_credits: 100,
    video_url: '/assets/videos/JDM.mp4',
    thumbnail_url: '/assets/backgrounds/fondos-INITIAL-D/Fondo-Initial-D-Supra-RX7.jpg',
    description: 'Cultura japonesa de altas revoluciones, pasos de montaña del monte Akina y duelo Sprinter Trueno AE86 vs RX-7.',
    badge: 'MIDNIGHT RUN'
  }
];

export default function SpeedClubTvModal() {
  const {
    isTvModalOpen,
    closeTvModal,
    tvSponsorStatus,
    activeTvChannel,
    tvActiveSession,
    isTvPlaying,
    fetchSponsorStatus,
    setActiveTvChannel,
    startSponsorVideo,
    claimSponsorReward,
    racingCredits,
    buyContainer
  } = useGarageStore();

  const videoRef = useRef(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState(null);
  const [claimErrorMsg, setClaimErrorMsg] = useState(null);
  const [hasClaimedCurrentSession, setHasClaimedCurrentSession] = useState(false);
  const [cooldownCountdown, setCooldownCountdown] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [scanlinesActive, setScanlinesActive] = useState(false);

  // Sync channels from store or fallback
  const channels = useMemo(() => {
    if (tvSponsorStatus?.channels && tvSponsorStatus.channels.length > 0) {
      return tvSponsorStatus.channels;
    }
    return FALLBACK_CHANNELS;
  }, [tvSponsorStatus]);

  const currentChannel = useMemo(() => {
    if (activeTvChannel) return activeTvChannel;
    return channels[0] || FALLBACK_CHANNELS[0];
  }, [activeTvChannel, channels]);

  const channelDuration = currentChannel?.duration_seconds || 16;

  // Sync cooldown from server status
  useEffect(() => {
    if (tvSponsorStatus?.cooldown_remaining_seconds) {
      setCooldownCountdown(tvSponsorStatus.cooldown_remaining_seconds);
    }
  }, [tvSponsorStatus]);

  // Ticking countdown timer for cooldown
  useEffect(() => {
    if (cooldownCountdown <= 0) return;
    const interval = setInterval(() => {
      setCooldownCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          fetchSponsorStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownCountdown, fetchSponsorStatus]);

  // Listen to Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isTvModalOpen) {
        closeTvModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTvModalOpen, closeTvModal]);

  // Handle video playback timeupdate & auto-claim at end
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = Math.floor(videoRef.current.currentTime);
    setWatchProgress(current);

    if (
      videoRef.current.duration &&
      videoRef.current.currentTime >= videoRef.current.duration - 0.5 &&
      tvActiveSession &&
      !hasClaimedCurrentSession
    ) {
      handleAutoClaim();
    }
  };

  const handleVideoEnded = () => {
    useGarageStore.setState({ isTvPlaying: false });
    if (tvActiveSession && !hasClaimedCurrentSession) {
      handleAutoClaim();
    }
  };

  // Channel select
  const handleSelectChannel = (channel) => {
    sound.playHover();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setWatchProgress(0);
    setClaimSuccessMsg(null);
    setClaimErrorMsg(null);
    setHasClaimedCurrentSession(false);
    setActiveTvChannel(channel);
  };

  // Start Playing
  const handlePlayStream = async () => {
    sound.playSelect();
    setClaimSuccessMsg(null);
    setClaimErrorMsg(null);
    setHasClaimedCurrentSession(false);
    setWatchProgress(0);

    const res = await startSponsorVideo(currentChannel.id);
    if (!res.success) {
      setClaimErrorMsg(res.message);
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn('Auto-play blocked, user click needed:', err);
      });
    }
  };

  // Pause
  const handlePauseStream = () => {
    sound.playSelect();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    useGarageStore.setState({ isTvPlaying: false });
  };

  // Auto-claim reward on completion
  const handleAutoClaim = async () => {
    if (hasClaimedCurrentSession || !tvActiveSession?.session_id) return;
    setHasClaimedCurrentSession(true);
    setIsClaiming(true);

    const res = await claimSponsorReward(tvActiveSession.session_id);
    setIsClaiming(false);

    if (res.success) {
      sound.playReward();
      setClaimSuccessMsg("¡Felicidades, ganaste 100 créditos!");
      setWatchProgress(channelDuration);
    } else {
      setClaimErrorMsg(res.message);
    }
  };

  if (!isTvModalOpen) return null;

  const completedInWindow = tvSponsorStatus?.completed_in_window ?? 0;
  const remainingInWindow = tvSponsorStatus?.remaining_in_window ?? 3;
  const canWatch = tvSponsorStatus?.can_watch ?? (remainingInWindow > 0);
  const earnedInWindow = tvSponsorStatus?.earned_in_window ?? (completedInWindow * 100);
  const remainingSeconds = Math.max(0, channelDuration - watchProgress);
  const progressPercent = Math.min(100, Math.round((watchProgress / channelDuration) * 100));

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-6 overflow-y-auto animate-fade-in font-sans">
      
      {/* Full Backdrop SpeedClub TV Wallpaper */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-25"
        style={{ backgroundImage: `url('/fondo_speedclub_tv.webp'), url('/fondo_speedclub_tv.jpg')` }}
      />

      {/* Main Container (Classic Racing Dark Zinc with Red & Blue accents) */}
      <div className="relative w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[96vh]">
        
        {/* Subtle In-Modal Background Texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{ backgroundImage: `url('/fondo_speedclub_tv.webp'), url('/fondo_speedclub_tv.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/90 to-zinc-950 pointer-events-none" />
        <div className="absolute inset-0 carbon-pattern opacity-25 pointer-events-none" />
        
        {/* Top Control Bar / Paddock Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block border border-red-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-racing uppercase tracking-wider text-white">
                  SPEEDCLUB TV // SISTEMA OFICIAL DE TRANSMISIÓN
                </span>
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.2 rounded font-mono font-bold">
                  EN DIRECTO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block font-mono">
                TELEMETRÍA Y TRÁILERS OFICIALES DE COMPETICIÓN
              </p>
            </div>
          </div>

          {/* Quick Stats in Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/60 border border-zinc-700 rounded font-mono text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">BILLETERA:</span>
              <span className="text-white font-bold tracking-wider">{racingCredits.toLocaleString()} CR</span>
            </div>

            <button
              onClick={() => {
                sound.playSelect();
                closeTvModal();
              }}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded border border-zinc-700 transition-all font-racing text-xs flex items-center gap-1 cursor-pointer"
              title="Cerrar Transmisión"
            >
              <span className="hidden sm:inline">SALIR</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quota & Cooldown Warning Banner */}
        <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 uppercase text-[11px]">CUPO POR TANDA:</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => {
                const isClaimed = idx < completedInWindow;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      isClaimed
                        ? 'bg-blue-950/70 border-blue-600 text-blue-300'
                        : canWatch
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <span>{isClaimed ? '✓' : `0${idx + 1}`}</span>
                    <span>+100 CR</span>
                  </div>
                );
              })}
            </div>
            <span className="text-white font-bold ml-1">
              ({earnedInWindow}/300 CR)
            </span>
          </div>

          <div>
            {!canWatch || cooldownCountdown > 0 ? (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-700 text-red-200 px-2.5 py-0.5 rounded text-[11px] font-mono">
                <Clock className="w-3 h-3 text-red-400" />
                <span>COOLDOWN ACTIVO: PRÓXIMA TANDA EN {formatTime(cooldownCountdown)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>ENLACE DISPONIBLE // {remainingInWindow} DE 3 EMISIONES</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Seconds HUD Bar (Prominent at top) */}
        <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold uppercase">{currentChannel.brand || 'SCUDERIA'}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-200 font-racing truncate">{currentChannel.title}</span>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1 rounded border border-zinc-700">
            <span className="text-zinc-400">SEGUNDOS:</span>
            <span className="text-white font-bold">{watchProgress}s / {channelDuration}s</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">RESTAN:</span>
            <span className="text-amber-400 font-bold">{remainingSeconds}s</span>
          </div>
        </div>

        {/* Content Body: Left Main TV / Right Multi-TV Wall */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
          
          {/* Main Broadcast Screen (Col 8) */}
          <div className="lg:col-span-8 p-3 sm:p-5 flex flex-col bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800 overflow-y-auto">
            {/* TV Screen Chassis */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 shadow-md group">
              
              <video
                ref={videoRef}
                src={currentChannel.video_url}
                poster={currentChannel.thumbnail_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {/* CRT Scanline Overlay */}
              {scanlinesActive && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
                    backgroundSize: '100% 4px',
                  }}
                />
              )}

              {/* Play Overlay if paused */}
              {!isTvPlaying && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
                  <button
                    disabled={!canWatch && cooldownCountdown > 0}
                    onClick={handlePlayStream}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-racing uppercase italic tracking-wider text-sm transition-all shadow-md ${
                      !canWatch && cooldownCountdown > 0
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 cursor-pointer'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {!canWatch && cooldownCountdown > 0
                        ? 'COOLDOWN ACTIVO (ESPERA REACTIVACIÓN)'
                        : 'REPRODUCIR VIDEO COMPLETO (+100 CR)'}
                    </span>
                  </button>
                  <p className="mt-2 text-xs text-zinc-400 font-mono text-center max-w-md">
                    Mira los {channelDuration} segundos del video. Al finalizar recibirás automáticamente tus 100 créditos.
                  </p>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="mt-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              
              {/* Progress Bar */}
              <div className="space-y-1 mb-2.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">PROGRESO DEL VIDEO:</span>
                  <span className="font-bold text-white">{watchProgress}s / {channelDuration}s</span>
                </div>
                <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-700 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-blue-600 to-red-600"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isTvPlaying ? (
                    <button
                      onClick={handlePauseStream}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded border border-zinc-600 font-racing uppercase italic transition-all cursor-pointer"
                    >
                      PAUSAR
                    </button>
                  ) : (
                    <button
                      disabled={!canWatch && cooldownCountdown > 0}
                      onClick={handlePlayStream}
                      className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-xs text-white rounded border border-blue-600 font-racing uppercase italic transition-all disabled:opacity-50 cursor-pointer"
                    >
                      REANUDAR
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsMuted(!isMuted);
                    }}
                    className={`px-2.5 py-1 text-xs rounded border font-mono transition-all cursor-pointer ${
                      isMuted
                        ? 'bg-red-950/70 border-red-700 text-red-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isMuted ? 'SILENCIADO' : 'AUDIO'}
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setScanlinesActive(!scanlinesActive);
                    }}
                    className={`px-2.5 py-1 text-xs rounded border font-mono transition-all hidden sm:block cursor-pointer ${
                      scanlinesActive
                        ? 'bg-blue-950 border-blue-600 text-blue-200'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    CRT FX
                  </button>
                </div>

                {/* Status or Manual Claim button */}
                <div>
                  {hasClaimedCurrentSession ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 border border-emerald-600 rounded text-emerald-300 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>100 CR ACREDITADOS ✓</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-zinc-400 block">
                        {isTvPlaying
                          ? `ACREDITACIÓN AUTOMÁTICA EN ${remainingSeconds}s`
                          : 'REPRODUCE EL VIDEO COMPLETO PARA RECIBIR 100 CR'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exact Congratulatory Message */}
              {claimSuccessMsg && (
                <div className="mt-3 p-3 bg-zinc-950 border-2 border-red-600 rounded-lg text-white text-xs font-racing uppercase italic tracking-wider flex items-center justify-between gap-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold">{claimSuccessMsg}</span>
                  </div>
                  <button
                    onClick={() => buyContainer('standard')}
                    className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-[10px] font-racing not-italic uppercase cursor-pointer"
                  >
                    COMPRAR SOBRE (100 CR)
                  </button>
                </div>
              )}

              {claimErrorMsg && (
                <div className="mt-3 p-2.5 bg-red-950 border border-red-700 rounded text-red-200 text-xs font-mono flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{claimErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Channel Details */}
            <div className="mt-3 text-xs text-zinc-400 font-mono">
              <h3 className="text-white font-bold text-sm tracking-wide">{currentChannel.title}</h3>
              <p className="mt-1 leading-relaxed text-zinc-400">{currentChannel.description}</p>
            </div>
          </div>

          {/* Right TV Wall Grid (Col 4) */}
          <div className="lg:col-span-4 p-3 sm:p-5 flex flex-col bg-zinc-950 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <span className="text-xs font-racing uppercase tracking-wider text-zinc-200">
                PADDOCK TV WALL // CANALES
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                1 CANAL ACTIVO
              </span>
            </div>

            {/* List of Channels */}
            <div className="space-y-2.5 flex-1">
              {channels.map((ch) => {
                const isActive = currentChannel.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch)}
                    className={`relative p-2.5 rounded-lg border transition-all cursor-pointer group overflow-hidden ${
                      isActive
                        ? 'bg-zinc-900 border-red-600 shadow-sm'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini Preview Thumbnail */}
                      <div className="relative w-20 h-14 bg-black rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                        <img
                          src={ch.thumbnail_url}
                          alt={ch.brand}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isActive && isTvPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/90 text-amber-400 font-mono px-1 rounded border border-zinc-700">
                          +100 CR
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold font-racing uppercase italic ${
                            isActive ? 'text-red-500' : 'text-zinc-200'
                          }`}>
                            {ch.brand}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">
                            {ch.duration_seconds || 16}s
                          </span>
                        </div>
                        <p className="text-xs text-white truncate font-semibold mt-0.5">
                          {ch.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                          {ch.name}
                        </p>
                      </div>
                    </div>

                    {/* Active highlight line */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Information Card at bottom of TV wall */}
            <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-2 text-white font-bold mb-1">
                <Box className="w-3.5 h-3.5 text-red-500" />
                <span>REGLAS DE BONIFICACIÓN</span>
              </div>
              <ul className="text-zinc-400 text-[11px] space-y-1 list-disc list-inside">
                <li>+100 CR automáticos al finalizar el video completo.</li>
                <li>Máximo 3 transmisiones cada 2 horas (300 CR).</li>
                <li>Los créditos se guardan en tu cuenta FIA.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Telemetry */}
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-4">
            <span>TERMINAL ID: FIA-BROADCAST-NODE-01</span>
            <span className="hidden sm:inline">LATENCIA: 14ms (OK)</span>
          </div>
          <div className="text-zinc-400">
            SPEEDCLUB RACING TELEMETRY // ESTILO CLÁSICO
          </div>
        </div>

      </div>
    </div>
  );
}
