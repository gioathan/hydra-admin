"use client";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
        ${selected
          ? "bg-[#C25B3C] text-white border-transparent"
          : "bg-white border border-gray-200 text-[#566572] hover:border-[#C25B3C]"
        }`}
    >
      {label}
    </button>
  );
}
