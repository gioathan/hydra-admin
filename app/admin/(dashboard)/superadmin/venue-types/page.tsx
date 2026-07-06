"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVenueTypes, createVenueType, updateVenueType, deleteVenueType } from "@/lib/api/venueTypes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { extractErrorMessage } from "@/lib/axios";
import { VenueTypeDto } from "@/types";

export default function SuperAdminVenueTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<VenueTypeDto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", description: "", displayOrder: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["venue-types"],
    queryFn: () => getVenueTypes(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: createVenueType,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venue-types"] }); setShowForm(false); showToast("Venue type created", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
      updateVenueType(id, { name: data.name, description: data.description || null, displayOrder: data.displayOrder }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venue-types"] }); setEditItem(null); showToast("Venue type updated", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVenueType,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venue-types"] }); setDeleteId(null); showToast("Venue type deleted", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const openCreate = () => { setForm({ name: "", description: "", displayOrder: 0 }); setShowForm(true); };
  const openEdit = (item: VenueTypeDto) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description ?? "", displayOrder: item.displayOrder ?? 0 });
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C5F7D]">Venue Types</h1>
          <p className="text-sm text-[#566572] mt-1">Manage venue categories</p>
        </div>
        <Button onClick={openCreate}>New Venue Type</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-6">Name</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Description</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Order</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="py-3 border-t border-gray-100 px-4"><Skeleton className="h-4 w-28" /></td>
                    ))}
                  </tr>
                ))
              : (data?.items ?? []).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 border-t border-gray-100 px-6 text-[#0C5F7D] font-medium">{item.name}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{item.description ?? "—"}</td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">{item.displayOrder ?? 0}</td>
                    <td className="py-3 border-t border-gray-100 px-4">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                        <button onClick={() => setDeleteId(item.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        open={showForm}
        title="New Venue Type"
        confirmLabel={createMutation.isPending ? "Creating..." : "Create"}
        loading={createMutation.isPending}
        onConfirm={() => createMutation.mutate({ name: form.name, description: form.description || null, displayOrder: form.displayOrder })}
        onCancel={() => setShowForm(false)}
      >
        <div className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Display Order" type="number" value={String(form.displayOrder)} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editItem}
        title="Edit Venue Type"
        confirmLabel={updateMutation.isPending ? "Saving..." : "Save"}
        loading={updateMutation.isPending}
        onConfirm={() => editItem && updateMutation.mutate({ id: editItem.id, data: form })}
        onCancel={() => setEditItem(null)}
      >
        <div className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Display Order" type="number" value={String(form.displayOrder)} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteId}
        title="Delete Venue Type"
        description="Are you sure you want to delete this venue type?"
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
