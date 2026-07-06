import Link from "next/link";
import { termsOfServiceSections } from "@/lib/legalContent";

export default function AdminTermsOfServicePage() {
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/account" className="text-[#566572] hover:text-[#0C5F7D] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#0C5F7D]">Terms of Service</h1>
      </div>

      <p className="text-xs text-[#566572]">Last updated: 1 January 2025</p>

      {termsOfServiceSections.map((section) => (
        <section
          key={section.title}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-2"
        >
          <h2 className="text-base font-semibold text-[#0C5F7D]">{section.title}</h2>
          <p className="text-sm text-[#566572] leading-relaxed">{section.content}</p>
        </section>
      ))}
    </div>
  );
}
