"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { register as registerApi } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";
import { validatePassword } from "@/lib/utils";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
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

export default function SignUpPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: registerApi,
    onSuccess: (data, variables) => {
      localStorage.setItem("pending_verify_email", variables.email);
      router.push("/verify-email");
    },
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen bg-[#dbdad5] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Atmospheric blobs */}
      <div className="absolute top-[-8%] right-[-4%] w-80 h-80 rounded-full bg-[#9c440f]/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-8%] left-[-4%] w-80 h-80 rounded-full bg-[#1b2b4b]/20 blur-[100px] pointer-events-none" />

      <section className="relative z-10 w-full max-w-[520px]">

        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold tracking-[0.2em] text-[#041635] hover:text-[#1b2b4b] transition-colors">
            HYDRA
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white shadow-sm rounded-xl border border-[#c5c6cf]/30 overflow-hidden">
          <div className="p-10 md:p-12">

            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full border border-[#c5c6cf] flex items-center justify-center text-[#041635]">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[32px] font-semibold text-[#041635] leading-tight mb-2">
                Create Account
              </h1>
              <p className="text-[#44474e]">Create your free account</p>
            </div>

            <form onSubmit={handleSubmit(({ website, ...data }) => { if (website) return; mutate(data); })} className="space-y-5" noValidate>

              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-bold tracking-[0.12em] text-[#44474e] uppercase">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  className={`w-full h-14 px-4 bg-[#f5f3f6] border rounded-lg text-[#1b1b1e] placeholder:text-[#75777f] outline-none transition-colors text-base
                    ${errors.name ? "border-red-500 focus:border-red-500" : "border-[#c5c6cf] focus:border-[#9c440f]"}`}
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold tracking-[0.12em] text-[#44474e] uppercase">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full h-14 px-4 bg-[#f5f3f6] border rounded-lg text-[#1b1b1e] placeholder:text-[#75777f] outline-none transition-colors text-base
                    ${errors.email ? "border-red-500 focus:border-red-500" : "border-[#c5c6cf] focus:border-[#9c440f]"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                  })}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-xs font-bold tracking-[0.12em] text-[#44474e] uppercase">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+30 210 000 0000"
                  className={`w-full h-14 px-4 bg-[#f5f3f6] border rounded-lg text-[#1b1b1e] placeholder:text-[#75777f] outline-none transition-colors text-base
                    ${errors.phone ? "border-red-500 focus:border-red-500" : "border-[#c5c6cf] focus:border-[#9c440f]"}`}
                  {...register("phone", { required: "Phone is required" })}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-bold tracking-[0.12em] text-[#44474e] uppercase">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full h-14 px-4 bg-[#f5f3f6] border rounded-lg text-[#1b1b1e] placeholder:text-[#75777f] outline-none transition-colors text-base
                    ${errors.password ? "border-red-500 focus:border-red-500" : "border-[#c5c6cf] focus:border-[#9c440f]"}`}
                  {...register("password", {
                    required: "Password is required",
                    validate: (v) => validatePassword(v) ?? true,
                  })}
                />
                {errors.password
                  ? <p className="text-xs text-red-600">{errors.password.message}</p>
                  : <p className="text-xs text-[#75777f]">10+ chars, uppercase, digit, special character</p>
                }
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
                className="w-full h-16 bg-[#9c440f] text-white font-bold tracking-[0.1em] text-sm rounded-lg hover:bg-[#7a3000] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? <Spinner /> : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-[#c5c6cf]/30 text-center">
              <p className="text-[#44474e]">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#9c440f] font-bold hover:underline ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
