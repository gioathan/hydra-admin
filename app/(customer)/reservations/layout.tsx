"use client";

import { RequireCustomerAuth } from "@/components/customer/RequireCustomerAuth";

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
  return <RequireCustomerAuth>{children}</RequireCustomerAuth>;
}
