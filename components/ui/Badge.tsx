import { BookingStatus } from "@/types";

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800",
  },
  Confirmed: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800",
  },
  Declined: {
    label: "Declined",
    className: "bg-red-100 text-red-800",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600",
  },
};

interface BadgeProps {
  status: BookingStatus;
}

export function Badge({ status }: BadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
