"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import {
  Compass,
  QrCode,
  Users,
  Calendar,
  ShieldCheck,
  Sparkles,
  Search,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Drop {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string | null;
  claimsCount: number;
  maxClaims: number | null;
  scansCount: number;
  expiresAt: string | null;
  isSoulbound: boolean;
}

const CATEGORIES = ["All", "Art", "Event", "Certificate", "Collectible", "Gaming", "Music"];

export default function ExplorePage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [filtered, setFiltered] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => r.json())
      .then((data) => {
        setDrops(data.drops ?? []);
        setFiltered(data.drops ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = drops;
    if (activeCategory !== "All") {
      result = result.filter(
        (d) => d.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeCategory, drops]);

  const getImageSrc = (image: string) =>
    image?.startsWith("ipfs://")
      ? image.replace("ipfs://", "https://ipfs.io/ipfs/")
      : image;

  const getTimeLeft = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (ms <= 0) return "Expired";
    const days = Math.floor(ms / 86400000);
    if (days > 0) return `${days}d left`;
    const hrs = Math.floor(ms / 3600000);
    return `${hrs}h left`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-stone-900">
      {/* ── HERO ── */}
      <section className="relative w-full bg-[#080818] overflow-hidden pt-20 pb-16">
        {/* Aurora blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-aurora absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="animate-aurora2 absolute -bottom-[10%] right-[0%] w-[45%] h-[45%] rounded-full bg-violet-600/20 blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Back nav */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-semibold transition-colors mb-8"
          >
            <Image src="/phygital_ultra_logo.png" alt="Phygital" width={20} height={20} className="object-contain" />
            Phygital
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center">
              <Compass className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Live NFT Drops
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-[1.05]">
            Explore Drops
          </h1>
          <p className="text-lg text-white/50 max-w-xl font-medium mb-10">
            Discover active NFT drops you can claim right now — no QR code needed.
            Each one is a real on-chain asset waiting for you.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search drops by name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter className="h-3.5 w-3.5 text-stone-400 flex-shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <main className="flex-1 container mx-auto px-4 md:px-6 max-w-5xl py-10">
        {/* Stats row */}
        {!loading && drops.length > 0 && (
          <div className="flex items-center gap-6 mb-8 text-sm text-stone-500 font-medium">
            <span>
              <span className="font-bold text-stone-900 text-lg">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "drop" : "drops"} found
            </span>
            {activeCategory !== "All" && (
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                {activeCategory}
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-stone-100 rounded-3xl overflow-hidden shadow-sm">
                <Skeleton className="w-full aspect-square" />
                <div className="p-5 flex flex-col gap-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-10 w-full rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-indigo-50 p-5 rounded-full mb-6">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-3">
              {search || activeCategory !== "All" ? "No drops match your search" : "No drops available yet"}
            </h2>
            <p className="text-stone-500 max-w-sm">
              {search || activeCategory !== "All"
                ? "Try clearing your filters or adjusting your search."
                : "Check back soon — creators are deploying new drops."}
            </p>
            {(search || activeCategory !== "All") && (
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700"
              >
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filtered.map((drop) => {
              const timeLeft = getTimeLeft(drop.expiresAt);
              const claimsPct =
                drop.maxClaims
                  ? Math.min(100, Math.round((drop.claimsCount / drop.maxClaims) * 100))
                  : null;

              return (
                <Link
                  key={drop.id}
                  href={`/claim?id=${drop.id}`}
                  className="group bg-white border border-stone-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square overflow-hidden bg-stone-50">
                    <img
                      src={getImageSrc(drop.image)}
                      alt={drop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {drop.category && (
                        <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-200 capitalize">
                          {drop.category}
                        </span>
                      )}
                      {drop.isSoulbound && (
                        <span className="flex items-center gap-1 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="h-2.5 w-2.5" /> Soulbound
                        </span>
                      )}
                    </div>
                    {timeLeft && (
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${timeLeft === "Expired" ? "bg-red-500/90 text-white" : "bg-amber-400/90 text-amber-900"}`}>
                        {timeLeft}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-stone-900 text-base mb-1 truncate">{drop.name}</h3>
                    <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mb-4">
                      {drop.description}
                    </p>

                    {/* Progress */}
                    {claimsPct !== null && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Claimed</span>
                          <span className="text-[10px] font-bold text-stone-700">
                            {drop.claimsCount}/{drop.maxClaims}
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                            style={{ width: `${claimsPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-auto pt-3 border-t border-stone-50 text-[11px] text-stone-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        {drop.scansCount} scans
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {drop.claimsCount} claimed
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex items-center justify-center gap-2 w-full bg-indigo-600 group-hover:bg-indigo-500 text-white py-3 rounded-2xl text-sm font-bold transition-all">
                      Claim Now <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
