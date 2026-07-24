import Link from "next/link";


export default function LandingPage() {
  return (
    <main className="min-h-screen lg:h-screen flex flex-col lg:grid lg:grid-cols-2 lg:overflow-hidden">

      {/* ── Left Panel ── */}
      <section className="flex flex-col justify-between p-10 lg:p-10 xl:p-16 bg-white lg:h-full lg:overflow-hidden">

        <div className="flex items-center justify-between">
          <img src="/brand-lockup.svg" alt="Local Bee" style={{ height: 64, width: "auto" }} />
          <a href="mailto:info@localbee.gr" className="text-sm text-[#566572] hover:text-[#C25B3C] transition-colors">
            Support
          </a>
        </div>

        {/* Mobile-only decorative element */}
        <div className="lg:hidden mx-auto my-8" style={{ width: 240 }} aria-hidden="true">
          <div className="bg-[#6e2a00] rounded-2xl p-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-[11px] font-bold tracking-[0.15em] uppercase">My Bookings</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EDB49B]/70" />
              </div>
            </div>
            <div className="flex mb-2.5">
              <div className="flex flex-col items-center w-10 shrink-0">
                <span className="text-[9px] font-mono text-white/40">19:00</span>
                <div className="w-2 h-2 rounded-full bg-[#EDB49B] my-1.5 shrink-0" />
                <div className="flex-1 w-px bg-white/10 min-h-4" />
              </div>
              <div className="flex-1 ml-2">
                <div className="bg-white/[0.07] border border-white/10 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-[11px] font-semibold">Rooftop Bar</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                  </div>
                  <p className="text-white/30 text-[10px]">2 guests · Soho</p>
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col items-center w-10 shrink-0">
                <span className="text-[9px] font-mono text-white/40">21:30</span>
                <div className="w-2 h-2 rounded-full border border-white/30 my-1.5 shrink-0" />
              </div>
              <div className="flex-1 ml-2">
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white/60 text-[11px] font-semibold">Sakura Garden</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400/70">Pending</span>
                  </div>
                  <p className="text-white/20 text-[10px]">4 guests · Covent Garden</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 max-w-md mx-auto lg:mx-0">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.2em] text-[#C25B3C] uppercase">
              Discover &amp; Book
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-5xl lg:text-[44px] xl:text-[56px] 2xl:text-[64px] font-bold text-[#0C5F7D] leading-[1.1] tracking-tight">
              Find &amp; Book the Best Around You
            </h1>
            <p className="text-lg text-[#566572] leading-relaxed">
              Browse restaurants, bars, cafés and activities. Book your next favourite experience in seconds.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/signup"
              className="w-full py-4 bg-[#C25B3C] text-white text-sm font-bold tracking-[0.08em] flex items-center justify-center gap-3 hover:bg-[#9E4527] transition-all duration-300 active:scale-[0.98]"
            >
              CREATE ACCOUNT
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/signin"
              className="w-full py-4 border border-[#C25B3C] text-[#C25B3C] text-sm font-bold tracking-[0.08em] flex items-center justify-center hover:bg-[#FBF2EC] transition-all duration-300 active:scale-[0.98]"
            >
              SIGN IN
            </Link>
            <Link
              href="/discover"
              className="w-full py-3 text-[#566572] text-sm font-semibold tracking-[0.04em] flex items-center justify-center gap-2 hover:text-[#0C5F7D] transition-colors"
            >
              Just Looking? Explore Venues First
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="text-xs text-[#8B95A0] text-center -mt-1.5">
              No account needed to browse — you&apos;ll only need to sign in when you&apos;re ready to book.
            </p>
          </div>

          <div className="pt-5 border-t border-[#E1D7C6]">
            <p className="text-sm text-[#566572] italic">
              &ldquo;Great experiences don&rsquo;t happen by accident — they&rsquo;re discovered.&rdquo;
            </p>
          </div>
        </div>

        <footer className="flex justify-between items-center pt-5">
          <span className="text-xs text-[#8B95A0]/60">© {new Date().getFullYear()} Local Bee</span>
        </footer>
      </section>

      {/* ── Right Panel — decorative (desktop only) ── */}
      <section className="hidden lg:flex relative bg-[#6e2a00] overflow-hidden lg:h-full" aria-hidden="true">

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Edge gradients */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#6e2a00] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#6e2a00] to-transparent pointer-events-none" />

        {/* Timeline */}
        <div className="relative z-10 flex flex-col justify-center p-10 xl:p-16 w-full">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[#EDB49B]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#EDB49B]/80 uppercase">Schedule</span>
          </div>

          <p className="text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase mb-4 pl-14">Today · May 24</p>

          <div>
            {/* Entry 1 — Confirmed */}
            <div className="flex">
              <div className="flex flex-col items-center w-14 shrink-0">
                <span className="text-[11px] font-mono text-white/40 h-5 flex items-center">19:00</span>
                <div className="w-2.5 h-2.5 rounded-full bg-[#EDB49B] ring-[3px] ring-[#EDB49B]/20 my-2 shrink-0 relative z-10" />
                <div className="flex-1 w-px bg-white/10" />
              </div>
              <div className="flex-1 ml-3 mb-4">
                <div className="bg-white/[0.06] border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-white font-semibold text-sm">The Rooftop Bar</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 ml-2 shrink-0">Confirmed</span>
                  </div>
                  <p className="text-white/40 text-xs mb-2">Cocktail Lounge · Soho</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/25">
                    <span>2 guests</span><span>·</span><span>Ref #A2F9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entry 2 — Pending */}
            <div className="flex">
              <div className="flex flex-col items-center w-14 shrink-0">
                <span className="text-[11px] font-mono text-white/40 h-5 flex items-center">21:30</span>
                <div className="w-2 h-2 rounded-full border border-white/30 bg-transparent my-2 shrink-0 relative z-10" />
                <div className="flex-1 w-px bg-white/[0.06]" />
              </div>
              <div className="flex-1 ml-3 mb-6">
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-white/70 font-semibold text-sm">Sakura Garden</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400/80 ml-2 shrink-0">Pending</span>
                  </div>
                  <p className="text-white/30 text-xs mb-2">Japanese · Covent Garden</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                    <span>4 guests</span><span>·</span><span>Ref #B7C1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold tracking-[0.2em] text-white/15 uppercase mb-4 pl-14">Tomorrow · May 25</p>

          <div className="opacity-40">
            {/* Entry 3 */}
            <div className="flex">
              <div className="flex flex-col items-center w-14 shrink-0">
                <span className="text-[11px] font-mono text-white/40 h-5 flex items-center">20:00</span>
                <div className="w-2 h-2 rounded-full border border-white/20 bg-transparent my-2 shrink-0" />
              </div>
              <div className="flex-1 ml-3">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-white/50 font-semibold text-sm">La Maison</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/60 ml-2 shrink-0">Pending</span>
                  </div>
                  <p className="text-white/25 text-xs mb-2">French Bistro · Chelsea</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/15">
                    <span>3 guests</span><span>·</span><span>Ref #D4E8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
