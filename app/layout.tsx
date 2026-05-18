import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Hydra Admin",
  description: "Admin dashboard for Hydra booking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#F8F5F0] text-[#1B2B4B] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
