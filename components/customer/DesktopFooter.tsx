"use client";

import Link from "next/link";

export function CustomerDesktopFooter() {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Local Bee", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <footer className="hidden lg:block py-16" style={{ background: "#0C5F7D" }}>
      <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-3 gap-8">
        {/* Brand + tagline */}
        <div className="flex flex-col gap-6">
          <img src="/brand-lockup-light.svg" alt="Local Bee" style={{ height: 30, width: "auto" }} />
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#7FA7B5", fontFamily: "var(--font-sans)" }}>
            Curating the finest Mediterranean experiences for the modern traveler. From secret coves to world-class dining.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-6">
          <h4
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#E1D7C6", fontFamily: "var(--font-sans)" }}
          >
            Navigation
          </h4>
          <div className="flex flex-col gap-4">
            <Link
              href="/privacy-policy"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "#E1D7C6", fontFamily: "var(--font-sans)" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "#E1D7C6", fontFamily: "var(--font-sans)" }}
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Connect */}
        <div className="flex flex-col gap-6">
          <h4
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#E1D7C6", fontFamily: "var(--font-sans)" }}
          >
            Connect
          </h4>
          <div className="flex gap-5">
            <a
              href="mailto:info@localbee.gr"
              className="transition-colors hover:text-white"
              style={{ color: "#E1D7C6" }}
              aria-label="Email us"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
            <button
              onClick={handleShare}
              className="transition-colors hover:text-white"
              style={{ color: "#E1D7C6" }}
              aria-label="Share this page"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>
          <p className="text-xs mt-8" style={{ color: "#7FA7B5", fontFamily: "var(--font-sans)" }}>
            © {new Date().getFullYear()} Local Bee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
