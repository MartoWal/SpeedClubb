import React from 'react';
import { useGarageStore } from '../store/useGarageStore';
import { 
  Trophy, 
  Users, 
  Gauge, 
  Activity, 
  Flame, 
  Ticket, 
  Box 
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function FooterTelemetry({ onTabClick }) {
  const { 
    unopenedCrates, 
    openPromoModal, 
    openCrateModal, 
    openTeamModal, 
    openChallengesModal 
  } = useGarageStore();

  const navItems = [
    { 
      id: 'codes', 
      label: 'CÓDIGOS', 
      icon: Ticket, 
      badge: 'PROMO',
      onClick: openPromoModal
    },
    { 
      id: 'containers', 
      label: 'CONTAINERS', 
      icon: Box, 
      badge: unopenedCrates > 0 ? `${unopenedCrates} LISTOS` : null,
      onClick: openCrateModal
    },
    { 
      id: 'team', 
      label: 'MI ESCUDERÍA', 
      icon: Users, 
      badge: null,
      onClick: openTeamModal
    },
    { 
      id: 'challenges', 
      label: 'DESAFÍOS', 
      icon: Trophy, 
      badge: 'DIARIOS',
      onClick: openChallengesModal
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-telemetry-950/95 border-t border-zinc-800/90 backdrop-blur-md">
      {/* Telemetry data strip */}
      <div className="hidden md:flex justify-between items-center px-6 py-1 bg-black/80 text-[10px] font-mono text-zinc-400 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Activity className="w-3 h-3 text-amber-400" />
            OIL TEMP: <strong className="text-white">92°C</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Flame className="w-3 h-3 text-amber-500" />
            TURBO BOOST: <strong className="text-white">1.85 BAR</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Gauge className="w-3 h-3 text-racing-red" />
            TOP SPEED: <strong className="text-white">367 KM/H</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">OFFICIAL PARTNERS:</span>
          <span className="font-racing italic tracking-wider text-zinc-300">PIRELLI</span>
          <span className="text-zinc-600">·</span>
          <span className="font-racing italic tracking-wider text-red-400">BREMBO</span>
          <span className="text-zinc-600">·</span>
          <span className="font-racing italic tracking-wider text-yellow-400">MOTUL</span>
          <span className="text-zinc-600">·</span>
          <span className="font-racing italic tracking-wider text-amber-400">SHELL V-POWER</span>
        </div>
      </div>

      {/* Main Console Nav Tabs (Panini Bottom Bar Redesigned) */}
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-around gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playSelect();
                if (item.onClick) {
                  item.onClick();
                } else if (onTabClick) {
                  onTabClick(item.id);
                }
              }}
              className="relative flex-1 py-2 px-2 sm:px-4 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 group flex items-center justify-center gap-2 select-none shadow-metallic cursor-pointer"
            >
              <Icon className="w-4 h-4 text-zinc-400 group-hover:text-racing-red transition-colors flex-shrink-0" />
              <span className="font-racing text-xs sm:text-sm text-zinc-200 group-hover:text-white uppercase italic tracking-wider">
                {item.label}
              </span>

              {item.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  item.badge === '!' 
                    ? 'bg-racing-red text-white' 
                    : 'bg-zinc-800 text-amber-300 border border-amber-600/40'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Red glow indicator on bottom */}
              <div className="absolute -bottom-px left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-racing-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </footer>
  );
}
