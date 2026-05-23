"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCustomerVenue } from "@/lib/api/customerVenues";
import { getCustomer } from "@/lib/api/customersApi";
import { createBooking } from "@/lib/api/customerBookings";
import { extractErrorMessage } from "@/lib/axios";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { formatLocalDate, formatLocalTime, getInitial } from "@/lib/utils";

export default function ConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startUtc = searchParams.get("startUtc") ?? "";
  const endUtc = searchParams.get("endUtc") ?? "";
  const partySize = Number(searchParams.get("partySize") ?? "2");

  const { customerId } = useCustomerAuthStore();

  const { data: venue } = useQuery({
    queryKey: ["customerVenue", id],
    queryFn: () => getCustomerVenue(id),
    staleTime: 60_000,
  });

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 60_000,
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      createBooking({ venueId: id, customerId: customerId!, startUtc, endUtc, partySize }),
    onSuccess: (booking) => {
      router.replace(`/venues/${id}/success?bookingId=${booking.id}&status=${booking.status}`);
    },
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="flex flex-col min-h-full">
      <div style={{ padding: "48px 20px 16px", background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition text-xl" style={{ color: "#041635" }}>‹</button>
        <h1 className="text-lg font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>Confirm Booking</h1>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* Booking summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#1B2B4B] uppercase tracking-wider">Booking Details</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Row label="Venue" value={venue?.name ?? "—"} />
            <Row label="Date" value={startUtc ? formatLocalDate(startUtc) : "—"} />
            <Row label="Time" value={startUtc ? formatLocalTime(startUtc) : "—"} />
            <Row label="Guests" value={`${partySize}`} />
          </div>
        </div>

        {/* Customer info */}
        {customer && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C4622D] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{getInitial(customer.name)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B2B4B]">{customer.name}</p>
              <p className="text-xs text-[#75777f]">{customer.email}</p>
              <p className="text-xs text-[#75777f]">{customer.phone}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{errorMessage}</p>
        )}
      </div>

      <div className="px-4 pb-6 pt-2">
        <button
          type="button"
          onClick={() => mutate()}
          disabled={isPending}
          className="w-full bg-[#C4622D] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#b0561f] transition-colors disabled:opacity-60"
        >
          {isPending ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#75777f]">{label}</span>
      <span className="font-medium text-[#1B2B4B]">{value}</span>
    </div>
  );
}
