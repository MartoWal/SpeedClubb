import React from 'react';
import { Trophy, Flag } from 'lucide-react';

const trackRecords = [
  { year: '1989', event: 'Nürburgring Nordschleife', car: 'Ferrari F40 Competizione', record: '7:11.20' },
  { year: '1995', event: '24h Le Mans', car: 'McLaren F1 LM #59', record: '1° GENERAL' },
  { year: '1998', event: 'Rally Sanremo WRC', car: 'Subaru Impreza 22B', record: 'CAMPEÓN' },
  { year: '2000', event: 'Rally Monte Carlo', car: 'Lancer Evo VI TME', record: 'RÉCORD' },
  { year: '2002', event: 'Tsukuba Time Attack', car: 'Skyline R34 V-Spec', record: '55.82s' },
  { year: '2011', event: 'Nürburgring Nordschleife', car: 'Porsche GT3 RS 997', record: '7:18.00' },
];

export default function HallOfFameTable() {
  return (
    <div className="relative w-full h-[168px] sm:h-[188px] rounded-xl bg-zinc-900 border-2 border-zinc-700/80 p-2.5 flex flex-col justify-between overflow-hidden shadow-sm select-none">
      {/* Background Texture */}
      <div className="absolute inset-0 carbon-pattern opacity-30 pointer-events-none" />

      {/* Header Plaque */}
      <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-zinc-800 border border-amber-500/60 flex items-center justify-center text-amber-400">
            <Trophy className="w-3 h-3" />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-racing text-[11px] font-black text-amber-400 italic uppercase tracking-wider leading-none">
              SALÓN DE LA FAMA
            </h3>
            <span className="text-[8px] font-mono text-zinc-400 leading-none mt-0.5">
              RÉCORDS HISTÓRICOS FIA
            </span>
          </div>
        </div>
        <span className="text-[8px] font-mono text-amber-400 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-zinc-700">
          FIA GR.1
        </span>
      </div>

      {/* Records List (Compact to match exact card height) */}
      <div className="relative z-10 overflow-y-auto my-1 space-y-1 text-[9px] font-mono pr-1">
        {trackRecords.map((rec, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between py-0.5 px-1 rounded bg-black/40 border border-zinc-800/80 text-zinc-300"
          >
            <div className="flex items-center gap-1 truncate max-w-[140px]">
              <span className="font-bold text-amber-400">{rec.year}</span>
              <span className="text-white truncate font-semibold">{rec.car}</span>
            </div>
            <span className="font-display text-[8px] text-amber-400 font-bold whitespace-nowrap ml-1">
              {rec.record}
            </span>
          </div>
        ))}
      </div>

      {/* Plaque Footer */}
      <div className="relative z-10 pt-1 border-t border-zinc-800 flex items-center justify-between text-[7px] font-mono text-zinc-400">
        <span>TAG HEUER PADDOCK TELEMETRY</span>
        <span className="text-amber-400 font-bold">EDICIÓN 2026</span>
      </div>
    </div>
  );
}
