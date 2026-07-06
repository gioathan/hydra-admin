"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getUpcomingEvents, getVenueLocations } from "@/lib/api/venues";
import { Select } from "@/components/ui/Select";
import { EventListItemDto } from "@/types";

const PAGE_SIZE = 15;

function formatEventDate(startsAtUtc: string, endsAtUtc: string | null): string {
  const start = new Date(startsAtUtc);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endsAtUtc) return `${dateStr} at ${startTime}`;
  const end = new Date(endsAtUtc);
  const endTime = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

function EventCard({ event }: { event: EventListItemDto }) {
  const startDate = new Date(event.startsAtUtc);
  const day = startDate.toLocaleDateString(undefined, { day: "numeric" });
  const month = startDate.toLocaleDateString(undefined, { month: "short" }).toUpperCase();

  return (
    <div className="flex gap-4 bg-white rounded-xl border border-[#E1D7C6] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo / date */}
      <div className="relative flex-shrink-0 w-32 sm:w-44 bg-[#0C5F7D]">
        {event.mainPhotoUrl ? (
          <img
            src={event.mainPhotoUrl}
            alt={event.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : null}
        {/* date badge */}
        <div className="absolute top-3 left-3 bg-[#C25B3C] rounded-lg px-2.5 py-1.5 flex flex-col items-center shadow-lg">
          <span className="text-white font-serif text-xl leading-none">{day}</span>
          <span className="text-white/85 text-[9px] font-bold tracking-widest mt-0.5">{month}</span>
        </div>
        {/* scrim + venue name */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] font-semibold truncate drop-shadow">
          {event.venueName}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 py-4 pr-4 flex flex-col gap-1.5 min-w-0">
        <h3 className="font-serif text-[#0C5F7D] text-lg leading-snug line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[#C25B3C] text-sm font-semibold">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatEventDate(event.startsAtUtc, event.endsAtUtc)}
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          {event.venueLocation && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.venueLocation}
            </span>
          )}
          <Link
            href={`/admin/venue`}
            className="text-xs font-semibold text-[#0C5F7D] hover:text-[#C25B3C] transition-colors ml-auto"
          >
            Manage venue →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [location, setLocation] = useState<string>("");

  const { data: locations = [] } = useQuery({
    queryKey: ["venueLocations"],
    queryFn: getVenueLocations,
    staleTime: 10 * 60_000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["upcomingEvents", location],
    queryFn: ({ pageParam = 1 }) =>
      getUpcomingEvents(pageParam as number, PAGE_SIZE, location || null),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNextPage ? last.pageNumber + 1 : undefined),
  });

  const events: EventListItemDto[] = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#C25B3C] uppercase mb-1">
            Across all venues
          </p>
          <h1 className="text-2xl font-bold text-[#0C5F7D]">Upcoming Events</h1>
          <p className="text-sm text-[#566572] mt-1 max-w-xl">
            Browse upcoming events from every venue on Hydra. To create or edit your
            own events, go to <Link href="/admin/venue" className="text-[#C25B3C] font-medium hover:underline">your Venue page</Link>.
          </p>
        </div>

        {/* Location filter */}
        {locations.length > 0 && (
          <div className="w-48">
            <Select
              options={[
                { value: "", label: "All locations" },
                ...locations.map((loc) => ({ value: loc, label: loc })),
              ]}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-sm text-gray-400 -mt-2">
          {totalCount} upcoming event{totalCount !== 1 ? "s" : ""}
          {location ? ` in ${location}` : ""}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-[#E1D7C6] animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#F4EDE1] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#C25B3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#0C5F7D] font-semibold">No upcoming events</p>
          <p className="text-sm text-gray-400">
            {location
              ? `No events scheduled in ${location}.`
              : "No events scheduled across any venues yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="self-center mt-2 px-6 py-2 text-sm font-semibold text-[#0C5F7D] border border-[#E1D7C6] rounded-lg hover:bg-[#F4EDE1] transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
