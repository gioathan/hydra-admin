"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCustomerVenue } from "@/lib/api/customerVenues";
import { getBooking } from "@/lib/api/customerBookings";
import { shortId, formatLocalDate, formatLocalTime } from "@/lib/utils";

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const status = searchParams.get("status");
  const isConfirmed = status === "Confirmed";

  const { data: venue } = useQuery({
    queryKey: ["customerVenue", id],
    queryFn: () => getCustomerVenue(id),
    staleTime: 60_000,
  });

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 60_000,
  });

  const firstPhoto = venue && [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.photoUrl);

  return (
    <>
      {/* ═══ MOBILE (hidden on desktop) ══════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-full items-center justify-center px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[#0C5F7D] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0C5F7D] mb-2">
          {isConfirmed ? "Booking Confirmed!" : "Booking Requested!"}
        </h1>
        <p className="text-sm text-[#566572] max-w-xs">
          {isConfirmed
            ? "Your reservation is confirmed. We look forward to seeing you."
            : "You'll be notified when the venue confirms your reservation."}
        </p>
        {bookingId && (
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
            <p className="text-xs text-[#8B95A0] uppercase tracking-wider mb-1">Reference</p>
            <p className="text-xl font-mono font-bold text-[#0C5F7D]">#{shortId(bookingId)}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
          <Link
            href="/reservations"
            className="w-full bg-[#0C5F7D] text-white py-3.5 rounded-xl font-semibold text-sm text-center hover:bg-[#094C63] transition-colors"
          >
            Go to Reservations
          </Link>
          <Link
            href="/discover"
            className="w-full border border-gray-200 text-[#0C5F7D] py-3.5 rounded-xl font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
          >
            Back to Discover
          </Link>
        </div>
      </div>

      {/* ═══ DESKTOP (hidden on mobile) ══════════════════════════════════ */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 py-24 px-8" style={{ background: "#FAF6EF" }}>
        <div className="w-full max-w-2xl text-center">

          {/* Success icon */}
          <div className="relative inline-block mb-10">
            <div
              className="absolute inset-0 scale-150 animate-pulse rounded-full"
              style={{ background: "radial-gradient(circle, rgba(232, 142, 107,0.12) 0%, rgba(232, 142, 107,0) 70%)" }}
            />
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "#E88E6B" }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D", lineHeight: 1.2 }}
          >
            {isConfirmed ? "Booking Confirmed!" : "Booking Requested!"}
          </h1>
          <p
            className="text-lg mb-12 max-w-lg mx-auto leading-relaxed"
            style={{ color: "#566572", fontFamily: "var(--font-sans)" }}
          >
            {isConfirmed
              ? "Your reservation is confirmed. We look forward to welcoming you."
              : `We've received your request${venue ? ` for ${venue.name}` : ""}. Our host will review your details and confirm shortly.`}
          </p>

          {/* Venue summary card */}
          <div
            className="rounded-xl overflow-hidden border shadow-sm text-left mb-12 flex flex-col md:flex-row"
            style={{ background: "#ffffff", borderColor: "#E1D7C6" }}
          >
            {/* Photo */}
            <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden" style={{ background: "#0C5F7D" }}>
              {firstPhoto?.photoUrl ? (
                <Image src={firstPhoto.photoUrl} alt={venue?.name ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-serif)" }}>
                    {venue?.name?.[0]?.toUpperCase() ?? ""}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-2/3 p-8 flex flex-col justify-center">
              <span
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "#C25B3C", fontFamily: "var(--font-sans)" }}
              >
                {isConfirmed ? "Confirmed Details" : "Booking Details"}
              </span>
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ fontFamily: "var(--font-serif)", color: "#0C5F7D" }}
              >
                {venue?.name ?? "—"}
              </h2>
              <div className="grid grid-cols-2 gap-y-5">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#8B95A0" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Date</p>
                    <p className="text-sm font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
                      {booking ? formatLocalDate(booking.startUtc) : "—"}
                    </p>
                  </div>
                </div>
                {/* Time */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#8B95A0" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Time</p>
                    <p className="text-sm font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
                      {booking ? `${formatLocalTime(booking.startUtc)} — ${formatLocalTime(booking.endUtc)}` : "—"}
                    </p>
                  </div>
                </div>
                {/* Guests */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#8B95A0" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Guests</p>
                    <p className="text-sm font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
                      {booking ? `${booking.partySize} ${booking.partySize === 1 ? "Guest" : "Guests"}` : "—"}
                    </p>
                  </div>
                </div>
                {/* Location */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#8B95A0" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Location</p>
                    <p className="text-sm font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
                      {venue?.location ?? venue?.address ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reference */}
          {bookingId && (
            <p className="text-xs mb-8" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>
              Booking reference: <span className="font-mono font-bold" style={{ color: "#0C5F7D" }}>#{shortId(bookingId)}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/reservations"
              className="px-10 py-4 text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all hover:opacity-90 active:scale-95 text-center"
              style={{ background: "#0C5F7D", fontFamily: "var(--font-sans)" }}
            >
              View My Bookings
            </Link>
            <Link
              href="/discover"
              className="px-10 py-4 text-sm font-bold uppercase tracking-wider rounded-full border transition-all hover:bg-[#F0E9DD] active:scale-95 text-center"
              style={{ color: "#0C5F7D", borderColor: "#8B95A0", fontFamily: "var(--font-sans)" }}
            >
              Back to Discover
            </Link>
          </div>

          {/* Help */}
          <p className="mt-16 text-sm" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>
            Need to make a change?{" "}
            <Link href="/reservations" className="font-semibold hover:underline" style={{ color: "#C25B3C" }}>
              View your bookings
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
