"use client";

import { RequireCustomerAuth } from "@/components/customer/RequireCustomerAuth";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <RequireCustomerAuth>{children}</RequireCustomerAuth>;
}
