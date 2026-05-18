"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !token) {
      router.replace("/login");
    }
  }, [mounted, token, router]);

  // Avoid SSR/hydration mismatch — render nothing until client-side auth resolved
  if (!mounted || !token) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F5F0]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
