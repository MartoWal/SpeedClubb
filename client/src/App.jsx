import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGarageStore } from './store/useGarageStore';

import NavbarTelemetry from './components/NavbarTelemetry';
import LoginScreen from './pages/LoginScreen';
import ConnectingScreen from './pages/ConnectingScreen';
import GarageAssemblyScreen from './pages/GarageAssemblyScreen';
import RewardModal from './pages/RewardModal';
import DashboardScreen from './pages/DashboardScreen';
import GarageView from './pages/GarageView';
import ContainerUnboxingModal from './components/dashboard/ContainerUnboxingModal';
import TeamFleetModal from './components/dashboard/TeamFleetModal';
import SpeedClubTvModal from './components/sponsors/SpeedClubTvModal';
import SpeedClubTvScreen from './pages/SpeedClubTvScreen';
import TradeMarketModal from './components/trades/TradeMarketModal';
import PromoCodesModal from './components/telemetry/PromoCodesModal';
import DailyChallengesModal from './components/telemetry/DailyChallengesModal';

export default function App() {
  const { currentScreen, setCurrentScreen } = useGarageStore();

  React.useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#login' || window.location.search.includes('login')) {
        setCurrentScreen('LOGIN');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setCurrentScreen]);

  return (
    <div className="relative min-h-screen w-full flex flex-col font-telemetry selection:bg-racing-red selection:text-white bg-zinc-950">
      {/* Dynamic Background System */}
      {currentScreen === 'DASHBOARD' ? (
        <div 
          className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none transition-all duration-700"
          style={{ 
            backgroundImage: `url('/assets/backgrounds/gt7_main_dashboard.jpg')`,
            backgroundAttachment: 'fixed',
            backgroundColor: '#05070d',
          }}
        >
          {/* Subtle GT7 cinematic vignette overlay to maintain high contrast for the dashboard stations */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/25 to-black/75 pointer-events-none" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
      ) : currentScreen === 'GARAGE_VIEW' ? (
        /* GarageView renders its own theme-specific background (WRC, Lamborghini, Ferrari, etc.) */
        null
      ) : (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none opacity-20 filter invert"
            style={{ 
              backgroundImage: `url('/assets/backgrounds/fondo_marcas_blanco.jpg')`,
              backgroundAttachment: 'fixed',
              backgroundColor: '#090a0f',
            }}
          />
          {/* Dark matte ambient layer for classic racing contrast (eliminates high glare) */}
          <div className="fixed inset-0 bg-gradient-to-b from-zinc-950/90 via-black/85 to-zinc-950 pointer-events-none z-0" />
        </>
      )}

      {/* Top Telemetry Console Bar (Strictly hidden on Login & SpeedClub TV screens) */}
      {currentScreen !== 'LOGIN' && currentScreen !== 'SPEEDCLUB_TV' && (
        <div className="relative z-40 w-full">
          <NavbarTelemetry />
        </div>
      )}

      {/* Main View Transition Container */}
      <div className="relative z-10 flex-1 w-full overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {currentScreen === 'LOGIN' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 w-full"
            >
              <LoginScreen />
            </motion.div>
          )}

          {currentScreen === 'CONNECTING' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 w-full"
            >
              <ConnectingScreen />
            </motion.div>
          )}

          {currentScreen === 'ASSEMBLY' && (
            <motion.div
              key="assembly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 w-full"
            >
              <GarageAssemblyScreen />
            </motion.div>
          )}

          {currentScreen === 'REWARD' && (
            <motion.div
              key="reward"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full relative"
            >
              {/* Dashboard in background with blur for depth */}
              <div className="filter blur-sm pointer-events-none opacity-40">
                <DashboardScreen />
              </div>
              <RewardModal onClose={() => setCurrentScreen('DASHBOARD')} />
            </motion.div>
          )}

          {currentScreen === 'DASHBOARD' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex-1 w-full"
            >
              <DashboardScreen />
            </motion.div>
          )}

          {currentScreen === 'GARAGE_VIEW' && (
            <motion.div
              key="garage-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex-1 w-full"
            >
              <GarageView />
            </motion.div>
          )}

          {currentScreen === 'SPEEDCLUB_TV' && (
            <motion.div
              key="speedclub-tv"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 w-full"
            >
              <SpeedClubTvScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Container Unboxing / Envelope Opening Modal */}
      <ContainerUnboxingModal />

      {/* Global "Mi Escudería" Fleet & Figurines Showcase Modal */}
      <TeamFleetModal />

      {/* Global SpeedClub TV / Paddock Broadcast Forum Modal */}
      <SpeedClubTvModal />

      {/* Global Paddock Trade / Intercambio de Figuritas Modal */}
      <TradeMarketModal />

      {/* Global Promo Codes Redemption Modal */}
      <PromoCodesModal />

      {/* Global Daily Challenges / Missions Modal */}
      <DailyChallengesModal />
    </div>
  );
}
