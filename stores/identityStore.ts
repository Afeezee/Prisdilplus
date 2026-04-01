'use client';
// ============================================================
// Prisdil+ Persistent Identity Store
// ============================================================

import { create } from 'zustand';

const STORAGE_KEY = 'prisdilplus_user_identity';

interface UserIdentity {
  alias: string;
  createdAt: string;
  deviceId: string;
}

interface IdentityState {
  identity: UserIdentity | null;
  loaded: boolean;
  showProfilePanel: boolean;

  loadIdentity: () => void;
  createIdentity: (alias: string) => void;
  changeAlias: (newAlias: string) => void;
  getAlias: () => string;
  hasIdentity: () => boolean;
  setShowProfilePanel: (show: boolean) => void;
}

function generateUUID(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

function readFromStorage(): UserIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.alias && parsed.createdAt && parsed.deviceId) {
      return parsed as UserIdentity;
    }
    return null;
  } catch {
    console.warn('Prisdil+: Could not read identity from localStorage');
    return null;
  }
}

function writeToStorage(identity: UserIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    console.warn('Prisdil+: Could not save identity to localStorage');
  }
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
  identity: null,
  loaded: false,
  showProfilePanel: false,

  loadIdentity: () => {
    const stored = readFromStorage();
    set({ identity: stored, loaded: true });
  },

  createIdentity: (alias: string) => {
    const identity: UserIdentity = {
      alias: alias.trim(),
      createdAt: new Date().toISOString(),
      deviceId: generateUUID(),
    };
    writeToStorage(identity);
    set({ identity });
  },

  changeAlias: (newAlias: string) => {
    const state = get();
    if (!state.identity) return;

    const updated: UserIdentity = {
      ...state.identity,
      alias: newAlias.trim(),
    };
    writeToStorage(updated);
    set({ identity: updated });
  },

  getAlias: () => {
    const state = get();
    return state.identity?.alias || '';
  },

  hasIdentity: () => {
    const state = get();
    return !!state.identity?.alias;
  },

  setShowProfilePanel: (show: boolean) => {
    set({ showProfilePanel: show });
  },
}));
