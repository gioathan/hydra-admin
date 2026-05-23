export interface LegalSection {
  title: string;
  content: string;
}

export const privacyPolicySections: LegalSection[] = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide when creating an account or making a reservation, including your name, email address, phone number, and payment details. We also collect usage data such as pages visited and features used to improve our service.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to process bookings, send confirmation and reminder notifications, and provide customer support. We may also use it to personalise your experience and send relevant offers, which you can opt out of at any time.",
  },
  {
    title: "Data Sharing",
    content:
      "We share your information only with the venues you book with, and with service providers that help us operate the platform such as payment processors. We do not sell your personal data to third parties.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.",
  },
  {
    title: "Cookies",
    content:
      "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how our platform is used. You can control cookie settings through your browser.",
  },
  {
    title: "Data Security",
    content:
      "We implement industry-standard security measures including encryption in transit and at rest. While we strive to protect your data, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. You may also request a copy of your data or object to certain processing. To exercise these rights, contact us at privacy@hydra.gr.",
  },
  {
    title: "Contact",
    content:
      "For privacy-related questions, please contact our privacy team at privacy@hydra.gr. We aim to respond to all enquiries within 30 days.",
  },
];

export const termsOfServiceSections: LegalSection[] = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using the HYDRA platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
  },
  {
    title: "Use of the Service",
    content:
      "HYDRA provides an online platform for discovering and booking venues in the Mediterranean. You agree to use the platform only for lawful purposes and in accordance with these terms.",
  },
  {
    title: "Account Responsibility",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials. All activity that occurs under your account is your responsibility. Please notify us immediately of any unauthorised use.",
  },
  {
    title: "Bookings and Cancellations",
    content:
      "When you make a booking through HYDRA, you enter into a direct agreement with the venue. Cancellation policies vary by venue and are displayed before you confirm. HYDRA is not responsible for venue-side cancellations.",
  },
  {
    title: "Payments",
    content:
      "Payments are processed securely through our payment provider. Prices are displayed in Euros and include applicable taxes where required by law. HYDRA reserves the right to correct pricing errors.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content on the HYDRA platform, including logos, text, graphics, and software, is the property of HYDRA Mediterranean and is protected by applicable intellectual property laws.",
  },
  {
    title: "Limitation of Liability",
    content:
      "HYDRA acts as an intermediary between users and venues. To the maximum extent permitted by law, HYDRA shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform.",
  },
  {
    title: "Changes to Terms",
    content:
      "We may update these Terms of Service from time to time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. We will notify you of material changes via email.",
  },
];
