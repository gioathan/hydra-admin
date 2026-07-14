"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";
import { validatePassword } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const newPassword = watch("newPassword", "");

  const email = typeof window !== "undefined" ? localStorage.getItem("reset_password_email") ?? "" : "";

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormValues) =>
      resetPassword({ email, code: data.code, newPassword: data.newPassword }),
    onSuccess: () => {
      localStorage.removeItem("reset_password_email");
      router.replace("/signin");
    },
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <img src="/brand-lockup.svg" alt="Local Bee" style={{ height: 36, width: "auto" }} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <h2 className="text-lg font-semibold text-[#0C5F7D] mb-1">Reset your password</h2>
          <p className="text-sm text-[#566572] mb-6">
            Enter the code from your email and choose a new password.
          </p>

          <form
            onSubmit={handleSubmit((data) => mutate(data))}
            className="flex flex-col gap-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-[#0C5F7D] mb-1.5">
                Reset code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#0C5F7D]"
                {...register("code", { required: "Code is required", minLength: { value: 6, message: "Enter the full 6-digit code" } })}
              />
              {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>}
            </div>

            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword", {
                required: "Password is required",
                validate: (v) => validatePassword(v) ?? true,
              })}
            />
            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === newPassword || "Passwords do not match",
              })}
            />

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
            )}

            <Button type="submit" loading={isPending} className="w-full mt-1">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
