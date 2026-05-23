"use client";

import { useState } from "react";
import { CustomerVenuePhotoDto } from "@/types";
import { getInitial } from "@/lib/utils";

interface PhotoSliderProps {
  photos: CustomerVenuePhotoDto[];
  name: string;
  height?: string;
}

export function PhotoSlider({ photos, name, height = "h-64" }: PhotoSliderProps) {
  const sorted = [...photos]
    .filter((p) => p.photoUrl)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const [current, setCurrent] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className={`${height} bg-[#1B2B4B] flex items-center justify-center`}>
        <span className="text-white/30 text-5xl font-bold">{getInitial(name)}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${height} bg-[#1B2B4B] overflow-hidden`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sorted[current].photoUrl!}
        alt={name}
        className="w-full h-full object-cover"
      />

      {sorted.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-0 hover:bg-black/60 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent((c) => Math.min(sorted.length - 1, c + 1))}
            disabled={current === sorted.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-0 hover:bg-black/60 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
