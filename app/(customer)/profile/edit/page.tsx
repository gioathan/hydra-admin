"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { getCustomer, updateCustomer } from "@/lib/api/customersApi";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UpdateCustomerRequest } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const { customerId } = useCustomerAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 60_000,
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } =
    useForm<UpdateCustomerRequest>();

  useEffect(() => {
    if (customer) reset({ name: customer.name, phone: customer.phone, locale: customer.locale });
  }, [customer, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateCustomerRequest) => updateCustomer(customerId!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["customer", customerId], updated);
      showToast("Profile updated.", "success");
      reset({ name: updated.name, phone: updated.phone, locale: updated.locale });
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile header */}
      <div
        className="lg:hidden"
        style={{ padding: "48px 20px 16px", background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", display: "flex", alignItems: "center", gap: 12 }}
      >
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition text-xl" style={{ color: "#041635" }}>‹</button>
        <h1 className="text-lg font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>Edit Profile</h1>
      </div>

      {/* Desktop header */}
      <div
        className="hidden lg:flex items-center gap-4"
        style={{ background: "#ffffff", borderBottom: "1px solid rgba(197,198,207,0.4)", padding: "28px 80px" }}
      >
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition text-2xl" style={{ color: "#041635" }}>‹</button>
        <h1 className="text-2xl font-bold" style={{ color: "#041635", fontFamily: "var(--font-serif)" }}>Edit Profile</h1>
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
                    label="Full Name"
                    autoComplete="name"
                    error={errors.name?.message}
                    {...register("name", { required: "Name is required" })}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5">Language</label>
                    <select
                      {...register("locale")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B] bg-white"
                    >
                      <option value="en">English</option>
                      <option value="el">Ελληνικά</option>
                    </select>
                  </div>

                  <Button type="submit" loading={isPending} disabled={!isDirty} className="mt-2">
                    Save Changes
                  </Button>
                </form>
              </div>
            </div>

            {/* Desktop info card */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-32 p-8 rounded-xl border flex flex-col gap-5" style={{ background: "#f5f3ee", borderColor: "#c5c6cf" }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#75777f", fontFamily: "var(--font-sans)" }}>About Your Profile</h3>
                <div className="flex flex-col gap-4">
                  <TipItem
                    title="Display Name"
                    body="Your name is shown on booking confirmations and correspondence with venues."
                  />
                  <TipItem
                    title="Phone Number"
                    body="Venues may contact you on this number to confirm or discuss your reservation."
                  />
                  <TipItem
                    title="Language"
                    body="Sets the language for notifications and communications sent to you."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TipItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold" style={{ color: "#041635", fontFamily: "var(--font-sans)" }}>{title}</p>
      <p className="text-sm leading-relaxed" style={{ color: "#75777f" }}>{body}</p>
    </div>
  );
}
