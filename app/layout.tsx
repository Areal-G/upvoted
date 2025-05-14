import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { DemoResetOnReload } from "@/components/demo/demo-reset-on-reload";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Upvoted", template: "%s | Upvoted" },
  description: "Collect, prioritize, and ship product feedback.",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    title: "Upvoted",
    description: "Collect, prioritize, and ship product feedback.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", inter.variable)}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
        {process.env["DEMO_MODE"] === "true" && <DemoResetOnReload />}
      </body>
    </html>
  );
}
