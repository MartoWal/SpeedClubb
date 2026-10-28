import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  X, 
  CheckCircle2, 
  XCircle,
  Coins, 
  Sparkles, 
  ArrowRight,
  Clock,
  Timer,
  Award,
  HelpCircle,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useGarageStore } from '../../store/useGarageStore';

const REWARD_TABLE = [
  { correct: 5, reward: 300, label: 'Gran Premio Paddock' },
  { correct: 4, reward: 200, label: 'Podio Oficial' },
  { correct: 3, reward: 120, label: 'Zona de Puntos' },
  { correct: 2, reward: 70, label: 'Completado' },
  { correct: 1, reward: 30, label: 'Bono Participación' },
  { correct: 0, reward: 10, label: 'Consolación' },
];

export default function DailyChallengesModal() {
  const { 
    isChallengesModalOpen, 
    closeChallengesModal,
    dailyTriviaStatus,
    isLoadingTrivia,
    fetchDailyTrivia,
    submitDailyTrivia,
    racingCredits
  } = useGarageStore();

  // Trivia local gameplay state
  // gamePhase: 'INTRO' | 'PLAYING' | 'SUMMARY'
  const [gamePhase, setGamePhase] = useState('INTRO');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // [{ question_id, selected_index }]
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [countdownRemaining, setCountdownRemaining] = useState(0);

  const timerRef = useRef(null);

  // Sync countdown to midnight
  useEffect(() => {
    if (dailyTriviaStatus?.seconds_to_midnight) {
      setCountdownRemaining(dailyTriviaStatus.seconds_to_midnight);
    }
  }, [dailyTriviaStatus?.seconds_to_midnight]);

  // Live timer tick to midnight
  useEffect(() => {
    if (countdownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev <= 1) {
          fetchDailyTrivia();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownRemaining]);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isChallengesModalOpen) {
      fetchDailyTrivia();
      setGamePhase('INTRO');
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setIsAnswerLocked(false);
      setFinalResult(null);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isChallengesModalOpen]);

  // Handle active question 20s countdown timer
  useEffect(() => {
    if (gamePhase !== 'PLAYING') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(20);
    setSelectedOption(null);
    setIsAnswerLocked(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase, currentQuestionIndex]);

  const questions = dailyTriviaStatus?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Auto-skip when 20s timer expires
  const handleTimeOut = () => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOption(-1);

    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [
      ...userAnswers,
      { question_id: currentQ.id, selected_index: -1 }
    ];
    setUserAnswers(newAnswers);

    setTimeout(() => {
      advanceOrFinish(newAnswers);
    }, 1200);
  };

  // User clicked an option
  const handleSelectOption = (index) => {
    if (isAnswerLocked) return;
    sound.playSelect();
    setIsAnswerLocked(true);
    setSelectedOption(index);

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [
      ...userAnswers,
      { question_id: currentQ.id, selected_index: index }
    ];
    setUserAnswers(newAnswers);

    setTimeout(() => {
      advanceOrFinish(newAnswers);
    }, 1000);
  };

  const advanceOrFinish = async (currentAnswers) => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setGamePhase('SUMMARY');
      const res = await submitDailyTrivia(currentAnswers);
      if (res?.success) {
        setFinalResult(res.data);
      }
    }
  };

  const handleStartTrivia = () => {
    if (!questions || questions.length === 0) return;
    sound.playSelect();
    setGamePhase('PLAYING');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isChallengesModalOpen) return null;

  const isAlreadyPlayedToday = dailyTriviaStatus?.played === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden select-none">
      {/* Official Fondo Desafíos Wallpaper with Classic Gran Turismo Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-100"
        style={{ backgroundImage: `url('/fondo_desafios.webp'), url('/fondo_desafios.jpg')` }}
      />
      
      {/* Classic Matte Overlays: Carbon Weave + Dark Vignette (Zero Neons) */}
      <div className="absolute inset-0 carbon-pattern opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/85 to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />

      {/* Main Modal Window - Classic Titanium & Zinc Architecture */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 w-full max-w-2xl bg-zinc-950/95 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 max-h-[92vh]"
      >
        {/* Top Header Bar - FIA Motorsport Livery */}
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-700/80 flex items-center justify-center text-red-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-racing text-sm sm:text-base text-white uppercase italic font-bold tracking-wider">
                  TRIVIA DIARIA DE PADDOCK
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold uppercase">
                  FIA SPEEDCLUB KNOWLEDGE
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                5 preguntas aleatorias multitemática con cronómetro de 20s. Reinicio diario a las 23:59:59.
              </p>
            </div>
          </div>

          <button
            onClick={closeChallengesModal}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col">
          {isLoadingTrivia && !finalResult ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-zinc-400 tracking-wider">
                CONECTANDO CON SERVIDOR DE TELEMETRÍA FIA...
              </p>
            </div>
          ) : isAlreadyPlayedToday && gamePhase === 'INTRO' ? (
            /* =========================================================================
               STATE: ALREADY PLAYED TODAY (Countdown to 23:59:59)
               ========================================================================= */
            <div className="flex flex-col items-center text-center py-6 px-2 sm:px-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-amber-600/70 flex items-center justify-center text-amber-400 mb-4 shadow-md">
                <Award className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-700 px-3 py-1 rounded-full mb-2">
                ✓ DESAFÍO DE HOY COMPLETADO
              </span>

              <h2 className="font-racing text-xl sm:text-2xl font-black italic uppercase text-white tracking-wide">
                ¡EXCELENTE JORNADA DE PADDOCK!
              </h2>

              <p className="text-xs font-mono text-zinc-400 max-w-md mt-2">
                Ya has completado tu desafío de trivia del día de hoy. Obtuviste una puntuación oficial de:
              </p>

              {/* Score card */}
              <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 w-full max-w-md flex items-center justify-around shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">ACIERTOS</span>
                  <span className="font-racing text-2xl font-black text-white italic">
                    {dailyTriviaStatus.score ?? 0} / 5
                  </span>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">CRÉDITOS OBTENIDOS</span>
                  <span className="font-racing text-2xl font-black text-amber-400 italic flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-400" />
                    +{dailyTriviaStatus.credits_awarded ?? 0} CR
                  </span>
                </div>
              </div>

              {/* Countdown box - Solid Classic Border (No Blurs) */}
              <div className="mt-6 p-4 rounded-xl bg-zinc-900/90 border border-zinc-700 w-full max-w-md flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono font-bold">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>PRÓXIMA TRIVIA Y 3 PERMUTAS EN:</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest bg-black/70 px-5 py-2 rounded-lg border border-zinc-800">
                  {formatTime(countdownRemaining)}
                </div>
                <p className="text-[9px] font-mono text-zinc-400 text-center mt-1">
                  Reinicio automático diario a las 23:59:59 horas.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeChallengesModal}
                  className="py-2.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-racing text-xs italic uppercase tracking-wider transition-colors cursor-pointer"
                >
                  VOLVER AL PADDOCK
                </button>
              </div>
            </div>
          ) : gamePhase === 'INTRO' ? (
            /* =========================================================================
               STATE: INTRO (Ready to start round)
               ========================================================================= */
            <div className="flex flex-col gap-4">
              {/* Hero Banner - Classic Motorsport Finish */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-red-700/70 flex items-center justify-center text-red-500 shrink-0">
                    <Flame className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-racing text-base sm:text-lg text-white uppercase italic font-black">
                      DESAFÍO OFICIAL DEL DÍA
                    </h4>
                    <p className="text-xs font-mono text-zinc-300">
                      Responde 5 preguntas aleatorias del automovilismo y el álbum oficial.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">PREMIO MÁXIMO</span>
                  <div className="font-racing text-xl sm:text-2xl font-black text-amber-400 italic">
                    +300 CR
                  </div>
                </div>
              </div>

              {/* Rules & Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-950 text-amber-400 border border-zinc-700 shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-racing text-xs font-bold text-white uppercase">
                      20 SEGUNDOS POR PREGUNTA
                    </h5>
                    <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                      El cronómetro corre al instante. Si se agota el tiempo sin responder, cuenta como no acertada.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-950 text-blue-400 border border-zinc-700 shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-racing text-xs font-bold text-white uppercase">
                      TEMÁTICAS VARIADAS
                    </h5>
                    <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                      Preguntas extraídas de los 9 temas: F1, JDM, WRC, Ferrari, Porsche, Clásicos 90s, Enfierrados y más.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward Scale Table */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                  TABLA OFICIAL DE CRÉDITOS DE CARRERA (CR):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REWARD_TABLE.map((row) => (
                    <div 
                      key={row.correct}
                      className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                    >
                      <span className="font-mono text-xs text-zinc-300 font-bold">
                        {row.correct} {row.correct === 1 ? 'acierto' : 'aciertos'}
                      </span>
                      <span className="font-racing text-xs font-black text-amber-400 italic">
                        +{row.reward} CR
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button - Classic Racing Red (Solid, No Neon Glow) */}
              <button
                onClick={handleStartTrivia}
                disabled={!questions || questions.length === 0}
                className="mt-2 w-full py-3.5 px-6 rounded-xl bg-red-700 hover:bg-red-600 border border-red-500/80 text-white font-racing text-sm sm:text-base font-black italic uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>INICIAR DESAFÍO DIARIO (5 PREGUNTAS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : gamePhase === 'PLAYING' && currentQuestion ? (
            /* =========================================================================
               STATE: PLAYING QUESTION (Active Round)
               ========================================================================= */
            <div className="flex flex-col gap-4">
              {/* Round Progress & Timer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                {/* Question counter & badges */}
                <div className="flex items-center gap-2">
                  <span className="font-racing text-xs font-bold text-white uppercase italic">
                    PREGUNTA {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold uppercase">
                    {currentQuestion.category}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                    currentQuestion.difficulty === 'FÁCIL'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                      : currentQuestion.difficulty === 'MEDIA'
                      ? 'bg-amber-950 text-amber-400 border-amber-700'
                      : 'bg-red-950 text-red-400 border-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {/* 20s Classic Solid Timer */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-black text-sm tracking-widest border transition-colors ${
                    timeLeft <= 5 
                      ? 'bg-red-950 text-red-400 border-red-700'
                      : timeLeft <= 10
                      ? 'bg-amber-950 text-amber-400 border-amber-700'
                      : 'bg-zinc-900 text-white border-zinc-700'
                  }`}>
                    <Timer className="w-4 h-4" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Timer Progress Bar - Solid Matte Fill */}
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5 
                      ? 'bg-red-600' 
                      : timeLeft <= 10 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${(timeLeft / 20) * 100}%` }}
                />
              </div>

              {/* Question Text Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 min-h-[90px] flex items-center">
                <h4 className="font-racing text-sm sm:text-base font-bold text-white tracking-wide leading-relaxed">
                  {currentQuestion.question}
                </h4>
              </div>

              {/* 4 Options Grid - Classic Clean Borders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = selectedOption === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerLocked}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-red-700 border-red-500 text-white shadow-md'
                          : isAnswerLocked
                          ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60'
                          : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:border-zinc-600'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-racing text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-white text-red-700'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {letters[idx]}
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-semibold flex-1">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Timeout Warning Message */}
              {isAnswerLocked && selectedOption === -1 && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-red-300 font-mono text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>¡TIEMPO AGOTADO! Avanzando a la siguiente pregunta...</span>
                </div>
              )}
            </div>
          ) : gamePhase === 'SUMMARY' ? (
            /* =========================================================================
               STATE: SUMMARY & REWARD FANFARE
               ========================================================================= */
            <div className="flex flex-col gap-4">
              {/* Fanfare Banner - Matte Podium Design */}
              <div className="p-5 rounded-2xl bg-zinc-900/95 border border-amber-600/70 flex flex-col items-center text-center shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-amber-500/70 flex items-center justify-center text-amber-400 mb-2 shadow-inner">
                  <Trophy className="w-7 h-7" />
                </div>

                <h3 className="font-racing text-xl sm:text-2xl font-black italic uppercase text-white tracking-wide">
                  ¡DESAFÍO COMPLETADO CON ÉXITO!
                </h3>

                <div className="mt-3 flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 flex flex-col items-center min-w-[120px]">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">ACIERTOS</span>
                    <span className="font-racing text-2xl font-black text-white italic">
                      {finalResult?.score ?? 0} / 5
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-700/80 flex flex-col items-center min-w-[140px]">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">RECOMPENSA</span>
                    <span className="font-racing text-2xl font-black text-amber-400 italic flex items-center gap-1.5">
                      <Coins className="w-5 h-5" />
                      +{finalResult?.credits_awarded ?? 0} CR
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-full">
                  ✓ {finalResult?.credits_awarded ?? 0} Créditos de Carrera acreditados en tu cuenta.
                </p>
              </div>

              {/* Breakdown List with Lore */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                  REVISIÓN DE TELEMETRÍA Y LORE OFICIAL:
                </span>

                {(finalResult?.breakdown || []).map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-3 rounded-xl border flex flex-col gap-2 transition-colors ${
                      item.is_correct
                        ? 'bg-zinc-900/85 border-emerald-700/80'
                        : 'bg-zinc-900/85 border-red-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                          [{item.category}]
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.is_correct
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : 'bg-red-950 text-red-400 border border-red-700'
                      }`}>
                        {item.is_correct ? 'ACERTADA' : 'INCORRECTA'}
                      </span>
                    </div>

                    <p className="font-racing text-xs font-bold text-white">
                      {item.question}
                    </p>

                    <div className="text-[11px] font-mono flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <span>Tu respuesta:</span>
                        <span className={`font-bold ${item.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.selected_index >= 0 ? item.options[item.selected_index] : 'Tiempo agotado (sin responder)'}
                        </span>
                      </div>
                      {!item.is_correct && (
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <span>Respuesta correcta:</span>
                          <span className="font-bold text-emerald-400">
                            {item.options[item.correct_index]}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.lore && (
                      <div className="p-2 rounded-lg bg-black/50 border border-zinc-800 text-[10px] font-mono text-zinc-400 italic">
                        <span className="text-amber-400 font-bold not-italic">🏁 Paddock Lore: </span>
                        {item.lore}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={closeChallengesModal}
                  className="w-full py-2.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-racing text-xs italic uppercase tracking-wider transition-colors cursor-pointer"
                >
                  VOLVER AL PADDOCK PRINCIPAL
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer - Classic Telemetry Strip */}
        <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SPEEDCLUB RACING TELEMETRY // EN LÍNEA</span>
          </div>

          <div className="flex items-center gap-2">
            <span>SALDO DISPONIBLE:</span>
            <span className="font-racing text-xs font-bold text-amber-400 italic">
              {racingCredits} CR
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
