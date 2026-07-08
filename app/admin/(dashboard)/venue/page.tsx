"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import {
  getVenue,
  updateVenue,
  addVenuePhoto,
  deleteVenuePhoto,
  reorderVenuePhotos,
  getVenueRules,
  updateVenueRules,
  updateVenuePricing,
  toggleVenueBookings,
  toggleVenueEvents,
  getVenueEvents,
  createVenueEvent,
  updateVenueEvent,
  deleteVenueEvent,
  closeVenueEvent,
  addEventPhoto,
  deleteEventPhoto,
  uploadFile,
} from "@/lib/api/venues";
import { getVenueTypes } from "@/lib/api/venueTypes";
import axios from "axios";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { VenuePhotoDto, UpdateVenueRequest, VenueRulesDto, VenueEventDto, CreateVenueEventRequest, UpdateVenueEventRequest } from "@/types";

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
        location: venue.location ?? "",
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
        location: updated.location ?? "",
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
        placeholder="e.g. Hydra"
        error={errors.location?.message}
        {...register("location")}
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

// ─── Booking Rules Section ────────────────────────────────────────────

function VenueRulesForm({ venueId, defaultValues }: { venueId: string; defaultValues: VenueRulesDto }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VenueRulesDto>({ defaultValues });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VenueRulesDto) => updateVenueRules(venueId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venueRules", venueId], updated);
      reset(updated);
      showToast("Booking rules saved.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const autoConfirm = watch("autoConfirm");

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-6 max-w-lg"
      noValidate
    >
      {/* Auto-confirm toggle */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-[#0C5F7D]">Auto-confirm bookings</p>
          <p className="text-xs text-[#566572] mt-0.5">
            {autoConfirm
              ? "Bookings are confirmed instantly."
              : "Bookings land in Pending — you confirm or decline manually."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoConfirm}
          onClick={() => setValue("autoConfirm", !autoConfirm, { shouldDirty: true })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C25B3C] focus:ring-offset-2
            ${autoConfirm ? "bg-[#C25B3C]" : "bg-gray-300"}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
              ${autoConfirm ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Slot duration */}
      <Input
        label="Slot duration (minutes)"
        type="number"
        min={15}
        max={480}
        error={errors.slotMinutes?.message}
        {...register("slotMinutes", {
          required: "Slot duration is required",
          valueAsNumber: true,
          min: { value: 15, message: "Minimum 15 minutes" },
          max: { value: 480, message: "Maximum 480 minutes" },
        })}
      />

      {/* Open / close hours */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Open hour (0–23)"
          type="number"
          min={0}
          max={23}
          error={errors.openHour?.message}
          {...register("openHour", {
            required: "Required",
            valueAsNumber: true,
            min: { value: 0, message: "Min 0" },
            max: { value: 23, message: "Max 23" },
          })}
        />
        <Input
          label="Close hour (0–23)"
          type="number"
          min={0}
          max={23}
          error={errors.closeHour?.message}
          {...register("closeHour", {
            required: "Required",
            valueAsNumber: true,
            min: { value: 0, message: "Min 0" },
            max: { value: 23, message: "Max 23" },
          })}
        />
      </div>

      <div>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          Save Rules
        </Button>
      </div>
    </form>
  );
}

function VenueRulesSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const { data: rules, isLoading: rulesLoading, isError, error } = useQuery({
    queryKey: ["venueRules", venueId],
    queryFn: () => getVenueRules(venueId),
    staleTime: 60_000,
    retry: false,
    enabled: !!venue?.bookingsEnabled,
  });

  const { mutate: toggle, isPending: toggling } = useMutation({
    mutationFn: (enabled: boolean) => toggleVenueBookings(venueId, enabled),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venue", venueId], updated);
      showToast(
        updated.bookingsEnabled ? "Bookings enabled." : "Bookings disabled.",
        "success"
      );
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  if (venueLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Bookings toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-[#0C5F7D]">Accept Bookings</p>
          <p className="text-xs text-[#566572] mt-0.5">
            When disabled, this venue is informational only — customers cannot book or rate it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggle(!venue?.bookingsEnabled)}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            venue?.bookingsEnabled ? "bg-[#0C5F7D]" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={!!venue?.bookingsEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
              venue?.bookingsEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Rules form — only shown when bookings are enabled */}
      {venue?.bookingsEnabled && (
        <>
          {rulesLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-[#566572]">
              {axios.isAxiosError(error) && error.response?.status === 404
                ? "Booking rules aren't set up for your venue yet. Contact support to enable bookings."
                : extractErrorMessage(error)}
            </p>
          ) : rules ? (
            <VenueRulesForm venueId={venueId} defaultValues={rules} />
          ) : null}
        </>
      )}

      {!venue?.bookingsEnabled && (
        <p className="text-sm text-[#566572]">
          Enable bookings above to configure booking rules and time slots.
        </p>
      )}
    </div>
  );
}

// ─── Pricing Section ────────────────────────────────────────────────

interface PricingFormRow {
  category: string;
  title: string;
  subtitle: string;
  price: string;
}

function PricingSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: venue } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const { control, register, handleSubmit, reset, formState: { isDirty } } = useForm<{ items: PricingFormRow[] }>({
    defaultValues: { items: [] },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (venue) {
      reset({
        items: [...venue.pricingItems]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((p) => ({
            category: p.category ?? "",
            title: p.title,
            subtitle: p.subtitle ?? "",
            price: String(p.price),
          })),
      });
    }
  }, [venue, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { items: PricingFormRow[] }) =>
      updateVenuePricing(venueId, {
        items: data.items.map((row, idx) => ({
          category: row.category.trim() || null,
          title: row.title.trim(),
          subtitle: row.subtitle.trim() || null,
          price: parseFloat(row.price) || 0,
          displayOrder: idx,
        })),
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(["venue", venueId], (old: typeof venue) =>
        old ? { ...old, pricingItems: saved } : old
      );
      reset({
        items: [...saved]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((p) => ({
            category: p.category ?? "",
            title: p.title,
            subtitle: p.subtitle ?? "",
            price: String(p.price),
          })),
      });
      showToast("Pricing saved.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#566572]">
        Items are grouped by category on the customer venue page. Leave category blank for uncategorised items.
      </p>

      <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
        {fields.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-[580px]">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_96px_80px] gap-2 pb-2 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-[#566572]">
                <span>Category</span>
                <span>Title *</span>
                <span>Subtitle</span>
                <span>Price *</span>
                <span />
              </div>
              <div className="divide-y divide-gray-50">
                {fields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-[1fr_1.2fr_1fr_96px_80px] gap-2 py-2 items-center">
                    <input
                      {...register(`items.${idx}.category`)}
                      placeholder="e.g. Coffees"
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
                    />
                    <input
                      {...register(`items.${idx}.title`, { required: true })}
                      placeholder="e.g. Espresso"
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
                    />
                    <input
                      {...register(`items.${idx}.subtitle`)}
                      placeholder="e.g. Oat milk"
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#566572] pointer-events-none">€</span>
                      <input
                        {...register(`items.${idx}.price`, { required: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1.5 text-[#566572] hover:text-[#0C5F7D] disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors"
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, idx + 1)}
                        disabled={idx === fields.length - 1}
                        className="p-1.5 text-[#566572] hover:text-[#0C5F7D] disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors"
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="p-1.5 text-[#566572] hover:text-red-500 rounded transition-colors"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {fields.length === 0 && (
          <p className="text-sm text-[#566572] py-2">No items yet. Add your first pricing item.</p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => append({ category: "", title: "", subtitle: "", price: "" })}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#C25B3C] hover:text-[#9E4527] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
          <Button type="submit" loading={isPending} disabled={!isDirty}>
            Save Pricing
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Events Section ───────────────────────────────────────────────

type EventFormData = {
  title: string;
  startsAtDate: string;
  startsAtTime: string;
  endsAtDate: string;
  endsAtTime: string;
  description: string;
  mainPhotoUrl: string;
};

function formatLocal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function EventForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EventFormData>({
    defaultValues: defaultValues ?? {
      title: "",
      startsAtDate: "",
      startsAtTime: "",
      endsAtDate: "",
      endsAtTime: "",
      description: "",
      mainPhotoUrl: "",
    },
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { showToast } = useToast();
  const mainPhotoUrl = watch("mainPhotoUrl");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">Title *</label>
          <Input
            {...register("title", { required: true })}
            placeholder="e.g. Live Jazz Night"
            error={errors.title ? "Required" : undefined}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">Start Date *</label>
          <input
            type="date"
            {...register("startsAtDate", { required: true })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">Start Time *</label>
          <input
            type="time"
            {...register("startsAtTime", { required: true })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">End Date <span className="font-normal text-[#566572]">(optional)</span></label>
          <input
            type="date"
            {...register("endsAtDate")}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">End Time <span className="font-normal text-[#566572]">(optional)</span></label>
          <input
            type="time"
            {...register("endsAtTime")}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">Main Photo <span className="font-normal text-[#566572]">(optional)</span></label>
          {mainPhotoUrl ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
              <img src={mainPhotoUrl} alt="Event photo" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setValue("mainPhotoUrl", "")}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
              >✕</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#C25B3C] hover:bg-orange-50 transition-colors">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">{uploadingPhoto ? "Uploading…" : "Click to upload photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingPhoto}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingPhoto(true);
                  try {
                    const url = await uploadFile(file);
                    setValue("mainPhotoUrl", url);
                  } catch {
                    showToast("Photo upload failed", "error");
                  } finally {
                    setUploadingPhoto(false);
                  }
                }}
              />
            </label>
          )}
          <input type="hidden" {...register("mainPhotoUrl")} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">Description <span className="font-normal text-[#566572]">(optional)</span></label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="What's happening at this event?"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] transition-colors resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isPending}>Save Event</Button>
      </div>
    </form>
  );
}

function toIso(date: string, time: string) {
  if (!date || !time) return null;
  return new Date(`${date}T${time}:00`).toISOString();
}

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function toTimeInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(11, 16);
}

function EventCard({
  event,
  venueId,
  onRefresh,
}: {
  event: VenueEventDto;
  venueId: string;
  onRefresh: () => void;
}) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; message: string; confirmLabel: string; onConfirm: () => void } | null>(null);

  const { mutate: close, isPending: closing } = useMutation({
    mutationFn: () => closeVenueEvent(venueId, event.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] }); showToast("Event closed.", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => deleteVenueEvent(venueId, event.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] }); showToast("Event deleted.", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const { mutate: saveEdit, isPending: saving } = useMutation({
    mutationFn: (data: UpdateVenueEventRequest) => updateVenueEvent(venueId, event.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] }); setEditing(false); showToast("Event updated.", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const { mutate: addPhoto, isPending: addingPhotoMutating } = useMutation({
    mutationFn: (url: string) => addEventPhoto(venueId, event.id, { url, displayOrder: event.additionalPhotos.length }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] }); setAddingPhoto(false); showToast("Photo added.", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const { mutate: delPhoto } = useMutation({
    mutationFn: (photoId: string) => deleteEventPhoto(venueId, event.id, photoId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] }); showToast("Photo removed.", "success"); },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  if (editing) {
    return (
      <div className="border border-[#0C5F7D]/20 rounded-xl p-5">
        <p className="text-sm font-semibold text-[#0C5F7D] mb-4">Edit Event</p>
        <EventForm
          defaultValues={{
            title: event.title,
            startsAtDate: toDateInput(event.startsAtUtc),
            startsAtTime: toTimeInput(event.startsAtUtc),
            endsAtDate: toDateInput(event.endsAtUtc),
            endsAtTime: toTimeInput(event.endsAtUtc),
            description: event.description ?? "",
            mainPhotoUrl: event.mainPhotoUrl ?? "",
          }}
          onSubmit={(fd) => saveEdit({
            title: fd.title,
            startsAtUtc: toIso(fd.startsAtDate, fd.startsAtTime)!,
            description: fd.description || null,
            endsAtUtc: toIso(fd.endsAtDate, fd.endsAtTime),
            mainPhotoUrl: fd.mainPhotoUrl || null,
          })}
          isPending={saving}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`border rounded-xl p-4 ${event.isPast ? "border-gray-200 bg-gray-50 opacity-70" : "border-[#0C5F7D]/20 bg-white"}`}>
      <div className="flex items-start gap-4">
        {event.mainPhotoUrl && (
          <img src={event.mainPhotoUrl} alt={event.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#0C5F7D]">{event.title}</p>
            {event.isPast && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Past</span>
            )}
          </div>
          <p className="text-xs text-[#566572] mt-0.5">
            Starts: {formatLocal(event.startsAtUtc)}
            {event.endsAtUtc && ` · Ends: ${formatLocal(event.endsAtUtc)}`}
          </p>
          {event.description && (
            <p className="text-xs text-[#566572] mt-1 line-clamp-2">{event.description}</p>
          )}
          {event.additionalPhotos.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {event.additionalPhotos.map((p) => (
                <div key={p.id} className="relative group">
                  {p.url && <img src={p.url} alt="" className="w-10 h-10 rounded object-cover" />}
                  <button
                    type="button"
                    onClick={() =>
                      setConfirm({
                        title: "Delete photo",
                        message: "Delete this photo? This can't be undone.",
                        confirmLabel: "Delete",
                        onConfirm: () => delPhoto(p.id),
                      })
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] items-center justify-center hidden group-hover:flex"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {!event.isPast && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-[#0C5F7D] hover:underline"
            >Edit</button>
            <button
              type="button"
              onClick={() =>
                setConfirm({
                  title: "Close event",
                  message: "Close this event? Customers will no longer see it.",
                  confirmLabel: "Close event",
                  onConfirm: () => close(),
                })
              }
              disabled={closing}
              className="text-xs font-semibold text-orange-600 hover:underline disabled:opacity-50"
            >Close</button>
            <button
              type="button"
              onClick={() =>
                setConfirm({
                  title: "Delete event",
                  message: "Delete this event? This can't be undone.",
                  confirmLabel: "Delete",
                  onConfirm: () => del(),
                })
              }
              disabled={deleting}
              className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
            >Delete</button>
          </div>
        )}
        {event.isPast && (
          <button
            type="button"
            onClick={() =>
              setConfirm({
                title: "Delete event",
                message: "Delete this event? This can't be undone.",
                confirmLabel: "Delete",
                onConfirm: () => del(),
              })
            }
            disabled={deleting}
            className="text-xs font-semibold text-red-400 hover:underline disabled:opacity-50 shrink-0"
          >Delete</button>
        )}
      </div>
      {!event.isPast && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {addingPhoto ? (
            <div className="flex flex-col gap-2 max-w-xs">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#C25B3C] hover:bg-orange-50 transition-colors">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">{uploadingPhoto || addingPhotoMutating ? "Uploading…" : "Click to upload photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPhoto || addingPhotoMutating}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingPhoto(true);
                    try {
                      const url = await uploadFile(file);
                      addPhoto(url);
                    } catch {
                      showToast("Photo upload failed", "error");
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                />
              </label>
              <Button size="sm" variant="ghost" onClick={() => setAddingPhoto(false)}>Cancel</Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingPhoto(true)}
              className="text-xs font-semibold text-[#C25B3C] hover:text-[#9E4527] flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add extra photo
            </button>
          )}
        </div>
      )}

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

function EventsSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showPast, setShowPast] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["venueEvents", venueId, showPast],
    queryFn: () => getVenueEvents(venueId, showPast),
    staleTime: 30_000,
    enabled: !!venue?.eventsEnabled,
  });

  const { mutate: toggleEvents, isPending: toggling } = useMutation({
    mutationFn: (enabled: boolean) => toggleVenueEvents(venueId, enabled),
    onSuccess: (updated) => {
      queryClient.setQueryData(["venue", venueId], updated);
      showToast(updated.eventsEnabled ? "Events enabled." : "Events disabled.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  const { mutate: createEvent, isPending: creatingMutating } = useMutation({
    mutationFn: (data: CreateVenueEventRequest) => createVenueEvent(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] });
      setCreating(false);
      showToast("Event created.", "success");
    },
    onError: (err) => showToast(extractErrorMessage(err), "error"),
  });

  if (venueLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Events toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-[#0C5F7D]">Enable Events</p>
          <p className="text-xs text-[#566572] mt-0.5">
            Show events on your venue page so customers know what&apos;s happening.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleEvents(!venue?.eventsEnabled)}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            venue?.eventsEnabled ? "bg-[#0C5F7D]" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={!!venue?.eventsEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
              venue?.eventsEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {venue?.eventsEnabled && (
        <>
          {creating ? (
            <div className="border border-[#0C5F7D]/20 rounded-xl p-5">
              <p className="text-sm font-semibold text-[#0C5F7D] mb-4">New Event</p>
              <EventForm
                onSubmit={(fd) => createEvent({
                  title: fd.title,
                  startsAtUtc: toIso(fd.startsAtDate, fd.startsAtTime)!,
                  description: fd.description || null,
                  endsAtUtc: toIso(fd.endsAtDate, fd.endsAtTime),
                  mainPhotoUrl: fd.mainPhotoUrl || null,
                })}
                isPending={creatingMutating}
                onCancel={() => setCreating(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 text-sm font-semibold text-[#C25B3C] hover:text-[#9E4527] transition-colors self-start"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create New Event
            </button>
          )}

          {eventsLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <>
              {(events ?? []).length === 0 && (
                <p className="text-sm text-[#566572]">No {showPast ? "" : "upcoming "}events yet.</p>
              )}
              <div className="flex flex-col gap-3">
                {(events ?? []).map((ev) => (
                  <EventCard key={ev.id} event={ev} venueId={venueId} onRefresh={() => queryClient.invalidateQueries({ queryKey: ["venueEvents", venueId] })} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowPast((p) => !p)}
                className="text-xs text-[#566572] hover:text-[#0C5F7D] underline self-start"
              >
                {showPast ? "Hide past events" : "Show past events"}
              </button>
            </>
          )}
        </>
      )}

      {!venue?.eventsEnabled && (
        <p className="text-sm text-[#566572]">
          Enable events above to start creating events for your venue.
        </p>
      )}
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

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-6">
          Venue Details
        </h2>
        <VenueDetailsSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-6">Photos</h2>
        <PhotosSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-2">Booking Rules</h2>
        <p className="text-sm text-[#566572] mb-6">
          Controls how bookings are handled and what time slots are available to customers.
        </p>
        <VenueRulesSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-2">Pricing</h2>
        <p className="text-sm text-[#566572] mb-6">
          Set the menu and pricing items displayed to customers on the venue page.
        </p>
        <PricingSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#0C5F7D] mb-2">Events</h2>
        <p className="text-sm text-[#566572] mb-6">
          Create and manage events at your venue. One active event per day is allowed.
        </p>
        <EventsSection venueId={venueId} />
      </section>
    </div>
  );
}
