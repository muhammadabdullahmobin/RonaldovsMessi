import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The GOAT Debate - Messi vs Ronaldo",
  description:
    "A neutral, sourced, interactive reference for comparing Lionel Messi and Cristiano Ronaldo across statistics, trophies, records, style, controversies, and legacy.",
  metadataBase: new URL("https://whosthegoat.vercel.app"),
  verification: {
    google: "bpZPh9mtzcX_9M3GFZMlM4ZdTdbih2nIEZgsjEtUQkI",
  },
  openGraph: {
    title: "The GOAT Debate - Messi vs Ronaldo",
    description: "Evidence-based, neutral, interactive comparison of football's defining rivalry.",
    type: "website"
  },
  keywords: [
    "Messi vs Ronaldo",
    "GOAT debate",
    "football statistics",
    "Lionel Messi",
    "Cristiano Ronaldo"
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}