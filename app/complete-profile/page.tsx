"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { updateCustomer } from "@/lib/api/customersApi";
import { extractErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormValues {
  phone: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { customerId } = useCustomerAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormValues) => updateCustomer(customerId!, { phone: data.phone }),
    onSuccess: () => router.replace(redirect || "/discover"),
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen bg-[#E7DFD0] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-[440px]">
        <div className="text-center mb-6">
          <img src="/brand-lockup.svg" alt="Local Bee" style={{ height: 36, width: "auto", margin: "0 auto" }} />
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-[#E1D7C6]/30 p-10">
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[26px] font-semibold text-[#0C5F7D] leading-tight mb-2">
              One last thing
            </h1>
            <p className="text-[#566572]">
              Add your phone number so venues can reach you about your bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-5" noValidate>
            <Input
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              placeholder="+30 210 000 0000"
              error={errors.phone?.message}
              {...register("phone", { required: "Phone number is required" })}
            />

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
            )}

            <Button type="submit" loading={isPending} className="w-full mt-1">
              Continue
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
