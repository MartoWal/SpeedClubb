import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import { 
  Play, 
  LogIn, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Award, 
  Mail, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Gauge, 
  Zap,
  Package,
  Box
} from 'lucide-react';
import FloatingHoloCard from '../components/FloatingHoloCard';
import AlbumCoverCard from '../components/garage/AlbumCoverCard';
import { sound } from '../utils/soundEffects';

export default function LoginScreen() {
  const { 
    globalStats, 
    catalog, 
    pastedVehicles,
    login, 
    register, 
    loginAsGuest, 
    isAuthenticating, 
    authError 
  } = useGarageStore();

  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Default values matching official paddock showcase (20/95 autos, 21% completion)
  const pastedCount = (pastedVehicles && pastedVehicles.length > 0) ? pastedVehicles.length : 20;
  const totalCount = (catalog && catalog.length > 0) ? catalog.length : 95;
  const completionPct = Math.round((pastedCount / totalCount) * 100);

  // Pick 4 iconic showcase vehicles to float around the central album cover
  const fiatUno = catalog.find(c => c.id === 1) || catalog[0];
  const skylineGtr = catalog.find(c => c.id === 14) || catalog[1];
  const ferrariF40 = catalog.find(c => c.id === 17) || catalog[2];
  const porsche = catalog.find(c => c.id === 16) || catalog[3];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Por favor ingresa tu correo y contraseña.');
      sound.playSelect();
      return;
    }

    if (authMode === 'REGISTER') {
      if (!username || username.trim().length < 2) {
        setFormError('El nombre de piloto debe tener al menos 2 caracteres.');
        sound.playSelect();
        return;
      }
      if (password.length < 6) {
        setFormError('La contraseña debe tener un mínimo de 6 caracteres.');
        sound.playSelect();
        return;
      }
      const res = await register(username, email, password);
      if (!res.success) {
        setFormError(res.message);
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setFormError(res.message);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden text-white select-none bg-transparent">
      {/* Top classic racing title plaque */}
      <header className="relative z-10 pt-4 sm:pt-6 px-4 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-4 sm:px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-md mb-2"
        >
          {/* Classic Motorsport Tri-Color Livery (Rojo, Blanco, Azul) */}
          <div className="flex items-center gap-1 border-r border-zinc-700 pr-3">
            <span className="w-2.5 h-3.5 bg-red-600 rounded-xs inline-block" />
            <span className="w-2.5 h-3.5 bg-white rounded-xs inline-block" />
            <span className="w-2.5 h-3.5 bg-blue-600 rounded-xs inline-block" />
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h1 className="font-racing text-xs sm:text-sm md:text-base font-bold tracking-wider uppercase italic text-zinc-100">
              SpeedClub Temporada 2026 Martin Waltar
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-zinc-700 pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
              OFICIAL
            </span>
          </div>
        </motion.div>
      </header>

      {/* Main Hero Showcase: Album + Floating Stickers & Gran Turismo Pilot License Terminal */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-2 sm:py-6 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 w-full">
        {/* Left / Center: 3D Official Garage Collector's Binder + Floating Vehicle Stickers */}
        <div className="relative flex-1 flex items-center justify-center w-full min-h-[350px] sm:min-h-[420px]">
          {/* Floating Sticker 1: Fiat Uno Denver (Upper Left) */}
          <div className="hidden md:block absolute -top-4 -left-4 sm:left-4 z-20">
            <FloatingHoloCard vehicle={fiatUno} rotation={-14} />
          </div>

          {/* Floating Sticker 2: Nissan Skyline R34 (Upper Right) */}
          <div className="hidden sm:block absolute -top-8 right-2 sm:right-12 z-20">
            <FloatingHoloCard vehicle={skylineGtr} rotation={12} />
          </div>

          {/* Floating Sticker 3: Ferrari F40 Competizione (Lower Right) */}
          <div className="hidden md:block absolute bottom-0 right-0 sm:right-4 z-20">
            <FloatingHoloCard vehicle={ferrariF40} rotation={-8} />
          </div>

          {/* Floating Sticker 4: Porsche 911 GT3 RS (Lower Left) */}
          <div className="hidden lg:block absolute bottom-4 left-6 z-20">
            <FloatingHoloCard vehicle={porsche} rotation={9} />
          </div>

          {/* Centerpiece: The Official SpeedClub Album Cover (Exact Same Cover as in the Paddock) */}
          <div className="relative z-10 flex items-center justify-center">
            <AlbumCoverCard
              completionPct={completionPct}
              pastedCount={pastedCount}
              totalCount={totalCount}
              onOpen={() => {
                sound.playSelect();
                loginAsGuest();
              }}
            />
          </div>
        </div>

        {/* Right: Gran Turismo FIA Pilot Super License Terminal */}
        <aside className="relative z-10 w-full lg:w-[420px] flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden p-4 sm:p-5 flex flex-col gap-4">
            {/* Terminal Header Plaque */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-red-500 shadow-sm">
                  <Gauge className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-racing text-xs text-racing-red font-black tracking-wider uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    FIA SUPER LICENSE // PADDOCK TERMINAL
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    SISTEMA DE ACCESO Y PERSISTENCIA DE PILOTO
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-black/80 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                PORTAL 2026
              </span>
            </div>

            {/* Auth Mode Tabs (Gran Turismo Switcher) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-black/80 border border-zinc-800 gap-1 text-xs font-racing italic font-bold">
              <button
                type="button"
                onClick={() => {
                  sound.playHover();
                  setAuthMode('LOGIN');
                  setFormError('');
                }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'LOGIN'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-600'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>INICIAR SESIÓN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playHover();
                  setAuthMode('REGISTER');
                  setFormError('');
                }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'REGISTER'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-600'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>NUEVA LICENCIA</span>
              </button>
            </div>

            {/* Welcome & Incentives info strip */}
            <div className="text-left bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-800/80 text-[11px] font-mono flex items-start gap-2">
              <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                {authMode === 'LOGIN' ? (
                  <p className="text-zinc-300">
                    Ingresa con tu correo y clave para continuar tu colección, créditos y stickers del álbum.
                  </p>
                ) : (
                  <p className="text-zinc-300">
                    <strong className="text-amber-400">¡Bono de bienvenida FIA!</strong> Recibe <strong className="text-white">+500 Créditos</strong> y <strong className="text-white">3 Containers</strong> para abrir en tu primera tanda.
                  </p>
                )}
              </div>
            </div>

            {/* Error Notification Alert */}
            {(formError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-red-950/80 border border-red-600/80 text-red-200 text-xs font-mono flex items-center gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formError || authError}</span>
              </motion.div>
            )}

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
              {/* Pilot Name (Registration only) */}
              {authMode === 'REGISTER' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span>NOMBRE DE PILOTO / GAMERTAG</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej: Ayrton Senna, Max Speed..."
                      className="w-full py-2.5 pl-3 pr-3 rounded-lg bg-black/70 border border-zinc-700/80 focus:border-zinc-400 focus:outline-none text-white font-telemetry text-sm placeholder:text-zinc-600 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <span>CORREO ELECTRÓNICO OFICIAL</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="piloto@speedclub.io"
                    className="w-full py-2.5 pl-3 pr-3 rounded-lg bg-black/70 border border-zinc-700/80 focus:border-zinc-400 focus:outline-none text-white font-telemetry text-sm placeholder:text-zinc-600 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-400" />
                  <span>CLAVE DE TELEMETRÍA (CONTRASEÑA)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full py-2.5 pl-3 pr-3 rounded-lg bg-black/70 border border-zinc-700/80 focus:border-zinc-400 focus:outline-none text-white font-telemetry text-sm placeholder:text-zinc-600 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isAuthenticating}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => sound.playHover()}
                className="w-full mt-2 py-3 px-4 rounded-xl btn-racing-red flex items-center justify-between group shadow-md cursor-pointer select-none disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center border border-white/20">
                    {isAuthenticating ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-white fill-white group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-racing text-base text-white italic font-black tracking-wider leading-none">
                      {isAuthenticating 
                        ? 'SINCRONIZANDO CON PADDOCK...' 
                        : (authMode === 'LOGIN' ? 'ENTRAR A LA PISTA' : 'EXPEDIR LICENCIA OFICIAL')}
                    </span>
                    <span className="text-[9px] font-mono text-red-200 uppercase tracking-widest mt-0.5">
                      {authMode === 'LOGIN' ? 'ACCESO SEGURO A TU GARAJE' : 'CREA TU CUENTA Y GUARDA TU PROGRESO'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>

            {/* Quick Demo Access Option */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500">¿ACCESO DE EVALUACIÓN?</span>
              <button
                type="button"
                onClick={loginAsGuest}
                onMouseEnter={() => sound.playHover()}
                className="text-[10px] font-racing italic text-amber-400 hover:text-amber-300 uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>PILOTO DEMO (AYRTON)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Global Statistics Bar */}
      <footer className="relative z-10 w-full bg-black/90 border-t border-zinc-800/90 py-3 sm:py-4 px-4 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Official License Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-950 border border-red-700/80 flex items-center justify-center font-display font-black text-racing-red text-sm">
              SC
            </div>
            <div className="flex flex-col text-left">
              <span className="font-racing text-xs text-white uppercase italic font-bold tracking-wider">
                SPEEDCLUB RACING
              </span>
              <span className="text-[9px] font-mono text-zinc-400">
                FEDERACIÓN INTERNACIONAL DE VELOCIDAD
              </span>
            </div>
          </div>

          {/* 3 Live Telemetry Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full md:w-auto text-center md:text-left">
            <div className="flex flex-col">
              <span className="font-display text-base sm:text-xl font-black text-white italic tracking-tight">
                {globalStats.piecesSwapped.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider -mt-0.5">
                Piezas Intercambiadas
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-display text-base sm:text-xl font-black text-amber-400 italic tracking-tight">
                {globalStats.registeredPilots.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider -mt-0.5">
                Pilotos Registrados
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-display text-base sm:text-xl font-black text-amber-400 italic tracking-tight">
                {globalStats.cratesOpened.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider -mt-0.5">
                Containers Abiertos
              </span>
            </div>
          </div>

          {/* Official Sponsor Logos strip */}
          <div className="flex items-center gap-3 text-xs font-racing italic text-zinc-500">
            <span>PIRELLI</span>
            <span>·</span>
            <span>BREMBO</span>
            <span>·</span>
            <span>MOTUL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
