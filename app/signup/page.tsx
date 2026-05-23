"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { register as registerApi } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";
import { validatePassword } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
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
    <div className="min-h-screen flex items-center justify-center bg-[#fbf8fc] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B2B4B] tracking-widest">
            HYDRA
          </Link>
          <p className="text-sm text-[#44474e] mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <form
            onSubmit={handleSubmit((data) => mutate(data))}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Full Name"
              autoComplete="name"
              placeholder="Alex Papadopoulos"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />
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
            <Input
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="+30 210 000 0000"
              error={errors.phone?.message}
              {...register("phone", { required: "Phone is required" })}
            />
            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  validate: (v) => validatePassword(v) ?? true,
                })}
              />
              <p className="text-xs text-[#75777f] mt-1">
                10+ chars, uppercase, digit, special character
              </p>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
            )}

            <Button type="submit" loading={isPending} className="w-full mt-1">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#44474e] mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#C4622D] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
