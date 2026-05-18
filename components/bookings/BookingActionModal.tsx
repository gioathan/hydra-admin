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
    noteLabel: "Note (optional)",
  },
  decline: {
    title: "Decline Booking",
    description: "Are you sure you want to decline this booking?",
    confirmLabel: "Decline Booking",
    confirmVariant: "danger",
    noteLabel: "Note (optional)",
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
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={config?.noteLabel}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#1B2B4B] placeholder:text-[#6B7280] outline-none focus:border-[#1B2B4B] focus:ring-1 focus:ring-[#1B2B4B] resize-none"
      />
    </Modal>
  );
}
