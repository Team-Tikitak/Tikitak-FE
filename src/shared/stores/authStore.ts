import { create } from 'zustand';

type AuthState = {
  accessToken: string | null;
  isLoggingOut: boolean;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  startLogout: () => void;
  endLogout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isLoggingOut: false,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
  startLogout: () => set({ isLoggingOut: true }),
  endLogout: () => set({ isLoggingOut: false }),
}));
