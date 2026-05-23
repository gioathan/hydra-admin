"use client";

import Link from "next/link";
import { BookingDto, BookingStatus } from "@/types";
import { formatLocalDate, formatLocalTime, shortId } from "@/lib/utils";

const statusConfig: Record<BookingStatus, { bg: string; color: string }> = {
  Pending:   { bg: "#FEF3C7", color: "#B45309" },
  Confirmed: { bg: "#DCFCE7", color: "#15803D" },
  Declined:  { bg: "#FEE2E2", color: "#DC2626" },
  Cancelled: { bg: "#F3F4F6", color: "#6B7280" },
};

interface BookingCardProps {
  booking: BookingDto;
  venueName?: string;
}

export function BookingCard({ booking, venueName }: BookingCardProps) {
  const status = statusConfig[booking.status];

  return (
    <Link
      href={`/reservations/${booking.id}`}
      className="block rounded-xl p-4"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(197,198,207,0.3)",
        boxShadow: "0 2px 8px rgba(4,22,53,0.05)",
      }}
    >
      {/* Top row: venue name + status badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p
          className="text-base font-semibold leading-tight flex-1 truncate"
          style={{ color: "#041635", fontFamily: "var(--font-sans)" }}
        >
          {venueName ?? "…"}
        </p>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
          style={{ background: status.bg, color: status.color, fontFamily: "var(--font-sans)" }}
        >
          {booking.status}
        </span>
      </div>

      {/* Meta row: date · time · party */}
      <div className="flex items-center gap-2 flex-wrap mb-2.5">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" style={{ color: "#44474e" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm" style={{ color: "#44474e" }}>{formatLocalDate(booking.startUtc)}</span>
        </div>
        <span style={{ color: "#c5c6cf" }}>·</span>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" style={{ color: "#44474e" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm" style={{ color: "#44474e" }}>{formatLocalTime(booking.startUtc)}</span>
        </div>
        <span style={{ color: "#c5c6cf" }}>·</span>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" style={{ color: "#44474e" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm" style={{ color: "#44474e" }}>{booking.partySize}</span>
        </div>
      </div>

      {/* Ref */}
      <p className="text-[10px] tracking-wide" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>
        Ref #{shortId(booking.id)}
      </p>
    </Link>
  );
}
