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

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (account) {
      router.push("/dashboard");
    }
  }, [account, router]);

  const handleConnect = async () => {
    await connect({
      client,
      size: "compact",
      theme: lightTheme({
        colors: {
          primaryButtonBg: "#a855f7", // fuchsia-500
          primaryButtonText: "#ffffff",
          modalBg: "#faf9f6", // warm off-white
          borderColor: "#e5e7eb", // gray-200
        }
      }),
      chain,
      wallets: [
        inAppWallet({
          auth: {
            options: [
              "google",
              "coinbase",
              "discord",
              "farcaster",
              "email",
              "passkey",
              "guest",
            ],
          },
        }),
        createWallet("io.metamask"),
      ],
    });
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-stone-900 selection:bg-fuchsia-500/30">
      <AutoConnect client={client} />

      {/* ===== Header ===== */}
      <header className="fixed top-0 w-full z-50 glass px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link className="flex items-center justify-center group" href="#">
          <div className="p-2 bg-fuchsia-500/10 rounded-xl group-hover:bg-fuchsia-500/20 transition-colors">
            <QrCode className="h-6 w-6 text-fuchsia-600" />
          </div>
          <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-500">
            NFT Scanner
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-auto mr-8">
          <button onClick={scrollToFeatures} className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Features
          </button>
          <button onClick={scrollToFeatures} className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            How it Works
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          {account ? (
            <>
              <Button
                onClick={() => disconnect(wallet!)}
                size="sm"
                variant="ghost"
                className="hidden sm:inline-flex text-stone-600 hover:text-red-600 hover:bg-red-500/10 transition-colors"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] transition-all rounded-full px-6 font-medium"
            >
              Sign up / Sign In
            </Button>
          )}

          {/* Mobile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-stone-900/5 border-stone-200 text-stone-900">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-stone-200 text-stone-900">
              <DropdownMenuItem onClick={scrollToFeatures} className="focus:bg-stone-900/5 cursor-pointer">
                Features
              </DropdownMenuItem>
              {account && (
                <DropdownMenuItem onClick={() => disconnect(wallet!)} className="focus:bg-red-500/10 focus:text-red-600 cursor-pointer text-red-600">
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="flex-1 pt-16 relative">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-fuchsia-300/40 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-300/30 blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-48 flex items-center justify-center bg-grid-white/[0.04]">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border border-fuchsia-200 bg-white/80 px-3 py-1 text-sm font-medium text-fuchsia-700 backdrop-blur-sm shadow-sm mb-4">
                <Zap className="mr-2 h-4 w-4 text-fuchsia-500" /> V2.0 Now Live
              </div>
              <div className="space-y-4 max-w-[800px]">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="text-stone-900">Scan. Collect.</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600 text-glow">
                    Own.
                  </span>
                </h1>
                <p className="mx-auto max-w-[600px] text-stone-600 md:text-xl leading-relaxed">
                  Discover hidden QR codes in the wild and instantly claim exclusive digital assets. Build your collection and trade with friends on-chain.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  onClick={handleConnect}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white h-12 px-8 rounded-full text-lg shadow-[0_8px_20px_rgba(168,85,247,0.4)] transition-all hover:-translate-y-1"
                >
                  Start Collecting
                </Button>
                <Button 
                  onClick={scrollToFeatures}
                  variant="outline" 
                  className="h-12 px-8 rounded-full text-lg border-stone-200 bg-white/50 hover:bg-white text-stone-700 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-1"
                >
                  How it Works
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-stone-100/50 border-t border-stone-200 relative z-10 mt-12 scroll-mt-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-stone-900">
                Revolutionize Your Collection
              </h2>
              <p className="max-w-[600px] text-stone-600 md:text-xl/relaxed">
                Cutting-edge tech meets beautiful design to make digital collecting seamless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
              {[
                {
                  icon: Smartphone,
                  title: "Instant Scanning",
                  desc: "Add NFTs to your wallet immediately with a quick camera scan.",
                  color: "from-blue-500 to-cyan-400"
                },
                {
                  icon: Wallet,
                  title: "Smart Wallet",
                  desc: "We generate a secure, hidden wallet for you using just your email or guest login.",
                  color: "from-fuchsia-500 to-purple-500"
                },
                {
                  icon: Zap,
                  title: "Zero Gas Fees",
                  desc: "Claim assets instantly on abstract, fast networks with zero friction.",
                  color: "from-orange-500 to-yellow-400"
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="glass-card p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform duration-300 group"
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/30 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-fuchsia-50/50" />
          <div className="container px-4 md:px-6 mx-auto relative z-10 glass-card rounded-3xl p-12 overflow-hidden border-fuchsia-100">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-fuchsia-300/30 blur-[100px] rounded-full" />
            <div className="flex flex-col items-center space-y-6 text-center max-w-[600px] mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-stone-900">
                Ready to find your first NFT?
              </h2>
              <p className="text-stone-600 md:text-lg">
                Join thousands of collectors uncovering digital treasure in the real world.
              </p>
              <Button 
                onClick={handleConnect}
                className="bg-stone-900 text-white hover:bg-stone-800 h-14 px-8 rounded-full font-bold text-lg mt-4 shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl"
              >
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="w-full py-8 px-6 border-t border-stone-200 bg-stone-50 flex flex-col md:flex-row items-center justify-between gap-4 z-10 relative">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-fuchsia-600" />
          <p className="text-sm text-stone-500 font-medium">
            © 2025 NFT Scanner. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors" href="#">
            Terms
          </Link>
          <Link className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
