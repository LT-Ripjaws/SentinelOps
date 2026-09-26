import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SentinelOps | Security incident management",
    template: "%s | SentinelOps",
  },
  description:
    "Track, investigate, document, and resolve security incidents in one operational record.",
  applicationName: "SentinelOps",
  keywords: [
    "security incident management",
    "SOC",
    "incident response",
    "evidence management",
    "audit timeline",
  ],
  icons: {
    icon: "/brand/sentinelops-mark.svg",
  },
  openGraph: {
    title: "SentinelOps | Preserve the full incident record",
    description:
      "A SOC workspace for investigation, evidence, audit trails, access control, and resolution.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SentinelOps | Preserve the full incident record",
    description:
      "A SOC workspace for investigation, evidence, audit trails, access control, and resolution.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
