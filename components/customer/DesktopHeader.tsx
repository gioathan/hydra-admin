"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { getCustomer } from "@/lib/api/customersApi";
import { getInitial } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/events", label: "Events" },
  { href: "/reservations", label: "Bookings" },
];

export function CustomerDesktopHeader() {
  const pathname = usePathname();
  const { token, customerId } = useCustomerAuthStore();

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60_000,
  });

  return (
    <nav
      className="hidden lg:flex sticky top-0 z-50 border-b"
      style={{ background: "#FAF6EF", borderColor: "#E1D7C6" }}
    >
      <div className="max-w-[1440px] mx-auto w-full px-20 flex justify-between items-center h-20">
        <div className="flex items-center gap-12">
          <Link href="/discover" className="flex items-center">
            <img src="/brand-lockup.svg" alt="Local Bee" style={{ height: 34, width: "auto" }} />
          </Link>
          <div className="flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#0C5F7D]"
                  style={
                    active
                      ? { color: "#C25B3C", borderBottom: "2px solid #C25B3C", paddingBottom: 2 }
                      : { color: "#566572" }
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        {token ? (
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition-opacity hover:opacity-80"
            style={{ background: "#C25B3C", fontFamily: "var(--font-sans)" }}
          >
            {getInitial(customer?.name ?? "")}
          </Link>
        ) : (
          <Link
            href={`/signin?redirect=${encodeURIComponent(pathname)}`}
            className="px-5 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
            style={{ background: "#C25B3C", fontFamily: "var(--font-sans)" }}
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
