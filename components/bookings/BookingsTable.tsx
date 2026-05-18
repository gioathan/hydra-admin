"use client";

import { useState } from "react";
import { BookingDto, BookingStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { BookingActionModal } from "./BookingActionModal";

type Action = "confirm" | "decline" | "cancel";

interface BookingsTableProps {
  bookings: BookingDto[];
  isLoading: boolean;
  queryKeys: unknown[][];
  emptyMessage?: string;
}

function formatDateTime(utcStr: string) {
  return new Date(utcStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function getActions(status: BookingStatus): Action[] {
  if (status === "Pending") return ["confirm", "decline"];
  if (status === "Confirmed") return ["cancel"];
  return [];
}

const actionButtonConfig: Record<
  Action,
  { label: string; variant: "success" | "danger" | "ghost" }
> = {
  confirm: { label: "Confirm", variant: "success" },
  decline: { label: "Decline", variant: "danger" },
  cancel: { label: "Cancel", variant: "ghost" },
};

export function BookingsTable({
  bookings,
  isLoading,
  queryKeys,
  emptyMessage = "No bookings found.",
}: BookingsTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleAction = (booking: BookingDto, action: Action) => {
    setSelectedBooking(booking);
    setSelectedAction(action);
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setSelectedAction(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Date &amp; Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Guests
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <SkeletonTable rows={5} />
            ) : bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[#6B7280]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const actions = getActions(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1B2B4B] font-medium">
                      {formatRef(booking.id)}
                    </td>
                    <td className="px-4 py-3 text-[#1B2B4B]">
                      {formatDateTime(booking.startUtc)}
                    </td>
                    <td className="px-4 py-3 text-[#1B2B4B]">
                      {booking.partySize}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actions.map((action) => {
                          const cfg = actionButtonConfig[action];
                          return (
                            <Button
                              key={action}
                              variant={cfg.variant}
                              size="sm"
                              onClick={() => handleAction(booking, action)}
                            >
                              {cfg.label}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <BookingActionModal
        booking={selectedBooking}
        action={selectedAction}
        onClose={handleClose}
        queryKeys={queryKeys}
      />
    </>
  );
}
