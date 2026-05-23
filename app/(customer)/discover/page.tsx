"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomerVenues, getVenueLocations } from "@/lib/api/customerVenues";
import { getVenueTypes } from "@/lib/api/venueTypes";
import { getPendingRatings } from "@/lib/api/ratingsApi";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { getCustomer } from "@/lib/api/customersApi";
import { VenueCard } from "@/components/customer/VenueCard";
import { getInitial } from "@/lib/utils";
import Link from "next/link";

const PAGE_SIZE = 20;
const LOCATION_KEY = "customer_location";

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
      style={{ background: "rgba(4,22,53,0.85)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center gap-6"
        style={{ background: "#fbf8fc" }}
      >
        <span
          className="text-[22px] font-bold tracking-[8px]"
          style={{ fontFamily: "var(--font-serif)", color: "#041635" }}
        >
          HYDRA
        </span>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#9c440f", fontFamily: "var(--font-sans)" }}>
            Welcome
          </p>
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: "#041635", fontWeight: 700 }}>
            Where are you visiting?
          </h2>
          <p className="text-sm mt-1" style={{ color: "#44474e" }}>Choose a location to discover venues</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          {loading
            ? [...Array(2)].map((_, i) => (
                <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "#e9e7eb" }} />
              ))
            : locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => onSelect(loc)}
                  className="w-full flex items-center justify-between px-5 h-14 rounded-2xl font-semibold text-base transition-all active:scale-[0.98]"
                  style={{ background: "#041635", color: "#ffffff", fontFamily: "var(--font-sans)" }}
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

