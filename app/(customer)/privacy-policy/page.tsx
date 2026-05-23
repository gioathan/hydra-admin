import { LegalPageLayout } from "@/components/customer/LegalPageLayout";
import { privacyPolicySections } from "@/lib/legalContent";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="1 January 2025"
      sections={privacyPolicySections}
    />
  );
}
