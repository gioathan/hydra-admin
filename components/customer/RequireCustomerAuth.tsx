"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuthStore } from "@/store/customerAuthStore";

export function RequireCustomerAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, hydrate } = useCustomerAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !token) {
      const query = searchParams.toString();
      const returnTo = query ? `${pathname}?${query}` : pathname;
      router.replace(`/signin?redirect=${encodeURIComponent(returnTo)}`);
    }
  }, [mounted, token, pathname, searchParams, router]);

  if (!mounted || !token) return null;

  return <>{children}</>;
}
