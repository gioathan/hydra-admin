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
          ? "bg-[#C4622D] text-white border-transparent"
          : "bg-white border border-gray-200 text-[#44474e] hover:border-[#C4622D]"
        }`}
    >
      {label}
    </button>
  );
}
