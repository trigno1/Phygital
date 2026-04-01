"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  QrCode,
  Smartphone,
  Wallet,
  Zap,
  Menu,
  ShieldCheck,
  TrendingUp,
  Award
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

export function LandingPage() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { connect } = useConnectModal();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push("/dashboard");
    }
  }, [account, router]);

  const handleConnect = async () => {
    try {
      const connectedWallet = await connect({
        client,
        size: "compact",
        theme: lightTheme({
          colors: {
            primaryButtonBg: "#3b3486", // sleek indigo
            primaryButtonText: "#ffffff",
            modalBg: "#ffffff", 
            borderColor: "#e5e7eb", 
          }
        }),
        chain,
        wallets: [
          inAppWallet({
            auth: {
              options: ["google", "email", "passkey", "guest"],
            },
          }),
          createWallet("io.metamask"),
        ],
      });
      
      // If a wallet was successfully connected, route to dashboard instantly
      if (connectedWallet) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const scrollTarget = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-stone-900 selection:bg-indigo-500/20">
      <AutoConnect client={client} />

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-4 lg:px-8 h-20 flex items-center justify-between transition-all duration-300">
        <Link className="flex items-center justify-center group" href="#">
          <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <QrCode className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="ml-3 text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-indigo-600 transition-colors">
            Phygital
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 ml-auto mr-8">
          <button onClick={() => scrollTarget("how-it-works")} className="text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors tracking-wide">
            How it Works
          </button>
          <button onClick={() => scrollTarget("features")} className="text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors tracking-wide">
            Features
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          {account ? (
            <Button
              onClick={() => disconnect(wallet!)}
              size="sm"
              variant="ghost"
              className="hidden sm:inline-flex text-stone-500 hover:text-red-600 font-semibold"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              className="bg-stone-900 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/10 transition-all rounded-full px-8 py-5 h-auto font-bold tracking-wide"
            >
              Get Started
            </Button>
          )}

          {/* Mobile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-stone-900">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-stone-100 shadow-xl rounded-xl p-2 w-48">
              <DropdownMenuItem onClick={() => scrollTarget("how-it-works")} className="font-medium cursor-pointer py-3 focus:bg-stone-50">
                How it Works
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => scrollTarget("features")} className="font-medium cursor-pointer py-3 focus:bg-stone-50">
                Features
              </DropdownMenuItem>
              {account && (
                <DropdownMenuItem onClick={() => disconnect(wallet!)} className="font-medium cursor-pointer text-red-600 py-3 focus:bg-red-50 focus:text-red-700">
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pt-20">
        
        {/* === HERO SECTION === */}
        <section className="relative w-full pt-20 pb-20 lg:pt-40 lg:pb-32 min-h-[calc(100svh-80px)] flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle grid & gradient background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent"></div>

          <div className="container px-4 md:px-6 relative z-10 text-center flex flex-col items-center">
            
            <div className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              The bridge between physical and digital
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-stone-900 max-w-4xl leading-[1.1] mb-8">
              Scan the real world. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                Own the digital.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-stone-500 leading-relaxed font-medium mb-12">
              Transform everyday interactions into permanent digital assets. Find our hidden QR markers in the wild and instantly claim exclusive NFTs straight to your invisible smart wallet.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button 
                onClick={handleConnect}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 rounded-full text-lg font-bold shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                Scan Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => scrollTarget("how-it-works")}
                variant="outline" 
                className="h-14 px-10 rounded-full text-lg font-bold border-stone-200 text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all w-full sm:w-auto"
              >
                Learn How
              </Button>
            </div>
          </div>
        </section>

        {/* === LIVE STATS (MOCK) === */}
        <section className="border-y border-stone-100 bg-white py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-stone-100">
              <div className="flex flex-col space-y-1">
                <span className="text-3xl md:text-4xl font-black text-stone-900">14.2K</span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Scans</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-3xl md:text-4xl font-black text-stone-900">5,430</span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Hunters</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-3xl md:text-4xl font-black text-stone-900">$0.00</span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Gas Fees Paid</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-3xl md:text-4xl font-black text-emerald-500">99.9%</span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">On-chain Uptime</span>
              </div>
            </div>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section id="how-it-works" className="w-full py-24 md:py-32 bg-stone-50 scroll-mt-20">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-stone-900 mb-4">
                How it works
              </h2>
              <p className="text-xl text-stone-500 max-w-2xl font-medium">
                No crypto experience required. Your journey from seeing a QR code to holding an NFT takes less than 30 seconds.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-stone-200 z-0"></div>

              {[
                {
                  step: "01",
                  title: "Locate & Scan",
                  desc: "Find our physical QR markers embedded in events, posters, and hidden locations. Open your camera app.",
                  icon: QrCode
                },
                {
                  step: "02",
                  title: "Instant Auth",
                  desc: "No seed phrases. No wallet apps. Sign in securely in 5 seconds using just your Google account or email.",
                  icon: ShieldCheck
                },
                {
                  step: "03",
                  title: "Claim Asset",
                  desc: "Tap claim. The smart contract instantly mints the NFT directly to your new embedded wallet, gas-free.",
                  icon: Award
                }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col mt-4 md:mt-0">
                  <div className="w-24 h-24 rounded-3xl bg-white border-2 border-stone-100 shadow-xl shadow-stone-200/50 flex items-center justify-center mb-8 mx-auto md:mx-0 relative">
                    <span className="absolute -top-4 -right-4 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {item.step}
                    </span>
                    <item.icon className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-3">{item.title}</h3>
                  <p className="text-stone-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === FEATURES / DETAILS === */}
        <section id="features" className="w-full py-24 md:py-32 bg-white scroll-mt-20">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                  <Wallet className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-stone-900 mb-4 tracking-tight">Invisible Smart Wallets</h3>
                <p className="text-lg text-stone-500 font-medium leading-relaxed mb-6">
                  Web3 is hard. We made it invisible. When you sign in with your email or social account, we deterministically generate a secure, non-custodial smart wallet for you in the background. 
                </p>
                <ul className="space-y-3">
                  {['No seed phrases to memorize', 'No extensions to download', 'True self-custody behind the scenes'].map((point, i) => (
                    <li key={i} className="flex items-center text-stone-700 font-semibold">
                      <div className="mr-3 p-1 rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px] w-full rounded-3xl bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.indigo.50)_0%,transparent_70%)]"></div>
                 {/* Decorative mock UI */}
                 <div className="relative w-64 p-6 bg-white rounded-2xl shadow-2xl border border-stone-100 z-10 animate-float">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-stone-100 animate-pulse"></div>
                     <div className="flex-1 space-y-2">
                       <div className="h-3 bg-stone-100 rounded-full w-24"></div>
                       <div className="h-2 bg-stone-50 rounded-full w-16"></div>
                     </div>
                   </div>
                   <div className="w-full h-32 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-inner"></div>
                   <div className="h-10 bg-stone-900 rounded-lg w-full flex items-center justify-center text-white text-xs font-bold">Sign In to Authenticate</div>
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 relative h-[400px] w-full rounded-3xl bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.emerald.50)_0%,transparent_70%)]"></div>
                  {/* Decorative mock UI */}
                  <div className="relative w-64 p-2 bg-white rounded-2xl shadow-2xl border border-stone-100 z-10 animate-float-delayed">
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="px-2 pb-2">
                      <div className="h-4 bg-stone-200 rounded text-transparent w-full mb-2">Claimed Asset</div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-stone-100 rounded w-12"></div>
                        <div className="h-5 w-16 bg-emerald-100 rounded-full"></div>
                      </div>
                    </div>
                  </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-stone-900 mb-4 tracking-tight">Zero Gas Fees. Zero Friction.</h3>
                <p className="text-lg text-stone-500 font-medium leading-relaxed mb-6">
                  We utilize abstract account sponsorship so you and your users never have to pay a network fee. If you scan a code, you get the asset immediately. Period.
                </p>
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 mt-8">
                  <p className="font-bold text-stone-900 mb-2 truncate">Speed test verified</p>
                  <p className="text-sm text-stone-500">Average time from camera scan to asset in wallet is exactly 4.2 seconds on Base Sepolia.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* === BOTTOM CTA === */}
        <section className="w-full py-24 bg-stone-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
              Ready to hunt?
            </h2>
            <p className="text-xl text-stone-400 max-w-2xl font-medium mb-10">
              Create your account in 3 seconds and start building your on-chain collection today.
            </p>
            <Button 
                onClick={handleConnect}
                className="bg-white text-stone-900 hover:bg-stone-100 h-16 px-12 rounded-full font-bold text-xl shadow-2xl transition-transform hover:-translate-y-1"
              >
                Join the Network
            </Button>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="w-full py-12 px-6 bg-white border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-50 rounded-lg">
            <QrCode className="h-5 w-5 text-stone-400" />
          </div>
          <p className="text-sm text-stone-400 font-semibold uppercase tracking-wider">
            © 2026 Phygital Protocol.
          </p>
        </div>
        <nav className="flex gap-8">
          <Link className="text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest" href="#">
            Platform
          </Link>
          <Link className="text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest" href="#">
            Terms
          </Link>
          <Link className="text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
