"use client";

import { create } from "zustand";
import { UserDto } from "@/types";

interface CustomerAuthState {
  token: string | null;
  user: UserDto | null;
  customerId: string | null;
  isGoogleUser: boolean;
  setAuth: (token: string, user: UserDto, customerId: string, isGoogle?: boolean) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  token: null,
  user: null,
  customerId: null,
  isGoogleUser: false,

  setAuth: (token, user, customerId, isGoogle = false) => {
    localStorage.setItem("customer_token", token);
    localStorage.setItem("customer_user", JSON.stringify(user));
    localStorage.setItem("customer_customerId", customerId);
    localStorage.setItem("customer_is_google", isGoogle ? "1" : "0");
    set({ token, user, customerId, isGoogleUser: isGoogle });
  },

  clearAuth: () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    localStorage.removeItem("customer_customerId");
    localStorage.removeItem("customer_is_google");
    set({ token: null, user: null, customerId: null, isGoogleUser: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("customer_token");
    const userRaw = localStorage.getItem("customer_user");
    const customerId = localStorage.getItem("customer_customerId") || null;
    const isGoogleUser = localStorage.getItem("customer_is_google") === "1";
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as UserDto;
        set({ token, user, customerId, isGoogleUser });
      } catch {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        localStorage.removeItem("customer_customerId");
        localStorage.removeItem("customer_is_google");
      }
    }
  },
}));
