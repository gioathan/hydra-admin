"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { token, setAuth, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (token) router.replace("/admin/dashboard"); }, [token, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user, data.venueId);
      router.replace("/admin/dashboard");
    },
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0] p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#C4622D]">Hydra</h1>
          <p className="text-sm text-[#6B7280] mt-1">Admin Dashboard</p>
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
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{errorMessage}</p>
          )}
          <Button type="submit" loading={isPending} className="w-full mt-1">Sign in</Button>
        </form>
      </div>
    </div>
  );
}
