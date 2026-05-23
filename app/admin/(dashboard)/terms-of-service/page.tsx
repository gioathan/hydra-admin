import Link from "next/link";
import { termsOfServiceSections } from "@/lib/legalContent";

export default function AdminTermsOfServicePage() {
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/account" className="text-[#6B7280] hover:text-[#1B2B4B] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Terms of Service</h1>
      </div>

      <p className="text-xs text-[#6B7280]">Last updated: 1 January 2025</p>

      {termsOfServiceSections.map((section) => (
        <section
          key={section.title}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-2"
        >
          <h2 className="text-base font-semibold text-[#1B2B4B]">{section.title}</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">{section.content}</p>
        </section>
      ))}
    </div>
  );
}
