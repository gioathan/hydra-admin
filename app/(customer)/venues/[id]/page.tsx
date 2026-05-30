"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCustomerVenue } from "@/lib/api/customerVenues";
import { getCustomerVenueTypes as getVenueTypes } from "@/lib/api/customerVenues";
import { PhotoSlider } from "@/components/customer/PhotoSlider";
import { StarRating } from "@/components/customer/StarRating";
import { CalendarPicker } from "@/components/customer/CalendarPicker";
import { formatDateParam } from "@/lib/utils";

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [pricingOpen, setPricingOpen] = useState(false);

  const { data: venue, isLoading } = useQuery({
    queryKey: ["customerVenue", id],
    queryFn: () => getCustomerVenue(id),
    staleTime: 60_000,
  });

  const { data: typesData } = useQuery({
    queryKey: ["venueTypes"],
    queryFn: () => getVenueTypes(),
    staleTime: 5 * 60_000,
  });

  const venueType = typesData?.items.find((t) => t.id === venue?.venueTypeId);

  const handleCheckAvailability = () => {
    if (!selectedDate) return;
    const dateParam = formatDateParam(selectedDate);
    router.push(`/venues/${id}/slots?date=${dateParam}&partySize=${partySize}`);
  };

  if (isLoading || !venue) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="h-64 lg:h-[480px] bg-gray-200" />
        <div className="p-4 lg:p-20 flex flex-col gap-3">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const firstPhoto = [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.photoUrl);
  const sortedPhotos = [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).filter((p) => p.photoUrl);

  const pricingGroups = [...venue.pricingItems]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .reduce((map, item) => {
      const key = item.category ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
      return map;
    }, new Map<string, typeof venue.pricingItems>());

  const hasPricing = venue.pricingItems.length > 0;

  return (
    <>
      {/* ═══ MOBILE (hidden on desktop) ═════════════════════════════════ */}
      <div className="lg:hidden relative flex flex-col pb-4">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="bg-black/40 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <PhotoSlider photos={venue.photos} name={venue.name} height="h-72" />

        <div className="px-4 py-5 flex flex-col gap-6">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#1B2B4B]">{venue.name}</h1>
              {venueType && (
                <span className="text-xs font-medium bg-[#1B2B4B]/10 text-[#1B2B4B] px-2.5 py-0.5 rounded-full flex-shrink-0 mt-1">
                  {venueType.name}
                </span>
              )}
            </div>
            <p className="text-sm text-[#75777f]">{venue.address}</p>
            <div className="flex items-center gap-3 mt-2">
              {venue.averageRating != null && venue.ratingCount > 0 ? (
                <StarRating rating={venue.averageRating} count={venue.ratingCount} size="md" />
              ) : (
                <span className="text-sm" style={{ color: "#75777f" }}>No reviews yet</span>
              )}
              <span className="text-sm text-[#75777f]">· Capacity {venue.capacity}</span>
            </div>
            {venue.googleMapsUrl && (
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium hover:underline"
                style={{ color: "#9c440f" }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open in Maps
              </a>
            )}
            {venue.description && (
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "#4b4f5a" }}>{venue.description}</p>
            )}
          </div>

          {hasPricing && (
            <button
              type="button"
              onClick={() => setPricingOpen(true)}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border font-semibold text-sm transition-colors"
              style={{ background: "#fff7f4", borderColor: "#9c440f", color: "#9c440f" }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Menu &amp; Pricing
            </button>
          )}

          <div>
            <h2 className="text-base font-semibold text-[#1B2B4B] mb-3">Select a date</h2>
            <CalendarPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#1B2B4B] mb-3">Party size</h2>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setPartySize((s) => Math.max(1, s - 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl text-[#1B2B4B] hover:bg-gray-50 disabled:opacity-30"
                disabled={partySize <= 1}
              >
                −
              </button>
              <span className="text-2xl font-bold text-[#1B2B4B] w-8 text-center">{partySize}</span>
              <button
                type="button"
                onClick={() => setPartySize((s) => Math.min(venue.capacity, s + 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl text-[#1B2B4B] hover:bg-gray-50 disabled:opacity-30"
                disabled={partySize >= venue.capacity}
              >
                +
              </button>
              <span className="text-sm text-[#75777f]">max {venue.capacity}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={!selectedDate}
            className="w-full bg-[#C4622D] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#b0561f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedDate ? "See Available Slots" : "Select a date first"}
          </button>
        </div>
      </div>

      {/* ═══ DESKTOP (hidden on mobile) ══════════════════════════════════ */}
      <div className="hidden lg:flex flex-col" style={{ background: "#fbf9f4" }}>

        {/* Hero */}
        <section className="relative h-[480px] w-full overflow-hidden">
          {sortedPhotos.length === 0 ? (
            <div className="w-full h-full" style={{ background: "#1b2b4b" }} />
          ) : sortedPhotos.length === 1 ? (
            <Image src={sortedPhotos[0].photoUrl!} alt={venue.name} fill className="object-cover object-center" sizes="100vw" priority />
          ) : (
            <div className="flex h-full gap-0.5">
              {/* Main photo */}
              <div className="relative flex-[3] overflow-hidden">
                <Image src={sortedPhotos[0].photoUrl!} alt={venue.name} fill className="object-cover" sizes="60vw" priority />
              </div>
              {/* Side grid — up to 4 thumbnails */}
              <div
                className="flex-[2] grid gap-0.5"
                style={{
                  gridTemplateColumns: sortedPhotos.length >= 4 ? "1fr 1fr" : "1fr",
                  gridTemplateRows: `repeat(${sortedPhotos.length >= 4 ? 2 : Math.min(sortedPhotos.length - 1, 3)}, 1fr)`,
                }}
              >
                {sortedPhotos.slice(1, 5).map((photo, i) => (
                  <div key={i} className="relative overflow-hidden">
                    <Image src={photo.photoUrl!} alt={venue.name} fill className="object-cover" sizes="20vw" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(4,22,53,0.7) 0%, transparent 55%)" }}
          />
          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-[1440px] mx-auto px-20 pb-12">
              <div className="max-w-3xl">
                <nav className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {venue.location && <span>{venue.location}</span>}
                  {venue.location && venueType && <span>·</span>}
                  {venueType && <span>{venueType.name}</span>}
                </nav>
                <h1
                  className="text-5xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-serif)", lineHeight: 1.15 }}
                >
                  {venue.name}
                </h1>
                <div className="flex items-center gap-4 text-white">
                  {venue.averageRating != null && venue.ratingCount > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: "#ffdbcc" }}>★</span>
                      <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                        {venue.averageRating.toFixed(1)} ({venue.ratingCount.toLocaleString()} Reviews)
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans)" }}>
                      No reviews yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="max-w-[1440px] mx-auto w-full px-20 py-16">
          <div className="grid grid-cols-12 gap-8">

            {/* Left: venue info */}
            <div className="col-span-8 space-y-10">
              {/* Back */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
                style={{ color: "#041635", fontFamily: "var(--font-sans)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to venues
              </button>

              {/* Info cards */}
              <div className="grid grid-cols-2 gap-6">
                {/* Address */}
                <div
                  className="flex items-start gap-4 p-6 rounded-xl border"
                  style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "#9c440f" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Address</p>
                    <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{venue.address}</p>
                    {venue.googleMapsUrl && (
                      <a
                        href={venue.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold hover:underline"
                        style={{ color: "#9c440f", fontFamily: "var(--font-sans)" }}
                      >
                        Open in Maps →
                      </a>
                    )}
                  </div>
                </div>

                {/* Capacity */}
                <div
                  className="flex items-start gap-4 p-6 rounded-xl border"
                  style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "#9c440f" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Capacity</p>
                    <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>Up to {venue.capacity} guests</p>
                  </div>
                </div>

                {/* Rating */}
                <div
                  className="flex items-start gap-4 p-6 rounded-xl border"
                  style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#9c440f" }}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Rating</p>
                    {venue.averageRating != null && venue.ratingCount > 0 ? (
                      <StarRating rating={venue.averageRating} count={venue.ratingCount} size="md" />
                    ) : (
                      <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>No reviews yet</p>
                    )}
                  </div>
                </div>

                {/* Venue type */}
                {venueType && (
                  <div
                    className="flex items-start gap-4 p-6 rounded-xl border"
                    style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "#9c440f" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Venue Type</p>
                      <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{venueType.name}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {venue.location && (
                  <div
                    className="flex items-start gap-4 p-6 rounded-xl border"
                    style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "#9c440f" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Location</p>
                      <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{venue.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {venue.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-3" style={{ color: "#041635", fontFamily: "var(--font-serif)" }}>About</h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#4b4f5a", fontFamily: "var(--font-sans)" }}>{venue.description}</p>
                </div>
              )}
            </div>

            {/* Right: booking card */}
            <div className="col-span-4">
              <div
                className="sticky top-32 p-10 rounded-xl border shadow-lg"
                style={{ background: "#f5f3ee", borderColor: "#c5c6cf" }}
              >
                <h3
                  className="text-2xl font-semibold mb-6 pb-4 border-b"
                  style={{ fontFamily: "var(--font-serif)", color: "#041635", borderColor: "#c5c6cf" }}
                >
                  Make a Reservation
                </h3>

                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Select a Date</p>
                    <CalendarPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Party Size</p>
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-white" style={{ borderColor: "#e4e2dd" }}>
                      <button
                        type="button"
                        onClick={() => setPartySize((s) => Math.max(1, s - 1))}
                        disabled={partySize <= 1}
                        className="w-10 h-10 rounded-full border flex items-center justify-center text-xl font-light transition hover:bg-gray-50 disabled:opacity-30"
                        style={{ borderColor: "#c5c6cf", color: "#041635" }}
                      >
                        −
                      </button>
                      <div className="text-center">
                        <span className="text-3xl font-bold" style={{ color: "#041635", fontFamily: "var(--font-serif)" }}>{partySize}</span>
                        <p className="text-xs mt-0.5" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>max {venue.capacity}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPartySize((s) => Math.min(venue.capacity, s + 1))}
                        disabled={partySize >= venue.capacity}
                        className="w-10 h-10 rounded-full border flex items-center justify-center text-xl font-light transition hover:bg-gray-50 disabled:opacity-30"
                        style={{ borderColor: "#c5c6cf", color: "#041635" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {hasPricing && (
                    <button
                      type="button"
                      onClick={() => setPricingOpen(true)}
                      className="w-full py-3.5 text-sm font-semibold rounded-lg border transition-colors flex items-center justify-center gap-2"
                      style={{ background: "#fff7f4", borderColor: "#9c440f", color: "#9c440f", fontFamily: "var(--font-sans)" }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Menu &amp; Pricing
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    disabled={!selectedDate}
                    className="w-full py-5 text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-3 shadow-xl"
                    style={{ background: "#041635", fontFamily: "var(--font-sans)" }}
                  >
                    {selectedDate ? "See Available Slots" : "Select a Date First"}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ═══ PRICING MODAL ══════════════════════════════════════════════ */}
      {pricingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          onClick={() => setPricingOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Sheet */}
          <div
            className="relative w-full lg:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl shadow-2xl"
            style={{ background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
              style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
            >
              <h2 className="text-base font-bold" style={{ color: "#041635", fontFamily: "var(--font-serif)" }}>
                Menu &amp; Pricing
              </h2>
              <button
                onClick={() => setPricingOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: "#75777f" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 pt-4 flex flex-col gap-6">
              {Array.from(pricingGroups.entries()).map(([category, items]) => (
                <div key={category || "__uncategorised__"}>
                  {category && (
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9c440f" }}>
                        {category}
                      </h3>
                      <div className="flex-1 h-px" style={{ background: "#f0d4c8" }} />
                    </div>
                  )}
                  <div className="flex flex-col divide-y" style={{ borderColor: "#f0eee9" }}>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold" style={{ color: "#1b2b4b" }}>{item.title}</span>
                          {item.subtitle && (
                            <span className="text-xs" style={{ color: "#75777f" }}>{item.subtitle}</span>
                          )}
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: "#9c440f" }}>
                          €{item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
