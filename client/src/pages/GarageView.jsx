import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../store/useGarageStore';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BookOpen
} from 'lucide-react';
import PageFlip from '../components/garage/PageFlip';
import SponsorsIndexPage from '../components/garage/SponsorsIndexPage';
import ThemePageSpread from '../components/garage/ThemePageSpread';
import HallOfFameTable from '../components/garage/HallOfFameTable';
import { sound } from '../utils/soundEffects';

export const pageTitles = [
  'ÍNDICE & SPONSORS',
  'CLÁSICOS URBANOS 90s',
  'JDM LEGENDS (INITIAL D)',
  'WRC CHAMPIONSHIP',
  'PORSCHE GT TEAM',
  'SCUDERIA FERRARI',
  'FÓRMULA 1 HISTÓRICA',
  'SPOON TEAM RACING',
  'FAST & FURIOUS HEROES',
  'ENFIERRADOS & 1/4 MILLA',
];

export const THEMES_DATA = [
  {
    id: 'clasicos',
    pageIndex: 1,
    title: 'CLÁSICOS URBANOS 90s',
    subtitle: 'HOT-HATCHES & LEYENDAS DE CALLE NACIONALES Y EUROPEAS',
    pageLeftNum: '01',
    pageRightNum: '02',
    bgImage: '/assets/backgrounds/Fondos-clasicos-90s/fondo-clasicos-90s.jpg',
    categoryName: 'Clásicos Urbanos 90s',
    leftLore: {
      badge: 'HOMOLOGACIÓN GR.1',
      title: 'HOT-HATCHES DE LOS 90s',
      desc: 'Torino 380W, Falcon Sprint, Clio Williams y Fiat 128 IAVA: Motores preparados, carburadores Weber y chasis aligerados.',
      footer: 'REGLAMENTO ANEXO J // SPEEDCLUB'
    },
    rightLore: {
      badge: 'TURISMO CARRETERA',
      title: 'GLORIAS DEL ASFALTO',
      desc: 'Potencia pura y aceleración directa sin ayudas electrónicas. La época dorada del automovilismo deportivo puro.',
      footer: 'CIRCUITOS HISTÓRICOS & NÜRBURGRING'
    }
  },
  {
    id: 'jdm',
    pageIndex: 2,
    title: 'JDM LEGENDS (INITIAL D)',
    subtitle: 'TOUGE DRIFT DIVISION & HIGH-RPM ATTACK (GUNMA)',
    pageLeftNum: '03',
    pageRightNum: '04',
    bgImage: '/assets/backgrounds/fondos-INITIAL-D/Fondo-Initial-D-Supra-RX7.jpg',
    categoryName: 'JDM Legends (Initial D)',
    leftLore: {
      badge: 'AKINA DOWNHILL',
      title: 'TAKUMI & 4A-GE 11.000 RPM',
      desc: 'Reparto de pesos 50:50, motor atmosférico de Grupo A de competición con técnica de inercia y canaleta.',
      footer: 'FUJIWARA TOFU SHOP // GUNMA'
    },
    rightLore: {
      badge: 'REDSUNS ROTARY & 2JZ',
      title: 'TWIN TURBO SEQUENTIAL',
      desc: 'Mazda RX-7 FD3S biturbo rotativo 13B y Supra 2JZ-GTE. La cima absoluta de la ingeniería automotriz japonesa.',
      footer: 'PROJECT D // SPEEDSTARS'
    }
  },
  {
    id: 'wrc',
    pageIndex: 3,
    title: 'WRC CHAMPIONSHIP',
    subtitle: 'GRUPO A, B & MONSTRUOS DEL RALLY MUNDIAL FIA',
    pageLeftNum: '05',
    pageRightNum: '06',
    bgImage: '/assets/backgrounds/Fondos-WRC/fondo-WRC-cars.jpg',
    categoryName: 'WRC Championship',
    leftLore: {
      badge: 'FIA WORLD RALLY',
      title: 'TRACCIÓN TOTAL PERMANENTE',
      desc: 'Subaru Impreza WRC98 y Lancia Delta HF Integrale Martini: Dominio absoluto sobre nieve, asfalto y grava con diferenciales activos.',
      footer: 'DIFERENCIAL ACTIVO DCCD // MARTINI RACING'
    },
    rightLore: {
      badge: 'GRUPO B LEGENDS',
      title: 'AUDI SPORT QUATTRO S1',
      desc: '5 cilindros turbo con más de 500 HP y válvula wastegate soplada. La era más salvaje e indomable de la historia del rally.',
      footer: '0 A 100 EN 3.1s // SANREMO & MONTE CARLO'
    }
  },
  {
    id: 'porsche',
    pageIndex: 4,
    title: 'PORSCHE GT TEAM',
    subtitle: 'STUTTGART MOTORSPORT HERITAGE & WEISSACH ENGINEERING',
    pageLeftNum: '07',
    pageRightNum: '08',
    bgImage: '/assets/backgrounds/Fondos-Porsche-Team/Fondo-Porsche-Team-Oficial.jfif',
    categoryName: 'Porsche GT Team',
    leftLore: {
      badge: 'WEISSACH DEVELOPMENT',
      title: 'CARRERA GT // V10 SOUNDTRACK',
      desc: 'Monocasco de fibra de carbono puro y embrague cerámico PCCC. 612 HP atmosféricos derivados de prototipos Le Mans.',
      footer: 'ATMOSFÉRICO 5.7L V10 // 8.400 RPM'
    },
    rightLore: {
      badge: 'LE MANS WINNERS',
      title: '917K & 930 TURBO WIDOWMAKER',
      desc: 'El mítico 917K con motor boxer de 12 cilindros refrigerado por turbina y el salvaje 930 Turbo sin control de tracción.',
      footer: 'CIRCUIT DE LA SARTHE // RÉCORD HISTÓRICO'
    }
  },
  {
    id: 'ferrari',
    pageIndex: 5,
    title: 'SCUDERIA FERRARI',
    subtitle: 'IL CAVALLINO RAMPANTE // PURA RAZA DE MARANELLO',
    pageLeftNum: '09',
    pageRightNum: '10',
    bgImage: '/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp',
    categoryName: 'Scuderia Ferrari',
    leftLore: {
      badge: 'MARANELLO DNA',
      title: 'F40 & ENZO V12',
      desc: 'El F40 Competizione: último coche aprobado personalmente por Enzo Ferrari. Carrocería de kevlar y biturbo salvaje.',
      footer: 'CIRCUITO DI FIORANO // TEST BENCH'
    },
    rightLore: {
      badge: 'GRAN TURISMO OMOLOGATA',
      title: 'DE LA TESTAROSSA AL LAFERRARI',
      desc: 'Testarossa Edición Maradona y la tecnología híbrida V6 biturbo del 296 GTB. Excelencia italiana en cada cilindro.',
      footer: 'CORSE CLIENTI // SCUDERIA PROTOCOL'
    }
  },
  {
    id: 'f1',
    pageIndex: 6,
    title: 'FÓRMULA 1 HISTÓRICA',
    subtitle: 'LA CÚSPIDE DE LA VELOCIDAD // CAMPEONES MUNDIALES FIA',
    pageLeftNum: '11',
    pageRightNum: '12',
    bgImage: '/assets/backgrounds/Fondos-F1/Fondo-F1.jfif',
    categoryName: 'Fórmula 1 Histórica',
    leftLore: {
      badge: 'CAMPEONES DEL MUNDO',
      title: 'SENNA, FANGIO & SCHUMACHER',
      desc: 'El McLaren MP4/4 turbo de Senna, la Flecha de Plata W196 de Fangio y la Scuderia F2004 V10 de Schumacher.',
      footer: 'MONACO, MONZA & SILVERSTONE'
    },
    rightLore: {
      badge: 'INNOVACIÓN EXTREMA',
      title: 'DE LOS 6 RUEDAS AL V10 R25',
      desc: 'El Tyrrell P34 de seis ruedas y el legendario V10 del Renault R25 de Fernando Alonso superando las 20.000 RPM.',
      footer: 'MÁXIMA CATEGORÍA FIA // 350+ KM/H'
    }
  },
  {
    id: 'spoon',
    pageIndex: 7,
    title: 'SPOON TEAM RACING',
    subtitle: 'TYPE-R VTEC & BLUE/YELLOW TSUKUBA TIME ATTACK',
    pageLeftNum: '13',
    pageRightNum: '14',
    bgImage: '/assets/backgrounds/Fondos-Spoon-team/Fondo-Spoo-Racing.jfif',
    categoryName: 'Spoon Team Racing',
    leftLore: {
      badge: 'TATSURU ICHISHIMA',
      title: 'FILOSOFÍA TOTAL BALANCE',
      desc: 'Motores B16B y B18C balanceados al gramo a mano. Reducción de peso extrema y respuesta milimétrica del acelerador.',
      footer: 'VTEC ENGAGEMENT // 5.800 RPM'
    },
    rightLore: {
      badge: 'TSUKUBA ATTACK',
      title: 'S2000 & NSX-R MONOCOQUE',
      desc: 'Diferenciales autoblocantes mecánicos 1.5-way y pinzas monoblock Spoon de 4 pistones en aluminio forjado.',
      footer: 'SPOON SPORTS CO., LTD. // TOKYO'
    }
  },
  {
    id: 'ff',
    pageIndex: 8,
    title: 'FAST & FURIOUS HEROES',
    subtitle: '1/4 DE MILLA, ÓXIDO NITROSO & REYES DE LA CALLE',
    pageLeftNum: '15',
    pageRightNum: '16',
    bgImage: '/assets/backgrounds/Fondos-F&F/mitsubishi-eclipse-F&F.jpg',
    categoryName: 'Fast & Furious Heroes',
    leftLore: {
      badge: 'BRIAN O’CONNER SPEC',
      title: 'R34 GT-R & SUPRA MK4 2JZ',
      desc: 'Computadora de telemetría a bordo, botella doble de NOS y preparación mecánica de 10 segundos en el cuarto de milla.',
      footer: '"VIVO MI VIDA UN CUARTO DE MILLA A LA VEZ"'
    },
    rightLore: {
      badge: 'DOM TORETTO CHARGER',
      title: '426 HEMI SUPERCHARGER',
      desc: 'Blower BDS sobre el capó, chasis reforzado para absorber el torque brutal que levanta las ruedas delanteras en la largada.',
      footer: '900 HP // SALIDA EN DOS RUEDAS'
    }
  },
  {
    id: 'enfierrados',
    pageIndex: 9,
    title: 'ENFIERRADOS & 1/4 MILLA',
    subtitle: 'PICADAS DEL GÁLVEZ, ESCAPE LIBRE & MOTORES FORJADOS',
    pageLeftNum: '17',
    pageRightNum: '18',
    bgImage: '/assets/backgrounds/Fondos-Enfierrados/Fondo-enfierrados-web.jpg',
    categoryName: 'Enfierrados & 1/4 Milla',
    leftLore: {
      badge: 'AUTÓDROMO GÁLVEZ',
      title: 'GOL TURBO & 128 IAVA DE PISTA',
      desc: 'Bielas forjadas Saenz, turbina Master Power a 2.2 bar y largador con launch control 2-step.',
      footer: 'CATEGORÍA LIBRE // 1/4 DE MILLA'
    },
    rightLore: {
      badge: 'STAGE 3 FORJADO',
      title: 'FIAT UNO & BORA 1.8T STAGE 3',
      desc: 'Inyección secuencial FuelTech FT550, escape de 3 pulgadas en acero inoxidable con salida al capó.',
      footer: 'ANTI-LAG SISTEMA // FUEGO POR EL ESCAPE'
    }
  }
];

