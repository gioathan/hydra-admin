"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/api/users";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const passwordRules = [
  "At least 10 characters",
  "At least 1 uppercase letter",
  "At least 1 digit",
  "At least 1 special character",
];

function validateNewPassword(value: string) {
  if (value.length < 10) return "At least 10 characters required";
  if (!/[A-Z]/.test(value)) return "At least 1 uppercase letter required";
  if (!/\d/.test(value)) return "At least 1 digit required";
  if (!/[^A-Za-z0-9]/.test(value)) return "At least 1 special character required";
  return true;
}

export default function AccountPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>();

  const newPassword = watch("newPassword", "");

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      updateUser(user!.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      showToast("Password changed successfully.", "success");
      reset();
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const handleSignOut = () => {
    clearAuth();
    router.replace("/admin/login");
  };

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0C5F7D]">Account</h1>

      {/* Account info */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#0C5F7D]">
          Account Information
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-[#566572] uppercase tracking-wider mb-1">
              Email
            </p>
            <p className="text-sm text-[#0C5F7D] font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-[#566572] uppercase tracking-wider mb-1">
              Role
            </p>
            <p className="text-sm text-[#0C5F7D] font-medium capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-6">
          Change Password
        </h2>

        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="flex flex-col gap-5 max-w-md"
          noValidate
        >
          <Input
            label="Current Password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />

          <div className="flex flex-col gap-1">
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword", {
                required: "New password is required",
                validate: validateNewPassword,
              })}
            />
            <ul className="mt-1 flex flex-col gap-0.5">
              {passwordRules.map((rule) => (
                <li key={rule} className="text-xs text-[#566572] flex items-center gap-1.5">
                  <span className="text-[#566572]">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your new password",
              validate: (val) =>
                val === newPassword || "Passwords do not match",
            })}
          />

          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              {errorMessage}
            </p>
          )}

          <div>
            <Button type="submit" loading={isPending}>
              Update Password
            </Button>
          </div>
        </form>
      </section>

      {/* Legal */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-4">Legal</h2>
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/privacy-policy"
            className="flex items-center justify-between py-2 text-sm text-[#0C5F7D] hover:text-[#C25B3C] transition-colors"
          >
            <span>Privacy Policy</span>
            <svg className="w-4 h-4 text-[#566572]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div className="border-t border-gray-100" />
          <Link
            href="/admin/terms-of-service"
            className="flex items-center justify-between py-2 text-sm text-[#0C5F7D] hover:text-[#C25B3C] transition-colors"
          >
            <span>Terms of Service</span>
            <svg className="w-4 h-4 text-[#566572]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Sign out */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-2">
          Sign Out
        </h2>
        <p className="text-sm text-[#566572] mb-4">
          You will be redirected to the login page.
        </p>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign Out
        </Button>
      </section>
    </div>
  );
}
