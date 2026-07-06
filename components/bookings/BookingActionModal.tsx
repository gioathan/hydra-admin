"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { confirmBooking, declineBooking, cancelBooking } from "@/lib/api/bookings";
import { extractErrorMessage } from "@/lib/axios";
import { BookingDto } from "@/types";

type Action = "confirm" | "decline" | "cancel";

interface BookingActionModalProps {
  booking: BookingDto | null;
  action: Action | null;
  onClose: () => void;
  queryKeys: unknown[][];
}

const actionConfig: Record<
  Action,
  { title: string; description: string; confirmLabel: string; confirmVariant: "success" | "danger" | "primary"; noteLabel: string }
> = {
  confirm: {
    title: "Confirm Booking",
    description: "Are you sure you want to confirm this booking?",
    confirmLabel: "Confirm Booking",
    confirmVariant: "success",
    noteLabel: "Comment for customer (optional)",
  },
  decline: {
    title: "Decline Booking",
    description: "Are you sure you want to decline this booking?",
    confirmLabel: "Decline Booking",
    confirmVariant: "danger",
    noteLabel: "Comment for customer (optional)",
  },
  cancel: {
    title: "Cancel Booking",
    description: "Are you sure you want to cancel this booking?",
    confirmLabel: "Cancel Booking",
    confirmVariant: "danger",
    noteLabel: "Reason (optional)",
  },
};

export function BookingActionModal({
  booking,
  action,
  onClose,
  queryKeys,
}: BookingActionModalProps) {
  const [note, setNote] = useState("");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!booking || !action) return;
      if (action === "confirm") return confirmBooking(booking.id, { note: note || null });
      if (action === "decline") return declineBooking(booking.id, { note: note || null });
      if (action === "cancel") return cancelBooking(booking.id, { reason: note || null });
    },
    onSuccess: () => {
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      showToast(
        action === "confirm"
          ? "Booking confirmed."
          : action === "decline"
          ? "Booking declined."
          : "Booking cancelled.",
        "success"
      );
      handleClose();
    },
    onError: (err) => {
      showToast(extractErrorMessage(err), "error");
    },
  });

  const handleClose = () => {
    setNote("");
    onClose();
  };

  const config = action ? actionConfig[action] : null;

  const summary = booking
    ? {
        when: new Date(booking.startUtc).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        guests: `${booking.partySize} ${booking.partySize === 1 ? "guest" : "guests"}`,
        ref: booking.id.slice(0, 8).toUpperCase(),
      }
    : null;

  return (
    <Modal
      open={!!booking && !!action}
      title={config?.title ?? ""}
      description={config?.description}
      confirmLabel={config?.confirmLabel}
      confirmVariant={config?.confirmVariant}
      loading={mutation.isPending}
      onConfirm={() => mutation.mutate()}
      onCancel={handleClose}
    >
      {summary && (
        <div className="mb-3 rounded-lg bg-[#F4EDE1] border border-[#E1D7C6] px-3 py-2 text-sm text-[#22303A]">
          <span className="font-semibold">{summary.when}</span>
          <span className="text-[#566572]"> · {summary.guests} · #{summary.ref}</span>
        </div>
      )}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={config?.noteLabel}
        rows={3}
        className="w-full px-3 py-2 border border-[#E1D7C6] rounded-md text-sm text-[#0C5F7D] placeholder:text-[#566572] outline-none focus:border-[#0C5F7D] focus:ring-1 focus:ring-[#0C5F7D] resize-none"
      />
    </Modal>
  );
}
