"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/api/bookings";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { BookingDto } from "@/types";

function isToday(utcStr: string) {
  const d = new Date(utcStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

interface SummaryCardProps {
  label: string;
  value: number | string;
  accent?: boolean;
  href?: string;
}

function SummaryCard({ label, value, accent, href }: SummaryCardProps) {
  const card = (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${
        href ? "transition-colors hover:border-[#C25B3C]/40 hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <p className="text-sm text-[#566572] mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-[#C25B3C]" : "text-[#0C5F7D]"}`}>
        {value}
      </p>
      {href && <p className="text-xs text-[#C25B3C] font-medium mt-2">Review →</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default function DashboardPage() {
  const { venueId } = useAuthStore();

  const commonParams = { venueId: venueId!, pageSize: 100 };

  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["bookings", venueId, "Pending"],
    queryFn: () => getBookings({ ...commonParams, status: "Pending" }),
    enabled: !!venueId,
    staleTime: 30_000,
  });

  const { data: confirmedData, isLoading: loadingConfirmed } = useQuery({
    queryKey: ["bookings", venueId, "Confirmed"],
    queryFn: () => getBookings({ ...commonParams, status: "Confirmed" }),
    enabled: !!venueId,
    staleTime: 30_000,
  });

  // Fetch recent bookings (all statuses, larger page)
  const { data: recentData, isLoading: loadingRecent } = useQuery({
    queryKey: ["bookings", venueId, "recent"],
    queryFn: () => getBookings({ venueId: venueId!, pageSize: 25 }),
    enabled: !!venueId,
    staleTime: 30_000,
  });

  const todayCount =
    recentData?.items.filter((b: BookingDto) => isToday(b.startUtc)).length ??
    0;

  const recentBookings = [...(recentData?.items ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
    )
    .slice(0, 10);

  const queryKeys = [
    ["bookings", venueId, "Pending"],
    ["bookings", venueId, "Confirmed"],
    ["bookings", venueId, "recent"],
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[#0C5F7D]">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingPending ? (
          <SkeletonCard />
        ) : (
          <SummaryCard
            label="Pending Bookings"
            value={pendingData?.totalCount ?? 0}
            accent
            href="/admin/bookings?status=Pending"
          />
        )}
        {loadingConfirmed ? (
          <SkeletonCard />
        ) : (
          <SummaryCard
            label="Confirmed Bookings"
            value={confirmedData?.totalCount ?? 0}
          />
        )}
        {loadingRecent ? (
          <SkeletonCard />
        ) : (
          <SummaryCard label="Bookings Today" value={todayCount} />
        )}
      </div>

      {/* Recent bookings */}
      <section>
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-4">
          Recent Bookings
        </h2>
        <BookingsTable
          bookings={recentBookings}
          isLoading={loadingRecent}
          queryKeys={queryKeys}
          emptyMessage="No recent bookings."
        />
      </section>
    </div>
  );
}
