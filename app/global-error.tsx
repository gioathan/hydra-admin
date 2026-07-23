"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#FAF6EF] text-[#0C5F7D] antialiased p-8">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-[#566572] max-w-sm">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={unstable_retry}
            className="px-4 py-2 bg-[#C25B3C] text-white rounded-lg text-sm font-medium hover:bg-[#9E4527] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
