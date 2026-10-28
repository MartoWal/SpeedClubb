import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Box, 
  ArrowRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useGarageStore } from '../../store/useGarageStore';

const PRESET_CODES = [
  { code: 'SPEED2026', reward: '+200 CR & 1 Container Común', desc: 'Bono oficial de Temporada 2026' },
  { code: 'PADDOCKVIP', reward: '+500 CR & 1 Container VIP Oro', desc: 'Acceso de telemetría VIP Paddock' },
  { code: 'AYRTON100', reward: '+100 CR', desc: 'Homenaje Ayrton Senna' },
  { code: 'FERRARI4K', reward: '+150 CR', desc: 'Bono especial Scuderia Ferrari' },
  { code: 'WRC2026', reward: '+150 CR & 1 Container Común', desc: 'Pack especial Rally Mundial FIA' }
];

export default function PromoCodesModal() {
  const { 
    isPromoModalOpen, 
    closePromoModal, 
    redeemedCodes, 
    redeemPromoCode 
  } = useGarageStore();

  const [inputCode, setInputCode] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPromoModalOpen) return null;

  const handleRedeem = async (codeToUse = null) => {
    const target = codeToUse || inputCode;
    if (!target || !target.trim()) {
      setFeedback({ type: 'error', message: 'Por favor ingresa un código promocional.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    const res = await redeemPromoCode(target);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setInputCode('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 carbon-pattern opacity-25 pointer-events-none" />

      {/* Main Container Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative z-10 w-full max-w-lg bg-zinc-950 border-2 border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/60 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-racing text-sm sm:text-base text-white uppercase italic font-bold tracking-wider">
                CANJE DE CÓDIGOS // PROMO CODES
              </h3>
              <p className="text-[10px] font-mono text-zinc-400">
                Ingresa tus códigos promocionales oficiales de SpeedClub y sponsors.
              </p>
            </div>
          </div>

          <button
            onClick={closePromoModal}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          
          {/* Input Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-zinc-400 font-bold uppercase">
              CÓDIGO DE CUPÓN / PROMOCIONAL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="EJ: SPEED2026"
                className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900 border-2 border-zinc-700 focus:border-amber-500 text-white font-racing tracking-widest text-sm uppercase outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRedeem();
                }}
              />
              <button
                onClick={() => handleRedeem()}
                disabled={isSubmitting || !inputCode.trim()}
                className={`py-2.5 px-4 rounded-xl font-racing text-xs italic font-black uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5 ${
                  inputCode.trim() && !isSubmitting
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 opacity-60'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>CANJEAR</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : 'bg-red-950/80 border-red-700 text-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </motion.div>
          )}

          {/* Quick Preset Hints */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
              CÓDIGOS DISPONIBLES DE TEMPORADA (CLICK PARA RELLENAR):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_CODES.map((item) => {
                const isRedeemed = (redeemedCodes || []).includes(item.code);
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      if (!isRedeemed) {
                        sound.playSelect();
                        setInputCode(item.code);
                      }
                    }}
                    disabled={isRedeemed}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isRedeemed
                        ? 'bg-zinc-900/50 border-zinc-800/80 opacity-50 cursor-not-allowed'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 hover:border-amber-500/70 cursor-pointer shadow-sm group'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-racing font-bold mb-0.5">
                      <span className={isRedeemed ? 'text-zinc-500 line-through' : 'text-amber-300 group-hover:text-amber-200'}>
                        {item.code}
                      </span>
                      {isRedeemed ? (
                        <span className="text-[8px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800">
                          YA CANJEADO
                        </span>
                      ) : (
                        <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </div>
                    <span className="text-[9.5px] font-mono text-zinc-300 font-bold">
                      {item.reward}
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 truncate mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer close */}
          <div className="pt-2 border-t border-zinc-800 flex justify-end">
            <button
              onClick={closePromoModal}
              className="py-1.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-racing text-xs italic uppercase transition-colors cursor-pointer"
            >
              CERRAR
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
