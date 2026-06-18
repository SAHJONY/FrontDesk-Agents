import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.frontdeskagents.com"),
  title: "FrontDesk Agents — The AI Receptionist That Never Sleeps",
  description:
    "The world's most advanced agentic AI receptionist. Answers every call in under 2 seconds, books appointments, qualifies leads, and speaks 50+ languages — 24/7, for any industry.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "FrontDesk Agents — The AI Receptionist That Never Sleeps",
    description:
      "Never miss a call again. Agentic AI receptionists that answer, book, and convert — 24/7 in 50+ languages.",
    images: ["/hero.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrontDesk Agents — AI Receptionist",
    description: "Never miss a call again. AI receptionists that answer, book, and convert 24/7.",
    images: ["/hero.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#04080f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
