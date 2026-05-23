"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  getVenue,
  updateVenue,
  addVenuePhoto,
  deleteVenuePhoto,
  reorderVenuePhotos,
  getVenueRules,
  updateVenueRules,
} from "@/lib/api/venues";
import { getVenueTypes } from "@/lib/api/venueTypes";
import axios from "axios";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { VenuePhotoDto, UpdateVenueRequest, AddVenuePhotoRequest, VenueRulesDto } from "@/types";

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
        latitude: venue.latitude ?? undefined,
        longitude: venue.longitude ?? undefined,
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
        latitude: updated.latitude ?? undefined,
        longitude: updated.longitude ?? undefined,
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          placeholder="e.g. 37.349"
          error={errors.latitude?.message}
          {...register("latitude", { valueAsNumber: true })}
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          placeholder="e.g. 23.473"
          error={errors.longitude?.message}
          {...register("longitude", { valueAsNumber: true })}
        />
      </div>
      {venue?.googleMapsUrl && (
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <a
            href={venue.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C4622D] hover:underline truncate"
          >
            View on Google Maps
          </a>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1B2B4B]">Description</label>
        <textarea
          rows={4}
          placeholder="A short description of the venue (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#1B2B4B] placeholder:text-[#6B7280] outline-none focus:border-[#1B2B4B] focus:ring-1 focus:ring-[#1B2B4B] resize-none"
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
      <div className="relative h-40 bg-[#1B2B4B] flex items-center justify-center">
        {photo.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.photoUrl}
            alt="Venue photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white/60 text-2xl font-bold">
            {getInitials(venueName)}
          </span>
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
            className="p-1.5 rounded-md text-[#6B7280] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded-md text-[#6B7280] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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

// ─── Photos Section ───────────────────────────────────────────────

function PhotosSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: venue } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const [localPhotos, setLocalPhotos] = useState<VenuePhotoDto[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register: registerPhoto,
    handleSubmit: handlePhotoSubmit,
    reset: resetPhoto,
    formState: { errors: photoErrors },
  } = useForm<AddVenuePhotoRequest>();

  useEffect(() => {
    if (venue) {
      setLocalPhotos([...venue.photos].sort((a, b) => a.displayOrder - b.displayOrder));
      setOrderChanged(false);
    }
  }, [venue]);

  const addMutation = useMutation({
    mutationFn: (data: AddVenuePhotoRequest) => addVenuePhoto(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      resetPhoto();
      showToast("Photo added.", "success");
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
              onDelete={() => deleteMutation.mutate(photo.id)}
              deleting={deletingId === photo.id}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6B7280]">No photos added yet.</p>
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

      {/* Add photo form */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-[#1B2B4B] mb-4">
          Add Photo
        </h3>
        <form
          onSubmit={handlePhotoSubmit((data) =>
            addMutation.mutate({ ...data, displayOrder: Number(data.displayOrder) })
          )}
          className="flex flex-col sm:flex-row gap-3 max-w-lg"
          noValidate
        >
          <div className="flex-1">
            <Input
              placeholder="Google Place ID"
              error={photoErrors.googlePlaceId?.message}
              {...registerPhoto("googlePlaceId", {
                required: "Google Place ID is required",
              })}
            />
          </div>
          <div className="w-28">
            <Input
              type="number"
              placeholder="Order"
              min={1}
              error={photoErrors.displayOrder?.message}
              {...registerPhoto("displayOrder", {
                required: "Required",
                valueAsNumber: true,
                min: { value: 1, message: "Min 1" },
              })}
            />
          </div>
          <Button type="submit" loading={addMutation.isPending}>
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Booking Rules Section ────────────────────────────────────────

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
          <p className="text-sm font-medium text-[#1B2B4B]">Auto-confirm bookings</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
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
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:ring-offset-2
            ${autoConfirm ? "bg-[#C4622D]" : "bg-gray-300"}`}
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
  const { data: rules, isLoading, isError, error } = useQuery({
    queryKey: ["venueRules", venueId],
    queryFn: () => getVenueRules(venueId),
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    return (
      <p className="text-sm text-[#6B7280]">
        {is404
          ? "No rules record found for this venue. Ask your backend to seed default rules for this venue ID."
          : extractErrorMessage(error)}
      </p>
    );
  }

  if (!rules) return null;

  return <VenueRulesForm venueId={venueId} defaultValues={rules} />;
}

// ─── Page ─────────────────────────────────────────────────────────

export default function VenuePage() {
  const { venueId } = useAuthStore();

  if (!venueId) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-[#6B7280]">No venue linked to this account.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-[#1B2B4B]">Venue</h1>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#1B2B4B] mb-6">
          Venue Details
        </h2>
        <VenueDetailsSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#1B2B4B] mb-6">Photos</h2>
        <PhotosSection venueId={venueId} />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#1B2B4B] mb-2">Booking Rules</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          Controls how bookings are handled and what time slots are available to customers.
        </p>
        <VenueRulesSection venueId={venueId} />
      </section>
    </div>
  );
}
