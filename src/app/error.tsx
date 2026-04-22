"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real production app, you would log 'error' to Sentry/CloudWatch here.
    console.error("Uncaught Runtime Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-white relative selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-100/40 blur-[100px] animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/30 blur-[100px] animate-aurora2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-lg w-full">
          {/* Branded Error Visual */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative bg-white/80 backdrop-blur-xl border border-rose-100 rounded-[2.5rem] p-8 shadow-2xl card-3d">
              <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                <AlertCircle className="h-8 w-8 text-rose-600" />
              </div>
              <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-tight mb-2">Something went wrong</h1>
              <p className="text-sm font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100 inline-block mb-4">
                Internal Runtime Error
              </p>
              {error.digest && (
                <p className="text-[10px] font-mono text-stone-400 mt-2">Error Digest: {error.digest}</p>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-4">
            Security Protected Environment
          </h2>
          <p className="text-stone-500 text-lg mb-10 leading-relaxed font-medium">
            A secure catch was triggered to prevent data exposure. Our diagnostics have been logged anonymously for review.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              onClick={() => reset()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
            >
              <RotateCcw className="mr-2 h-5 w-5" /> Attempt Recovery
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-stone-200 bg-white hover:bg-stone-50 font-bold text-lg text-stone-600 transition-all">
                <Home className="mr-2 h-5 w-5" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-10 flex justify-center items-center gap-3 relative z-10">
        <Image src="/phygital_ultra_logo.png" alt="Phygital" width={24} height={24} className="rounded-lg shadow-sm" />
        <span className="font-bold text-stone-400 tracking-tight text-sm">Phygital Platform</span>
      </footer>
    </div>
  );
}
