import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import { sound } from '../utils/soundEffects';
import { 
  Radio, 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Tv, 
  Trophy, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Box, 
  ShieldCheck, 
  Coins, 
  Activity, 
  Flame, 
  Gauge,
  CheckCircle2,
  X
} from 'lucide-react';

const FALLBACK_CHANNELS = [
  {
    id: 'ch-ferrari',
    channel_code: 'CH-01',
    sponsor_name: 'SCUDERIA FERRARI',
    title: 'Scuderia Ferrari // 499P Le Mans & F1 High Speed Attack',
    description: 'Sonido puro de competición, aceleración brutal en recta y telemetría oficial de Scuderia Ferrari.',
    duration_seconds: 16,
    reward_credits: 100,
    video_url: '/assets/videos/Ferrari.mp4',
    thumbnail_url: '/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp',
    accent_color: '#dc2626',
  },
  {
    id: 'ch-porsche',
    channel_code: 'CH-02',
    sponsor_name: 'PORSCHE MOTORSPORT',
    title: 'Porsche Motorsport // 911 GT3 RS & 963 LMDh',
    description: 'Vuelta récord onboard en Nürburgring Nordschleife con el equipo oficial Porsche GT.',
    duration_seconds: 15,
    reward_credits: 100,
    video_url: '/assets/videos/Porsche.mp4',
    thumbnail_url: '/assets/backgrounds/Fondos-Porsche-Team/Fondo-Porsche-Team-Oficial.jfif',
    accent_color: '#2563eb',
  },
  {
    id: 'ch-wrc',
    channel_code: 'CH-03',
    sponsor_name: 'WRC FIA RALLY',
    title: 'FIA WRC Championship // Tramos Alpinos & Gravilla',
    description: 'Saltos a 180 km/h y tracción integral en los tramos más desafiantes del Campeonato Mundial FIA.',
    duration_seconds: 18,
    reward_credits: 100,
    video_url: '/assets/videos/WRC.mp4',
    thumbnail_url: '/assets/backgrounds/Fondos-WRC/fondo-WRC-cars.jpg',
    accent_color: '#2563eb',
  },
  {
    id: 'ch-jdm',
    channel_code: 'CH-04',
    sponsor_name: 'GRAN TURISMO / JDM TOUGE',
    title: 'Gran Turismo JDM Touge // Batalla en Mount Akina',
    description: 'Cultura japonesa de altas revoluciones, pasos de montaña del monte Akina y duelo Sprinter Trueno AE86 vs RX-7.',
    duration_seconds: 17,
    reward_credits: 100,
    video_url: '/assets/videos/JDM.mp4',
    thumbnail_url: '/assets/backgrounds/fondos-INITIAL-D/Fondo-Initial-D-Supra-RX7.jpg',
    accent_color: '#dc2626',
  }
];

