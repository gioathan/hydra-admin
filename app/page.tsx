import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1B2B4B] flex flex-col">
      <header className="px-6 py-6 flex items-center justify-between">
        <span className="text-white font-bold text-2xl tracking-widest">HYDRA</span>
        <Link
          href="/signin"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <div>
          <h1 className="text-6xl sm:text-8xl font-bold text-white tracking-tight mb-3">
            HYDRA
          </h1>
          <p className="text-base text-white/60 max-w-xs mx-auto">
            Book the best of the island — restaurants, bars, cafés, and more.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-4">
          <Link
            href="/signup"
            className="flex-1 bg-[#C4622D] text-white text-center py-3.5 rounded-xl font-semibold text-sm hover:bg-[#b0561f] transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/signin"
            className="flex-1 border border-white/25 text-white text-center py-3.5 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-white/25">
        Hydra Island, Greece
      </footer>
    </div>
  );
}
