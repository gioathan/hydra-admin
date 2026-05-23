"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "@/lib/api/customerBookings";
import { getCustomerVenues } from "@/lib/api/customerVenues";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { BookingCard } from "@/components/customer/BookingCard";
import { BookingDto, BookingStatus, CustomerVenueDto } from "@/types";
import Link from "next/link";
import { formatLocalDate, formatLocalTime, shortId } from "@/lib/utils";

type Tab = "upcoming" | "past";

function isUpcoming(booking: BookingDto): boolean {
  const now = new Date();
  if (booking.status === "Pending") return new Date(booking.startUtc) > now;
  if (booking.status === "Confirmed") return new Date(booking.endUtc) > now;
  return false;
}

const statusStyle: Record<BookingStatus, { bg: string; color: string; border: string }> = {
  Pending:   { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  Confirmed: { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
  Declined:  { bg: "#FEE2E2", color: "#DC2626", border: "#FECACA" },
  Cancelled: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
};

function DesktopBookingCard({ booking, venue }: { booking: BookingDto; venue?: CustomerVenueDto }) {
  const st = statusStyle[booking.status];
  const firstPhoto = venue && [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.photoUrl);

  return (
    <Link
      href={`/reservations/${booking.id}`}
      className="group flex flex-col md:flex-row rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg"
      style={{ background: "#ffffff", borderColor: "#c5c6cf" }}
    >
      {/* Photo */}
      <div className="w-full md:w-56 h-48 md:h-auto overflow-hidden shrink-0" style={{ background: "#1b2b4b" }}>
        {firstPhoto?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstPhoto.photoUrl}
            alt={venue?.name ?? ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-serif)" }}>
              {venue?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          {/* Status + ref */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ background: st.bg, color: st.color, borderColor: st.border, fontFamily: "var(--font-sans)" }}
            >
              {booking.status}
            </span>
            <span className="text-xs" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>
              #{shortId(booking.id)}
            </span>
          </div>

          {/* Venue name */}
          <h3
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-serif)", color: "#041635" }}
          >
            {venue?.name ?? "—"}
          </h3>
          {venue?.address && (
            <p className="flex items-center gap-1 mb-5 text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#75777f" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {venue.location ?? venue.address}
            </p>
          )}

          {/* Date / Time grid */}
          <div
            className="grid grid-cols-2 gap-4 py-4 border-y"
            style={{ borderColor: "#e4e2dd" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Date</p>
              <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
                {formatLocalDate(booking.startUtc)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Time</p>
              <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
                {formatLocalTime(booking.startUtc)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <span
            className="flex-1 py-3 rounded-full text-center text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90"
            style={{ background: "#041635", color: "#ffffff", fontFamily: "var(--font-sans)" }}
          >
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ReservationsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");

  const { data, isLoading } = useQuery({
    queryKey: ["myBookings"],
    queryFn: () => getMyBookings({ pageSize: 100 }),
    staleTime: 30_000,
  });

  const allBookings = data?.items ?? [];
  const upcoming = useMemo(() => allBookings.filter(isUpcoming).sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime()), [allBookings]);
  const past = useMemo(() => allBookings.filter((b) => !isUpcoming(b)).sort((a, b) => new Date(b.startUtc).getTime() - new Date(a.startUtc).getTime()), [allBookings]);
  const displayed = tab === "upcoming" ? upcoming : past;

  const { data: venuesData } = useQuery({
    queryKey: ["customerVenues", "", undefined, 1],
    queryFn: () => getCustomerVenues({ pageSize: 100 }),
    staleTime: 5 * 60_000,
  });
  const venueMap = Object.fromEntries((venuesData?.items ?? []).map((v) => [v.id, v]));

  return (
    <>
      {/* ═══ MOBILE (hidden on desktop) ══════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-full" style={{ background: "#fbf8fc" }}>
        <div className="px-5 pt-5 pb-0">
          <h1
            className="text-[28px] leading-9 mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "#041635", fontWeight: 700 }}
          >
            My Bookings
          </h1>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#e9e7eb" }}>
            {(["upcoming", "past"] as Tab[]).map((t) => {
              const active = tab === t;
              const count = t === "upcoming" ? upcoming.length : 0;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[9px] text-sm font-semibold capitalize transition-all"
                  style={{
                    fontFamily: "var(--font-sans)",
                    background: active ? "#ffffff" : "transparent",
                    color: active ? "#041635" : "#75777f",
                    boxShadow: active ? "0 1px 4px rgba(4,22,53,0.08)" : "none",
                  }}
                >
                  {t === "upcoming" ? "Upcoming" : "Past"}
                  {t === "upcoming" && count > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                      style={{
                        background: active ? "#9c440f" : "#c5c6cf",
                        color: active ? "#ffffff" : "#44474e",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 px-5 py-4 flex flex-col gap-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "#e9e7eb" }} />
            ))
          ) : displayed.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-18 h-18 rounded-full flex items-center justify-center mb-1" style={{ width: 72, height: 72, background: "#e9e7eb" }}>
                <svg className="w-9 h-9" style={{ color: "#44474e" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-base font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
                {tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
              </p>
              <p className="text-sm" style={{ color: "#44474e" }}>
                {tab === "upcoming" ? "Explore venues and make your first booking." : "Your completed bookings will appear here."}
              </p>
              {tab === "upcoming" && (
                <Link href="/discover" className="mt-2 px-6 py-3 rounded-lg text-sm font-semibold text-white" style={{ background: "#9c440f", fontFamily: "var(--font-sans)" }}>
                  Discover Venues
                </Link>
              )}
            </div>
          ) : (
            displayed.map((booking) => (
              <BookingCard key={booking.id} booking={booking} venueName={venueMap[booking.venueId]?.name} />
            ))
          )}
        </div>
      </div>

      {/* ═══ DESKTOP (hidden on mobile) ══════════════════════════════════ */}
      <div className="hidden lg:block" style={{ background: "#fbf9f4" }}>
        <div className="max-w-[1440px] mx-auto px-20 py-16">

          {/* Editorial header */}
          <div className="mb-16">
            <h1
              className="text-5xl font-bold mb-4"
              style={{ fontFamily: "var(--font-serif)", color: "#041635" }}
            >
              My Bookings
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
              Manage your upcoming reservations and explore your journey history.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">

            {/* Sidebar */}
            <aside className="col-span-4 flex flex-col gap-6">

              {/* Stats card */}
              <div className="p-8 rounded-xl shadow-sm relative overflow-hidden" style={{ background: "#1b2b4b" }}>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8393b8", fontFamily: "var(--font-sans)" }}>
                    Booking Overview
                  </p>
                  <div className="flex gap-8 mt-4">
                    <div>
                      <p className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>{upcoming.length}</p>
                      <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: "#8393b8", fontFamily: "var(--font-sans)" }}>Upcoming</p>
                    </div>
                    <div className="w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                    <div>
                      <p className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>{past.length}</p>
                      <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: "#8393b8", fontFamily: "var(--font-sans)" }}>Completed</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full" style={{ background: "rgba(156,68,15,0.15)" }} />
              </div>

              {/* Assistance card */}
              <div className="p-8 rounded-xl border" style={{ background: "#f5f3ee", borderColor: "#c5c6cf" }}>
                <h4 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-serif)", color: "#041635" }}>
                  Need assistance?
                </h4>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
                  Our team is available to help you with booking modifications or special requests.
                </p>
                <Link
                  href="/discover"
                  className="flex items-center gap-2 text-sm font-semibold hover:underline"
                  style={{ color: "#9c440f", fontFamily: "var(--font-sans)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover more venues
                </Link>
              </div>
            </aside>

            {/* Main: booking list */}
            <section className="col-span-8">

              {/* Tabs — underline style */}
              <div className="flex gap-10 border-b mb-10" style={{ borderColor: "#c5c6cf" }}>
                {(["upcoming", "past"] as Tab[]).map((t) => {
                  const active = tab === t;
                  const label = t === "upcoming" ? "Upcoming" : "Past Reservations";
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className="pb-4 text-sm font-bold uppercase tracking-widest transition-colors"
                      style={{
                        color: active ? "#9c440f" : "#44474e",
                        borderBottom: active ? "2px solid #9c440f" : "2px solid transparent",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {label}
                      {t === "upcoming" && upcoming.length > 0 && (
                        <span
                          className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: active ? "#9c440f" : "#e4e2dd", color: active ? "#ffffff" : "#44474e" }}
                        >
                          {upcoming.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex flex-col gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "#e4e2dd" }} />
                  ))}
                </div>
              )}

              {/* Empty */}
              {!isLoading && displayed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#e9e7eb" }}>
                    <svg className="w-10 h-10" style={{ color: "#44474e" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                  </div>
                  <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)", color: "#041635" }}>
                    {tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
                  </p>
                  <p className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
                    {tab === "upcoming" ? "Explore venues and make your first booking." : "Your completed bookings will appear here."}
                  </p>
                  {tab === "upcoming" && (
                    <Link
                      href="/discover"
                      className="mt-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90"
                      style={{ background: "#9c440f", fontFamily: "var(--font-sans)" }}
                    >
                      Discover Venues
                    </Link>
                  )}
                </div>
              )}

              {/* Cards */}
              {!isLoading && displayed.length > 0 && (
                <div className="flex flex-col gap-8">
                  {displayed.map((booking) => (
                    <DesktopBookingCard key={booking.id} booking={booking} venue={venueMap[booking.venueId]} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
