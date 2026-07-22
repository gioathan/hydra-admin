"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, createVenueAdmin, deleteUser, updateUserEmail } from "@/lib/api/users";
import { getVenueTypes } from "@/lib/api/venueTypes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { extractErrorMessage } from "@/lib/axios";
import { RegisterVenueAdminRequest, UserDto } from "@/types";

const roleBadgeClass = (role: string) => {
  if (role === "SuperAdmin") return "bg-purple-100 text-purple-800";
  if (role === "Admin") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-600";
};

export default function SuperAdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const { showToast } = useToast();
  const [form, setForm] = useState<RegisterVenueAdminRequest>({
    email: "", name: "", address: "", capacity: 0, venueTypeId: "", location: "", password: "", description: "",
  });

  // debounce the search box; reset to page 1 whenever the filters change
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => { setPage(1); }, [roleFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-users", page, search, roleFilter],
    queryFn: () => getAllUsers(page, 25, search || undefined, roleFilter || undefined),
  });

  const { data: venueTypesData } = useQuery({
    queryKey: ["venue-types-all"],
    queryFn: () => getVenueTypes(1, 100),
  });

  // Default the venue-type dropdown to the first available type so the form
  // never submits an empty venueTypeId (a controlled <select> shows the first
  // option but doesn't set its value until the user changes it).
  useEffect(() => {
    const firstId = venueTypesData?.items?.[0]?.id;
    if (firstId) setForm(f => (f.venueTypeId ? f : { ...f, venueTypeId: firstId }));
  }, [venueTypesData]);

  const createMutation = useMutation({
    mutationFn: createVenueAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-users"] });
      setShowCreate(false);
      showToast("Venue admin created successfully", "success");
      setForm({ email: "", name: "", address: "", capacity: 0, venueTypeId: venueTypesData?.items?.[0]?.id ?? "", location: "", password: "", description: "" });
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-users"] });
      setDeleteId(null);
      showToast("User deleted", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const editEmailMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => updateUserEmail(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-users"] });
      setEditUser(null);
      showToast("Email updated", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const venueTypeOptions = (venueTypesData?.items ?? []).map(vt => ({ value: vt.id, label: vt.name }));

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C5F7D]">Users</h1>
          <p className="text-sm text-[#566572] mt-1">All registered users in the system</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Create Venue Admin</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input placeholder="Search by email…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        </div>
        <div className="w-44">
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            options={[
              { value: "", label: "All roles" },
              { value: "Admin", label: "Admins" },
              { value: "Customer", label: "Customers" },
              { value: "SuperAdmin", label: "Super Admins" },
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-6">Email</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Role</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Verified</th>
              <th className="text-left text-xs font-semibold text-[#566572] uppercase tracking-wide pb-3 pt-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 border-t border-gray-100 px-6"><Skeleton className="h-4 w-48" /></td>
                    <td className="py-3 border-t border-gray-100 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 border-t border-gray-100 px-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-3 border-t border-gray-100 px-4"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              : (data?.items ?? []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 border-t border-gray-100 px-6 text-[#0C5F7D]">{user.email}</td>
                    <td className="py-3 border-t border-gray-100 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 border-t border-gray-100 px-4 text-[#566572]">
                      {user.isEmailVerified ? "Yes" : "No"}
                    </td>
                    <td className="py-3 border-t border-gray-100 px-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setEditUser(user); setEditEmail(user.email); }}
                          className="text-[#0C5F7D] hover:text-[#C25B3C] text-sm font-medium"
                        >
                          Edit email
                        </button>
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && (data?.items?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-[#566572] border-t border-gray-100">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {!isLoading && data && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-[#566572]">
              Page {data.pageNumber} of {data.totalPages} — {data.totalCount} users
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Venue Admin Modal */}
      <Modal
        open={showCreate}
        title="Create Venue Admin"
        confirmLabel={createMutation.isPending ? "Creating..." : "Create"}
        loading={createMutation.isPending}
        onConfirm={() => createMutation.mutate(form)}
        onCancel={() => setShowCreate(false)}
      >
        <div className="flex flex-col gap-4">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password ?? ""} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to auto-generate" />
          <Input label="Venue Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
          <Input label="Location (city/island)" placeholder="e.g. Hydra" value={form.location ?? ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <Input label="Capacity" type="number" value={String(form.capacity)} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} required />
          <Select
            label="Venue Type"
            value={form.venueTypeId}
            onChange={e => setForm(f => ({ ...f, venueTypeId: e.target.value }))}
            options={venueTypeOptions}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0C5F7D]">Description</label>
            <textarea
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0C5F7D] resize-none"
              rows={3}
              value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteId}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {/* Edit Email Modal */}
      <Modal
        open={!!editUser}
        title="Change user email"
        confirmLabel={editEmailMutation.isPending ? "Saving..." : "Save"}
        loading={editEmailMutation.isPending}
        onConfirm={() => editUser && editEmailMutation.mutate({ id: editUser.id, email: editEmail })}
        onCancel={() => setEditUser(null)}
      >
        <Input label="Email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
      </Modal>
    </div>
  );
}
