"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/lib/api/adminCustomers";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SuperAdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setEmail(emailInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [emailInput]);

  useEffect(() => {
    const timer = setTimeout(() => { setPhone(phoneInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [phoneInput]);

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-customers", page, email, phone],
    queryFn: () => getCustomers({ page, pageSize: 25, email: email || undefined, phone: phone || undefined }),
  });

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0C5F7D]">Customers</h1>
        <p className="text-sm text-[#566572] mt-1">All customer accounts</p>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search by email..." value={emailInput} onChange={e => setEmailInput(e.target.value)} />
        <Input placeholder="Search by phone..." value={phoneInput} onChange={e => setPhoneInput(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-6">Name</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Email</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Phone</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Locale</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 border-t border-gray-100 px-4"><Skeleton className="h-4 w-28" /></td>
                    ))}
                  </tr>
                ))
              : (data?.items ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 border-t border-gray-100 px-6 text-[#0C5F7D] font-medium">{c.name ?? "—"}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{c.email}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{c.phone ?? "—"}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{c.locale ?? "—"}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">
                      {c.createdAtUtc ? new Date(c.createdAtUtc).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && data && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-[#566572]">
              Page {data.pageNumber} of {data.totalPages} — {data.totalCount} customers
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
