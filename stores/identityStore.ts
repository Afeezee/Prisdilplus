'use client';
// ============================================================
// Prisdil+ Persistent Identity Store
// ============================================================

import { create } from 'zustand';

const STORAGE_KEY = 'prisdilplus_user_identity_device';
const LEGACY_STORAGE_KEY = 'prisdilplus_user_identity';

export interface UserIdentity {
  alias: string;
  createdAt: string;
  deviceId: string;
}

interface IdentityState {
  identity: UserIdentity | null;
  loaded: boolean;
  showProfilePanel: boolean;

  loadIdentity: () => Promise<void>;
  createIdentity: (alias: string) => Promise<void>;
  changeAlias: (newAlias: string) => Promise<void>;
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

export const useIdentityStore = create<IdentityState>((set, get) => ({
  identity: null,
  loaded: false,
  showProfilePanel: false,

  loadIdentity: async () => {
    if (typeof window === 'undefined') return;
    
    // Migration from old storage key if it exists
    let deviceId = localStorage.getItem(STORAGE_KEY);
    if (!deviceId) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (parsed && parsed.deviceId) {
            deviceId = parsed.deviceId;
            localStorage.setItem(STORAGE_KEY, deviceId);
          }
        } catch {
        }
      }
    }

    if (!deviceId) {
      set({ loaded: true });
      return;
    }

    try {
      const res = await fetch(`/api/identity?deviceId=${deviceId}`);
      const data = await res.json();
      if (data.identity) {
        set({ identity: data.identity, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  createIdentity: async (alias: string) => {
    const deviceId = generateUUID();
    localStorage.setItem(STORAGE_KEY, deviceId);
    
    // Optimistic lock
    const newIdentity = { alias: alias.trim(), createdAt: new Date().toISOString(), deviceId };
    set({ identity: newIdentity });

    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, alias: alias.trim() })
      });
      const data = await res.json();
      if (data.identity) {
        set({ identity: data.identity });
      }
    } catch {
      console.warn("Failed to save identity online");
    }
  },

  changeAlias: async (newAlias: string) => {
    const state = get();
    if (!state.identity) return;

    const updated: UserIdentity = {
      ...state.identity,
      alias: newAlias.trim(),
    };
    
    set({ identity: updated });

    try {
      await fetch('/api/identity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: state.identity.deviceId, alias: newAlias.trim() })
      });
    } catch {
      console.warn("Failed to update alias online");
    }
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
