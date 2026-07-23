"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  getVenue,
  updateVenue,
  addVenuePhoto,
  deleteVenuePhoto,
  reorderVenuePhotos,
} from "@/lib/api/venues";
import { getVenueTypes } from "@/lib/api/venueTypes";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { VenuePhotoDto, UpdateVenueRequest } from "@/types";

// ─── Venue Details Form ──────────────────────────────────────────

function VenueDetailsSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const { data: venueTypesData, isLoading: typesLoading } = useQuery({
    queryKey: ["venueTypes"],
    queryFn: () => getVenueTypes(),
    staleTime: 5 * 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateVenueRequest>();

  useEffect(() => {
    if (venue) {
      reset({
        name: venue.name,
        address: venue.address,
        capacity: venue.capacity,
        venueTypeId: venue.venueTypeId,
        mapsUrl: venue.googleMapsUrl ?? "",
        description: venue.description ?? "",
      });
    }
  }, [venue, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateVenueRequest) => updateVenue(venueId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venue", venueId], updated);
      showToast("Venue details saved.", "success");
      reset({
        name: updated.name,
        address: updated.address,
        capacity: updated.capacity,
        venueTypeId: updated.venueTypeId,
        mapsUrl: updated.googleMapsUrl ?? "",
        description: updated.description ?? "",
      });
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const typeOptions =
    venueTypesData?.items.map((t) => ({ value: t.id, label: t.name })) ?? [];

  if (venueLoading || typesLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-5 max-w-lg"
      noValidate
    >
      <Input
        label="Name"
        error={errors.name?.message}
        {...register("name", { required: "Name is required" })}
      />
      <Input
        label="Address"
        error={errors.address?.message}
        {...register("address", { required: "Address is required" })}
      />
      <Input
        label="Capacity"
        type="number"
        min={1}
        error={errors.capacity?.message}
        {...register("capacity", {
          required: "Capacity is required",
          valueAsNumber: true,
          min: { value: 1, message: "Minimum capacity is 1" },
        })}
      />
      <Select
        label="Venue Type"
        options={typeOptions}
        error={errors.venueTypeId?.message}
        {...register("venueTypeId", { required: "Venue type is required" })}
      />
      <Input
        label="Location (city/island)"
        value={venue?.location ?? "—"}
        readOnly
        disabled
        helperText="Set by the administrator — contact support to change it."
      />
      <div className="flex flex-col gap-1.5">
        <Input
          label="Google Maps link"
          placeholder="https://www.google.com/maps/place/..."
          error={errors.mapsUrl?.message}
          {...register("mapsUrl")}
        />
        <p className="text-xs text-[#566572]">
          Paste the Google Maps link for this venue&apos;s location.
        </p>
      </div>
      {venue?.googleMapsUrl && (
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 shrink-0 text-[#566572]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <a
            href={venue.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C25B3C] hover:underline truncate"
          >
            View on Google Maps
          </a>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#0C5F7D]">Description</label>
        <textarea
          rows={4}
          placeholder="A short description of the venue (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#0C5F7D] placeholder:text-[#566572] outline-none focus:border-[#0C5F7D] focus:ring-1 focus:ring-[#0C5F7D] resize-none"
          {...register("description")}
        />
      </div>
      <div>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface PhotoCardProps {
  photo: VenuePhotoDto;
  venueName: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  deleting: boolean;
}

function PhotoCard({
  photo,
  venueName,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  deleting,
}: PhotoCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="relative h-40 bg-[#0C5F7D] flex items-center justify-center">
        {photo.url && (
          <Image
            src={photo.url}
            alt="Venue photo"
            fill
            className="object-cover"
            sizes="300px"
          />
        )}
        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          #{photo.displayOrder}
        </span>
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 rounded-md text-[#566572] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded-md text-[#566572] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            ↓
          </button>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          loading={deleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

// ─── Photos Section ─────────────────────────────────────────────────

function PhotosSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: venue } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const [localPhotos, setLocalPhotos] = useState<VenuePhotoDto[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [confirm, setConfirm] = useState<{ title: string; message: string; confirmLabel: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    if (venue) {
      const sorted = [...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder);
      setLocalPhotos(sorted);
      setOrderChanged(false);
      setDisplayOrder(sorted.length + 1);
    }
  }, [venue]);

  const addMutation = useMutation({
    mutationFn: ({ file, order }: { file: File; order: number }) =>
      addVenuePhoto(venueId, file, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Photo uploaded.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => {
      setDeletingId(photoId);
      return deleteVenuePhoto(venueId, photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      showToast("Photo deleted.", "success");
      setDeletingId(null);
    },
    onError: (err) => {
      showToast(extractErrorMessage(err), "error");
      setDeletingId(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: () =>
      reorderVenuePhotos(venueId, {
        items: localPhotos.map((p, idx) => ({
          photoId: p.id,
          displayOrder: idx + 1,
        })),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venue", venueId], (old: typeof venue) =>
        old ? { ...old, photos: updated } : old
      );
      setOrderChanged(false);
      showToast("Photo order saved.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const movePhoto = (index: number, direction: "up" | "down") => {
    const next = [...localPhotos];
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    setLocalPhotos(next);
    setOrderChanged(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addMutation.mutate({ file, order: displayOrder });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Photo grid */}
      {localPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {localPhotos.map((photo, idx) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              venueName={venue?.name ?? ""}
              isFirst={idx === 0}
              isLast={idx === localPhotos.length - 1}
              onMoveUp={() => movePhoto(idx, "up")}
              onMoveDown={() => movePhoto(idx, "down")}
              onDelete={() =>
                setConfirm({
                  title: "Delete photo",
                  message: "Delete this photo? This can't be undone.",
                  confirmLabel: "Delete",
                  onConfirm: () => deleteMutation.mutate(photo.id),
                })
              }
              deleting={deletingId === photo.id}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#566572]">No photos added yet.</p>
      )}

      {/* Save order button */}
      {orderChanged && (
        <div>
          <Button
            onClick={() => reorderMutation.mutate()}
            loading={reorderMutation.isPending}
          >
            Save Order
          </Button>
        </div>
      )}

      {/* Upload photo */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-[#0C5F7D] mb-4">Add Photo</h3>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg items-end">
          <div className="w-28 shrink-0">
            <label className="text-sm font-medium text-[#0C5F7D] block mb-1.5">
              Display order
            </label>
            <input
              type="number"
              min={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#0C5F7D] outline-none focus:border-[#0C5F7D] focus:ring-1 focus:ring-[#0C5F7D]"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-[#0C5F7D] block mb-1.5">
              Photo file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={addMutation.isPending}
              className="w-full text-sm text-[#0C5F7D] file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0C5F7D] file:text-white hover:file:bg-[#0E6E8E] disabled:opacity-50 cursor-pointer"
            />
          </div>
          {addMutation.isPending && (
            <span className="text-sm text-[#566572] shrink-0">Uploading…</span>
          )}
        </div>
      </div>

      <Modal
        open={!!confirm}
        title={confirm?.title ?? ""}
        description={confirm?.message}
        confirmLabel={confirm?.confirmLabel ?? "Confirm"}
        confirmVariant="danger"
        onConfirm={() => {
          confirm?.onConfirm();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function VenuePage() {
  const { venueId } = useAuthStore();

  if (!venueId) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-[#566572]">No venue linked to this account.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-[#0C5F7D]">Venue</h1>

      <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-6">
          Venue Details
        </h2>
        <VenueDetailsSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-6">Photos</h2>
        <PhotosSection venueId={venueId} />
      </section>
    </div>
  );
}
