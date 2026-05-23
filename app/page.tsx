import Link from "next/link";

const STARS = [
  { top: "8%", left: "14%" }, { top: "16%", left: "68%" },
  { top: "31%", left: "88%" }, { top: "47%", left: "22%" },
  { top: "62%", left: "91%" }, { top: "21%", left: "42%" },
  { top: "72%", left: "11%" }, { top: "11%", left: "82%" },
  { top: "84%", left: "57%" }, { top: "53%", left: "73%" },
  { top: "38%", left: "6%"  }, { top: "77%", left: "38%" },
  { top: "5%",  left: "50%" }, { top: "92%", left: "79%" },
  { top: "25%", left: "30%" }, { top: "67%", left: "60%" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">

      {/* ── Left Panel ── */}
      <section className="flex flex-col justify-between p-10 lg:p-20 bg-white min-h-screen lg:min-h-0">

        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold tracking-[0.2em] text-[#041635]">
            HYDRA
          </span>
          <span className="text-sm text-[#44474e] hover:text-[#9c440f] transition-colors cursor-pointer">
            Support
          </span>
        </div>

        {/* Mobile-only decorative element */}
        <div className="lg:hidden relative mx-auto w-56 h-56 my-8 flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 bg-[#efedf0] rounded-xl rotate-2 shadow-sm" />
          <div className="absolute top-3 left-3  w-6 h-6 border-l-2 border-t-2 border-[#9c440f]/30" />
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#9c440f]/30" />
          <div className="absolute bottom-3 left-3  w-6 h-6 border-l-2 border-b-2 border-[#9c440f]/30" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#9c440f]/30" />
          <div className="relative z-10 flex items-center justify-center w-36 h-36">
            <div className="absolute inset-0 rounded-full border border-[#041635]/10" />
            <div className="absolute w-24 h-24 rounded-full border border-[#041635]/10" />
            <div className="w-10 h-10 rounded-full border-2 border-[#9c440f]/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#9c440f]/50" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-[#041635]/10" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-full bg-[#041635]/10" />
          </div>
        </div>

        <div className="flex flex-col gap-8 max-w-md mx-auto lg:mx-0">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.2em] text-[#9c440f] uppercase">
              Mediterranean Heritage
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-5xl lg:text-[64px] font-bold text-[#041635] leading-[1.1] tracking-tight">
              Experience the Heritage of Hydra
            </h1>
            <p className="text-lg text-[#44474e] leading-relaxed">
              Navigate the timeless beauty of the Aegean. Discover curated venues through the cradle of civilization.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/signup"
              className="w-full py-5 bg-[#041635] text-white text-sm font-bold tracking-[0.08em] flex items-center justify-center gap-3 hover:bg-[#1b2b4b] transition-all duration-300 active:scale-[0.98]"
            >
              CREATE ACCOUNT
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/signin"
              className="w-full py-5 border border-[#c5c6cf] text-[#041635] text-sm font-bold tracking-[0.08em] flex items-center justify-center hover:bg-[#f5f3f6] transition-all duration-300 active:scale-[0.98]"
            >
              SIGN IN
            </Link>
          </div>

          <div className="pt-8 border-t border-[#c5c6cf]">
            <p className="text-sm text-[#44474e] italic">
              &ldquo;A journey of a thousand leagues begins with a single mast.&rdquo;
            </p>
          </div>
        </div>

        <footer className="flex justify-between items-center pt-8">
          <span className="text-xs text-[#75777f]/60">© 2024 HYDRA Mediterranean</span>
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-6 h-px bg-[#75777f]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#75777f]">EST. 1960</span>
            <div className="w-6 h-px bg-[#75777f]" />
          </div>
        </footer>
      </section>

      {/* ── Right Panel — decorative (desktop only) ── */}
      <section className="hidden lg:flex relative bg-[#041635] overflow-hidden items-end p-20" aria-hidden="true">

        {/* Star field */}
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/30"
            style={{ top: s.top, left: s.left }}
          />
        ))}

        {/* Compass rose */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            width="520" height="520" viewBox="0 0 100 100"
            className="opacity-[0.15]"
            style={{ animation: "spin 120s linear infinite" }}
          >
            <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="white" strokeWidth="0.2" fill="none" />
            <circle cx="50" cy="50" r="26" stroke="white" strokeWidth="0.3" strokeDasharray="2 2" fill="none" />
            <circle cx="50" cy="50" r="12" stroke="white" strokeWidth="0.2" fill="none" />
            <path d="M50 5 L52 45 L50 48 L48 45 Z" fill="white" />
            <path d="M50 95 L48 55 L50 52 L52 55 Z" fill="white" />
            <path d="M5 50 L45 52 L48 50 L45 48 Z" fill="white" />
            <path d="M95 50 L55 48 L52 50 L55 52 Z" fill="white" />
            <line x1="16" y1="16" x2="84" y2="84" stroke="white" strokeWidth="0.15" opacity="0.4" />
            <line x1="84" y1="16" x2="16" y2="84" stroke="white" strokeWidth="0.15" opacity="0.4" />
            <circle cx="50" cy="50" r="2" fill="white" opacity="0.7" />
          </svg>
        </div>

        {/* Ambient rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
          <div className="absolute w-[480px] h-[480px] rounded-full border border-white/[0.03]" />
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041635]/80 via-transparent to-transparent pointer-events-none" />

        {/* Quote */}
        <div className="relative z-10 flex flex-col gap-6 max-w-lg">
          <div className="w-24 h-px bg-[#ffb693]" />
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-4xl font-bold text-white leading-tight">
            The sea, once it casts its spell, holds one in its net of wonder forever.
          </h2>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 border border-white/20">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.2" />
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M10 6.5l1.2 4.8-1.2 1.2-1.2-1.2L10 6.5z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wider">Currently Exploring</p>
              <p className="text-sm text-[#ffb693]">The Saronic Gulf Passages</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