export default function GarageView() {
  const { 
    catalog, 
    pastedVehicles, 
    inventory, 
    garagePageIndex, 
    setGaragePageIndex, 
    exitGarageAlbum,
    pasteVehicle,
    addVehicleToInventory
  } = useGarageStore();

  const [direction, setDirection] = useState(0);
  const [toast, setToast] = useState(null);

  const pastedIds = new Set(pastedVehicles.map(v => v.id));
  const inventoryMap = new Map(inventory.map(i => [i.id, i.count]));

  const showToast = (message, type = 'info', action = null) => {
    setToast({ message, type, action });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handlePrevPage = () => {
    if (garagePageIndex > 0) {
      sound.playPageTurn();
      setDirection(-1);
      setGaragePageIndex(garagePageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (garagePageIndex < pageTitles.length - 1) {
      sound.playPageTurn();
      setDirection(1);
      setGaragePageIndex(garagePageIndex + 1);
    }
  };

  // Keyboard navigation for realistic book page turning (Arrow Left / Arrow Right)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [garagePageIndex]);

  const handleSlotPasteClick = async (vehicle) => {
    const res = await pasteVehicle(vehicle.id);
    if (res.success) {
      showToast(`¡${vehicle.name} estampado exitosamente en tu Garaje!`, 'success');
    } else if (res.reason === 'ALREADY_PASTED') {
      showToast(`${vehicle.name} ya se encuentra fijado en su casillero.`, 'info');
    } else if (res.reason === 'NOT_IN_INVENTORY') {
      showToast(
        `No posees copias de "${vehicle.name}" en tu inventario.`,
        'warning',
        {
          label: 'Añadir 1 copia y Pegar',
          onClick: async () => {
            addVehicleToInventory(vehicle.id);
            setTimeout(async () => {
              const retry = await pasteVehicle(vehicle.id);
              if (retry.success) {
                showToast(`¡${vehicle.name} agregado y pegado con éxito!`, 'success');
              }
            }, 100);
          }
        }
      );
    }
  };

  const completionPct = Math.round((pastedVehicles.length / catalog.length) * 100);

  // Active theme background image from "Fondos e imagenes de diseño para la pagina"
  const currentBgImage = garagePageIndex === 0 
    ? '/assets/backgrounds/paddock_main.jpg'
    : THEMES_DATA[garagePageIndex - 1]?.bgImage || '/assets/backgrounds/paddock_main.jpg';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col justify-between text-white select-none overflow-hidden pb-4 bg-zinc-950">
      
      {/* ============================================================ */}
      {/* THEMED ATMOSPHERIC BACKGROUND (HIGH VISIBILITY & BRIGHTNESS) */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBgImage}
            src={currentBgImage}
            alt="Album Thematic Background"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.06] saturate-[1.12]"
          />
        </AnimatePresence>
        {/* Soft, Light Shading (Preserves full image brightness and clarity) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      {/* Top Header Console */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-2.5 flex items-center justify-between bg-zinc-950/90 border-b border-zinc-800 backdrop-blur-md">
        {/* Back Button */}
        <button
          onMouseEnter={() => sound.playHover()}
          onClick={() => {
            sound.playSelect();
            exitGarageAlbum();
          }}
          className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-zinc-900/90 hover:bg-racing-red border border-zinc-700 hover:border-red-500 text-zinc-200 hover:text-white transition-all shadow-md group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-black/80 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
          <span className="font-racing text-xs italic font-bold uppercase tracking-wider hidden sm:inline">
            VOLVER AL PADDOCK
          </span>
        </button>

        {/* Center Album Title & Active Page Indicator */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <h1 className="font-racing text-base sm:text-lg text-white italic font-black uppercase tracking-wide">
              TU GARAJE // <span className="text-racing-red">ÁLBUM DE COLECCIÓN</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 font-bold">
              EDICIÓN 2026
            </span>
          </div>
          {/* Active Book Section Indicator Ribbon */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-2 py-0.2 rounded bg-black/60 border border-zinc-700 text-[9px] font-mono text-zinc-300 font-bold">
              {garagePageIndex === 0 ? 'PORTADA' : `PÁG. ${garagePageIndex} DE 9`}
            </span>
            <span className="font-racing text-xs text-amber-400 italic font-black uppercase tracking-wider">
              {pageTitles[garagePageIndex]}
            </span>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[9px] font-mono text-zinc-400 uppercase">PROGRESO DEL ÁLBUM</span>
            <span className="font-racing text-sm text-amber-400 font-bold italic leading-none">
              {pastedVehicles.length} / {catalog.length} VEHÍCULOS
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-700 text-white font-racing text-xs font-black italic shadow-md border border-emerald-500">
            {completionPct}%
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
                : toast.type === 'warning'
                ? 'bg-zinc-900 border-amber-500 text-amber-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
            <span className="text-xs font-mono font-medium">{toast.message}</span>

            {toast.action && (
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playSelect();
                  toast.action.onClick();
                  setToast(null);
                }}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-racing text-[10px] italic font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ml-1"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MAIN OPEN BOOK STAGE WITH LATERAL ARROW BUTTONS              */}
      {/* ============================================================ */}
      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-3 flex-1 w-full flex items-center justify-center">
        
        {/* LATERAL BUTTON: PÁGINA ANTERIOR (LEFT ARROW) */}
        <button
          onClick={handlePrevPage}
          disabled={garagePageIndex === 0}
          onMouseEnter={() => sound.playHover()}
          className={`group absolute left-1 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-20 sm:w-12 sm:h-28 lg:w-14 lg:h-32 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
            garagePageIndex === 0
              ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600 opacity-20 cursor-not-allowed'
              : 'bg-zinc-950/85 hover:bg-zinc-900 border-zinc-700/80 hover:border-amber-400 text-zinc-300 hover:text-white shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:scale-105 active:scale-95'
          }`}
          title={garagePageIndex > 0 ? `Página Anterior: ${pageTitles[garagePageIndex - 1]}` : ''}
          aria-label="Página Anterior"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden xl:inline text-[8px] font-racing italic font-bold uppercase text-zinc-400 group-hover:text-amber-400 tracking-tighter mt-1">
            ANT
          </span>
        </button>

        {/* Realistic Book Open Spread Wrapper */}
        <div className="w-full max-w-6xl">
          <PageFlip pageKey={garagePageIndex} direction={direction}>
            
            {/* PÁGINA 0: PORTADA INTERNA (SPONSORS E ÍNDICE) */}
            {garagePageIndex === 0 && (
              <SponsorsIndexPage 
                onNavigateToPage={(targetPage) => {
                  sound.playPageTurn();
                  setDirection(1);
                  setGaragePageIndex(targetPage);
                }}
                pastedVehicles={pastedVehicles}
                catalog={catalog}
              />
            )}

            {/* PÁGINAS 1 A 9: LAS 9 TEMÁTICAS OFICIALES CON LIBRO ABIERTO */}
            {garagePageIndex >= 1 && garagePageIndex <= 9 && (() => {
              const currentTheme = THEMES_DATA[garagePageIndex - 1];
              const themeVehicles = catalog.filter(c => c.category === currentTheme.categoryName);
              return (
                <ThemePageSpread
                  theme={currentTheme}
                  vehicles={themeVehicles}
                  pastedIds={pastedIds}
                  inventoryMap={inventoryMap}
                  onSlotPasteClick={handleSlotPasteClick}
                  customRightComponent={garagePageIndex === 1 ? <HallOfFameTable /> : null}
                />
              );
            })()}

          </PageFlip>
        </div>

        {/* LATERAL BUTTON: PÁGINA SIGUIENTE (RIGHT ARROW) */}
        <button
          onClick={handleNextPage}
          disabled={garagePageIndex === pageTitles.length - 1}
          onMouseEnter={() => sound.playHover()}
          className={`group absolute right-1 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-20 sm:w-12 sm:h-28 lg:w-14 lg:h-32 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
            garagePageIndex === pageTitles.length - 1
              ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600 opacity-20 cursor-not-allowed'
              : 'bg-zinc-950/85 hover:bg-zinc-900 border-zinc-700/80 hover:border-amber-400 text-zinc-300 hover:text-white shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:scale-105 active:scale-95'
          }`}
          title={garagePageIndex < pageTitles.length - 1 ? `Página Siguiente: ${pageTitles[garagePageIndex + 1]}` : ''}
          aria-label="Página Siguiente"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 group-hover:translate-x-1 transition-transform" />
          <span className="hidden xl:inline text-[8px] font-racing italic font-bold uppercase text-zinc-400 group-hover:text-amber-400 tracking-tighter mt-1">
            SIG
          </span>
        </button>

      </main>

    </div>
  );
}
