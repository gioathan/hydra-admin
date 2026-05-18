"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F8F5F0] text-[#1B2B4B] antialiased p-8">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-[#6B7280] max-w-sm">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={unstable_retry}
            className="px-4 py-2 bg-[#C4622D] text-white rounded-lg text-sm font-medium hover:bg-[#b0561f] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
