"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/api/bookings";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { BookingStatus } from "@/types";

const PAGE_SIZE = 25;

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Declined", label: "Declined" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const { venueId } = useAuthStore();
  const [status, setStatus] = useState<BookingStatus | "">("");
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
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[#1B2B4B]">Bookings</h1>

      {/* Filter bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-48">
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          />
        </div>
        {data && (
          <span className="text-sm text-[#6B7280]">
            {data.totalCount} booking{data.totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <BookingsTable
        bookings={data?.items ?? []}
        isLoading={isLoading}
        queryKeys={[queryKey]}
        emptyMessage="No bookings match the selected filter."
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-[#6B7280]">
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
  );
}
