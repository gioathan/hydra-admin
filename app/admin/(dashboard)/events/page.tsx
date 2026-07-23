"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import {
  getVenue,
  getUpcomingEvents,
  getVenueEvents,
  createVenueEvent,
  updateVenueEvent,
  deleteVenueEvent,
  closeVenueEvent,
  addEventPhoto,
  deleteEventPhoto,
  toggleVenueEvents,
  uploadFile,
} from "@/lib/api/venues";
import { EventListItemDto, VenueEventDto, CreateVenueEventRequest, UpdateVenueEventRequest } from "@/types";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 15;

// ─── Venue's own event management ──────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TIME_OPTIONS: { label: string; value: string }[] = (() => {
  const opts: { label: string; value: string }[] = [{ label: "— select —", value: "" }];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const period = h < 12 ? "AM" : "PM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      opts.push({ value: `${hh}:${mm}`, label: `${String(h12).padStart(2, "0")}:${mm} ${period}` });
    }
  }
  return opts;
})();

const selectCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0C5F7D] bg-white transition-colors appearance-none cursor-pointer";

function parseDateValue(value: string) {
  if (!value) return { year: "", month: "", day: "" };
  const [y, m, d] = value.split("-");
  return {
    year: y ?? "",
    month: m ? String(parseInt(m)) : "",
    day: d ? String(parseInt(d)) : "",
  };
}

function DateSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const init = parseDateValue(value);
  const [year, setYear] = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [day, setDay] = useState(init.day);

  const prevValue = useRef(value);
  useEffect(() => {
    if (value !== prevValue.current) {
      const p = parseDateValue(value);
      setYear(p.year);
      setMonth(p.month);
      setDay(p.day);
      prevValue.current = value;
    }
  }, [value]);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const daysInMonth = year && month ? new Date(parseInt(year), parseInt(month), 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex gap-2">
      <select
        value={month}
        onChange={(e) => { setMonth(e.target.value); emit(year, e.target.value, day); }}
        className={`${selectCls} flex-[2]`}
        required={required}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={i} value={String(i + 1)}>{name}</option>
        ))}
      </select>
      <select
        value={day}
        onChange={(e) => { setDay(e.target.value); emit(year, month, e.target.value); }}
        className={`${selectCls} flex-1`}
        required={required}
      >
        <option value="">Day</option>
        {days.map((dd) => (
          <option key={dd} value={String(dd)}>{dd}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => { setYear(e.target.value); emit(e.target.value, month, day); }}
        className={`${selectCls} flex-[1.4]`}
        required={required}
      >
        <option value="">Year</option>
        {years.map((yy) => (
          <option key={yy} value={String(yy)}>{yy}</option>
        ))}
      </select>
    </div>
  );
}

function TimeSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
      required={required}
    >
      {TIME_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

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
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
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
  const startsAtDate = watch("startsAtDate");
  const startsAtTime = watch("startsAtTime");
  const endsAtDate = watch("endsAtDate");
  const endsAtTime = watch("endsAtTime");

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
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">
            Start Date &amp; Time *
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <DateSelect
                value={startsAtDate}
                onChange={(v) => setValue("startsAtDate", v, { shouldValidate: true })}
                required
              />
            </div>
            <div className="sm:w-40">
              <TimeSelect
                value={startsAtTime}
                onChange={(v) => setValue("startsAtTime", v, { shouldValidate: true })}
                required
              />
            </div>
          </div>
          {(errors.startsAtDate || errors.startsAtTime) && (
            <p className="mt-1 text-xs text-red-500">Start date and time are required</p>
          )}
          <input type="hidden" {...register("startsAtDate", { required: true })} />
          <input type="hidden" {...register("startsAtTime", { required: true })} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0C5F7D] mb-1.5">
            End Date &amp; Time <span className="font-normal text-[#566572]">(optional)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <DateSelect
                value={endsAtDate}
                onChange={(v) => setValue("endsAtDate", v)}
              />
            </div>
            <div className="sm:w-40">
              <TimeSelect
                value={endsAtTime}
                onChange={(v) => setValue("endsAtTime", v)}
              />
            </div>
          </div>
          <input type="hidden" {...register("endsAtDate")} />
          <input type="hidden" {...register("endsAtTime")} />
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

