"use client";

import { create } from "zustand";
import { UserDto } from "@/types";

interface AuthState {
  token: string | null;
  user: UserDto | null;
  venueId: string | null;
  setAuth: (token: string, user: UserDto, venueId: string | null) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  venueId: null,

  setAuth: (token, user, venueId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("venueId", venueId ?? "");
    set({ token, user, venueId });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("venueId");
    set({ token: null, user: null, venueId: null });
  },

  hydrate: () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const venueId = localStorage.getItem("venueId") || null;
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as UserDto;
        set({ token, user, venueId: venueId || null });
      } catch {
        // corrupted storage — clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("venueId");
      }
    }
  },
}));
