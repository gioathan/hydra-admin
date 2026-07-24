"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import axios from "axios";
import { getBookings } from "@/lib/api/bookings";
import { getVenue, getVenueRules, updateVenueRules, toggleVenueBookings } from "@/lib/api/venues";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { extractErrorMessage } from "@/lib/axios";
import { BookingStatus, VenueRulesDto } from "@/types";

const PAGE_SIZE = 25;

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Declined", label: "Declined" },
  { value: "Cancelled", label: "Cancelled" },
];

const isBookingStatus = (v: string): v is BookingStatus =>
  ["Pending", "Confirmed", "Declined", "Cancelled"].includes(v);

// ─── Booking Rules ──────────────────────────────────────────────────

const TIME_OPTIONS: { label: string; value: string }[] = (() => {
  const opts: { label: string; value: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const period = h < 12 ? "AM" : "PM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      opts.push({ value: `${hh}:${mm}`, label: `${String(h12).padStart(2, "0")}:${mm} ${period}` });
    }
  }
  return opts;
})();

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function VenueRulesForm({ venueId, defaultValues, isNew }: { venueId: string; defaultValues: VenueRulesDto; isNew?: boolean }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VenueRulesDto>({ defaultValues });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VenueRulesDto) => updateVenueRules(venueId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venueRules", venueId], updated);
      reset(updated);
      showToast("Booking rules saved.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const autoConfirm = watch("autoConfirm");
  const openHour = watch("openHour");
  const openMinute = watch("openMinute");
  const closeHour = watch("closeHour");
  const closeMinute = watch("closeMinute");

  const handleTimeChange = (field: "open" | "close") => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (field === "open") {
      setValue("openHour", h, { shouldDirty: true });
      setValue("openMinute", m, { shouldDirty: true });
    } else {
      setValue("closeHour", h, { shouldDirty: true });
      setValue("closeMinute", m, { shouldDirty: true });
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-6 max-w-lg"
      noValidate
    >
      {/* Auto-confirm toggle */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-[#0C5F7D]">Auto-confirm bookings</p>
          <p className="text-xs text-[#566572] mt-0.5">
            {autoConfirm
              ? "Bookings are confirmed instantly."
              : "Bookings land in Pending — you confirm or decline manually."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoConfirm}
          onClick={() => setValue("autoConfirm", !autoConfirm, { shouldDirty: true })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C25B3C] focus:ring-offset-2
            ${autoConfirm ? "bg-[#C25B3C]" : "bg-gray-300"}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
              ${autoConfirm ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Slot duration */}
      <Input
        label="Slot duration (minutes)"
        type="number"
        min={15}
        max={480}
        error={errors.slotMinutes?.message}
        {...register("slotMinutes", {
          required: "Slot duration is required",
          valueAsNumber: true,
          min: { value: 15, message: "Minimum 15 minutes" },
          max: { value: 480, message: "Maximum 480 minutes" },
        })}
      />

      {/* Open / close hours */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0C5F7D]">Opens at</label>
          <select
            value={`${pad2(openHour ?? 9)}:${pad2(openMinute ?? 0)}`}
            onChange={handleTimeChange("open")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#0C5F7D] outline-none focus:border-[#0C5F7D] focus:ring-1 focus:ring-[#0C5F7D] bg-white"
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0C5F7D]">Closes at</label>
          <select
            value={`${pad2(closeHour ?? 22)}:${pad2(closeMinute ?? 0)}`}
            onChange={handleTimeChange("close")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#0C5F7D] outline-none focus:border-[#0C5F7D] focus:ring-1 focus:ring-[#0C5F7D] bg-white"
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-[#566572]">
            If earlier than opening time, treated as after midnight (e.g. open 6PM, close 3AM).
          </p>
        </div>
      </div>

      <div>
        <Button type="submit" loading={isPending} disabled={!isNew && !isDirty}>
          Save Rules
        </Button>
      </div>
    </form>
  );
}

function VenueRulesSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const { data: rules, isLoading: rulesLoading, isError, error } = useQuery({
    queryKey: ["venueRules", venueId],
    queryFn: () => getVenueRules(venueId),
    staleTime: 60_000,
    retry: false,
    enabled: !!venue?.bookingsEnabled,
  });

  const { mutate: toggle, isPending: toggling } = useMutation({
    mutationFn: (enabled: boolean) => toggleVenueBookings(venueId, enabled),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venue", venueId], updated);
      showToast(
        updated.bookingsEnabled ? "Bookings enabled." : "Bookings disabled.",
        "success"
      );
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  if (venueLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Bookings toggle */}
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-[#0C5F7D]">Accept Bookings</p>
          <p className="text-xs text-[#566572] mt-0.5">
            When disabled, this venue is informational only — customers cannot book or rate it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggle(!venue?.bookingsEnabled)}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            venue?.bookingsEnabled ? "bg-[#0C5F7D]" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={!!venue?.bookingsEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
              venue?.bookingsEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Rules form — only shown when bookings are enabled */}
      {venue?.bookingsEnabled && (
        <>
          {rulesLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError && !(axios.isAxiosError(error) && error.response?.status === 404) ? (
            <p className="text-sm text-[#566572]">{extractErrorMessage(error)}</p>
          ) : (
            <>
              {!rules && (
                <p className="text-sm text-[#566572] -mt-2">
                  These are the default rules — review and save to apply them to your venue.
                </p>
              )}
              <VenueRulesForm
                venueId={venueId}
                defaultValues={rules ?? { autoConfirm: true, slotMinutes: 90, openHour: 9, openMinute: 0, closeHour: 22, closeMinute: 0 }}
                isNew={!rules}
              />
            </>
          )}
        </>
      )}

      {!venue?.bookingsEnabled && (
        <p className="text-sm text-[#566572]">
          Enable bookings above to configure booking rules and time slots.
        </p>
      )}
    </div>
  );
}

// ─── Bookings list ───────────────────────────────────────────────────

export default function BookingsPage() {
  const { venueId } = useAuthStore();
  const [status, setStatus] = useState<BookingStatus | "">(() => {
    if (typeof window === "undefined") return "";
    const s = new URLSearchParams(window.location.search).get("status") ?? "";
    return isBookingStatus(s) ? s : "";
  });
  const [page, setPage] = useState(1);

  const queryKey = ["bookings", venueId, status, page];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getBookings({
        venueId: venueId!,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    enabled: !!venueId,
    staleTime: 30_000,
  });

  const handleStatusChange = (val: string) => {
    setStatus(val as BookingStatus | "");
    setPage(1);
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-[#0C5F7D]">Bookings</h1>

      {venueId && (
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-[#0C5F7D] mb-2">Booking Rules</h2>
          <p className="text-sm text-[#566572] mb-6">
            Controls how bookings are handled and what time slots are available to customers.
          </p>
          <VenueRulesSection venueId={venueId} />
        </section>
      )}

      <div className="flex flex-col gap-6">
        {/* Filter bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
          </div>
          {data && (
            <span className="text-sm text-[#566572]">
              {data.totalCount} booking{data.totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <BookingsTable
            bookings={data?.items ?? []}
            isLoading={isLoading}
            queryKeys={[queryKey]}
            emptyMessage="No bookings match the selected filter."
          />
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
            <span className="text-sm text-[#566572]">
              Page {data.pageNumber} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!data.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
