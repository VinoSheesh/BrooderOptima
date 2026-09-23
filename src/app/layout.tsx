import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrooderOptima — IoT Smart Poultry Brooder Monitoring & Control",
  description:
    "Real-time IoT dashboard for intelligent poultry brooder monitoring. Features adaptive DOC-based temperature control, NH₃ auto-ventilation, and offline-first edge node architecture.",
  keywords: ["poultry", "brooder", "IoT", "monitoring", "temperature control", "edge computing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
