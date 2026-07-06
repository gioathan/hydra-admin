"use client";

import { useRouter } from "next/navigation";
import { LegalSection } from "@/lib/legalContent";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  const router = useRouter();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      {/* ── MOBILE ────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col min-h-full" style={{ background: "#FAF6EF" }}>
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 h-14"
          style={{
            background: "rgba(250, 246, 239,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(225, 215, 198,0.3)",
          }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5"
            style={{ color: "#566572" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <span
            className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold"
            style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}
          >
            {title}
          </span>

          <button onClick={handleShare} style={{ color: "#566572" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-5 py-6 flex flex-col gap-7">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1.5">
              <h2
                className="text-base font-semibold"
                style={{ color: "#0C5F7D", fontFamily: "var(--font-sans)" }}
              >
                {section.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#566572", fontFamily: "var(--font-sans)" }}
              >
                {section.content}
              </p>
            </div>
          ))}
          <p className="text-xs mt-2" style={{ color: "#8B95A0", fontFamily: "var(--font-sans)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* ── DESKTOP ───────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1" style={{ background: "#FAF6EF" }}>
        <div style={{ background: "#0C5F7D", padding: "72px 0 56px" }}>
          <div className="max-w-[1440px] mx-auto px-20">
            <h1
              className="font-bold text-white"
              style={{ fontSize: 52, fontFamily: "var(--font-serif)" }}
            >
              {title}
            </h1>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)" }}>
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-20 py-16 w-full">
          <div className="max-w-3xl flex flex-col gap-10">
            {sections.map((section, i) => (
              <div key={section.title} className="flex flex-col gap-3">
                {i > 0 && <div style={{ height: 1, background: "#E6DCCC", marginBottom: 8 }} />}
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "#0C5F7D", fontFamily: "var(--font-serif)" }}
                >
                  {section.title}
                </h2>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "#566572", fontFamily: "var(--font-sans)" }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
