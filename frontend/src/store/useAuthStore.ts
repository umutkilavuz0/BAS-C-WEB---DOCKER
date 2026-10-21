import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),

  // Giriş yapıldığında token ve kullanıcı verisini saklar
  setAuth: (user, token) => {
    localStorage.setItem('accessToken', token);
    set({ user, token });
  },

  // Çıkış yapıldığında localStorage'ı ve state'i temizler
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null });
  },
}));