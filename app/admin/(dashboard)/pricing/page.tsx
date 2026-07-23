"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { getVenue, updateVenuePricing } from "@/lib/api/venues";
import { extractErrorMessage } from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface PricingFormRow {
  category: string;
  title: string;
  subtitle: string;
  price: string;
}

function PricingSection({ venueId }: { venueId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId),
    staleTime: 60_000,
  });

  const { control, register, handleSubmit, reset, watch, formState: { isDirty } } = useForm<{ items: PricingFormRow[] }>({
    defaultValues: { items: [] },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

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

  if (venueLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  // Group indices by category (in first-appearance order) purely for the visual header labels.
  const groupLabels: Record<number, string> = {};
  const seenCategories = new Set<string>();
  fields.forEach((_, idx) => {
    const cat = (watchedItems?.[idx]?.category ?? "").trim();
    const key = cat || "Uncategorised";
    if (!seenCategories.has(`${key}::${idx}`)) {
      const prevCat = idx > 0 ? (watchedItems?.[idx - 1]?.category ?? "").trim() || "Uncategorised" : null;
      if (idx === 0 || prevCat !== key) {
        groupLabels[idx] = key;
      }
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#566572]">
        Items are grouped by category on the customer venue page. Leave category blank for uncategorised items.
        Items sharing the same category (in order) are shown together below.
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
                  <div key={field.id}>
                    {groupLabels[idx] && (
                      <div className={`pt-4 pb-1.5 ${idx === 0 ? "pt-3" : ""}`}>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#C25B3C]">
                          {groupLabels[idx]}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-[1fr_1.2fr_1fr_96px_80px] gap-2 py-2 items-center">
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

export default function PricingPage() {
  const { venueId } = useAuthStore();

  if (!venueId) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-[#566572]">No venue linked to this account.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0C5F7D]">Pricing</h1>
        <p className="text-sm text-[#566572] mt-1">
          Set the menu and pricing items displayed to customers on the venue page.
        </p>
      </div>

      <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <PricingSection venueId={venueId} />
      </section>
    </div>
  );
}
