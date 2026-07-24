"use client";

import { RequireCustomerAuth } from "@/components/customer/RequireCustomerAuth";

export default function SlotsLayout({ children }: { children: React.ReactNode }) {
  return <RequireCustomerAuth>{children}</RequireCustomerAuth>;
}
