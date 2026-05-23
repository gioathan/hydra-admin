"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rateVenue, getCustomerVenue } from "@/lib/api/customerVenues";
import { extractErrorMessage } from "@/lib/axios";

const LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const { data: venue } = useQuery({
    queryKey: ["customerVenue", id],
    queryFn: () => getCustomerVenue(id),
    staleTime: 60_000,
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => rateVenue(id, rating!, bookingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRatings"] });
      queryClient.invalidateQueries({ queryKey: ["customerVenue", id] });
      router.replace("/discover");
    },
  });

  const display = hovered ?? rating;
  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="flex flex-col min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center flex flex-col items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B] mb-1">Rate your visit</h1>
          {venue?.name && (
            <p className="text-base font-semibold text-[#1B2B4B] mb-1">{venue.name}</p>
          )}
          <p className="text-sm text-[#44474e]">How was your experience?</p>
        </div>

        {/* Stars */}
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-12 h-12 transition-colors ${star <= (display ?? 0) ? "text-amber-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>

        {display && (
          <p className="text-base font-medium text-[#1B2B4B]">{LABELS[display - 1]}</p>
        )}

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl w-full">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={() => mutate()}
          disabled={!rating || isPending}
          className="w-full bg-[#C4622D] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#b0561f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting…" : "Submit Rating"}
        </button>

        <button
          type="button"
          onClick={() => router.replace("/discover")}
          className="text-sm text-[#75777f] hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
