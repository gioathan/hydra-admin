"use client";

import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUpcomingEvents, getVenueLocations } from "@/lib/api/customerVenues";
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

function EventCard({ event }: { event: EventListItemDto }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = !!event.mainPhotoUrl && !imgError;
  const day = new Date(event.startsAtUtc).toLocaleDateString(undefined, { day: "numeric" });
  const month = new Date(event.startsAtUtc).toLocaleDateString(undefined, { month: "short" }).toUpperCase();

  return (
    <Link
      href={`/venues/${event.venueId}`}
      className="group block rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{
        background: "#fff",
        border: "1px solid rgba(197,198,207,0.4)",
        boxShadow: "0 4px 24px rgba(4,22,53,0.06)",
      }}
    >
      {/* Photo area */}
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
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#e8e0f0" }}>
            <svg className="w-12 h-12" fill="none" stroke="rgba(156,68,15,0.3)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Date badge */}
        <div
          className="absolute top-3 left-3 flex flex-col items-center rounded-xl px-3 py-2"
          style={{ background: "#9c440f", minWidth: 44 }}
        >
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

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold leading-snug line-clamp-2" style={{ fontSize: 17, fontFamily: "var(--font-serif)", color: "#041635" }}>
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#9c440f" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: "#9c440f", fontFamily: "var(--font-sans)" }}>
            {formatEventDate(event.startsAtUtc, event.endsAtUtc)}
          </span>
        </div>

        {event.description && (
          <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          {event.venueLocation && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#f3f0f7", color: "#44474e", fontFamily: "var(--font-sans)" }}
            >
              {event.venueLocation}
            </span>
          )}
          <span className="text-xs font-semibold ml-auto flex items-center gap-1" style={{ color: "#9c440f", fontFamily: "var(--font-sans)" }}>
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

export default function EventsPage() {
  const [location, setLocation] = useState<string | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    setLocation(saved ?? null);
    setLocationReady(true);
    getVenueLocations().then(setLocations).catch(() => {});
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["customerEvents", location],
    queryFn: ({ pageParam = 1 }) => getUpcomingEvents(pageParam as number, PAGE_SIZE, location),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasNextPage ? last.pageNumber + 1 : undefined,
    enabled: locationReady,
  });

  const events = data?.pages.flatMap((p) => p.items) ?? [];

  const handleLocationChange = useCallback((loc: string) => {
    setLocation(loc || null);
    if (loc) localStorage.setItem(LOCATION_KEY, loc);
    else localStorage.removeItem(LOCATION_KEY);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-20 py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#9c440f", fontFamily: "var(--font-sans)" }}>
            UPCOMING
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "#041635" }}>
            Events
          </h1>
        </div>

        {/* Location filter */}
        {locations.length > 0 && (
          <div className="flex items-center gap-2 mt-4 lg:mt-0">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#9c440f" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <select
              value={location ?? ""}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="text-sm font-semibold rounded-xl px-3 py-2 border outline-none appearance-none cursor-pointer"
              style={{
                background: "#fbf9f4",
                borderColor: "#c5c6cf",
                color: "#041635",
                fontFamily: "var(--font-sans)",
              }}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(197,198,207,0.4)" }}>
              <div className="h-48 animate-pulse" style={{ background: "#e9e7eb" }} />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 rounded animate-pulse" style={{ background: "#e9e7eb", width: "75%" }} />
                <div className="h-3 rounded animate-pulse" style={{ background: "#e9e7eb", width: "50%" }} />
                <div className="h-3 rounded animate-pulse" style={{ background: "#e9e7eb", width: "90%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f3f0f7" }}>
            <svg className="w-8 h-8" fill="none" stroke="#9c440f" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "#041635" }}>No upcoming events</p>
          <p className="text-sm text-center" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
            {location ? `No events found in ${location}. Check back soon!` : "No events scheduled. Check back soon!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
                style={{ background: "#041635", color: "#fff", fontFamily: "var(--font-sans)" }}
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
