"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { getCustomer } from "@/lib/api/customersApi";
import { getInitial } from "@/lib/utils";

type IconType = "edit" | "lock" | "calendar" | "exit" | "shield" | "document" | "mail";

function MenuIcon({ type }: { type: IconType }) {
  if (type === "edit") return (
    <svg className="w-5 h-5" style={{ color: "#0C5F7D" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
  if (type === "lock") return (
    <svg className="w-5 h-5" style={{ color: "#0C5F7D" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
  if (type === "calendar") return (
    <svg className="w-5 h-5" style={{ color: "#0C5F7D" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  if (type === "mail") return (
    <svg className="w-5 h-5" style={{ color: "#0C5F7D" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
  if (type === "shield") return (
    <svg className="w-5 h-5" style={{ color: "#0C5F7D" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 12c0 2.869.998 5.504 2.652 7.57L12 21l6.348-1.43A9.994 9.994 0 0021 12c0-2.23-.731-4.29-1.966-5.958A11.954 11.954 0 0112 2.714z" />
    </svg>
  );
  if (type === "document") return (
    <svg className="w-5 h-5" style={{ color: "#0C5F7D" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "#C0392C" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function MenuRow({ href, label, iconType, destructive, onClick }: {
  href?: string;
  label: string;
  iconType: IconType;
  destructive?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: destructive ? "#F7DED9" : "rgba(12, 95, 125,0.12)" }}
        >
          <MenuIcon type={iconType} />
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: destructive ? "#C0392C" : "#0C5F7D", fontFamily: "var(--font-sans)" }}
        >
          {label}
        </span>
      </div>
      {!destructive && (
        <svg className="w-5 h-5" style={{ color: "#8B95A0" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  );

  const cls = "flex items-center justify-between px-4 py-3.5 hover:bg-[#F4EDE1] active:bg-[#F4EDE1] transition-colors w-full";

  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button className={cls} onClick={onClick}>{inner}</button>;
}

function DesktopCard({ href, title, subtitle, iconType }: {
  href: string;
  title: string;
  subtitle: string;
  iconType: IconType;
}) {
  const cls = "flex items-center gap-5 p-6 rounded-xl border hover:shadow-md transition-shadow";
  const style = { background: "#ffffff", borderColor: "#E6DCCC" };
  const inner = (
    <>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(12, 95, 125,0.08)" }}
      >
        <MenuIcon type={iconType} />
      </div>
      <div className="flex-1">
        <p className="font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>{title}</p>
        <p className="text-sm mt-0.5" style={{ color: "#8B95A0" }}>{subtitle}</p>
      </div>
      <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#8B95A0" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );
  if (href.startsWith('mailto:')) {
    return <a href={href} className={cls} style={style}>{inner}</a>;
  }
  return (
    <Link
      href={href}
      className={cls}
      style={style}
    >
      {inner}
    </Link>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "#8B95A0" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "#0C5F7D" }}>{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { customerId, clearAuth, isGoogleUser } = useCustomerAuthStore();

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 60_000,
  });

  const handleSignOut = () => {
    clearAuth();
    router.replace("/");
  };

  const name = customer?.name ?? "—";

  return (
    <>
      {/* ── MOBILE ────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col min-h-full" style={{ background: "#FAF6EF" }}>
        <div
          className="flex flex-col items-center pt-9 pb-8 px-5 gap-2"
          style={{ background: "#ffffff", borderBottom: "1px solid rgba(225, 215, 198,0.4)" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-2"
            style={{ background: "#C25B3C", fontFamily: "var(--font-serif)" }}
          >
            {getInitial(name)}
          </div>
          <p className="text-lg font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>{name}</p>
          <p className="text-sm" style={{ color: "#566572" }}>{customer?.email ?? customer?.phone}</p>
        </div>

        <div className="flex-1 px-5 py-5 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2.5 ml-1" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>Account</p>
            <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(225, 215, 198,0.3)", boxShadow: "0 1px 4px rgba(12, 54, 72,0.04)" }}>
              <MenuRow href="/profile/edit" label="Edit Profile" iconType="edit" />
              {!isGoogleUser && (
                <>
                  <div style={{ height: 1, background: "rgba(225, 215, 198,0.4)", marginLeft: 64 }} />
                  <MenuRow href="/profile/password" label="Change Password" iconType="lock" />
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2.5 ml-1" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>Bookings</p>
            <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(225, 215, 198,0.3)", boxShadow: "0 1px 4px rgba(12, 54, 72,0.04)" }}>
              <MenuRow href="/reservations" label="My Bookings" iconType="calendar" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2.5 ml-1" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>Support</p>
            <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(225, 215, 198,0.3)", boxShadow: "0 1px 4px rgba(12, 54, 72,0.04)" }}>
              <MenuRow label="Contact Us" iconType="mail" onClick={() => window.open('mailto:test@email.com')} />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2.5 ml-1" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>Legal</p>
            <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(225, 215, 198,0.3)", boxShadow: "0 1px 4px rgba(12, 54, 72,0.04)" }}>
              <MenuRow href="/privacy-policy" label="Privacy Policy" iconType="shield" />
              <div style={{ height: 1, background: "rgba(225, 215, 198,0.4)", marginLeft: 64 }} />
              <MenuRow href="/terms-of-service" label="Terms of Service" iconType="document" />
            </div>
          </div>

          <div>
            <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(225, 215, 198,0.3)", boxShadow: "0 1px 4px rgba(12, 54, 72,0.04)" }}>
              <MenuRow label="Sign Out" iconType="exit" destructive onClick={handleSignOut} />
            </div>
          </div>

          <p className="text-[10px] text-center tracking-widest uppercase mt-2" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Local Bee v1.0</p>
        </div>
      </div>

      {/* ── DESKTOP ───────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1" style={{ background: "#FAF6EF" }}>
        {/* Banner */}
        <div style={{ background: "#0C5F7D", padding: "72px 0 56px" }}>
          <div className="max-w-[1440px] mx-auto px-20 flex items-center gap-8">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{ background: "#C25B3C", fontSize: 40, fontFamily: "var(--font-serif)" }}
            >
              {getInitial(name)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1.5" style={{ fontFamily: "var(--font-serif)" }}>{name}</h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>{customer?.email}</p>
              {customer?.phone && (
                <p style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)", fontSize: 14, marginTop: 2 }}>{customer.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-[1440px] mx-auto px-20 py-16 w-full">
          <div className="grid grid-cols-12 gap-8">
            {/* Left — settings */}
            <div className="col-span-8 flex flex-col gap-10">
              <div>
                <h2 className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Account</h2>
                <div className="flex flex-col gap-3">
                  <DesktopCard href="/profile/edit" title="Edit Profile" subtitle="Update your name and phone number" iconType="edit" />
                  {!isGoogleUser && (
                    <DesktopCard href="/profile/password" title="Change Password" subtitle="Keep your account secure with a strong password" iconType="lock" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Bookings</h2>
                <div className="flex flex-col gap-3">
                  <DesktopCard href="/reservations" title="My Bookings" subtitle="View and manage all your upcoming and past reservations" iconType="calendar" />
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Support</h2>
                <div className="flex flex-col gap-3">
                  <DesktopCard href="mailto:test@email.com" title="Contact Us" subtitle="Get in touch with our support team" iconType="mail" />
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Legal</h2>
                <div className="flex flex-col gap-3">
                  <DesktopCard href="/privacy-policy" title="Privacy Policy" subtitle="How we collect, use, and protect your personal data" iconType="shield" />
                  <DesktopCard href="/terms-of-service" title="Terms of Service" subtitle="Rules and guidelines for using the Local Bee platform" iconType="document" />
                </div>
              </div>
            </div>

            {/* Right — contact summary */}
            <div className="col-span-4">
              <div className="sticky top-32 p-8 rounded-xl border flex flex-col gap-5" style={{ background: "#F4EDE1", borderColor: "#E1D7C6" }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Contact Info</h3>
                <div className="flex flex-col gap-3">
                  <SummaryRow label="Email" value={customer?.email ?? "—"} />
                  <SummaryRow label="Phone" value={customer?.phone ?? "—"} />
                </div>
                <div style={{ height: 1, background: "#E6DCCC" }} />
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition hover:bg-red-50"
                  style={{ color: "#C0392C", border: "1px solid #C0392C", background: "transparent" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
