"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAvailability } from "@/lib/api/customerBookings";
import { getCustomerVenue } from "@/lib/api/customerVenues";
import { getVenueTypes } from "@/lib/api/venueTypes";
import { AvailabilitySlot } from "@/types";
import { formatLocalTime, formatLocalDate } from "@/lib/utils";

const fmt24 = (utc: string) =>
  new Date(utc).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

export default function SlotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? "";
  const partySize = Number(searchParams.get("partySize") ?? "2");

  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);

  const { data: slots, isLoading, isError } = useQuery({
    queryKey: ["availability", id, date, partySize],
    queryFn: () => getAvailability({ venueId: id, date, partySize }),
    enabled: !!date,
    staleTime: 60_000,
    retry: false,
  });

  const { data: venue } = useQuery({
    queryKey: ["customerVenue", id],
    queryFn: () => getCustomerVenue(id),
    staleTime: 60_000,
  });

  const { data: typesData } = useQuery({
    queryKey: ["venueTypes"],
    queryFn: () => getVenueTypes(),
    staleTime: 5 * 60_000,
  });

  const handleContinue = () => {
    if (!selected) return;
    router.push(
      `/venues/${id}/confirm?startUtc=${encodeURIComponent(selected.startUtc)}&endUtc=${encodeURIComponent(selected.endUtc)}&partySize=${partySize}`
    );
  };

  const venueType = typesData?.items.find((t) => t.id === venue?.venueTypeId);
  const firstPhoto = venue && [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.photoUrl);
  const formattedDate = date ? formatLocalDate(date + "T12:00:00Z") : "";

  // ── Shared slot button renderer ──────────────────────────────────
  const SlotButton = ({ slot, label }: { slot: AvailabilitySlot; label: string }) => {
    const isSel = selected?.startUtc === slot.startUtc;
    return (
      <button
        type="button"
        onClick={() => setSelected(isSel ? null : slot)}
        className={`py-4 rounded-lg text-sm font-semibold border transition-all ${
          isSel
            ? "shadow-md scale-105 z-10 ring-4"
            : "bg-white hover:border-[#9c440f] hover:text-[#9c440f]"
        }`}
        style={
          isSel
            ? { background: "#9c440f", color: "#ffffff", borderColor: "#9c440f", ringColor: "rgba(156,68,15,0.15)", fontFamily: "var(--font-sans)" }
            : { borderColor: "#c5c6cf", color: "#44474e", fontFamily: "var(--font-sans)" }
        }
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#fbf9f4" }}>

      {/* ═══ MOBILE (hidden on desktop) ══════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-full">
        <div style={{ padding: "48px 20px 16px", background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition text-xl" style={{ color: "#041635" }}>‹</button>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>Choose a time</h1>
            <p className="text-xs text-gray-500">
              {formattedDate} · {partySize} guests
            </p>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          {isLoading && (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[#44474e] text-sm">Could not load slots. Try a different date.</p>
            </div>
          )}

          {slots && slots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[#44474e] text-sm font-medium">No availability</p>
              <p className="text-xs text-[#75777f] mt-1">Try a different date or party size.</p>
            </div>
          )}

          {slots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {slots.map((slot) => {
                const isSelected = selected?.startUtc === slot.startUtc;
                return (
                  <button
                    key={slot.startUtc}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : slot)}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors border
                      ${isSelected
                        ? "bg-[#C4622D] text-white border-[#C4622D]"
                        : "bg-white text-[#1B2B4B] border-gray-200 hover:border-[#C4622D]"
                      }`}
                  >
                    {formatLocalTime(slot.startUtc)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div className="px-4 pb-6 pt-2">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-[#C4622D] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#b0561f] transition-colors"
            >
              Continue — {formatLocalTime(selected.startUtc)}
            </button>
          </div>
        )}
      </div>

      {/* ═══ DESKTOP (hidden on mobile) ══════════════════════════════════ */}
      <div className="hidden lg:flex flex-col">

        {/* Hero */}
        <section className="relative h-[480px] w-full overflow-hidden">
          {firstPhoto?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstPhoto.photoUrl}
              alt={venue?.name ?? ""}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full" style={{ background: "#1b2b4b" }} />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(4,22,53,0.7) 0%, transparent 55%)" }}
          />
          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-[1440px] mx-auto px-20 pb-12">
              <div className="max-w-3xl">
                <nav className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {venue?.location && <span>{venue.location}</span>}
                  {venue?.location && venueType && <span>·</span>}
                  {venueType && <span>{venueType.name}</span>}
                </nav>
                <h1
                  className="text-5xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-serif)", lineHeight: 1.15 }}
                >
                  {venue?.name ?? ""}
                </h1>
                {venue?.averageRating != null && (
                  <div className="flex items-center gap-1.5 text-white">
                    <span style={{ color: "#ffdbcc" }}>★</span>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                      {venue.averageRating.toFixed(1)} ({venue.ratingCount.toLocaleString()} Reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="max-w-[1440px] mx-auto w-full px-20 py-16">
          <div className="grid grid-cols-12 gap-8">

            {/* Left: slot selection */}
            <div className="col-span-8 space-y-16">

              {/* Header */}
              <header className="flex items-end justify-between border-b pb-8" style={{ borderColor: "#c5c6cf" }}>
                <div>
                  <h2
                    className="text-4xl font-semibold mb-2"
                    style={{ fontFamily: "var(--font-serif)", color: "#041635" }}
                  >
                    Available Time Slots
                  </h2>
                  <p className="text-lg" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
                    For {formattedDate}, {partySize} {partySize === 1 ? "Guest" : "Guests"}
                  </p>
                </div>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border rounded-lg transition hover:bg-[#f0eee9]"
                  style={{ color: "#041635", borderColor: "#041635", fontFamily: "var(--font-sans)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                  Change Date or Party
                </button>
              </header>

              {/* Loading */}
              {isLoading && (
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "#e4e2dd" }} />
                  ))}
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="py-20 text-center">
                  <p style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
                    Could not load slots. Try a different date.
                  </p>
                </div>
              )}

              {/* Empty */}
              {slots && slots.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)", color: "#041635" }}>
                    No availability
                  </p>
                  <p className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>
                    Try a different date or party size.
                  </p>
                </div>
              )}

              {/* Slots grid */}
              {slots && slots.length > 0 && (
                <div className="grid grid-cols-5 gap-4">
                  {slots.map((slot) => (
                    <SlotButton key={slot.startUtc} slot={slot} label={fmt24(slot.startUtc)} />
                  ))}
                </div>
              )}

              {/* Policy info box */}
              {slots && slots.length > 0 && (
                <div
                  className="p-8 rounded-xl flex items-start gap-6 border-l-4 shadow-sm"
                  style={{ background: "#1b2b4b", borderLeftColor: "#9c440f" }}
                >
                  <svg className="w-8 h-8 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#ffdbcc" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-serif)" }}>
                      Reservation Policy
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#8393b8", fontFamily: "var(--font-sans)" }}>
                      Selected time slots are held for{" "}
                      <span className="text-white font-bold">10 minutes</span>{" "}
                      while you complete your details. We offer a 15-minute grace period for all reservations.
                      Cancellations must be made at least 24 hours in advance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: booking summary */}
            <div className="col-span-4">
              <div
                className="sticky top-32 p-10 rounded-xl border shadow-lg"
                style={{ background: "#f5f3ee", borderColor: "#c5c6cf" }}
              >
                <h3
                  className="text-2xl font-semibold mb-6 pb-4 border-b"
                  style={{ fontFamily: "var(--font-serif)", color: "#041635", borderColor: "#c5c6cf" }}
                >
                  Booking Summary
                </h3>

                <div className="flex flex-col gap-5 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Venue</span>
                    <span className="text-sm font-bold text-right max-w-[60%]" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
                      {venue?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Date</span>
                    <span className="text-sm font-bold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{formattedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Party Size</span>
                    <span className="text-sm font-bold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
                      {partySize} {partySize === 1 ? "Guest" : "Guests"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Selected Time</span>
                    <span
                      className="text-3xl font-extrabold"
                      style={{ color: "#9c440f", fontFamily: "var(--font-serif)" }}
                    >
                      {selected ? fmt24(selected.startUtc) : "—"}
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ background: "#ffdbcc", color: "#351000" }}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Booking Fee</span>
                    </div>
                    <span className="text-sm font-bold uppercase" style={{ fontFamily: "var(--font-sans)" }}>Free</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selected}
                  className="w-full py-5 text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-3 shadow-xl"
                  style={{ background: "#041635", fontFamily: "var(--font-sans)" }}
                >
                  Continue to Reservation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <p className="mt-6 text-center text-xs px-4" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>
                  By continuing, you agree to our terms and cancellation policy.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
