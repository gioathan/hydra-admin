"use client";

import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getUpcomingEvents, getVenueLocations } from "@/lib/api/customerVenues";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { getCustomer } from "@/lib/api/customersApi";
import { getInitial } from "@/lib/utils";
import Link from "next/link";
import type { EventListItemDto } from "@/types";

const PAGE_SIZE = 10;
const LOCATION_KEY = "customer_location";

function formatEventDate(startsAtUtc: string, endsAtUtc: string | null): string {
  const start = new Date(startsAtUtc);
  const dateStr = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (!endsAtUtc) return `${dateStr} · ${startTime}`;
  const end = new Date(endsAtUtc);
  const endTime = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

// ─── Mobile Location Picker Modal ────────────────────────────────

function LocationPickerModal({
  locations,
  loading,
  onSelect,
}: {
  locations: string[];
  loading: boolean;
  onSelect: (loc: string) => void;
}) {
  return (
    <div
      className="lg:hidden fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "rgba(12, 54, 72,0.85)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center gap-6"
        style={{ background: "#FAF6EF" }}
      >
        <span className="text-[22px] font-bold tracking-[8px]" style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D" }}>
          HYDRA
        </span>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#C25B3C", fontFamily: "var(--font-sans)" }}>
            Events
          </p>
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D", fontWeight: 700 }}>
            Where are you visiting?
          </h2>
          <p className="text-sm mt-1" style={{ color: "#566572" }}>Choose a location to see upcoming events</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          {loading
            ? [...Array(2)].map((_, i) => (
                <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "#ECE3D4" }} />
              ))
            : locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => onSelect(loc)}
                  className="w-full flex items-center justify-between px-5 h-14 rounded-2xl font-semibold text-base transition-all active:scale-[0.98]"
                  style={{ background: "#0C5F7D", color: "#ffffff", fontFamily: "var(--font-sans)" }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {loc}
                  </span>
                  <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────

function EventCard({ event }: { event: EventListItemDto }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = !!event.mainPhotoUrl && !imgError;
  const day = new Date(event.startsAtUtc).toLocaleDateString(undefined, { day: "numeric" });
  const month = new Date(event.startsAtUtc).toLocaleDateString(undefined, { month: "short" }).toUpperCase();

  return (
    <Link
      href={`/venues/${event.venueId}`}
      className="group block rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ background: "#fff", border: "1px solid rgba(225, 215, 198,0.4)", boxShadow: "0 4px 24px rgba(12, 54, 72,0.06)" }}
    >
      <div className="relative h-48 overflow-hidden">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.mainPhotoUrl!}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#D3E7EE" }}>
            <svg className="w-12 h-12" fill="none" stroke="rgba(194, 91, 60,0.3)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-3 left-3 flex flex-col items-center rounded-xl px-3 py-2" style={{ background: "#C25B3C", minWidth: 44 }}>
          <span className="text-white font-bold leading-none" style={{ fontSize: 20, fontFamily: "var(--font-serif)" }}>{day}</span>
          <span className="text-white/80 font-bold tracking-widest" style={{ fontSize: 9, fontFamily: "var(--font-sans)" }}>{month}</span>
        </div>

        {/* Scrim + venue name */}
        <div className="absolute bottom-0 left-0 right-0 h-14" style={{ background: "rgba(0,0,0,0.45)" }} />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="rgba(255,255,255,0.75)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-sans)" }}>
            {event.venueName}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold leading-snug line-clamp-2" style={{ fontSize: 17, fontFamily: "var(--font-serif)", color: "#0C5F7D" }}>
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#C25B3C" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: "#C25B3C", fontFamily: "var(--font-sans)" }}>
            {formatEventDate(event.startsAtUtc, event.endsAtUtc)}
          </span>
        </div>
        {event.description && (
          <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>
            {event.description}
          </p>
        )}
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "#C25B3C", fontFamily: "var(--font-sans)" }}>
            View venue
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function EventsPage() {
  const { customerId } = useCustomerAuthStore();
  const [location, setLocation] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      setLocation(saved);
    } else {
      setShowLocationPicker(true);
    }
    setLocationReady(true);
  }, []);

  const handleSelectLocation = useCallback((loc: string) => {
    localStorage.setItem(LOCATION_KEY, loc);
    setLocation(loc);
    setShowLocationPicker(false);
  }, []);

  const { data: locationsList, isLoading: locationsLoading } = useQuery({
    queryKey: ["venueLocations"],
    queryFn: getVenueLocations,
    staleTime: 10 * 60_000,
    enabled: locationReady,
    retry: false,
  });

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60_000,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["customerEvents", location],
    queryFn: ({ pageParam = 1 }) => getUpcomingEvents(pageParam as number, PAGE_SIZE, location),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasNextPage ? last.pageNumber + 1 : undefined,
    enabled: locationReady && !!location,
  });

  const events = data?.pages.flatMap((p) => p.items) ?? [];

  const eventsContent = (
    <div className="flex flex-col gap-3">
      {!location ? (
        <div className="hidden lg:flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-base font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
            Select a location from the sidebar
          </p>
          <p className="text-sm" style={{ color: "#566572" }}>Choose a location to see upcoming events.</p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(225, 215, 198,0.4)" }}>
              <div className="h-48 animate-pulse" style={{ background: "#ECE3D4" }} />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 rounded animate-pulse" style={{ background: "#ECE3D4", width: "75%" }} />
                <div className="h-3 rounded animate-pulse" style={{ background: "#ECE3D4", width: "50%" }} />
                <div className="h-3 rounded animate-pulse" style={{ background: "#ECE3D4", width: "90%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="flex items-center justify-center mb-1 rounded-full" style={{ width: 72, height: 72, background: "#ECE3D4" }}>
            <svg className="w-9 h-9" style={{ color: "#566572" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>No upcoming events</p>
          <p className="text-sm" style={{ color: "#566572" }}>
            {location ? `No events found in ${location}. Check back soon!` : "No events scheduled. Check back soon!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
                style={{ background: "#0C5F7D", color: "#fff", fontFamily: "var(--font-sans)" }}
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAF6EF" }}>

      {/* Mobile location picker modal */}
      {showLocationPicker && (
        <LocationPickerModal
          locations={locationsList ?? []}
          loading={locationsLoading}
          onSelect={handleSelectLocation}
        />
      )}

      {/* Mobile sticky header */}
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5"
        style={{
          height: 64,
          background: "rgba(250, 246, 239,0.97)",
          borderBottom: "1px solid rgba(225, 215, 198,0.4)",
        }}
      >
        <button
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 px-3 h-8 rounded-full transition hover:bg-black/5"
          style={{ border: "1px solid rgba(225, 215, 198,0.7)" }}
        >
          <svg className="w-4 h-4" style={{ color: "#C25B3C" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location && (
            <span className="text-xs font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
              {location}
            </span>
          )}
        </button>

        <span className="text-[22px] font-bold tracking-[8px]" style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D" }}>
          HYDRA
        </span>

        <Link
          href="/profile"
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: "#C25B3C", fontFamily: "var(--font-sans)" }}
        >
          {getInitial(customer?.name ?? "")}
        </Link>
      </div>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 lg:max-w-[1440px] lg:mx-auto lg:w-full">

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col w-80 shrink-0 sticky top-20 overflow-y-auto border-r"
          style={{ height: "calc(100vh - 80px)", background: "#F4EDE1", borderColor: "#E1D7C6" }}
        >
          <div className="flex flex-col gap-4 p-8 h-full">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D" }}>
                Location
              </h2>
              <p className="text-xs font-medium mt-1" style={{ color: "#566572" }}>
                Filter events by location
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {locationsLoading
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "#E6DCCC" }} />
                  ))
                : (locationsList ?? []).map((loc) => {
                    const active = location === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => handleSelectLocation(loc)}
                        className="flex items-center justify-between p-3 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
                        style={active ? { background: "#C25B3C", color: "#ffffff" } : { color: "#566572", background: "transparent" }}
                        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#E6DCCC"; }}
                        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ opacity: active ? 1 : 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span style={{ fontFamily: "var(--font-sans)" }}>{loc}</span>
                        </div>
                        {active && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 min-w-0 flex flex-col">
          <div className="hidden lg:block px-12 pt-12 pb-8">
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#C25B3C", fontFamily: "var(--font-sans)" }}>
              UPCOMING
            </p>
            <h1 className="text-5xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D" }}>
              Events
            </h1>
          </div>

          <div className="flex-1 px-5 lg:px-12 pt-4 lg:pt-0 pb-6 lg:pb-12">
            {eventsContent}
          </div>
        </section>
      </div>
    </div>
  );
}
