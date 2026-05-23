"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { updateUser } from "@/lib/api/users";
import { extractErrorMessage } from "@/lib/axios";
import { validatePassword } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useCustomerAuthStore();
  const { showToast } = useToast();

  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<FormValues>();
  const newPassword = watch("newPassword", "");

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormValues) =>
      updateUser(user!.id, { currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      showToast("Password updated.", "success");
      reset();
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile header */}
      <div
        className="lg:hidden"
        style={{ padding: "48px 20px 16px", background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", display: "flex", alignItems: "center", gap: 12 }}
      >
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition text-xl" style={{ color: "#041635" }}>‹</button>
        <h1 className="text-lg font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>Change Password</h1>
      </div>

      {/* Desktop header */}
      <div
        className="hidden lg:flex items-center gap-4"
        style={{ background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", padding: "28px 80px" }}
      >
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition text-2xl" style={{ color: "#041635" }}>‹</button>
        <h1 className="text-2xl font-bold" style={{ color: "#041635", fontFamily: "var(--font-serif)" }}>Change Password</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 lg:px-0 lg:py-0" style={{ background: "#fbf9f4" }}>
        <div className="lg:max-w-[1440px] lg:mx-auto lg:px-20 lg:py-16 lg:w-full">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="lg:bg-white lg:rounded-xl lg:p-8 lg:border lg:border-gray-100 lg:shadow-sm">
                <form
                  onSubmit={handleSubmit((data) => mutate(data))}
                  className="flex flex-col gap-4 lg:gap-5"
                  noValidate
                >
                  <Input
                    label="Current Password"
                    type="password"
                    autoComplete="current-password"
                    error={errors.currentPassword?.message}
                    {...register("currentPassword", { required: "Current password is required" })}
                  />
                  <div>
                    <Input
                      label="New Password"
                      type="password"
                      autoComplete="new-password"
                      error={errors.newPassword?.message}
                      {...register("newPassword", {
                        required: "New password is required",
                        validate: (v) => validatePassword(v) ?? true,
                      })}
                    />
                    <p className="text-xs mt-1" style={{ color: "#75777f" }}>10+ chars, uppercase, digit, special character</p>
                  </div>
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

                  <Button type="submit" loading={isPending} className="mt-2">
                    Update Password
                  </Button>
                </form>
              </div>
            </div>

            {/* Desktop info card */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-32 p-8 rounded-xl border flex flex-col gap-5" style={{ background: "#f5f3ee", borderColor: "#c5c6cf" }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>Password Requirements</h3>
                <div className="flex flex-col gap-3">
                  <RequirementItem label="At least 10 characters long" />
                  <RequirementItem label="One uppercase letter (A–Z)" />
                  <RequirementItem label="One digit (0–9)" />
                  <RequirementItem label="One special character (!@#$…)" />
                </div>
                <div style={{ height: 1, background: "#e4e2dd" }} />
                <p className="text-sm leading-relaxed" style={{ color: "#75777f" }}>
                  Use a unique password you don't use anywhere else. Avoid common words and personal information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#9c440f" }}>
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm" style={{ color: "#041635" }}>{label}</span>
    </div>
  );
}
