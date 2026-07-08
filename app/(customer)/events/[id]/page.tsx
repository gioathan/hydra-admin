"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getCustomerEvent } from "@/lib/api/customerVenues";

function formatEventDate(startsAtUtc: string, endsAtUtc: string | null): string {
  const start = new Date(startsAtUtc);
  const dateStr = start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (!endsAtUtc) return `${dateStr} at ${startTime}`;
  const endTime = new Date(endsAtUtc).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: event, isLoading } = useQuery({
    queryKey: ["customerEvent", id],
    queryFn: () => getCustomerEvent(id),
    staleTime: 60_000,
  });

  if (isLoading || !event) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="h-72 lg:h-[420px] bg-gray-200" />
        <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-4">
          <div className="h-7 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full mt-4" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAF6EF" }}>
      {/* Hero */}
      <div className="relative h-72 lg:h-[420px] w-full overflow-hidden bg-[#0C5F7D]">
        {event.mainPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.mainPhotoUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,54,72,0.75) 0%, transparent 55%)" }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-black/40 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Date badge */}
        <div className="absolute top-4 right-4 flex flex-col items-center rounded-xl px-3 py-2" style={{ background: "#C25B3C" }}>
          <span className="text-white font-bold leading-none" style={{ fontSize: 22, fontFamily: "var(--font-serif)" }}>
            {new Date(event.startsAtUtc).toLocaleDateString("en-US", { day: "numeric" })}
          </span>
          <span className="text-white/80 font-bold tracking-widest" style={{ fontSize: 10, fontFamily: "var(--font-sans)" }}>
            {new Date(event.startsAtUtc).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 w-full px-5 lg:px-10 pb-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>
            {event.venueName}
          </p>
          <h1
            className="text-2xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-serif)", lineHeight: 1.2 }}
          >
            {event.title}
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto w-full px-5 lg:px-0 py-8 flex flex-col gap-8">

        {/* Date & time */}
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: "#fff", borderColor: "#E6DCCC" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#F0E9DD" }}>
            <svg className="w-4 h-4" fill="none" stroke="#C25B3C" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>Date &amp; Time</p>
            <p className="text-sm font-semibold" style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}>
              {formatEventDate(event.startsAtUtc, event.endsAtUtc)}
            </p>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: "#0C5F7D", fontFamily: "var(--font-serif)" }}>About this event</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#566572", fontFamily: "var(--font-sans)" }}>
              {event.description}
            </p>
          </div>
        )}

        {/* CTA: go to venue */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={`/venues/${event.venueId}`}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
            style={{ background: "#0C5F7D", fontFamily: "var(--font-sans)" }}
          >
            Visit venue &amp; book a table
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {event.venueLocation && (
            <p className="text-center text-xs" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>
              {event.venueName} · {event.venueLocation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
