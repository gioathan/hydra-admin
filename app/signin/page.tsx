"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { customerLogin, googleLogin } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";

interface FormValues {
  email: string;
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

function EyeOpen() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { setAuth } = useCustomerAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [extraError, setExtraError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = googleContainerRef.current;
    if (el) setGoogleWidth(Math.floor(el.getBoundingClientRect().width));
  }, []);

  const { mutate, isPending, error } = useMutation({
    mutationFn: customerLogin,
    onSuccess: (data) => {
      if (!data.customerId) {
        setExtraError("This account is not a customer account. Please use the admin portal to sign in.");
        return;
      }
      setExtraError(null);
      setAuth(data.token, data.user, data.customerId);
      router.replace(data.phoneRequired ? "/complete-profile" : "/discover");
    },
    onError: (err, variables) => {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        const userId = err.response.data?.userId ?? "";
        localStorage.setItem("pending_verify_userId", userId);
        localStorage.setItem("pending_verify_email", variables.email);
        router.push("/verify-email");
      }
    },
  });

  const { mutate: mutateGoogle, isPending: isGooglePending, error: googleError } = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      if (!data.customerId) {
        setExtraError("This Google account is not linked to a customer account.");
        return;
      }
      setExtraError(null);
      setAuth(data.token, data.user, data.customerId, true);
      router.replace(data.phoneRequired ? "/complete-profile" : "/discover");
    },
  });

  const errorMessage = extraError ?? (error ? extractErrorMessage(error) : null) ?? (googleError ? extractErrorMessage(googleError) : null);
  const anyPending = isPending || isGooglePending;

  return (
    <div className="min-h-screen bg-[#E7DFD0] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Atmospheric blobs */}
      <div className="absolute top-[-8%] right-[-4%] w-80 h-80 rounded-full bg-[#C25B3C]/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-8%] left-[-4%] w-80 h-80 rounded-full bg-[#0C5F7D]/20 blur-[100px] pointer-events-none" />

      <section className="relative z-10 w-full max-w-[520px]">

        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center">
            <img src="/brand-lockup.svg" alt="Local Bee" style={{ height: 36, width: "auto" }} />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white shadow-sm rounded-xl border border-[#E1D7C6]/30 overflow-hidden">
          <div className="p-10 md:p-12">

            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full border border-[#E1D7C6] flex items-center justify-center text-[#0C5F7D]">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3v15L6 17V14L14 3z" fill="currentColor" opacity="0.9" />
                  <path d="M14 9v9l6-1.5V12L14 9z" fill="currentColor" opacity="0.45" />
                  <path d="M5 21h18M8 21v2M20 21v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[32px] font-semibold text-[#0C5F7D] leading-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-[#566572]">Sign in to your account</p>
            </div>

            {/* Google sign-in button */}
            <div className="flex justify-center mb-6">
              {isGooglePending ? (
                <div className="flex items-center gap-2 text-[#566572] text-sm h-11">
                  <Spinner />
                  Signing in with Google…
                </div>
              ) : (
                <div ref={googleContainerRef} className="w-full overflow-hidden">
                  {googleWidth !== null && (
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        if (!credentialResponse.credential) return;
                        setExtraError(null);
                        mutateGoogle({ idToken: credentialResponse.credential });
                      }}
                      onError={() => setExtraError("Google sign-in failed. Please try again.")}
                      text="continue_with"
                      shape="rectangular"
                      size="large"
                      width={googleWidth}
                      useOneTap={false}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[#E1D7C6]/40" />
              <span className="text-xs text-[#8B95A0] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-[#E1D7C6]/40" />
            </div>

            <form onSubmit={handleSubmit(({ website, ...data }) => { if (website) return; setExtraError(null); mutate(data); })} className="space-y-6" noValidate>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold tracking-[0.12em] text-[#566572] uppercase">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`w-full h-14 px-4 bg-[#F4EDE1] border rounded-lg text-[#22303A] placeholder:text-[#8B95A0] outline-none transition-colors text-base
                    ${errors.email ? "border-red-500 focus:border-red-500" : "border-[#E1D7C6] focus:border-[#C25B3C]"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                  })}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold tracking-[0.12em] text-[#566572] uppercase">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#C25B3C] hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full h-14 px-4 pr-12 bg-[#F4EDE1] border rounded-lg text-[#22303A] placeholder:text-[#8B95A0] outline-none transition-colors text-base
                      ${errors.password ? "border-red-500 focus:border-red-500" : "border-[#E1D7C6] focus:border-[#C25B3C]"}`}
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B95A0] hover:text-[#0C5F7D] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {errorMessage && (
                errorMessage.includes("Google Sign-In") ? (
                  <p className="text-sm text-[#C25B3C] bg-[#FBF2EC] border border-[#C25B3C]/20 px-3 py-2 rounded-lg">
                    ↑ This account was registered with Google. Use the &ldquo;Continue with Google&rdquo; button above.
                  </p>
                ) : (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
                )
              )}

              <div className="absolute -left-[9999px] top-0 h-0 overflow-hidden" aria-hidden="true">
                <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>

              <button
                type="submit"
                disabled={anyPending}
                className="w-full h-16 bg-[#C25B3C] text-white font-bold tracking-[0.1em] text-sm rounded-lg hover:bg-[#9E4527] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? <Spinner /> : "SIGN IN"}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-[#E1D7C6]/30 text-center">
              <p className="text-[#566572]">
                New to Local Bee?{" "}
                <Link href="/signup" className="text-[#C25B3C] font-bold hover:underline ml-1">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
