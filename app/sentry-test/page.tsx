"use client";

// Temporary — verifies the Sentry pipeline end-to-end, then removed.

export default function SentryTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] p-8">
      <button
        onClick={() => {
          throw new Error("Sentry test error (Next.js) — safe to ignore.");
        }}
        className="px-4 py-2 bg-[#C25B3C] text-white rounded-lg text-sm font-medium hover:bg-[#9E4527] transition-colors"
      >
        Throw test error
      </button>
    </div>
  );
}
