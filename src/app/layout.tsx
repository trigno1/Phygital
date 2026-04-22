import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThirdwebProviderWrapper from "@/providers/ThirdwebProviderWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phygital — Create & Claim Physical NFT Drops",
  description: "Create NFT drops with a QR code. Scan any Phygital QR in the real world and instantly claim an on-chain NFT to your invisible smart wallet — no crypto experience needed.",
  icons: {
    icon: "/phygital_ultra_logo.png",
  },
  // Material Symbols for landing page icons
  other: {
    "link-material-symbols": [
      "<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' />",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased selection:bg-fuchsia-500 selection:text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {/* ✅ Wrap everything inside ThirdwebProviderWrapper */}
          <ThirdwebProviderWrapper>{children}</ThirdwebProviderWrapper>
          <Toaster position="bottom-right" richColors closeButton />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
