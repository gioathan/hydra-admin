"use client";

import Link from "next/link";
import { CustomerVenueDto, VenueTypeDto } from "@/types";
import { StarRating } from "./StarRating";
import { getInitial } from "@/lib/utils";

interface VenueCardProps {
  venue: CustomerVenueDto;
  venueType?: VenueTypeDto;
}

export function VenueCard({ venue, venueType }: VenueCardProps) {
  const firstPhoto = [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.photoUrl);

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="block group rounded-[16px] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(197,198,207,0.3)",
        boxShadow: "0 8px 32px rgba(27,43,75,0.08)",
        marginBottom: 0,
      }}
    >
      {/* Photo — 256px tall to match RN */}
      <div className="relative overflow-hidden" style={{ height: 256, background: "#e9e7eb" }}>
        {firstPhoto?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstPhoto.photoUrl}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#1b2b4b" }}>
            <span className="text-5xl font-bold" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-serif)" }}>
              {getInitial(venue.name)}
            </span>
          </div>
        )}

        {/* Type badge — top right, white pill, terracotta text */}
        {venueType && (
          <span
            className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#9c440f",
              fontFamily: "var(--font-sans)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {venueType.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3
            className="text-base font-semibold leading-tight truncate"
            style={{ color: "#041635", fontFamily: "var(--font-sans)" }}
          >
            {venue.name}
          </h3>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#9c440f" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm truncate" style={{ color: "#44474e" }}>{venue.address}</p>
          </div>
          {venue.averageRating != null && venue.ratingCount > 0 ? (
            <StarRating rating={venue.averageRating} count={venue.ratingCount} />
          ) : (
            <span className="text-xs" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>No reviews yet</span>
          )}
        </div>

        {/* Book button */}
        <span
          className="shrink-0 px-6 py-3 rounded-lg text-sm font-semibold text-white"
          style={{
            background: "#9c440f",
            fontFamily: "var(--font-sans)",
            boxShadow: "0 2px 6px rgba(156,68,15,0.35)",
          }}
        >
          Book
        </span>
      </div>
    </Link>
  );
}
