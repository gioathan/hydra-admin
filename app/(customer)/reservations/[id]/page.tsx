"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBooking, cancelBooking } from "@/lib/api/customerBookings";
import { getCustomerVenue } from "@/lib/api/customerVenues";
import { extractErrorMessage } from "@/lib/axios";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { formatLocalDate, formatLocalTime, shortId } from "@/lib/utils";
import { BookingStatus } from "@/types";

const statusStyles: Record<BookingStatus, string> = {
  Pending:   "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-green-50 text-green-700 border-green-200",
  Declined:  "bg-red-50 text-red-600 border-red-200",
  Cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusDesktop: Record<BookingStatus, { bg: string; color: string; border: string }> = {
  Pending:   { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  Confirmed: { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
  Declined:  { bg: "#FEE2E2", color: "#DC2626", border: "#FECACA" },
  Cancelled: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
};

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();


  const [showCancel, setShowCancel] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
    staleTime: 30_000,
  });

  const { data: venue } = useQuery({
    queryKey: ["customerVenue", booking?.venueId],
    queryFn: () => getCustomerVenue(booking!.venueId),
    enabled: !!booking?.venueId,
    staleTime: 60_000,
  });

  const { mutate: doCancel, isPending: cancelling, error: cancelError } = useMutation({
    mutationFn: () => cancelBooking(id, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      setShowCancel(false);
    },
  });

  if (isLoading || !booking) {
    return (
      <div className="flex flex-col gap-4 p-4 pt-10 lg:max-w-[1440px] lg:mx-auto lg:px-20 lg:py-16">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#e4e2dd" }} />
        ))}
      </div>
    );
  }

  const canCancel = booking.status === "Pending" || booking.status === "Confirmed";
  const firstPhoto = venue && [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.photoUrl);
  const st = statusDesktop[booking.status];

  return (
    <>
      {/* ═══ MOBILE (hidden on desktop) ══════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-full">
        <div style={{ padding: "48px 20px 16px", background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition text-xl" style={{ color: "#041635" }}>‹</button>
          <h1 className="text-lg font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>Reservation</h1>
        </div>

        <div className="flex-1 px-4 py-5 flex flex-col gap-4">
          <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${statusStyles[booking.status]}`}>
            {booking.status}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            <Row label="Venue" value={venue?.name ?? "—"} />
            <Row label="Reference" value={`#${shortId(booking.id)}`} />
            <Row label="Date" value={formatLocalDate(booking.startUtc)} />
            <Row label="Time" value={`${formatLocalTime(booking.startUtc)} – ${formatLocalTime(booking.endUtc)}`} />
            <Row label="Guests" value={`${booking.partySize}`} />
            {venue?.address && <Row label="Address" value={venue.address} />}
          </div>

          {booking.venueComment && (
            <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
              <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#b45309" }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#b45309", fontFamily: "var(--font-sans)" }}>
                  Message from {venue?.name ?? "Venue"}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#92400e", fontFamily: "var(--font-sans)" }}>
                  {booking.venueComment}
                </p>
              </div>
            </div>
          )}

          {canCancel && !showCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full border border-red-200 text-red-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              Cancel Reservation
            </button>
          )}

          {showCancel && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#1B2B4B]">Cancel this reservation?</p>
              <p className="text-xs" style={{ color: "#75777f" }}>This action cannot be undone.</p>
              {cancelError && (
                <p className="text-xs text-red-600">{extractErrorMessage(cancelError)}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowCancel(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Keep it
                </button>
                <button
                  onClick={() => doCancel()}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Confirm Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ DESKTOP (hidden on mobile) ══════════════════════════════════ */}
      <div className="hidden lg:flex flex-col" style={{ background: "#fbf9f4" }}>

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
                <div className="mb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border"
                    style={{ background: st.bg, color: st.color, borderColor: st.border, fontFamily: "var(--font-sans)" }}
                  >
                    {booking.status}
                  </span>
                </div>
                <h1
                  className="text-5xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-serif)", lineHeight: 1.15 }}
                >
                  {venue?.name ?? "Reservation"}
                </h1>
                {venue?.location && (
                  <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans)" }}>
                    {venue.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="max-w-[1440px] mx-auto w-full px-20 py-16">
          <div className="grid grid-cols-12 gap-8">

            {/* Left: details */}
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
                Back to bookings
              </button>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    label: "Date",
                    value: formatLocalDate(booking.startUtc),
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    ),
                  },
                  {
                    label: "Time",
                    value: `${formatLocalTime(booking.startUtc)} — ${formatLocalTime(booking.endUtc)}`,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ),
                  },
                  {
                    label: "Guests",
                    value: `${booking.partySize} ${booking.partySize === 1 ? "Guest" : "Guests"}`,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    ),
                  },
                  {
                    label: "Location",
                    value: venue?.location ?? venue?.address ?? "—",
                    icon: (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </>
                    ),
                  },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 p-6 rounded-xl border"
                    style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#9c440f" }}>
                        {icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>{label}</p>
                      <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Venue comment */}
              {booking.venueComment && (
                <div
                  className="flex items-start gap-4 p-6 rounded-xl border"
                  style={{ background: "#fffbeb", borderColor: "#fde68a" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fef3c7" }}>
                    <svg className="w-5 h-5" style={{ color: "#b45309" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#b45309", fontFamily: "var(--font-sans)" }}>
                      Message from {venue?.name ?? "Venue"}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "#92400e", fontFamily: "var(--font-sans)" }}>
                      {booking.venueComment}
                    </p>
                  </div>
                </div>
              )}

              {/* Address */}
              {venue?.address && (
                <div
                  className="flex items-start gap-4 p-6 rounded-xl border"
                  style={{ background: "#ffffff", borderColor: "#e4e2dd" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0eee9" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#9c440f" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Full Address</p>
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
              )}
            </div>

            {/* Right: action card */}
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

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Reference</span>
                    <span className="text-sm font-mono font-bold" style={{ color: "#041635" }}>#{shortId(booking.id)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Status</span>
                    <span
                      className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                      style={{ background: st.bg, color: st.color, borderColor: st.border, fontFamily: "var(--font-sans)" }}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Venue</span>
                    <span className="text-sm font-bold text-right max-w-[55%]" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{venue?.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Date</span>
                    <span className="text-sm font-bold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{formatLocalDate(booking.startUtc)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#44474e", fontFamily: "var(--font-sans)" }}>Guests</span>
                    <span className="text-sm font-bold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{booking.partySize}</span>
                  </div>
                </div>

                {/* Cancel section */}
                {canCancel && !showCancel && (
                  <button
                    onClick={() => setShowCancel(true)}
                    className="w-full py-3.5 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all hover:bg-red-50"
                    style={{ borderColor: "#FECACA", color: "#DC2626", fontFamily: "var(--font-sans)" }}
                  >
                    Cancel Reservation
                  </button>
                )}

                {showCancel && (
                  <div className="flex flex-col gap-4 pt-4 border-t" style={{ borderColor: "#e4e2dd" }}>
                    <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>
                      Cancel this reservation?
                    </p>
                    <p className="text-xs" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>This action cannot be undone.</p>
                    {cancelError && (
                      <p className="text-xs text-red-600">{extractErrorMessage(cancelError)}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCancel(false)}
                        className="flex-1 py-2.5 rounded-lg border text-sm font-semibold transition hover:bg-gray-50"
                        style={{ borderColor: "#c5c6cf", color: "#041635", fontFamily: "var(--font-sans)" }}
                      >
                        Keep it
                      </button>
                      <button
                        onClick={() => doCancel()}
                        disabled={cancelling}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        style={{ background: "#DC2626", fontFamily: "var(--font-sans)" }}
                      >
                        {cancelling ? "Cancelling…" : "Yes, cancel"}
                      </button>
                    </div>
                  </div>
                )}

                {!canCancel && (
                  <p className="text-xs text-center pt-4" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>
                    This reservation cannot be modified.
                  </p>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-[#75777f]">{label}</span>
      <span className="text-sm font-medium text-[#1B2B4B] text-right">{value}</span>
    </div>
  );
}
