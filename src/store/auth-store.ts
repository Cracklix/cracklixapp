import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AuthState {
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateXP: (xp: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  updateXP: (xp) => set((state) => ({
    profile: state.profile ? { ...state.profile, xp: state.profile.xp + xp } : null
  })),
}));
