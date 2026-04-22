"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white relative selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px] animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/30 blur-[100px] animate-aurora2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-md w-full">
          {/* Branded 404 Visual */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative bg-white/80 backdrop-blur-xl border border-stone-100 rounded-[2.5rem] p-10 shadow-2xl card-3d">
              <div className="bg-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Search className="h-10 w-10 text-indigo-600" />
              </div>
              <h1 className="text-8xl font-black text-stone-900 tracking-tighter mb-2">404</h1>
              <div className="h-1.5 w-12 bg-indigo-600 rounded-full mx-auto mb-4" />
              <p className="text-xl font-bold text-stone-800 tracking-tight">Destination Unknown</p>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-4">
            Lost in the Phygital Void?
          </h2>
          <p className="text-stone-500 text-lg mb-10 leading-relaxed font-medium">
            This asset or page doesn't exist on-chain. Let's get you back to familiar coordinates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1">
                <Home className="mr-2 h-5 w-5" /> Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-stone-200 bg-white hover:bg-stone-50 font-bold text-lg text-stone-600 transition-all">
                <ArrowLeft className="mr-2 h-5 w-5" /> Back Home
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
