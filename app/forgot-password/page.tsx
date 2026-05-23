"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, variables) => {
      localStorage.setItem("reset_password_email", variables.email);
      router.push("/reset-password");
    },
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf8fc] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B2B4B] tracking-widest">
            HYDRA
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <h2 className="text-lg font-semibold text-[#1B2B4B] mb-1">Forgot password?</h2>
          <p className="text-sm text-[#44474e] mb-6">
            Enter your email and we&apos;ll send you a reset code.
          </p>

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

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
            )}

            <Button type="submit" loading={isPending} className="w-full">
              Send Reset Code
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#44474e] mt-6">
          <Link href="/signin" className="text-[#C4622D] font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
