"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { CustomerBottomNav } from "@/components/customer/BottomNav";
import { CustomerDesktopHeader } from "@/components/customer/DesktopHeader";
import { CustomerDesktopFooter } from "@/components/customer/DesktopFooter";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrate } = useCustomerAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !token) router.replace("/signin");
  }, [mounted, token, router]);

  if (!mounted || !token) return null;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FAF6EF" }}>
      <CustomerDesktopHeader />
      <main className="flex-1 flex flex-col min-w-0 pb-[72px] lg:pb-0">{children}</main>
      <CustomerBottomNav />
      <CustomerDesktopFooter />
    </div>
  );
}
