"use client";

import { create } from "zustand";
import { UserDto } from "@/types";

interface CustomerAuthState {
  token: string | null;
  user: UserDto | null;
  customerId: string | null;
  setAuth: (token: string, user: UserDto, customerId: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  token: null,
  user: null,
  customerId: null,

  setAuth: (token, user, customerId) => {
    localStorage.setItem("customer_token", token);
    localStorage.setItem("customer_user", JSON.stringify(user));
    localStorage.setItem("customer_customerId", customerId);
    set({ token, user, customerId });
  },

  clearAuth: () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    localStorage.removeItem("customer_customerId");
    set({ token: null, user: null, customerId: null });
  },

  hydrate: () => {
    const token = localStorage.getItem("customer_token");
    const userRaw = localStorage.getItem("customer_user");
    const customerId = localStorage.getItem("customer_customerId") || null;
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as UserDto;
        set({ token, user, customerId });
      } catch {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        localStorage.removeItem("customer_customerId");
      }
    }
  },
}));
