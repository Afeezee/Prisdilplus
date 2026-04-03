'use client';
// ============================================================
// Prisdil+ Room Store (Multiplayer)
// ============================================================

import { create } from 'zustand';

export interface RoomPlayerState {
  id: string;
  alias: string;
  deviceId: string;
  isHost: boolean;
  totalScore: number;
}

export interface RevealedSubmission {
  playerId: string;
  move: string;
  score: number;
  round: number;
}

export interface RoomState {
  // Room metadata
  roomId: string | null;
  roomCode: string | null;
  roomStatus: 'idle' | 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  totalRounds: number;
  currentRound: number;
  hostDeviceId: string | null;

  // Players
  players: RoomPlayerState[];
  myPlayerId: string | null;
  myDeviceId: string | null;

  // Per-round state
  mySubmittedThisRound: boolean;
  submittedCount: number;
  revealedSubmissions: RevealedSubmission[];

  // UI
  error: string | null;
  loading: boolean;

  // Actions
  setMyDeviceId: (id: string) => void;
  createRoom: (deviceId: string, alias: string, maxPlayers: number, totalRounds: number) => Promise<void>;
  joinRoom: (code: string, deviceId: string, alias: string) => Promise<void>;
  startRoom: () => Promise<void>;
  submitMove: (move: 'C' | 'D') => Promise<void>;
  poll: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

const initialState = {
  roomId: null,
  roomCode: null,
  roomStatus: 'idle' as const,
  maxPlayers: 2,
  totalRounds: 10,
  currentRound: 1,
  hostDeviceId: null,
  players: [],
  myPlayerId: null,
  myDeviceId: null,
  mySubmittedThisRound: false,
  submittedCount: 0,
  revealedSubmissions: [],
  error: null,
  loading: false,
};

export const useRoomStore = create<RoomState>((set, get) => ({
  ...initialState,

  setMyDeviceId: (id) => set({ myDeviceId: id }),

  createRoom: async (deviceId, alias, maxPlayers, totalRounds) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, alias, maxPlayers, totalRounds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');

      const room = data.room;
      const me = room.players.find((p: RoomPlayerState) => p.deviceId === deviceId);
      set({
        roomId: room.id,
        roomCode: room.code,
        roomStatus: 'waiting',
        maxPlayers: room.maxPlayers,
        totalRounds: room.totalRounds,
        currentRound: room.currentRound,
        hostDeviceId: room.hostDeviceId,
        players: room.players,
        myPlayerId: me?.id ?? null,
        myDeviceId: deviceId,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false });
    }
  },

  joinRoom: async (code, deviceId, alias) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceId, alias }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join room');

      const room = data.room;
      const me = room.players.find((p: RoomPlayerState) => p.deviceId === deviceId);
      set({
        roomId: room.id,
        roomCode: room.code,
        roomStatus: 'waiting',
        maxPlayers: room.maxPlayers,
        totalRounds: room.totalRounds,
        currentRound: room.currentRound,
        hostDeviceId: room.hostDeviceId,
        players: room.players,
        myPlayerId: me?.id ?? null,
        myDeviceId: deviceId,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false });
    }
  },

  startRoom: async () => {
    const { roomId, myDeviceId } = get();
    if (!roomId || !myDeviceId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/room/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, deviceId: myDeviceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      set({ roomStatus: 'playing', loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false });
    }
  },

  submitMove: async (move) => {
    const { roomId, myDeviceId } = get();
    if (!roomId || !myDeviceId) return;
    try {
      const res = await fetch('/api/room/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, deviceId: myDeviceId, move }),
      });
      if (!res.ok) {
        const d = await res.json();
        set({ error: d.error });
      } else {
        set({ mySubmittedThisRound: true });
      }
    } catch {
      set({ error: 'Network error submitting move' });
    }
  },

  poll: async () => {
    const { roomId, myDeviceId } = get();
    if (!roomId || !myDeviceId) return;
    try {
      const res = await fetch(`/api/room/poll?roomId=${roomId}&deviceId=${myDeviceId}`);
      if (!res.ok) return;
      const data = await res.json();

      set({
        roomStatus: data.room.status === 'waiting' ? 'waiting'
          : data.room.status === 'playing' ? 'playing'
          : 'finished',
        currentRound: data.room.currentRound,
        totalRounds: data.room.totalRounds,
        hostDeviceId: data.room.hostDeviceId,
        players: data.players,
        myPlayerId: data.myPlayerId,
        mySubmittedThisRound: data.mySubmittedThisRound,
        submittedCount: data.submittedCount,
        revealedSubmissions: data.revealedSubmissions,
      });
    } catch {
      // Silent poll failure
    }
  },

  startPolling: () => {
    if (pollInterval) return;
    pollInterval = setInterval(() => {
      get().poll();
    }, 1500);
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },

  reset: () => {
    get().stopPolling();
    set(initialState);
  },
}));
