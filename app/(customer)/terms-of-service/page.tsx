import { LegalPageLayout } from "@/components/customer/LegalPageLayout";
import { termsOfServiceSections } from "@/lib/legalContent";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="1 January 2025"
      sections={termsOfServiceSections}
    />
  );
}