function ManagedEventCard({
  event,
  venueId,
}: {
  event: VenueEventDto;
  venueId: string;
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

function ManageEventsSection({ venueId }: { venueId: string }) {
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
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                  <ManagedEventCard key={ev.id} event={ev} venueId={venueId} />
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

// ─── Nearby upcoming events browse feed ────────────────────────────

function formatEventDate(startsAtUtc: string, endsAtUtc: string | null): string {
  const start = new Date(startsAtUtc);
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endsAtUtc) return `${dateStr} at ${startTime}`;
  const end = new Date(endsAtUtc);
  const endTime = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

function NearbyEventCard({ event }: { event: EventListItemDto }) {
  const startDate = new Date(event.startsAtUtc);
  const day = startDate.toLocaleDateString("en-US", { day: "numeric" });
  const month = startDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  return (
    <div className="flex gap-4 bg-white rounded-xl border border-[#E1D7C6] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative flex-shrink-0 w-24 sm:w-44 bg-[#0C5F7D]">
        {event.mainPhotoUrl ? (
          <img
            src={event.mainPhotoUrl}
            alt={event.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : null}
        <div className="absolute top-3 left-3 bg-[#C25B3C] rounded-lg px-2.5 py-1.5 flex flex-col items-center shadow-lg">
          <span className="text-white font-serif text-xl leading-none">{day}</span>
          <span className="text-white/85 text-[9px] font-bold tracking-widest mt-0.5">{month}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] font-semibold truncate drop-shadow">
          {event.venueName}
        </p>
      </div>

      <div className="flex-1 py-4 pr-4 flex flex-col gap-1.5 min-w-0">
        <h3 className="font-serif text-[#0C5F7D] text-lg leading-snug line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[#C25B3C] text-sm font-semibold">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatEventDate(event.startsAtUtc, event.endsAtUtc)}
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {event.venueLocation && (
          <div className="flex items-center justify-between mt-auto pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.venueLocation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function NearbyEventsFeed({ location }: { location: string | null }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["upcomingEvents", location],
    queryFn: ({ pageParam = 1 }) =>
      getUpcomingEvents(pageParam as number, PAGE_SIZE, location),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNextPage ? last.pageNumber + 1 : undefined),
    enabled: !!location,
  });

  const events: EventListItemDto[] = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-[#F4EDE1] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#C25B3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-[#0C5F7D] font-semibold">Your venue has no location set</p>
        <p className="text-sm text-gray-400 max-w-sm">
          Contact support to set your venue&apos;s location so we can show you what&apos;s happening nearby.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!isLoading && (
        <p className="text-sm text-gray-400">
          {totalCount} upcoming event{totalCount !== 1 ? "s" : ""} in {location}
        </p>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-[#E1D7C6] animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">No upcoming events in {location} yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <NearbyEventCard key={event.id} event={event} />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="self-center mt-2 px-6 py-2 text-sm font-semibold text-[#0C5F7D] border border-[#E1D7C6] rounded-lg hover:bg-[#F4EDE1] transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function EventsPage() {
  const { venueId } = useAuthStore();

  const { data: venue } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId!),
    enabled: !!venueId,
  });

  const location = venue?.location ?? null;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-[#0C5F7D]">Events</h1>

      {venueId && (
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-[#0C5F7D] mb-2">Your Events</h2>
          <p className="text-sm text-[#566572] mb-6">
            Create and manage events at your venue. One active event per day is allowed.
          </p>
          <ManageEventsSection venueId={venueId} />
        </section>
      )}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold tracking-widest text-[#C25B3C] uppercase mb-1">
            {location ? `In ${location}` : "Upcoming Events"}
          </p>
          <h2 className="text-xl font-bold text-[#0C5F7D]">Nearby Events</h2>
          <p className="text-sm text-[#566572] mt-1 max-w-xl">
            {location
              ? `What's happening around ${location} — from your venue and others nearby.`
              : "Events happening around your venue."}
          </p>
        </div>
        <NearbyEventsFeed location={location} />
      </section>
    </div>
  );
}
