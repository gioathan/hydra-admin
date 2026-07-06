"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-[#0C5F7D]">Something went wrong</h2>
      <p className="text-sm text-[#566572] max-w-sm">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={unstable_retry}>Try again</Button>
    </div>
  );
}
