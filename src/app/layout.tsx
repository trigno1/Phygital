import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThirdwebProviderWrapper from "@/providers/ThirdwebProviderWrapper";
import { ThemeProvider } from "@/components/theme-provider";

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

export const metadata: Metadata = {
  title: "Phygital — Create & Claim Physical NFT Drops",
  description: "Create NFT drops with a QR code. Scan any Phygital QR in the real world and instantly claim an on-chain NFT to your invisible smart wallet — no crypto experience needed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-fuchsia-500 selection:text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {/* ✅ Wrap everything inside ThirdwebProviderWrapper */}
          <ThirdwebProviderWrapper>{children}</ThirdwebProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
