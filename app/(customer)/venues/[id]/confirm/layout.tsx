"use client";

import { RequireCustomerAuth } from "@/components/customer/RequireCustomerAuth";

export default function ConfirmLayout({ children }: { children: React.ReactNode }) {
  return <RequireCustomerAuth>{children}</RequireCustomerAuth>;
}
