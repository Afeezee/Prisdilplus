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
  title: "Prisdil+ | Behavioural Strategy Game",
  description:
    "A game-theory based behavioural strategy game inspired by the Iterated Prisoner's Dilemma. Discover how you cooperate, compete, retaliate, and forgive.",
  keywords: [
    "prisoner's dilemma",
    "game theory",
    "strategy game",
    "cooperation",
    "behavioural analysis",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prisdil+",
  },
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">
        {children}
      </body>
    </html>
  );
}