// ─── Page ─────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { customerId } = useCustomerAuthStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

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
    setPage(1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, selectedTypeId]);

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

  const { data: typesData } = useQuery({
    queryKey: ["venueTypes"],
    queryFn: () => getVenueTypes(),
    staleTime: 5 * 60_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["customerVenues", debouncedSearch, selectedTypeId, page, location],
    queryFn: () =>
      getCustomerVenues({
        name: debouncedSearch || undefined,
        venueTypeId: selectedTypeId,
        page,
        pageSize: PAGE_SIZE,
        location: location ?? undefined,
      }),
    staleTime: 30_000,
    enabled: locationReady && !!location,
  });

  const { data: pendingRatings } = useQuery({
    queryKey: ["pendingRatings"],
    queryFn: getPendingRatings,
    staleTime: 60_000,
  });

  const venueTypes = typesData?.items ?? [];
  const venues = data?.items ?? [];
  const typeMap = Object.fromEntries(venueTypes.map((t) => [t.id, t]));
  const firstName = customer?.name?.split(" ")[0] ?? "";

  // ── Shared venue grid content ──────────────────────────────────
  const venueContent = (
    <div className="flex flex-col gap-3">
      {/* Pending ratings banners */}
      {(pendingRatings ?? []).length > 0 && (
        <div className="flex flex-col gap-2 mb-1">
          {pendingRatings!.map((r) => (
            <Link
              key={r.bookingId}
              href={`/venues/${r.venueId}/rate?bookingId=${r.bookingId}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Rate your visit</p>
                <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>{r.venueName}</p>
              </div>
              <span style={{ color: "#B45309" }}>★</span>
            </Link>
          ))}
        </div>
      )}

      {!location ? (
        <div className="hidden lg:flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-base font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
            Select a location from the sidebar
          </p>
          <p className="text-sm" style={{ color: "#44474e" }}>Choose a location to discover venues nearby.</p>
        </div>
      ) : isLoading ? (
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-[16px] overflow-hidden" style={{ background: "#e9e7eb" }}>
              <div className="animate-pulse" style={{ height: 256, background: "#e4e2e5" }} />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-5 rounded animate-pulse" style={{ background: "#e9e7eb", width: "60%" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "#e9e7eb", width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="flex items-center justify-center mb-1 rounded-full" style={{ width: 72, height: 72, background: "#e9e7eb" }}>
            <svg className="w-9 h-9" style={{ color: "#44474e" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
            {debouncedSearch ? `No results for "${debouncedSearch}"` : "No venues found"}
          </p>
          <p className="text-sm" style={{ color: "#44474e" }}>
            {debouncedSearch ? "Try a different search term." : "Try a different category."}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}
        >
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} venueType={typeMap[venue.venueTypeId]} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs" style={{ color: "#75777f" }}>
            Page {data.pageNumber} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!data.hasPreviousPage}
              className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
              style={{ borderColor: "#c5c6cf", color: "#041635", fontFamily: "var(--font-sans)" }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.hasNextPage}
              className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
              style={{ borderColor: "#c5c6cf", color: "#041635", fontFamily: "var(--font-sans)" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#fbf9f4" }}>

      {/* ═══ MOBILE: location modal (hidden on desktop) ═══════════════ */}
      {showLocationPicker && (
        <LocationPickerModal
          locations={locationsList ?? []}
          loading={locationsLoading}
          onSelect={handleSelectLocation}
        />
      )}

      {/* ═══ MOBILE: sticky header (hidden on desktop) ════════════════ */}
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5"
        style={{
          height: 64,
          background: "rgba(251,249,244,0.97)",
          borderBottom: "1px solid rgba(197,198,207,0.4)",
        }}
      >
        <button
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 px-3 h-8 rounded-full transition hover:bg-black/5"
          style={{ border: "1px solid rgba(197,198,207,0.7)" }}
        >
          <svg className="w-4 h-4" style={{ color: "#9c440f" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location && (
            <span className="text-xs font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
              {location}
            </span>
          )}
        </button>

        <span
          className="text-[22px] font-bold tracking-[8px]"
          style={{ fontFamily: "var(--font-serif)", color: "#041635" }}
        >
          HYDRA
        </span>

        <Link
          href="/profile"
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: "#9c440f", fontFamily: "var(--font-sans)" }}
        >
          {getInitial(customer?.name ?? "")}
        </Link>
      </div>

      {/* ═══ BODY: sidebar + main ══════════════════════════════════════ */}
      <div className="flex flex-1 lg:max-w-[1440px] lg:mx-auto lg:w-full">

        {/* ── DESKTOP SIDEBAR (hidden on mobile) ─────────────────── */}
        <aside
          className="hidden lg:flex flex-col w-80 shrink-0 sticky top-20 overflow-y-auto border-r"
          style={{
            height: "calc(100vh - 80px)",
            background: "#f5f3ee",
            borderColor: "#c5c6cf",
          }}
        >
          <div className="flex flex-col gap-4 p-8 h-full">
            {/* Header */}
            <div className="mb-4">
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-serif)", color: "#041635" }}
              >
                Filters
              </h2>
              <p className="text-xs font-medium mt-1" style={{ color: "#44474e" }}>
                Select your location
              </p>
            </div>

            {/* Location list */}
            <nav className="flex flex-col gap-2">
              {locationsLoading
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "#e4e2dd" }} />
                  ))
                : (locationsList ?? []).map((loc) => {
                    const active = location === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => handleSelectLocation(loc)}
                        className="flex items-center justify-between p-3 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
                        style={
                          active
                            ? { background: "#9c440f", color: "#ffffff" }
                            : { color: "#44474e", background: "transparent" }
                        }
                        onMouseEnter={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#e4e2dd";
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                            style={{ opacity: active ? 1 : 0 }}
                          >
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

        {/* ── MAIN CONTENT ───────────────────────────────────────── */}
        <section className="flex-1 min-w-0 flex flex-col">

          {/* DESKTOP: search bar + category chips */}
          <div className="hidden lg:block px-12 pt-12 pb-8 space-y-8">
            {/* Search */}
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Where would you like to go?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full py-5 px-8 pr-20 text-lg focus:outline-none focus:ring-2 shadow-sm"
                style={{
                  background: "#eae8e3",
                  color: "#1b1c19",
                  fontFamily: "var(--font-sans)",
                  ["--tw-ring-color" as string]: "#041635",
                }}
              />
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                style={{ background: "#041635" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-16 top-1/2 -translate-y-1/2"
                  style={{ color: "#75777f" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {[{ id: undefined, name: "All" }, ...venueTypes].map((type) => {
                const active = type.id === selectedTypeId;
                return (
                  <button
                    key={type.id ?? "all"}
                    onClick={() => setSelectedTypeId(active && type.id ? undefined : type.id)}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-all hover:opacity-90"
                    style={
                      active
                        ? { background: "#041635", color: "#ffffff", fontFamily: "var(--font-sans)" }
                        : { background: "#e4e2dd", color: "#44474e", fontFamily: "var(--font-sans)" }
                    }
                  >
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOBILE: search */}
          <div className="lg:hidden px-5 pb-2">
            <div className="flex items-center gap-2 px-3 h-12 rounded-xl border bg-white" style={{ borderColor: "#c5c6cf" }}>
              <svg className="w-5 h-5 shrink-0" style={{ color: "#75777f" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search venues…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: "#1b1b1e", fontFamily: "var(--font-sans)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "#75777f" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* MOBILE: category tabs (underline style) */}
          <div className="lg:hidden relative mt-2">
            <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <div className="flex px-5 gap-0" style={{ minWidth: "max-content" }}>
                {[{ id: undefined, name: "All" }, ...venueTypes].map((type) => {
                  const active = type.id === selectedTypeId;
                  return (
                    <button
                      key={type.id ?? "all"}
                      onClick={() => setSelectedTypeId(active && type.id ? undefined : type.id)}
                      className="relative flex flex-col items-center pb-3 pt-3 mr-6"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <span
                        className="text-sm font-semibold whitespace-nowrap"
                        style={{ color: active ? "#041635" : "#75777f" }}
                      >
                        {type.name}
                      </span>
                      {active && (
                        <span
                          className="absolute bottom-0 left-0 right-0 rounded-t-sm"
                          style={{ height: 2, background: "#9c440f" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0" style={{ height: 1, background: "rgba(197,198,207,0.5)" }} />
          </div>

          {/* Venue content area */}
          <div className="flex-1 px-5 lg:px-12 pt-4 lg:pt-0 pb-6 lg:pb-12">
            {venueContent}
          </div>
        </section>
      </div>

    </div>
  );
}
