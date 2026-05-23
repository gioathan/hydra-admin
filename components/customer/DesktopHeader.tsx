"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { getCustomer } from "@/lib/api/customersApi";
import { getInitial } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/reservations", label: "Bookings" },
];

export function CustomerDesktopHeader() {
  const pathname = usePathname();
  const { customerId } = useCustomerAuthStore();

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60_000,
  });

  return (
    <nav
      className="hidden lg:flex sticky top-0 z-50 border-b"
      style={{ background: "#fbf9f4", borderColor: "#c5c6cf" }}
    >
      <div className="max-w-[1440px] mx-auto w-full px-20 flex justify-between items-center h-20">
        <div className="flex items-center gap-12">
          <Link
            href="/discover"
            className="font-bold tracking-[0.2em]"
            style={{ fontSize: 28, fontFamily: "var(--font-serif)", color: "#041635" }}
          >
            HYDRA
          </Link>
          <div className="flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#041635]"
                  style={
                    active
                      ? { color: "#9c440f", borderBottom: "2px solid #9c440f", paddingBottom: 2 }
                      : { color: "#44474e" }
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: "#9c440f", fontFamily: "var(--font-sans)" }}
        >
          {getInitial(customer?.name ?? "")}
        </Link>
      </div>
    </nav>
  );
}
