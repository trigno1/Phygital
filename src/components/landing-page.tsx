"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  QrCode,
  Wallet,
  Zap,
  Menu,
  ShieldCheck,
  Award,
  Upload,
  Lock,
  Users,
  Sparkles,
  Tag,
  Globe,
  CheckCircle2,
  ScanLine,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useActiveAccount,
  useActiveWallet,
  useConnectModal,
  useDisconnect,
  AutoConnect,
  lightTheme,
} from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client, chain } from "@/app/const/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const indigoTheme = lightTheme({
  colors: {
    primaryButtonBg: "#4f46e5",
    primaryButtonText: "#ffffff",
    modalBg: "#ffffff",
    borderColor: "#e5e7eb",
  },
});

export function LandingPage() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { connect } = useConnectModal();
  const router = useRouter();

  useEffect(() => {
    if (account) router.push("/dashboard");
  }, [account, router]);

  const handleConnect = async () => {
    try {
      const connected = await connect({
        client,
        size: "compact",
        theme: indigoTheme,
        chain,
        wallets: [
          inAppWallet({ auth: { options: ["google", "email", "passkey", "guest"] } }),
          createWallet("io.metamask"),
        ],
      });
      if (connected) router.push("/dashboard");
    } catch (e) {
      console.error("Connection failed:", e);
    }
  };

  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex flex-col min-h-screen bg-white text-stone-900 selection:bg-indigo-500/20">
      <AutoConnect client={client} />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#080818]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo.png" alt="Phygital" width={36} height={36} className="rounded-xl" />
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            Phygital
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 ml-auto mr-8">
          {[["How it Works", "how-it-works"], ["Create", "create"], ["Features", "features"]].map(([label, id]) => (
            <button key={id} onClick={() => scroll(id)}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors tracking-wide">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {account ? (
            <Button onClick={() => disconnect(wallet!)} size="sm" variant="ghost"
              className="text-white/50 hover:text-red-400 font-semibold hidden sm:flex">Sign Out</Button>
          ) : (
            <Button onClick={handleConnect}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-7 h-10 font-bold transition-all shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
              Get Started
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white/70"><Menu className="h-6 w-6" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0f0f23] border border-white/10 shadow-2xl rounded-xl p-2 w-48">
              {[["How it Works", "how-it-works"], ["Create", "create"], ["Features", "features"]].map(([label, id]) => (
                <DropdownMenuItem key={id} onClick={() => scroll(id)}
                  className="font-medium cursor-pointer py-3 text-white/70 hover:text-white focus:bg-white/5">{label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080818]">

          {/* Aurora blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="animate-aurora absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="animate-aurora2 absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="animate-aurora absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[100px]" style={{ animationDelay: "4s" }} />
          </div>

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* ─ Spinning rings (3D ornament) ─ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="animate-spin-slow w-[700px] h-[700px] rounded-full border border-indigo-400/40" style={{ borderStyle: "dashed" }} />
            <div className="animate-spin-reverse absolute w-[500px] h-[500px] rounded-full border border-violet-400/30" />
            <div className="animate-spin-slow absolute w-[320px] h-[320px] rounded-full border border-fuchsia-400/20" style={{ animationDuration: "30s" }} />
          </div>

          <div className="container px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16 pt-24 pb-16">

            {/* Hero text */}
            <div className="flex-1 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-300 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse" />
                Phygital NFT Platform — Base Sepolia Testnet
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white max-w-2xl leading-[1.05] mb-6">
                Create drops.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                  Collect the world.
                </span>
              </h1>

              <p className="max-w-xl text-lg text-white/50 leading-relaxed font-medium mb-10">
                Phygital turns physical objects into on-chain NFT drops. Generate a QR code, print it anywhere, and let people claim a real ERC-1155 NFT to their invisible wallet — free, in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleConnect}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-10 rounded-full text-lg font-bold shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 border border-indigo-400/20">
                  Start Collecting <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={() => scroll("create")} variant="outline"
                  className="h-14 px-10 rounded-full text-lg font-bold border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all">
                  Create a Drop
                </Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
                {["No seed phrases", "No gas fees", "Real on-chain NFTs", "ERC-1155 Standard"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/60">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 3D Floating mockup */}
            <div className="flex-shrink-0 relative w-[340px] h-[420px] hidden lg:flex items-center justify-center">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-3xl animate-pulse-ring" />

              {/* Card 1: QR Scanner (back) */}
              <div className="animate-float-slow absolute -left-6 top-8 w-52 bg-[#0f0f23] border border-white/10 rounded-2xl p-4 shadow-2xl z-10"
                style={{ transform: "perspective(800px) rotateY(10deg) rotateX(-3deg)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-white/30 ml-2 font-mono">scan.tsx</span>
                </div>
                {/* Mock QR grid */}
                <div className="w-full aspect-square rounded-xl bg-white p-2">
                  <div className="w-full h-full grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${[0,1,5,6,4,9,10,14,15,19,20,21,24,12,7,17].includes(i) ? "bg-indigo-900" : "bg-stone-100"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-center text-xs text-white/30 mt-2 font-mono">Claim URL encoded</p>
              </div>

              {/* Card 2: NFT Card (front, floating) */}
              <div className="animate-float absolute -right-4 bottom-0 w-52 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-2xl shadow-2xl z-20 overflow-hidden"
                style={{ transform: "perspective(800px) rotateY(-8deg) rotateX(3deg)" }}>
                {/* Shimmer overlay */}
                <div className="absolute inset-0 animate-shimmer" />
                <div className="p-4">
                  <div className="w-full aspect-square rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/20">
                    <div className="text-center">
                      <div className="text-4xl mb-1">⬡</div>
                      <p className="text-xs text-white/60 font-semibold">Red Hexagon</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-sm">Red Hexagon</p>
                      <p className="text-white/50 text-xs">Shapes Collection</p>
                    </div>
                    <div className="bg-emerald-400/20 border border-emerald-400/30 rounded-full px-2 py-0.5">
                      <span className="text-emerald-300 text-xs font-bold">Minted ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting dots */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>

              {/* Transaction badge */}
              <div className="animate-float-delayed absolute top-4 right-0 bg-emerald-900/80 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center gap-2 backdrop-blur-sm z-30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-bold">Tx confirmed</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ──────────────────────────────────────────────────── */}
        <section className="bg-[#0c0c1e] border-y border-white/5 py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { val: "5", label: "Live NFT Drops" },
                { val: "ERC-1155", label: "Token Standard" },
                { val: "$0.00", label: "Gas for Claimers" },
                { val: "Base", label: "Network" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col space-y-1">
                  <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{s.val}</span>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS: COLLECTORS ──────────────────────────────────── */}
        <section id="how-it-works" className="w-full py-24 md:py-32 bg-white scroll-mt-20">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <ScanLine className="h-3.5 w-3.5" /> For Collectors
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-stone-900 mb-4">Claim an NFT in 3 steps</h2>
              <p className="text-xl text-stone-500 max-w-2xl font-medium">No crypto experience needed. From scan to owning takes under 30 seconds.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                { step: "01", icon: ScanLine, color: "text-indigo-600 bg-indigo-50 border-indigo-100", title: "Scan Any QR Code", desc: "Find a Phygital QR on a product, event, poster or card. Open your phone camera — no app needed." },
                { step: "02", icon: ShieldCheck, color: "text-violet-600 bg-violet-50 border-violet-100", title: "Connect in Seconds", desc: "Sign in with Google, email, or passkey. Your invisible smart wallet is created in the background — no seed phrases." },
                { step: "03", icon: Award, color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100", title: "Own It On-Chain", desc: "Tap Claim. An ERC-1155 NFT is minted to your wallet on Base. View it on your dashboard or BaseScan." },
              ].map((item, i) => (
                <div key={i} className="card-3d bg-white border border-stone-100 rounded-3xl p-8 shadow-sm hover:shadow-xl cursor-default">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 ${item.color}`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-black text-stone-100 mb-3 tabular-nums">{item.step}</div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                  <p className="text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOR CREATORS ──────────────────────────────────────────────── */}
        <section id="create" className="w-full py-24 md:py-32 bg-[#080818] scroll-mt-20 relative overflow-hidden">
          {/* Aurora bg */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="animate-aurora absolute -top-[20%] left-[30%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[100px]" />
            <div className="animate-aurora2 absolute -bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[100px]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="container px-4 md:px-6 mx-auto max-w-6xl relative z-10">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <Sparkles className="h-3.5 w-3.5" /> For Creators
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Create your own NFT drop</h2>
              <p className="text-xl text-white/40 max-w-2xl font-medium">Design, configure, and distribute a physical NFT drop in minutes — no code required.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                { step: "01", icon: ImageIcon, grad: "from-amber-500 to-orange-500", title: "Design Your NFT", desc: "Upload your image to IPFS, set a name, description, and build custom traits like event name, edition, or rarity." },
                { step: "02", icon: Lock, grad: "from-rose-500 to-fuchsia-500", title: "Set the Rules", desc: "Set a claim limit (e.g. 50 people max), add an expiry date, protect with a secret code, or mark it as soulbound." },
                { step: "03", icon: Zap, grad: "from-indigo-500 to-violet-500", title: "Print & Distribute", desc: "Download your unique high-res QR code and print it on cards, posters, packaging, or any physical surface." },
              ].map((item, i) => (
                <div key={i} className="card-3d bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 hover:border-white/20 cursor-default">
                  <div className="relative w-16 h-16 mb-6">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.grad} opacity-20 blur-md`} />
                    <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${item.grad} bg-opacity-10 border border-white/10 flex items-center justify-center`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white/10 mb-3">{item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex justify-center">
              <Button onClick={handleConnect}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white h-14 px-10 rounded-full text-lg font-bold shadow-2xl shadow-amber-500/30 transition-all hover:-translate-y-1 border-0">
                Create Your First Drop <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────────── */}
        <section id="features" className="w-full py-24 md:py-32 bg-stone-50 scroll-mt-20">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-stone-900 mb-4">Everything you need</h2>
              <p className="text-xl text-stone-500 max-w-2xl mx-auto font-medium">Powerful tools for creators. Seamless experience for collectors.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Upload, grad: "from-indigo-500 to-blue-500", bg: "bg-indigo-50 border-indigo-100", ic: "text-indigo-600", title: "IPFS Image Upload", desc: "Upload images directly. Stored permanently on IPFS — your NFT artwork is immutable and lives forever." },
                { icon: Tag, grad: "from-violet-500 to-purple-500", bg: "bg-violet-50 border-violet-100", ic: "text-violet-600", title: "Custom Attributes", desc: "Add unlimited key-value traits: event name, rarity, edition number, color — visible on every NFT marketplace." },
                { icon: Users, grad: "from-amber-500 to-orange-400", bg: "bg-amber-50 border-amber-100", ic: "text-amber-600", title: "Claim Limit", desc: "Set how many unique wallets can claim. After the limit, the QR locks itself automatically." },
                { icon: Lock, grad: "from-rose-500 to-pink-500", bg: "bg-rose-50 border-rose-100", ic: "text-rose-600", title: "Secret Code Gate", desc: "Password-protect a drop. Only people you give the code to can claim — perfect for exclusive events." },
                { icon: ShieldCheck, grad: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 border-emerald-100", ic: "text-emerald-600", title: "Soulbound NFTs", desc: "Mark as non-transferable. Perfect for certificates, diplomas, and attendance records." },
                { icon: Globe, grad: "from-sky-500 to-cyan-500", bg: "bg-sky-50 border-sky-100", ic: "text-sky-600", title: "External Links", desc: "Embed a URL in the NFT metadata — link to your website, event page, or any resource." },
                { icon: Wallet, grad: "from-indigo-500 to-violet-500", bg: "bg-indigo-50 border-indigo-100", ic: "text-indigo-600", title: "Invisible Wallets", desc: "Sign in with Google or email. A self-custody smart wallet is created silently — zero crypto knowledge." },
                { icon: Zap, grad: "from-yellow-500 to-amber-400", bg: "bg-yellow-50 border-yellow-100", ic: "text-yellow-600", title: "Zero Gas for Claimers", desc: "Your backend wallet sponsors all gas fees. Collectors claim completely free, you set it up once." },
                { icon: QrCode, grad: "from-stone-500 to-stone-600", bg: "bg-stone-100 border-stone-200", ic: "text-stone-600", title: "Printable QR Codes", desc: "Every drop generates a unique high-res QR code ready to print on products, posters, or cards." },
              ].map((f, i) => (
                <div key={i} className={`card-3d bg-white border rounded-2xl p-6 hover:shadow-lg cursor-default ${f.bg}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-white border ${f.bg}`}>
                    <f.icon className={`h-5 w-5 ${f.ic}`} />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-2">{f.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
        <section className="w-full py-28 bg-[#080818] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-aurora absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="animate-aurora2 absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[100px]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse" />
              Ready to go Phygital?
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
              The physical world just{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                went on-chain.
              </span>
            </h2>
            <p className="text-xl text-white/40 max-w-xl font-medium mb-12">
              Create your first NFT drop or start collecting — all in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleConnect}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-16 px-12 rounded-full font-bold text-xl shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 border border-indigo-400/10">
                Collect an NFT
              </Button>
              <Button onClick={handleConnect}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-16 px-12 rounded-full font-bold text-xl transition-all hover:-translate-y-1">
                Create a Drop
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
