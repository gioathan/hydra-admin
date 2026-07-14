"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
import { login, googleLogin } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { token, setAuth, clearAuth, hydrate } = useAuthStore();
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    // Re-hydrate from localStorage — if localStorage was cleared on logout,
    // this wipes any stale in-memory token from the Zustand singleton.
    clearAuth();
    hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) router.replace("/admin/dashboard"); }, [token, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user, data.venueId);
      router.replace("/admin/dashboard");
    },
  });

  const { mutate: mutateGoogle, isPending: isGooglePending } = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      setGoogleError(null);
      setAuth(data.token, data.user, data.venueId);
      router.replace("/admin/dashboard");
    },
    onError: (err) => setGoogleError(extractErrorMessage(err)),
  });

  const errorMessage = googleError ?? (error ? extractErrorMessage(error) : null);
  const anyPending = isPending || isGooglePending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center">
            <img src="/brand-lockup.svg" alt="Local Bee" style={{ height: 40, width: "auto" }} />
          </h1>
          <p className="text-sm text-[#566572] mt-1">Admin Dashboard</p>
        </div>

        {/* Google sign-in */}
        <div className="flex justify-center mb-6">
          {isGooglePending ? (
            <div className="flex items-center gap-2 text-[#566572] text-sm h-10">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in with Google…
            </div>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (!credentialResponse.credential) return;
                setGoogleError(null);
                mutateGoogle({ idToken: credentialResponse.credential });
              }}
              onError={() => setGoogleError("Google sign-in failed. Please try again.")}
              text="continue_with"
              shape="rectangular"
              size="large"
              width={368}
              useOneTap={false}
            />
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-[#566572] uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-5" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
            })}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          {errorMessage && (
            errorMessage.includes("Google Sign-In") ? (
              <p className="text-sm text-[#C25B3C] bg-orange-50 border border-[#C25B3C]/20 px-3 py-2 rounded-md">
                ↑ This account was registered with Google. Use the &ldquo;Continue with Google&rdquo; button above.
              </p>
            ) : (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{errorMessage}</p>
            )
          )}
          <Button type="submit" loading={anyPending} className="w-full mt-1">Sign in</Button>
        </form>
      </div>
    </div>
  );
}
