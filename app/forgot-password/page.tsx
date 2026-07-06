"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";

interface FormValues {
  email: string;
  website?: string;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, variables) => {
      localStorage.setItem("reset_password_email", variables.email);
      router.push("/reset-password");
    },
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen bg-[#E7DFD0] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Atmospheric blobs */}
      <div className="absolute top-[-8%] right-[-4%] w-80 h-80 rounded-full bg-[#C25B3C]/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-8%] left-[-4%] w-80 h-80 rounded-full bg-[#0C5F7D]/20 blur-[100px] pointer-events-none" />

      <section className="relative z-10 w-full max-w-[520px]">

        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold tracking-[0.2em] text-[#0C5F7D] hover:text-[#0C5F7D] transition-colors">
            HYDRA
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white shadow-sm rounded-xl border border-[#E1D7C6]/30 overflow-hidden">
          <div className="p-10 md:p-12">

            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full border border-[#E1D7C6] flex items-center justify-center text-[#0C5F7D]">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="4" y="11" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 11V8a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="13" cy="17" r="2" fill="currentColor" />
                  <line x1="13" y1="19" x2="13" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[32px] font-semibold text-[#0C5F7D] leading-tight mb-2">
                Forgot Password?
              </h1>
              <p className="text-[#566572]">Enter your email and we&apos;ll send you a reset code.</p>
            </div>

            <form onSubmit={handleSubmit(({ website, ...data }) => { if (website) return; mutate(data); })} className="space-y-6" noValidate>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold tracking-[0.12em] text-[#566572] uppercase">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full h-14 px-4 bg-[#F4EDE1] border rounded-lg text-[#22303A] placeholder:text-[#8B95A0] outline-none transition-colors text-base
                    ${errors.email ? "border-red-500 focus:border-red-500" : "border-[#E1D7C6] focus:border-[#C25B3C]"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                  })}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
              )}

              <div className="absolute -left-[9999px] top-0 h-0 overflow-hidden" aria-hidden="true">
                <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-16 bg-[#C25B3C] text-white font-bold tracking-[0.1em] text-sm rounded-lg hover:bg-[#9E4527] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? <Spinner /> : "SEND RESET CODE"}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-[#E1D7C6]/30 text-center">
              <Link href="/signin" className="text-[#C25B3C] font-bold hover:underline">
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
