"use client";

import { useEffect, useState } from "react";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { CustomerBottomNav } from "@/components/customer/BottomNav";
import { CustomerDesktopHeader } from "@/components/customer/DesktopHeader";
import { CustomerDesktopFooter } from "@/components/customer/DesktopFooter";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { hydrate } = useCustomerAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // Public browsing (discover/venues/events) doesn't require login — only render
  // once hydrated so the header/nav don't flash a logged-out state for a
  // logged-in customer. Routes that require an account (reservations, profile,
  // booking confirm/rate) guard themselves via RequireCustomerAuth.
  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FAF6EF" }}>
      <CustomerDesktopHeader />
      <main className="flex-1 flex flex-col min-w-0 pb-[72px] lg:pb-0">{children}</main>
      <CustomerBottomNav />
      <CustomerDesktopFooter />
    </div>
  );
}
