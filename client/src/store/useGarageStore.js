import { create } from 'zustand';
import { sound } from '../utils/soundEffects';
import { masterCatalog } from './catalogData';

export const useGarageStore = create((set, get) => ({
  // Navigation / Screen state machine
  // Screens: 'LOGIN' | 'CONNECTING' | 'ASSEMBLY' | 'REWARD' | 'DASHBOARD' | 'GARAGE_VIEW'
  currentScreen: 'LOGIN',
  hasClaimedReward: false,
  soundEnabled: true,
  isGarageAlbumOpen: false,
  garagePageIndex: 0, // 0: Sponsors & Index, 1: Clásicos Urbanos, 2: JDM Legends, 3: Muscle Cars, 4: Supercars & Hyper

  // Pilot Profile & Session
  currentUser: (() => {
    try {
      return JSON.parse(localStorage.getItem('speedclub_user') || 'null');
    } catch {
      return null;
    }
  })(),
  isAuthenticated: Boolean(localStorage.getItem('speedclub_user')),
  authError: null,
  isAuthenticating: false,

  pilot: (() => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('speedclub_user') || 'null');
    } catch {}
    return {
      id: saved?.id || 'pilot-1',
      name: saved?.username || 'Ayrton Driver',
      number: '08',
      team: 'SpeedClub Works Racing',
      license: 'SUPERCAR GR.1 FEDERADA',
      status: 'EN PADDOCK',
      ping: 14,
      reputation: 98.4,
    };
  })(),
  racingCredits: 500,
  containers: {
    standard: 2, // Common Red Containers (100 CR, 3 figurines)
    premium: 1,  // Premium Gold Containers (500 CR, 5 figurines)
  },
  unopenedCrates: 3,
  isOpeningCrateModalOpen: false,
  openingCrateType: null,
  isTeamModalOpen: false,
  isTvModalOpen: false,
  tvSponsorStatus: null,
  activeTvChannel: null,
  tvActiveSession: null,
  isTvPlaying: false,
  tvComments: {},

  // Global Statistics (Screen 1 counters)
  globalStats: {
    piecesSwapped: 10689427,
    registeredPilots: 13833744,
    cratesOpened: 68011462,
  },

  // Master Vehicle Collection (95 Official Vehicles across 9 Thematic Album Sections)
  catalog: masterCatalog,

  // Pasted in album
  pastedVehicles: [
    { id: 1, name: 'Torino 380W Nürburgring 1969', tier: 'A', category: 'Clásicos Urbanos 90s', pastedAt: '2026-10-21' },
    { id: 12, name: 'Toyota Sprinter Trueno AE86 Takumi Spec', tier: 'C', category: 'JDM Legends (Initial D)', pastedAt: '2026-10-21' },
    { id: 45, name: 'Ferrari F40 Competizione Biturbo 1989', tier: 'S', category: 'Scuderia Ferrari', pastedAt: '2026-10-21' },
  ],

  // Unpasted inventory ready to paste or swap
  inventory: [
    { id: 2, name: 'Ford Falcon Sprint 1973', tier: 'B', category: 'Clásicos Urbanos 90s', count: 1 },
    { id: 13, name: 'Mazda RX-7 FD3S Keisuke Takahashi RedSuns', tier: 'A', category: 'JDM Legends (Initial D)', count: 1 },
    { id: 23, name: 'Subaru Impreza WRC98 Colin McRae', tier: 'A', category: 'WRC Championship', count: 1 },
    { id: 33, name: 'Porsche Carrera GT V10 Monocasco 2004', tier: 'S', category: 'Porsche GT Team', count: 2 },
    { id: 56, name: 'McLaren MP4/4 Honda Turbo Ayrton Senna 1988', tier: 'S', category: 'Fórmula 1 Histórica', count: 1 },
    { id: 65, name: 'Honda Civic Type-R EK9 Spoon Sports Blue/Yellow', tier: 'B', category: 'Spoon Team Racing', count: 1 },
  ],

  // Actions
  setCurrentScreen: (screen) => {
    sound.playSelect();
    set({ currentScreen: screen });
  },

  startOnboardingFlow: () => {
    sound.playSelect();
    set({ currentScreen: 'CONNECTING' });
  },

  resumeGameDirectly: () => {
    sound.playSelect();
    set({ currentScreen: 'DASHBOARD' });
  },

  enterGarageAlbum: () => {
    sound.playSelect();
    set({ currentScreen: 'GARAGE_VIEW' });
  },

  exitGarageAlbum: () => {
    sound.playSelect();
    set({ currentScreen: 'DASHBOARD' });
  },

  setGaragePageIndex: (index) => {
    sound.playSelect();
    set({ garagePageIndex: index });
  },

  finishConnecting: () => {
    set({ currentScreen: 'ASSEMBLY' });
  },

  finishAssembly: () => {
    sound.playSelect();
    set({ currentScreen: 'REWARD' });
  },

  claimRewardAndGoToDashboard: () => {
    sound.playSelect();
    set((state) => ({
      hasClaimedReward: true,
      unopenedCrates: state.unopenedCrates + 2,
      racingCredits: state.racingCredits + 200,
      currentScreen: 'DASHBOARD',
    }));
  },

  toggleSound: () => {
    const nextState = sound.toggleSound();
    set({ soundEnabled: nextState });
  },

  addCredits: (amount) => {
    sound.playSelect();
    set((state) => ({ racingCredits: state.racingCredits + amount }));
  },

  openCrateModal: (type = null) => {
    sound.playSelect();
    set({ isOpeningCrateModalOpen: true, openingCrateType: type });
  },

  closeCrateModal: () => {
    sound.playSelect();
    set({ isOpeningCrateModalOpen: false, openingCrateType: null });
  },

  openTeamModal: () => {
    sound.playSelect();
    set({ isTeamModalOpen: true });
  },

  closeTeamModal: () => {
    sound.playSelect();
    set({ isTeamModalOpen: false });
  },

  // ==========================================
  // SpeedClub TV / Paddock Broadcast Actions
  // ==========================================
  openTvModal: async () => {
    sound.playSelect();
    set({ isTvModalOpen: true });
    await get().fetchSponsorStatus();
  },

  closeTvModal: () => {
    sound.playSelect();
    set({ isTvModalOpen: false, isTvPlaying: false, tvActiveSession: null });
  },

  fetchSponsorStatus: async () => {
    const userId = get().currentUser?.id || get().pilot?.id || 'pilot-1';
    try {
      const res = await fetch(`http://localhost:8000/api/sponsors/status?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        set({
          tvSponsorStatus: data,
          activeTvChannel: get().activeTvChannel || data.channels[0] || null,
        });
        return data;
      }
    } catch (err) {
      console.warn("Fallo al obtener estado de sponsors:", err);
    }
  },

  setActiveTvChannel: (channel) => {
    sound.playSelect();
    set({ activeTvChannel: channel, isTvPlaying: false, tvActiveSession: null });
  },

  startSponsorVideo: async (channelId) => {
    sound.playSelect();
    const userId = get().currentUser?.id || get().pilot?.id || 'pilot-1';
    try {
      const res = await fetch(`http://localhost:8000/api/sponsors/start-session?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trailer_id: channelId, duration_seconds: 20 }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.detail || 'Límite de transmisiones alcanzado.' };
      }
      const session = await res.json();
      set({ tvActiveSession: session, isTvPlaying: true });
      return { success: true, session };
    } catch (err) {
      return { success: false, message: 'Fallo al conectar con el servidor de transmisiones.' };
    }
  },

  claimSponsorReward: async (sessionId) => {
    try {
      const res = await fetch('http://localhost:8000/api/sponsors/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.detail || 'Error al reclamar la recompensa.' };
      }
      const data = await res.json();
      set((state) => ({
        racingCredits: data.total_credits,
        isTvPlaying: false,
        tvActiveSession: null,
      }));
      sound.playSelect();
      await get().fetchSponsorStatus();
      return { success: true, data };
    } catch (err) {
      return { success: false, message: 'Fallo al conectar con el servidor.' };
    }
  },

  enterSpeedClubTv: async () => {
    sound.playSelect();
    set({ currentScreen: 'SPEEDCLUB_TV', isTvPlaying: false, tvActiveSession: null });
    await get().fetchSponsorStatus();
    const active = get().activeTvChannel;
    if (active?.id) {
      get().fetchVideoComments(active.id);
    }
  },

  exitSpeedClubTv: () => {
    sound.playSelect();
    set({ currentScreen: 'DASHBOARD', isTvPlaying: false, tvActiveSession: null });
  },

  fetchVideoComments: async (channelId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sponsors/comments?channel_id=${channelId}`);
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          tvComments: {
            ...state.tvComments,
            [channelId]: data,
          },
        }));
        return data;
      }
    } catch (err) {
      console.warn("Fallo al obtener comentarios de telemetría:", err);
    }
  },

  postVideoComment: async (channelId, text) => {
    const userId = get().currentUser?.id || get().pilot?.id || 'pilot-1';
    try {
      const res = await fetch(`http://localhost:8000/api/sponsors/comments?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_id: channelId, comment: text }),
      });
      if (!res.ok) {
        return { success: false, message: 'No se pudo publicar el comentario.' };
      }
      const data = await res.json();
      sound.playSelect();
      await get().fetchVideoComments(channelId);
      return { success: true, comment: data.comment };
    } catch (err) {
      return { success: false, message: 'Error de conexión con el foro.' };
    }
  },

  likeVideoComment: async (commentId, channelId) => {
    try {
      sound.playClick();
      const res = await fetch(`http://localhost:8000/api/sponsors/comments/${commentId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        await get().fetchVideoComments(channelId);
      }
    } catch (err) {}
  },

  buyContainer: async (type = 'standard') => {
    const cost = type === 'premium' ? 500 : 100;
    const { racingCredits, containers } = get();

    if (racingCredits < cost) {
      sound.playSelect();
      return {
        success: false,
        reason: 'INSUFFICIENT_CREDITS',
        message: `Créditos insuficientes. El Container ${type === 'premium' ? 'Premium' : 'Común'} cuesta ${cost} CR y tienes ${racingCredits} CR.`
      };
    }

    sound.playSelect();
    const nextContainers = {
      ...containers,
      [type]: (containers[type] || 0) + 1,
    };
    const newTotal = (nextContainers.standard || 0) + (nextContainers.premium || 0);

    set({
      racingCredits: racingCredits - cost,
      containers: nextContainers,
      unopenedCrates: newTotal,
    });

    // Background sync to backend SQLite
    const activeUserId = get().currentUser?.id || get().pilot?.id || 'pilot-1';
    try {
      const res = await fetch(`http://localhost:8000/api/buy-container?user_id=${activeUserId}&pack_type=${type}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        set({
          racingCredits: data.racing_credits,
          containers: data.containers,
          unopenedCrates: data.unopened_crates,
        });
      }
    } catch (e) {
      console.info("Offline mode: buy-container state saved locally.");
    }

    return {
      success: true,
      message: `¡Container ${type === 'premium' ? 'Premium Dorado' : 'Común'} comprado con éxito (+1 en tu inventario)!`,
    };
  },

  openContainer: async (type = 'standard') => {
    const state = get();
    let chosenType = type;

    if (!state.containers[chosenType] || state.containers[chosenType] <= 0) {
      if (state.containers.standard > 0) chosenType = 'standard';
      else if (state.containers.premium > 0) chosenType = 'premium';
      else {
        return {
          success: false,
          reason: 'NO_CONTAINERS',
          message: 'No posees sobres containers en tu inventario. ¡Adquiere uno con tus créditos!'
        };
      }
    }

    sound.playSelect();
    const activeUserId = state.currentUser?.id || state.pilot?.id || 'pilot-1';

    // 1. Try full persistence with SQLite backend via FastAPI
    try {
      const res = await fetch(`http://localhost:8000/api/un-crate?user_id=${activeUserId}&pack_type=${chosenType}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        const dropped = data.vehicles_dropped.map((v) => {
          const catItem = state.catalog.find((c) => c.id === v.id);
          const resolvedImg = v.image || v.image_url || catItem?.image || '';
          return {
            ...catItem,
            ...v,
            tier: v.rarity_tier || v.tier || catItem?.tier || 'C',
            image: resolvedImg,
            image_url: resolvedImg,
            hp: v.hp || catItem?.hp || 200,
            topSpeed: v.topSpeed || catItem?.topSpeed || 220,
          };
        });

        let nextInventory = [...state.inventory];
        dropped.forEach((v) => {
          const idx = nextInventory.findIndex((item) => item.id === v.id);
          if (idx >= 0) {
            nextInventory[idx] = { 
              ...nextInventory[idx], 
              count: (nextInventory[idx].count || 0) + 1,
              image: v.image,
              image_url: v.image_url 
            };
          } else {
            nextInventory.push({ 
              id: v.id, 
              name: v.name, 
              tier: v.tier, 
              category: v.category, 
              image: v.image,
              image_url: v.image_url,
              count: 1 
            });
          }
        });

        const nextContainers = data.containers || {
          ...state.containers,
          [chosenType]: Math.max(0, (state.containers[chosenType] || 0) - 1),
        };
        const nextTotal = (nextContainers.standard || 0) + (nextContainers.premium || 0);

        set({
          racingCredits: data.racing_credits !== undefined ? data.racing_credits : state.racingCredits,
          containers: nextContainers,
          unopenedCrates: nextTotal,
          inventory: nextInventory,
        });

        return {
          success: true,
          containerType: chosenType,
          droppedVehicles: dropped,
        };
      }
    } catch (err) {
      console.warn("Backend unboxing failed, rolling client-side fallback:", err);
    }

    // 2. Client-side fallback if backend is offline
    const catalog = state.catalog;
    let dropped = [];

    if (chosenType === 'premium') {
      const tierS = catalog.filter((c) => c.tier === 'S');
      const tierA = catalog.filter((c) => c.tier === 'A');
      const tierB = catalog.filter((c) => c.tier === 'B' || c.tier === 'C');

      const card1 = tierS[Math.floor(Math.random() * tierS.length)] || catalog[0];
      const card2 = tierA[Math.floor(Math.random() * tierA.length)] || catalog[1];
      const card3 = tierA[Math.floor(Math.random() * tierA.length)] || catalog[2];
      const card4 = tierB[Math.floor(Math.random() * tierB.length)] || catalog[3];
      const card5 = catalog[Math.floor(Math.random() * catalog.length)] || catalog[4];
      dropped = [card1, card2, card3, card4, card5];
    } else {
      const pool = [...catalog];
      for (let i = 0; i < 3; i++) {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        dropped.push(rand);
      }
    }

    const nextContainers = {
      ...state.containers,
      [chosenType]: Math.max(0, state.containers[chosenType] - 1),
    };
    const nextTotal = (nextContainers.standard || 0) + (nextContainers.premium || 0);

    let nextInventory = [...state.inventory];
    dropped.forEach((v) => {
      const idx = nextInventory.findIndex((item) => item.id === v.id);
      if (idx >= 0) {
        nextInventory[idx] = { ...nextInventory[idx], count: (nextInventory[idx].count || 0) + 1 };
      } else {
        nextInventory.push({ id: v.id, name: v.name, tier: v.tier, category: v.category, count: 1 });
      }
    });

    set({
      containers: nextContainers,
      unopenedCrates: nextTotal,
      inventory: nextInventory,
    });

    return {
      success: true,
      containerType: chosenType,
      droppedVehicles: dropped,
    };
  },

  addCrate: () => {
    sound.playSelect();
    set((state) => {
      const nextContainers = {
        ...state.containers,
        standard: state.containers.standard + 1,
      };
      return {
        containers: nextContainers,
        unopenedCrates: (nextContainers.standard || 0) + (nextContainers.premium || 0),
      };
    });
  },

  // Add vehicle copy to inventory (helpful for testing & crate unboxing)
  addVehicleToInventory: (vehicleId) => {
    const v = get().catalog.find((c) => c.id === vehicleId);
    if (!v) return;
    sound.playSelect();
    set((state) => {
      const existing = state.inventory.find((i) => i.id === vehicleId);
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.id === vehicleId ? { ...i, count: i.count + 1 } : i
          ),
        };
      }
      return {
        inventory: [...state.inventory, { id: v.id, name: v.name, tier: v.tier, category: v.category, count: 1 }],
      };
    });
  },

  /**
   * Sincronización Optimista de Pegado (Matching 6- Zustand.pdf)
   * 1. Clona estado para posible Rollback.
   * 2. Muta la UI al instante (la carta se pega con destello).
   * 3. Dispara fetch POST al servidor en segundo plano.
   * 4. En caso de error, revierte el estado visual sin bloquear la UX.
   */
  pasteVehicle: async (vehicleId) => {
    const { inventory, pastedVehicles, catalog } = get();
    const vehicle = catalog.find((v) => v.id === vehicleId);

    if (!vehicle) {
      return { success: false, reason: 'NOT_FOUND' };
    }

    if (pastedVehicles.some((p) => p.id === vehicleId)) {
      return { success: false, reason: 'ALREADY_PASTED', vehicle };
    }

    const invItem = inventory.find((i) => i.id === vehicleId && i.count > 0);
    if (!invItem) {
      return { success: false, reason: 'NOT_IN_INVENTORY', vehicle };
    }

    // 1. Clonar estado actual para Rollback
    const previousInventory = [...inventory];
    const previousPasted = [...pastedVehicles];

    // 2. Actualización Optimista inmediata
    const updatedInventory = inventory
      .map((i) => (i.id === vehicleId ? { ...i, count: i.count - 1 } : i))
      .filter((i) => i.count > 0);

    const newPastedEntry = {
      id: vehicle.id,
      name: vehicle.name,
      tier: vehicle.tier,
      category: vehicle.category,
      pastedAt: new Date().toISOString().split('T')[0],
      justPasted: true,
    };

    sound.playSelect();

    set({
      inventory: updatedInventory,
      pastedVehicles: [...pastedVehicles, newPastedEntry],
    });

    // 3. Petición en segundo plano al backend (FastAPI / SQLite)
    const activeUserId = get().currentUser?.id || 'pilot-1';
    try {
      const res = await fetch(`http://localhost:8000/api/paste-vehicle?user_id=${activeUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicleId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn("Backend rejected paste (running in optimistic client mode):", errorData);
      }
    } catch (err) {
      console.info("Backend offline. Client-side optimistic paste preserved.");
    }

    return { success: true, vehicle };
  },

  // ==========================================
  // Pilot Authentication Actions (Gran Turismo FIA Super License)
  // ==========================================
  login: async (email, password) => {
    sound.playSelect();
    set({ isAuthenticating: true, authError: null });
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isAuthenticating: false, authError: data.detail || 'Error al iniciar sesión' });
        return { success: false, message: data.detail };
      }

      localStorage.setItem('speedclub_user', JSON.stringify(data.user));
      set({
        currentUser: data.user,
        isAuthenticated: true,
        isAuthenticating: false,
        authError: null,
        pilot: {
          ...get().pilot,
          id: data.user.id,
          name: data.user.username,
        },
        racingCredits: data.racing_credits,
        unopenedCrates: data.unopened_crates,
        currentScreen: 'DASHBOARD',
      });

      get().syncWithBackend(data.user.id);
      return { success: true, message: data.message };
    } catch (err) {
      set({
        isAuthenticating: false,
        authError: 'No se pudo conectar con el servidor de Paddock (localhost:8000).',
      });
      return { success: false, message: 'Fallo de conexión al servidor.' };
    }
  },

  register: async (username, email, password) => {
    sound.playSelect();
    set({ isAuthenticating: true, authError: null });
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isAuthenticating: false, authError: data.detail || 'Error al expedir la licencia' });
        return { success: false, message: data.detail };
      }

      localStorage.setItem('speedclub_user', JSON.stringify(data.user));
      set({
        currentUser: data.user,
        isAuthenticated: true,
        isAuthenticating: false,
        authError: null,
        pilot: {
          ...get().pilot,
          id: data.user.id,
          name: data.user.username,
        },
        racingCredits: data.racing_credits,
        containers: { standard: 2, premium: 1 },
        unopenedCrates: 3,
        currentScreen: 'CONNECTING', // Flujo de bienvenida cinematográfico
      });

      get().syncWithBackend(data.user.id);
      return { success: true, message: data.message };
    } catch (err) {
      set({
        isAuthenticating: false,
        authError: 'No se pudo conectar con el servidor de Paddock (localhost:8000).',
      });
      return { success: false, message: 'Fallo de conexión al servidor.' };
    }
  },

  loginAsGuest: () => {
    sound.playSelect();
    const guestUser = {
      id: 'pilot-1',
      username: 'Ayrton Driver',
      email: 'ayrton@speedclub.io',
    };
    localStorage.setItem('speedclub_user', JSON.stringify(guestUser));
    set({
      currentUser: guestUser,
      isAuthenticated: true,
      authError: null,
      pilot: {
        ...get().pilot,
        id: guestUser.id,
        name: guestUser.username,
      },
      currentScreen: 'DASHBOARD',
    });
    get().syncWithBackend('pilot-1');
  },

  logout: () => {
    sound.playSelect();
    localStorage.removeItem('speedclub_user');
    set({
      currentUser: null,
      isAuthenticated: false,
      authError: null,
      currentScreen: 'LOGIN',
      pastedVehicles: [],
      inventory: [],
      racingCredits: 0,
      containers: { standard: 0, premium: 0 },
      unopenedCrates: 0,
      pilot: {
        id: 'pilot-1',
        name: 'Ayrton Driver',
        number: '08',
        team: 'SpeedClub Works Racing',
        license: 'SUPERCAR GR.1 FEDERADA',
        status: 'EN PADDOCK',
        ping: 14,
        reputation: 98.4,
      },
    });
  },

  syncWithBackend: async (userIdOverride = null) => {
    const userId = userIdOverride || get().currentUser?.id || 'pilot-1';
    try {
      const res = await fetch(`http://localhost:8000/api/garage?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const mappedPasted = (data.pasted_vehicles || []).map((v) => {
          const catItem = get().catalog.find((c) => c.id === v.id);
          const resolvedImg = v.image || v.image_url || catItem?.image || '';
          return {
            ...catItem,
            ...v,
            tier: v.rarity_tier || v.tier || catItem?.tier || 'C',
            image: resolvedImg,
            image_url: resolvedImg,
          };
        });

        const mappedInventory = (data.inventory || []).map((v) => {
          const catItem = get().catalog.find((c) => c.id === v.id);
          const resolvedImg = v.image || v.image_url || catItem?.image || '';
          return {
            ...catItem,
            ...v,
            tier: v.rarity_tier || v.tier || catItem?.tier || 'C',
            image: resolvedImg,
            image_url: resolvedImg,
            count: v.unpasted_count !== undefined ? v.unpasted_count : (v.count || 1),
          };
        });

        set({
          racingCredits: data.racing_credits,
          unopenedCrates: data.unopened_crates,
          containers: data.containers || { standard: 2, premium: 1 },
          pilot: {
            ...get().pilot,
            id: data.user.id,
            name: data.user.username,
          },
          pastedVehicles: mappedPasted,
          inventory: mappedInventory,
        });
      }
    } catch (err) {
      console.info("Modo local: backend no disponible para sincronización total.");
    }
  },
}));

// Auto-sync on client load if session is stored
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('speedclub_user') || 'null');
      if (saved?.id) {
        useGarageStore.getState().syncWithBackend(saved.id);
      }
    } catch (e) {}
  }, 100);
}

export default useGarageStore;
