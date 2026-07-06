"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyEmail, resendVerification } from "@/lib/api/customerAuth";
import { extractErrorMessage } from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const email = typeof window !== "undefined"
    ? localStorage.getItem("pending_verify_email") ?? ""
    : "";
  const userId = typeof window !== "undefined"
    ? localStorage.getItem("pending_verify_userId") ?? ""
    : "";

  const [code, setCode] = useState("");

  const { mutate: verify, isPending, error } = useMutation({
    mutationFn: () => verifyEmail({ userId, code }),
    onSuccess: () => {
      localStorage.removeItem("pending_verify_userId");
      localStorage.removeItem("pending_verify_email");
      router.replace("/signin");
    },
  });

  const { mutate: resend, isPending: resending, isSuccess: resent } = useMutation({
    mutationFn: () => resendVerification({ userId }),
  });

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#0C5F7D] tracking-widest">
            HYDRA
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <h2 className="text-lg font-semibold text-[#0C5F7D] mb-1">Verify your email</h2>
          <p className="text-sm text-[#566572] mb-6">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[#0C5F7D]">{email || "your email"}</span>.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0C5F7D] mb-1.5">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#0C5F7D]"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
            )}

            <Button
              onClick={() => verify()}
              loading={isPending}
              disabled={code.length < 6}
              className="w-full"
            >
              Verify
            </Button>

            <button
              type="button"
              onClick={() => resend()}
              disabled={resending || !userId}
              className="text-sm text-[#C25B3C] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resent ? "Code sent!" : resending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