export default function SpeedClubTvScreen() {
  const {
    pilot,
    racingCredits,
    containers,
    unopenedCrates,
    tvSponsorStatus,
    activeTvChannel,
    tvActiveSession,
    isTvPlaying,
    tvComments,
    fetchSponsorStatus,
    setActiveTvChannel,
    startSponsorVideo,
    claimSponsorReward,
    fetchVideoComments,
    postVideoComment,
    likeVideoComment,
    exitSpeedClubTv,
    buyContainer,
    enterGarageAlbum
  } = useGarageStore();

  const videoRef = useRef(null);

  const [watchProgress, setWatchProgress] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState(null);
  const [claimErrorMsg, setClaimErrorMsg] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasClaimedCurrentSession, setHasClaimedCurrentSession] = useState(false);
  const [cooldownCountdown, setCooldownCountdown] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Simulated telemetry dials state
  const [telemetryRpm, setTelemetryRpm] = useState(4200);
  const [telemetryThrottle, setTelemetryThrottle] = useState(85);
  const [telemetryGForce, setTelemetryGForce] = useState(1.15);

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

  // Load initial comments for active channel
  useEffect(() => {
    if (currentChannel?.id) {
      fetchVideoComments(currentChannel.id);
    }
  }, [currentChannel?.id, fetchVideoComments]);

  // Cooldown ticking timer
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

  // Telemetry needle simulator while playing
  useEffect(() => {
    if (!isTvPlaying) return;
    const interval = setInterval(() => {
      const baseRpm = 5200 + Math.sin(Date.now() / 380) * 2900 + Math.random() * 500;
      setTelemetryRpm(Math.round(Math.min(9200, Math.max(3200, baseRpm))));
      setTelemetryThrottle(Math.round(75 + Math.sin(Date.now() / 500) * 20 + Math.random() * 5));
      setTelemetryGForce(+(1.05 + Math.abs(Math.sin(Date.now() / 700) * 0.5)).toFixed(2));
    }, 120);
    return () => clearInterval(interval);
  }, [isTvPlaying]);

  // Handle video timeupdate
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = Math.floor(videoRef.current.currentTime);
    setWatchProgress(current);

    // Auto-claim when video reaches its end
    if (
      videoRef.current.duration &&
      videoRef.current.currentTime >= videoRef.current.duration - 0.5 &&
      tvActiveSession &&
      !hasClaimedCurrentSession
    ) {
      handleAutoClaim();
    }
  };

  // Video ended callback
  const handleVideoEnded = () => {
    useGarageStore.setState({ isTvPlaying: false });
    if (tvActiveSession && !hasClaimedCurrentSession) {
      handleAutoClaim();
    }
  };

  // Switch Channel
  const handleSelectChannel = (channel) => {
    sound.playHover();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setWatchProgress(0);
    setClaimSuccessMsg(null);
    setClaimErrorMsg(null);
    setShowSuccessModal(false);
    setHasClaimedCurrentSession(false);
    setActiveTvChannel(channel);
    fetchVideoComments(channel.id);
  };

  // Play Stream
  const handlePlayStream = async () => {
    sound.playSelect();
    setClaimSuccessMsg(null);
    setClaimErrorMsg(null);
    setShowSuccessModal(false);
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

  // Pause Stream
  const handlePauseStream = () => {
    sound.playSelect();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    useGarageStore.setState({ isTvPlaying: false });
  };

  // Auto-claim reward when video finishes
  const handleAutoClaim = async () => {
    if (hasClaimedCurrentSession || !tvActiveSession?.session_id) return;
    setHasClaimedCurrentSession(true);
    setIsClaiming(true);

    const res = await claimSponsorReward(tvActiveSession.session_id);
    setIsClaiming(false);

    if (res.success) {
      sound.playReward();
      setClaimSuccessMsg("¡Felicidades, ganaste 100 créditos!");
      setShowSuccessModal(true);
      setWatchProgress(channelDuration);
    } else {
      setClaimErrorMsg(res.message);
    }
  };

  // Manual claim fallback
  const handleManualClaim = async () => {
    await handleAutoClaim();
  };

  // Submit comment to forum
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsPostingComment(true);
    const res = await postVideoComment(currentChannel.id, newCommentText.trim());
    setIsPostingComment(false);

    if (res.success) {
      setNewCommentText('');
    }
  };

  const completedInWindow = tvSponsorStatus?.completed_in_window ?? 0;
  const remainingInWindow = tvSponsorStatus?.remaining_in_window ?? 3;
  const canWatch = tvSponsorStatus?.can_watch ?? (remainingInWindow > 0);
  const earnedInWindow = tvSponsorStatus?.earned_in_window ?? (completedInWindow * 100);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, channelDuration - watchProgress);
  const progressPercent = Math.min(100, Math.round((watchProgress / channelDuration) * 100));
  const isRewardReady = watchProgress >= channelDuration && tvActiveSession && !hasClaimedCurrentSession;
  const currentComments = tvComments[currentChannel?.id] || [];

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Dynamic Ambient Background - subtle, dark, classic */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-15 filter blur-md transition-all duration-700"
        style={{ backgroundImage: `url('${currentChannel.thumbnail_url}')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/85 via-zinc-950/95 to-black pointer-events-none" />

      {/* Top Header Broadcast Navigation (Classic Racing Red & Blue) */}
      <header className="relative z-20 w-full bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          
          {/* Back button & Station Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={exitSpeedClubTv}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white transition-all text-xs font-racing uppercase italic cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>VOLVER AL PIT LANE</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block border border-red-500" />
              <h1 className="font-racing text-lg sm:text-xl text-white italic tracking-wider flex items-center gap-2">
                <span>SPEEDCLUB</span>
                <span className="text-red-600">TV</span>
                <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono px-2 py-0.5 rounded not-italic font-bold">
                  TELEMETRÍA EN DIRECTO
                </span>
              </h1>
            </div>
          </div>

          {/* User Credits & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 border border-zinc-800 rounded-lg text-xs font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">BILLETERA:</span>
              <span className="text-white font-bold tracking-wider">{racingCredits.toLocaleString()} CR</span>
            </div>

            <button
              onClick={() => {
                sound.playSelect();
                buyContainer('standard');
              }}
              onMouseEnter={() => sound.playHover()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white border border-red-800 rounded-lg text-xs font-racing uppercase italic transition-all cursor-pointer shadow-sm"
            >
              <Box className="w-3.5 h-3.5 text-white" />
              <span>COMPRAR CONTAINER COMÚN (100 CR)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Classic Fuel Battery Quota & Cooldown Strip */}
      <div className="relative z-10 w-full bg-zinc-900/90 border-b border-zinc-800 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          {/* 3-Battery Meter (Classic Blue / Red / White) */}
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              CUPO DISPONIBLE (TANDA 2 HORAS):
            </span>
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((idx) => {
                const isClaimed = idx < completedInWindow;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold border transition-all ${
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
            <span className="text-zinc-200 font-bold ml-1">
              ({earnedInWindow}/300 CR GANADOS)
            </span>
          </div>

          {/* Cooldown or Available Status */}
          <div>
            {!canWatch || cooldownCountdown > 0 ? (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-700 text-red-200 px-3 py-1 rounded-lg font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span>COOLDOWN ACTIVO // PRÓXIMA TANDA EN: <strong>{formatTime(cooldownCountdown)}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>ENLACE SATELITAL ACTIVO // {remainingInWindow} DE 3 TRANSMISIONES DISPONIBLES</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Arena */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Stage: TV Cinema Screen + Live Telemetry + Video Forum (Col 8) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Top Seconds HUD Strip (Directly requested above video) */}
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 flex items-center justify-between text-xs font-mono shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-red-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                  EMISIÓN OFICIAL:
                </span>
                <span className="text-white font-racing tracking-wide uppercase italic">
                  {currentChannel.sponsor_name}
                </span>
              </div>

              {/* Central Seconds Indicator */}
              <div className="flex items-center gap-4 bg-black/60 px-3 py-1 rounded border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>TIEMPO:</span>
                  <span className="text-white">{watchProgress}s</span>
                  <span className="text-zinc-500">/</span>
                  <span className="text-zinc-400">{channelDuration}s</span>
                </div>
                <div className="hidden sm:block text-zinc-400 border-l border-zinc-700 pl-3">
                  <span>RESTAN:</span>{' '}
                  <strong className={remainingSeconds === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    {remainingSeconds}s
                  </strong>
                </div>
              </div>

              {/* Reward Badge */}
              <div className="hidden sm:flex items-center gap-1 bg-blue-950/70 border border-blue-700 text-blue-300 px-2.5 py-0.5 rounded text-[11px] font-bold">
                <span>RECOMPENSA:</span>
                <span className="text-white">+100 CR</span>
              </div>
            </div>

            {/* Main Cinema TV Chassis (Classic Racing Dark Zinc & Clean Borders) */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-xl group">
              
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

              {/* CRT Scanline Overlay (Optional) */}
              {scanlinesActive && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
                    backgroundSize: '100% 4px',
                  }}
                />
              )}

              {/* In-Video Top Telemetry Banner */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none font-mono text-xs z-10">
                <div className="flex items-center gap-2 bg-zinc-950/90 px-3 py-1 rounded border border-zinc-700 text-zinc-200">
                  <span className="font-bold text-red-500">{currentChannel.channel_code || 'CH-01'}</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-white font-racing tracking-wider">{currentChannel.sponsor_name}</span>
                </div>
                <div className="bg-zinc-950/90 px-3 py-1 rounded border border-zinc-700 text-white font-bold">
                  {watchProgress}s / {channelDuration}s
                </div>
              </div>

              {/* Center Play Overlay when idle */}
              {!isTvPlaying && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-6 z-20">
                  <button
                    disabled={!canWatch && cooldownCountdown > 0}
                    onClick={handlePlayStream}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold font-racing uppercase italic tracking-wider text-sm transition-all shadow-lg ${
                      !canWatch && cooldownCountdown > 0
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 cursor-pointer transform hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {!canWatch && cooldownCountdown > 0
                        ? 'COOLDOWN ACTIVO // ESPERA REAPERTURA'
                        : 'REPRODUCIR VIDEO COMPLETO (+100 CR)'}
                    </span>
                  </button>
                  <p className="mt-3 text-xs text-zinc-400 font-mono text-center max-w-md">
                    Mira los {channelDuration} segundos del video completo. Al finalizar recibirás automáticamente tus 100 créditos.
                  </p>
                </div>
              )}

              {/* Dynamic Live Telemetry Instruments Overlay */}
              {isTvPlaying && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-zinc-950/90 px-3.5 py-1.5 rounded-lg border border-zinc-700 text-xs font-mono pointer-events-none z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-zinc-400">RPM:</span>
                      <span className="text-white font-bold">{telemetryRpm}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-zinc-400">ACELERADOR:</span>
                      <span className="text-white font-bold">{telemetryThrottle}%</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-zinc-400">G-LAT:</span>
                      <span className="text-white font-bold">{telemetryGForce} G</span>
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>EN TRANSMISIÓN</span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls & Progress Bar */}
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-md">
              
              {/* Progress Bar */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    PROGRESO DE TRANSMISIÓN:
                  </span>
                  <span className="font-bold text-white">
                    {watchProgress}s / {channelDuration}s ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-zinc-700 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-blue-600 via-blue-500 to-red-600"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isTvPlaying ? (
                    <button
                      onClick={handlePauseStream}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg border border-zinc-600 font-racing uppercase italic transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSAR</span>
                    </button>
                  ) : (
                    <button
                      disabled={!canWatch && cooldownCountdown > 0}
                      onClick={handlePlayStream}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-xs text-white rounded-lg border border-blue-600 font-racing uppercase italic transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>REANUDAR</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsMuted(!isMuted);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isMuted
                        ? 'bg-red-950/70 border-red-700 text-red-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? 'SILENCIADO' : 'AUDIO'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setScanlinesActive(!scanlinesActive);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-mono transition-all hidden sm:flex items-center gap-1.5 cursor-pointer ${
                      scanlinesActive
                        ? 'bg-blue-950/80 border-blue-600 text-blue-200'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>LÍNEAS CRT</span>
                  </button>
                </div>

                {/* Status indicator / manual claim button if video ended */}
                <div>
                  {hasClaimedCurrentSession ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950/70 border border-emerald-600 rounded-lg text-emerald-300 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>100 CR ACREDITADOS ✓</span>
                    </div>
                  ) : isRewardReady ? (
                    <button
                      onClick={handleManualClaim}
                      disabled={isClaiming}
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-racing uppercase italic text-xs rounded-lg border border-red-500 transition-all cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isClaiming ? 'ACREDITANDO...' : 'RECLAMAR 100 CRÉDITOS'}</span>
                    </button>
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

              {/* Status alerts */}
              {claimErrorMsg && (
                <div className="mt-3 p-3 bg-red-950/80 border border-red-700 rounded-lg text-red-200 text-xs font-mono flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{claimErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Video Forum / Community Discussion */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 shadow-md flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h3 className="font-racing text-sm uppercase italic tracking-wider text-white">
                    FORO DE PILOTOS // ANÁLISIS DE TELEMETRÍA
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {currentComments.length} COMENTARIOS EN VIVO
                </span>
              </div>

              {/* Comments Stream */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {currentComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start justify-between gap-3 group hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold font-mono text-zinc-200 flex-shrink-0 mt-0.5">
                        {c.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-zinc-200">{c.username}</span>
                          <span className="text-[9px] bg-zinc-900 text-zinc-500 px-1 rounded font-mono">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{c.comment}</p>
                      </div>
                    </div>

                    {/* Like button */}
                    <button
                      onClick={() => likeVideoComment(c.id, currentChannel.id)}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-red-400 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{c.likes_count}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handlePostComment} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Escribe tu comentario sobre ${currentChannel.sponsor_name}...`}
                  className="flex-1 bg-black border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isPostingComment || !newCommentText.trim()}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white font-racing uppercase italic text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>PUBLICAR</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Sidebar: 4-TV Wall Matrix + Sponsor Details + Shop (Col 4) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            
            {/* 4-TV Wall Matrix (Clean Classic Racing Style) */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 shadow-md">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span className="font-racing text-xs tracking-wider uppercase italic text-zinc-300 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-red-500" />
                  <span>PADDOCK TV WALL // 4 CANALES</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  1 CANAL ACTIVO
                </span>
              </div>

              {/* 4 TV Feeds */}
              <div className="space-y-3">
                {channels.map((ch) => {
                  const isActive = currentChannel.id === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChannel(ch)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                        isActive
                          ? 'bg-zinc-950 border-red-600 shadow-md'
                          : 'bg-zinc-950/60 hover:bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Mini TV Monitor Chassis */}
                        <div className="relative w-24 h-16 bg-black rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0 group">
                          <img
                            src={ch.thumbnail_url}
                            alt={ch.sponsor_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                          {isActive && isTvPlaying ? (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100">
                              <Play className="w-5 h-5 fill-white text-white drop-shadow" />
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-black/90 text-amber-400 px-1 rounded border border-zinc-700">
                            +100 CR
                          </span>
                        </div>

                        {/* Channel Specs */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold tracking-wider ${
                              isActive ? 'text-red-500' : 'text-zinc-400'
                            }`}>
                              {ch.channel_code || 'CANAL'}
                            </span>
                            <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-800">
                              {ch.duration_seconds || 16}s
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate mt-0.5">
                            {ch.sponsor_name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {ch.title}
                          </p>
                        </div>
                      </div>

                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Box: Direct Container Purchase */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 shadow-md">
              <div className="flex items-center gap-2 text-white font-racing uppercase italic text-xs mb-2">
                <Box className="w-4 h-4 text-red-500" />
                <span>CANJE DIRECTO DE CRÉDITOS FIA</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                Cada 100 CR obtenidos en SPEEDCLUB TV equivalen a <strong>1 Sobre Container Común (3 figuritas)</strong>.
              </p>
              
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => {
                    sound.playSelect();
                    buyContainer('standard');
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-racing uppercase italic text-xs rounded-lg transition-all flex items-center justify-center gap-2 border border-red-800 cursor-pointer shadow-sm"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>COMPRAR CONTAINER ROJO (100 CR)</span>
                </button>

                <button
                  onClick={enterGarageAlbum}
                  onMouseEnter={() => sound.playHover()}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-racing uppercase italic text-xs rounded-lg transition-all flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
                >
                  <span>ABRIR ÁLBUM DE GARAJE</span>
                </button>
              </div>
            </div>

            {/* Official Sponsors Rules */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-bold block mb-1">PROTOCOLO FIA DE TELEMETRÍA:</span>
              <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                <li>El video debe visualizarse completo para certificar la telemetría.</li>
                <li>Límite de tanda: 3 videos cada 2 horas (300 CR máximo).</li>
                <li>Acreditación automática inmediata de 100 CR al finalizar el video.</li>
              </ul>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="relative z-20 w-full bg-zinc-900 border-t border-zinc-800 py-2 px-6 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-4">
          <span>TERMINAL BROADCAST: FIA-PADDOCK-TV-01</span>
          <span className="hidden sm:inline">CODEC: H.264 / 4K UHD</span>
        </div>
        <div className="text-zinc-400">
          SPEEDCLUB RACING TELEMETRY v3.2 // SISTEMA CLÁSICO
        </div>
      </footer>

      {/* Success Modal / Banner: "¡Felicidades, ganaste 100 créditos!" */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md bg-zinc-900 border-2 border-red-600 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              {/* Header Badges */}
              <div className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-400 pb-2 mb-3 border-b border-zinc-800">
                <span className="flex items-center gap-1.5 text-red-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                  SCUDERIA FIA PROTOCOL
                </span>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Trophy Icon */}
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-amber-500 flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>

              {/* Exact Requested Message */}
              <h2 className="font-racing text-2xl text-white uppercase italic tracking-wider leading-tight">
                ¡Felicidades, ganaste 100 créditos!
              </h2>

              <p className="mt-2 text-xs font-mono text-zinc-300 leading-relaxed max-w-xs">
                Has completado la transmisión de <strong>{currentChannel.sponsor_name}</strong>. Los 100 créditos han sido acreditados automáticamente en tu billetera.
              </p>

              {/* Wallet Update preview */}
              <div className="mt-4 px-4 py-2 bg-black/60 border border-zinc-700 rounded-lg flex items-center gap-3 text-xs font-mono">
                <span className="text-zinc-400">NUEVO SALDO:</span>
                <span className="text-amber-400 font-bold text-sm">{racingCredits.toLocaleString()} CR</span>
                <span className="text-emerald-400 font-bold">(+100 CR)</span>
              </div>

              {/* Action buttons */}
              <div className="mt-5 w-full flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    sound.playSelect();
                    setShowSuccessModal(false);
                  }}
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-racing uppercase italic text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  CONTINUAR VIENDO
                </button>

                <button
                  onClick={() => {
                    sound.playSelect();
                    setShowSuccessModal(false);
                    buyContainer('standard');
                  }}
                  className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white font-racing uppercase italic text-xs rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>COMPRAR SOBRE (100 CR)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
