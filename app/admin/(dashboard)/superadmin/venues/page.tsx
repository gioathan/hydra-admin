"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVenues } from "@/lib/api/venues";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SuperAdminVenuesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-venues", page, search],
    queryFn: () => getVenues({ page, pageSize: 25, name: search || undefined }),
  });

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0C5F7D]">All Venues</h1>
        <p className="text-sm text-[#566572] mt-1">Every venue registered in the system</p>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search by name..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-6">Name</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Location</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Capacity</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Rating</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">ID</th>
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
              : (data?.items ?? []).map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3 border-t border-gray-100 px-6 text-[#0C5F7D] font-medium">{v.name}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{v.location ?? v.address ?? "—"}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{v.capacity}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{v.averageRating?.toFixed(1) ?? "—"}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572] font-mono text-xs">{v.id}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && data && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-[#566572]">
              Page {data.pageNumber} of {data.totalPages} — {data.totalCount} venues
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
