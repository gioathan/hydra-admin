"use client";

import { RequireCustomerAuth } from "@/components/customer/RequireCustomerAuth";

export default function RateLayout({ children }: { children: React.ReactNode }) {
  return <RequireCustomerAuth>{children}</RequireCustomerAuth>;
}
