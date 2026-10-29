import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  X, 
  Check,
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
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useGarageStore } from '../../store/useGarageStore';

const REWARD_TABLE = [
  { correct: 5, reward: 300, label: 'Gran Premio' },
  { correct: 4, reward: 200, label: 'Podio' },
  { correct: 3, reward: 120, label: 'Puntos' },
  { correct: 2, reward: 70, label: 'Clasificado' },
  { correct: 1, reward: 30, label: 'Participación' },
  { correct: 0, reward: 10, label: 'Consolación' },
];

const THEME_BADGES = {
  'Fórmula 1 Histórica': { label: 'F1 HISTÓRICA', icon: '🏎️', border: 'border-blue-600', bg: 'bg-blue-950/80', text: 'text-blue-300' },
  'Scuderia Ferrari': { label: 'SCUDERIA FERRARI', icon: '🐎', border: 'border-red-600', bg: 'bg-red-950/80', text: 'text-red-300' },
  'JDM Legends (Initial D)': { label: 'JDM LEGENDS', icon: '🔰', border: 'border-zinc-500', bg: 'bg-zinc-800', text: 'text-zinc-200' },
  'WRC Championship': { label: 'WRC RALLY', icon: '🏁', border: 'border-amber-600', bg: 'bg-amber-950/80', text: 'text-amber-300' },
  'Porsche GT Team': { label: 'PORSCHE GT', icon: '🛡️', border: 'border-yellow-600', bg: 'bg-yellow-950/80', text: 'text-yellow-300' },
  'Spoon Team Racing': { label: 'SPOON RACING', icon: '⚡', border: 'border-yellow-500', bg: 'bg-yellow-950/80', text: 'text-yellow-300' },
  'Fast & Furious Heroes': { label: 'FAST & FURIOUS', icon: '💥', border: 'border-orange-600', bg: 'bg-orange-950/80', text: 'text-orange-300' },
  'Clásicos Urbanos 90s': { label: 'CLÁSICOS 90s', icon: '🚗', border: 'border-emerald-600', bg: 'bg-emerald-950/80', text: 'text-emerald-300' },
  'Enfierrados & 1/4 Milla': { label: '1/4 DE MILLA', icon: '🔥', border: 'border-red-700', bg: 'bg-red-950/80', text: 'text-red-300' },
};

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

  // Gameplay phases: 'INTRO' | 'PLAYING' | 'SUMMARY'
  const [gamePhase, setGamePhase] = useState('INTRO');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // [{ question_id, selected_index, is_correct, correct_index }]
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [countdownRemaining, setCountdownRemaining] = useState(0);

  const timerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  // Sync midnight countdown
  useEffect(() => {
    if (dailyTriviaStatus?.seconds_to_midnight) {
      setCountdownRemaining(dailyTriviaStatus.seconds_to_midnight);
    }
  }, [dailyTriviaStatus?.seconds_to_midnight]);

  // Live midnight countdown tick
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

  // Reset or initialize on open
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
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    }
  }, [isChallengesModalOpen]);

  // 20s active question timer
  useEffect(() => {
    if (gamePhase !== 'PLAYING') {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
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
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [gamePhase, currentQuestionIndex]);

  const questions = dailyTriviaStatus?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Auto-skip on timeout
  const handleTimeOut = () => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOption(-1);
    sound.playWrong();

    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [
      ...userAnswers,
      { 
        question_id: currentQ.id, 
        selected_index: -1, 
        is_correct: false,
        correct_index: currentQ.correct_index 
      }
    ];
    setUserAnswers(newAnswers);

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceOrFinish(newAnswers);
    }, 2800);
  };

  // Option clicked
  const handleSelectOption = (index) => {
    if (isAnswerLocked) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswerLocked(true);
    setSelectedOption(index);

    const isCorrect = currentQuestion && index === currentQuestion.correct_index;
    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [
      ...userAnswers,
      { 
        question_id: currentQ.id, 
        selected_index: index, 
        is_correct: isCorrect,
        correct_index: currentQ.correct_index 
      }
    ];
    setUserAnswers(newAnswers);

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceOrFinish(newAnswers);
    }, 2800);
  };

  // Manual advance button clicked (skip waiting 2.8s)
  const handleManualAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    advanceOrFinish(userAnswers);
  };

  const advanceOrFinish = async (currentAnswers) => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setGamePhase('SUMMARY');
      sound.playReward();
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
    setSelectedOption(null);
    setIsAnswerLocked(false);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isChallengesModalOpen) return null;

  const isAlreadyPlayedToday = dailyTriviaStatus?.played === true;
  const currentBadge = currentQuestion ? (THEME_BADGES[currentQuestion.category] || {
    label: currentQuestion.category,
    icon: '🏁',
    border: 'border-zinc-700',
    bg: 'bg-zinc-800',
    text: 'text-zinc-200'
  }) : null;

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden select-none">
      {/* Official Fondo Desafíos Wallpaper with Classic Gran Turismo Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-100"
        style={{ backgroundImage: `url('/fondo_desafios.webp'), url('/fondo_desafios.jpg')` }}
      />
      
      {/* Classic Matte Overlays: Carbon Weave + Dark Vignette */}
      <div className="absolute inset-0 carbon-pattern opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/85 to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />

      {/* Main Modal Window - Preguntados / Classic Arcade Console */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-xl bg-zinc-950/95 border-2 border-zinc-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 max-h-[94vh]"
      >
        {/* Top Header Bar - Clean Classic Bar */}
        <div className="px-4 sm:px-6 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-700/80 flex items-center justify-center text-red-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-racing text-sm sm:text-base text-white uppercase italic font-bold tracking-wider leading-none">
                DESAFÍO // <span className="text-amber-400">TRIVIA DIARIA</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                SPEEDCLUB RACING KNOWLEDGE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Credits */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-zinc-800 rounded-lg text-xs font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-bold font-racing">{racingCredits} CR</span>
            </div>

            <button
              onClick={closeChallengesModal}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {isLoadingTrivia && !finalResult ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-zinc-400 tracking-wider">
                CARGANDO PREGUNTAS DEL DÍA...
              </p>
            </div>
          ) : isAlreadyPlayedToday && gamePhase === 'INTRO' ? (
            /* =========================================================================
               STATE: ALREADY PLAYED TODAY (Clear, concise summary & countdown)
               ========================================================================= */
            <div className="flex flex-col items-center text-center py-6 px-2 sm:px-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-amber-500/70 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
                <Award className="w-8 h-8" />
              </div>

              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-700 px-3.5 py-1 rounded-full mb-3">
                ✓ DESAFÍO DE HOY COMPLETADO
              </span>

              <h2 className="font-racing text-2xl font-black italic uppercase text-white tracking-wide">
                ¡JORNADA FINALIZADA!
              </h2>

              <p className="text-xs font-mono text-zinc-400 max-w-sm mt-1">
                Ya has completado tu desafío de trivia por el día de hoy.
              </p>

              {/* Score pill */}
              <div className="mt-5 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 w-full max-w-sm flex items-center justify-around shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">ACIERTOS</span>
                  <span className="font-racing text-2xl font-black text-white italic">
                    {dailyTriviaStatus.score ?? 0} / 5
                  </span>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">RECOMPENSA</span>
                  <span className="font-racing text-2xl font-black text-amber-400 italic flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-400" />
                    +{dailyTriviaStatus.credits_awarded ?? 0} CR
                  </span>
                </div>
              </div>

              {/* Countdown box */}
              <div className="mt-5 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-700 w-full max-w-sm flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono font-bold">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>PRÓXIMO DESAFÍO EN:</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest bg-black/80 px-5 py-2 rounded-xl border border-zinc-800 mt-1">
                  {formatTime(countdownRemaining)}
                </div>
                <p className="text-[9px] font-mono text-zinc-400 text-center mt-1">
                  Reinicio diario oficial a las 23:59:59 horas.
                </p>
              </div>

              <div className="mt-6 w-full max-w-sm">
                <button
                  onClick={closeChallengesModal}
                  className="w-full py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-racing text-xs italic uppercase tracking-wider transition-colors cursor-pointer"
                >
                  VOLVER AL PADDOCK
                </button>
              </div>
            </div>
          ) : gamePhase === 'INTRO' ? (
            /* =========================================================================
               STATE: INTRO (Preguntados Style - Clear, visual, 0 clutter)
               ========================================================================= */
            <div className="flex flex-col items-center text-center py-4 px-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-zinc-900 to-black border-2 border-red-500/80 flex items-center justify-center text-white mb-3 shadow-xl">
                <Flame className="w-8 h-8 text-amber-400" />
              </div>

              <h2 className="font-racing text-2xl sm:text-3xl font-black italic uppercase text-white tracking-wide">
                TRIVIA DEL DÍA
              </h2>

              <p className="text-xs font-mono text-zinc-300 max-w-xs mt-1">
                Demuestra tus conocimientos de automovilismo y gana Créditos de Carrera.
              </p>

              {/* 3 Simple Stat Chips */}
              <div className="grid grid-cols-3 gap-2.5 my-6 w-full max-w-md">
                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center">
                  <Timer className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="font-racing text-xs font-bold text-white uppercase">20s</span>
                  <span className="text-[9px] font-mono text-zinc-400">Por pregunta</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center">
                  <HelpCircle className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="font-racing text-xs font-bold text-white uppercase">5 Preguntas</span>
                  <span className="text-[9px] font-mono text-zinc-400">Multitemática</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center">
                  <Trophy className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="font-racing text-xs font-bold text-amber-400 uppercase">+300 CR</span>
                  <span className="text-[9px] font-mono text-zinc-400">Premio máximo</span>
                </div>
              </div>

              {/* Mini reward scale pill */}
              <div className="w-full max-w-md p-3 rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-300 mb-6">
                <span className="font-bold text-zinc-400">TABLA DE PREMIOS:</span>
                <span className="text-amber-400 font-bold">5 = 300 CR</span>
                <span className="text-zinc-400">4 = 200 CR</span>
                <span className="text-zinc-400">3 = 120 CR</span>
              </div>

              {/* Big Red Action Button */}
              <button
                onClick={handleStartTrivia}
                disabled={!questions || questions.length === 0}
                className="w-full max-w-md py-4 px-6 rounded-2xl bg-red-700 hover:bg-red-600 active:scale-[0.98] border-2 border-red-500/80 text-white font-racing text-base font-black italic uppercase tracking-wider transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>¡COMENZAR DESAFÍO AHORA!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : gamePhase === 'PLAYING' && currentQuestion ? (
            /* =========================================================================
               STATE: PLAYING QUESTION (Preguntados Arcade UI)
               ========================================================================= */
            <div className="flex flex-col w-full py-1">
              
              {/* 1. Category Badge & Step Tracker */}
              <div className="flex flex-col items-center gap-2 mb-2">
                {/* Category Pill */}
                {currentBadge && (
                  <div className={`px-4 py-1 rounded-full border ${currentBadge.border} ${currentBadge.bg} ${currentBadge.text} flex items-center gap-2 text-xs font-racing font-bold tracking-wider shadow-sm uppercase`}>
                    <span className="text-sm">{currentBadge.icon}</span>
                    <span>{currentBadge.label}</span>
                  </div>
                )}

                {/* 5 Segmented Question Dots (Preguntados Style) */}
                <div className="flex items-center gap-2.5 mt-1">
                  {[0, 1, 2, 3, 4].map((step) => {
                    const ans = userAnswers[step];
                    const isCurrent = step === currentQuestionIndex && !isAnswerLocked;
                    const isAnswered = ans !== undefined;

                    return (
                      <div
                        key={step}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-racing text-xs font-black transition-all ${
                          isAnswered
                            ? ans.is_correct
                              ? 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-md'
                              : 'bg-red-700 text-white border-2 border-red-500 shadow-md'
                            : isCurrent
                            ? 'bg-zinc-900 text-amber-400 border-2 border-amber-400 ring-2 ring-amber-400/30 scale-110'
                            : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {isAnswered ? (
                          ans.is_correct ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />
                        ) : (
                          step + 1
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Big Arcade Countdown Dial & Bar */}
              <div className="flex flex-col items-center justify-center my-1.5">
                <div className={`px-4 py-1 rounded-full font-mono font-black text-sm sm:text-base tracking-widest flex items-center gap-1.5 border-2 transition-all ${
                  timeLeft <= 5 
                    ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                    : timeLeft <= 10 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                    : 'bg-zinc-900 text-white border-zinc-700'
                }`}>
                  <Timer className="w-4 h-4 text-current" />
                  <span>0:{String(timeLeft).padStart(2, '0')}</span>
                </div>

                {/* Smooth Countdown Tachometer Bar */}
                <div className="w-40 sm:w-56 h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(timeLeft / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Central Question Card (Spacious, Clear, Centered) */}
              <div className="my-3 sm:my-4 p-5 sm:p-7 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 min-h-[105px] flex items-center justify-center text-center shadow-inner">
                <h3 className="font-racing text-base sm:text-xl text-white font-bold leading-relaxed tracking-wide">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4. Four Large, Clear Answer Option Buttons */}
              <div className="space-y-2.5 sm:space-y-3 mb-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correct_index;
                  const showFeedback = isAnswerLocked;

                  let buttonStyle = 'bg-zinc-900/90 hover:bg-zinc-850 border-2 border-zinc-800 hover:border-zinc-600 text-zinc-100 hover:scale-[1.01] active:scale-[0.99]';
                  let badgeStyle = 'bg-zinc-800 text-zinc-300 border border-zinc-700';

                  if (showFeedback) {
                    if (isSelected && isCorrect) {
                      buttonStyle = 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-xl shadow-emerald-950/50 scale-[1.01]';
                      badgeStyle = 'bg-white text-emerald-700 font-black';
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = 'bg-red-700 border-2 border-red-500 text-white shadow-xl shadow-red-950/50';
                      badgeStyle = 'bg-white text-red-700 font-black';
                    } else if (!isSelected && isCorrect) {
                      buttonStyle = 'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200';
                      badgeStyle = 'bg-emerald-600 text-white font-black';
                    } else {
                      buttonStyle = 'bg-zinc-950/40 border-zinc-850 text-zinc-500 opacity-35';
                      badgeStyle = 'bg-zinc-900 text-zinc-600 border border-zinc-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerLocked}
                      className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl flex items-center gap-3.5 transition-all text-left ${buttonStyle} cursor-pointer`}
                    >
                      {/* Letter badge (A, B, C, D) */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-racing font-black text-sm shrink-0 transition-colors ${badgeStyle}`}>
                        {letters[idx]}
                      </div>

                      {/* Answer text */}
                      <span className="font-sans font-semibold text-sm sm:text-base flex-1 leading-snug">
                        {option}
                      </span>

                      {/* Feedback label */}
                      {showFeedback && (
                        <div className="shrink-0 flex items-center gap-1 font-racing text-xs font-bold uppercase tracking-wider">
                          {isSelected && isCorrect && (
                            <span className="text-white flex items-center gap-1 bg-emerald-700/90 px-2.5 py-1 rounded-lg border border-emerald-400">
                              <CheckCircle2 className="w-4 h-4" /> ¡CORRECTO!
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="text-white flex items-center gap-1 bg-red-800/90 px-2.5 py-1 rounded-lg border border-red-400">
                              <XCircle className="w-4 h-4" /> INCORRECTO
                            </span>
                          )}
                          {!isSelected && isCorrect && (
                            <span className="text-emerald-300 flex items-center gap-1 bg-emerald-900/90 px-2.5 py-1 rounded-lg border border-emerald-600">
                              <CheckCircle2 className="w-4 h-4" /> RESPUESTA CORRECTA
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 5. Instant Answer Feedback Banner & Manual Advance Button */}
              {isAnswerLocked && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 sm:p-3.5 rounded-2xl bg-zinc-900/95 border-2 border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-center sm:text-left">
                    {selectedOption === currentQuestion.correct_index ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-racing font-bold text-sm uppercase">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                        <span>¡RESPUESTA CORRECTA! (+1 ACIERTO)</span>
                      </div>
                    ) : selectedOption === -1 ? (
                      <div className="flex items-center gap-2 text-amber-400 font-racing font-bold text-sm uppercase">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                        <span>¡TIEMPO AGOTADO! NO SUMA PUNTOS</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400 font-racing font-bold text-sm uppercase">
                        <XCircle className="w-5 h-5 shrink-0 text-red-400" />
                        <span>RESPUESTA INCORRECTA</span>
                      </div>
                    )}
                  </div>

                  {/* Advance Button (Player can click instantly or wait for 2.8s auto-advance) */}
                  <button
                    onClick={handleManualAdvance}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 border border-red-500 text-white font-racing font-bold text-xs sm:text-sm uppercase italic tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
                  >
                    <span>{currentQuestionIndex + 1 < questions.length ? 'SIGUIENTE' : 'VER RESULTADOS'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          ) : gamePhase === 'SUMMARY' ? (
            /* =========================================================================
               STATE: SUMMARY & RESULTS SCREEN (Clean celebration)
               ========================================================================= */
            <div className="flex flex-col items-center py-2 px-1">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-amber-500/80 flex items-center justify-center text-amber-400 mb-2 shadow-xl">
                <Trophy className="w-8 h-8" />
              </div>

              <h3 className="font-racing text-2xl sm:text-3xl font-black italic uppercase text-white tracking-wide">
                ¡DESAFÍO COMPLETADO!
              </h3>

              {/* Score & Reward Pills */}
              <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-sm">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">ACIERTOS</span>
                  <span className="font-racing text-2xl font-black text-white italic">
                    {finalResult?.score ?? userAnswers.filter(a => a.is_correct).length} / 5
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900 border border-amber-700/80 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">PREMIO TOTAL</span>
                  <span className="font-racing text-2xl font-black text-amber-400 italic flex items-center gap-1.5">
                    <Coins className="w-5 h-5" />
                    +{finalResult?.credits_awarded ?? 0} CR
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800 px-3.5 py-1 rounded-full">
                ✓ {finalResult?.credits_awarded ?? 0} Créditos de Carrera acreditados en tu cuenta.
              </p>

              {/* Compact Review of the 5 Questions */}
              <div className="mt-4 w-full flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                {(finalResult?.breakdown || []).map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left ${
                      item.is_correct
                        ? 'bg-zinc-900/90 border-emerald-700/80'
                        : 'bg-zinc-900/90 border-red-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="font-racing text-xs text-white truncate">
                        {item.question}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                      item.is_correct
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : 'bg-red-950 text-red-400 border border-red-700'
                    }`}>
                      {item.is_correct ? 'CORRECTA' : 'INCORRECTA'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="mt-5 w-full max-w-sm">
                <button
                  onClick={closeChallengesModal}
                  className="w-full py-3.5 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-racing text-xs italic uppercase tracking-wider transition-colors cursor-pointer"
                >
                  VOLVER AL PADDOCK PRINCIPAL
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
