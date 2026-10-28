import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  X, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Target,
  Clock
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useGarageStore } from '../../store/useGarageStore';

export default function DailyChallengesModal() {
  const { 
    isChallengesModalOpen, 
    closeChallengesModal,
    pastedVehicles,
    inventory,
    completedChallenges,
    claimChallengeReward,
    enterGarageAlbum,
    openCrateModal
  } = useGarageStore();

  if (!isChallengesModalOpen) return null;

  const pastedCount = (pastedVehicles || []).length;
  const hasJdm = (pastedVehicles || []).some(v => v.category?.includes('JDM')) || 
                 (inventory || []).some(v => v.category?.includes('JDM'));

  const challengesList = [
    {
      id: 'daily_unboxing',
      title: 'Desempaque en Boxes',
      desc: 'Adquiere y abre al menos 1 sobre container común o premium.',
      reward: 100,
      current: 1,
      target: 1,
      isCompleted: true, // Completed as starter pilots start with crates
      actionText: 'ABRIR CONTAINERS',
      onAction: () => {
        closeChallengesModal();
        openCrateModal();
      }
    },
    {
      id: 'daily_paste_5',
      title: 'Pegado Oficial en Álbum',
      desc: 'Pega al menos 5 figuritas oficiales en tu álbum de colección.',
      reward: 200,
      current: Math.min(pastedCount, 5),
      target: 5,
      isCompleted: pastedCount >= 5,
      actionText: 'IR AL ÁLBUM',
      onAction: () => {
        closeChallengesModal();
        enterGarageAlbum();
      }
    },
    {
      id: 'daily_jdm_touge',
      title: 'Fiebre Touge JDM',
      desc: 'Consigue o colecciona al menos 1 leyenda japonesa (Initial D).',
      reward: 150,
      current: hasJdm ? 1 : 0,
      target: 1,
      isCompleted: hasJdm,
      actionText: 'VER GARAJE',
      onAction: () => {
        closeChallengesModal();
        enterGarageAlbum();
      }
    },
    {
      id: 'daily_telemetry_tv',
      title: 'Telemetría en Boxes',
      desc: 'Sintoniza transmisiones oficiales de sponsors en SpeedClub TV.',
      reward: 100,
      current: 1,
      target: 1,
      isCompleted: true,
      actionText: null
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 carbon-pattern opacity-25 pointer-events-none" />

      {/* Main Container Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative z-10 w-full max-w-xl bg-zinc-950 border-2 border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/60 flex items-center justify-center text-red-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-racing text-sm sm:text-base text-white uppercase italic font-bold tracking-wider">
                  DESAFÍOS DIARIOS DEL PADDOCK
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-red-950 text-red-300 border border-red-700 font-bold">
                  RENOVA CADA 24H
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                Cumple objetivos de competición para reclamar Créditos de Carrera (CR).
              </p>
            </div>
          </div>

          <button
            onClick={closeChallengesModal}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Challenges */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
          {challengesList.map((ch) => {
            const isClaimed = (completedChallenges || []).includes(ch.id);
            const canClaim = ch.isCompleted && !isClaimed;
            const pct = Math.round((ch.current / ch.target) * 100);

            return (
              <div
                key={ch.id}
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                  isClaimed
                    ? 'bg-zinc-950/60 border-zinc-800/80 opacity-70'
                    : canClaim
                    ? 'bg-zinc-900/90 border-emerald-600/80 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isClaimed
                        ? 'bg-zinc-800 text-zinc-500'
                        : canClaim
                        ? 'bg-emerald-950 border border-emerald-600 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Target className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-racing text-xs sm:text-sm text-white uppercase italic font-bold">
                        {ch.title}
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-400">
                        {ch.desc}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-zinc-700 shrink-0">
                    +{ch.reward} CR
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isClaimed
                          ? 'bg-zinc-600'
                          : canClaim
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 font-bold shrink-0">
                    {ch.current}/{ch.target}
                  </span>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] font-mono">
                  <span className="text-zinc-500">
                    {isClaimed ? 'Recompensa acreditada' : canClaim ? '¡Completado! Listo para reclamar' : 'En progreso'}
                  </span>

                  {isClaimed ? (
                    <span className="text-zinc-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      RECLAMADO
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => claimChallengeReward(ch.id, ch.reward)}
                      className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>RECLAMAR (+{ch.reward} CR)</span>
                    </button>
                  ) : ch.actionText ? (
                    <button
                      onClick={ch.onAction}
                      className="py-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-racing text-[10px] italic font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{ch.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={closeChallengesModal}
            className="py-1.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-racing text-xs italic uppercase transition-colors cursor-pointer"
          >
            CERRAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
