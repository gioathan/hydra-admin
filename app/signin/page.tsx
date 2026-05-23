"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { customerLogin } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  email: string;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const { setAuth } = useCustomerAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const [extraError, setExtraError] = useState<string | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: customerLogin,
    onSuccess: (data) => {
      if (!data.customerId) {
        setExtraError("This account is not a customer account. Please use the admin portal to sign in.");
        return;
      }
      setExtraError(null);
      setAuth(data.token, data.user, data.customerId);
      router.replace("/discover");
    },
  });

  const errorMessage = extraError ?? (error ? extractErrorMessage(error) : null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf8fc] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B2B4B] tracking-widest">
            HYDRA
          </Link>
          <p className="text-sm text-[#44474e] mt-1">Welcome back</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <form
            onSubmit={handleSubmit((data) => mutate(data))}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              })}
            />
            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                showPasswordToggle
                error={errors.password?.message}
                {...register("password", { required: "Password is required" })}
              />
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-[#C4622D] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
            )}

            <Button type="submit" loading={isPending} className="w-full mt-1">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#44474e] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#C4622D] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
