"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActiveAccount, useActiveWallet, useConnectModal, useDisconnect, AutoConnect, lightTheme } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client, chain } from "@/app/const/client";
import { motion } from "framer-motion";
import { Hexagon, Zap, Globe, Timer, Search, Shield, Mail, FileText, LayoutGrid, Smartphone, Diamond, Cpu, Globe2, Palette, Watch, Github, Linkedin, ExternalLink, ArrowRight } from "lucide-react";

const phygitalLogo = "/phygital_ultra_logo.png";

const indigoTheme = lightTheme({
  colors: {
    primaryButtonBg: "#4f46e5",
    primaryButtonText: "#ffffff",
    modalBg: "#0c0c1d",
    borderColor: "#474659",
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
        client, size: "compact", theme: indigoTheme, chain,
        wallets: [
          inAppWallet({ auth: { options: ["google", "email", "passkey", "guest"] } }),
          createWallet("io.metamask"),
        ],
      });
      if (connected) router.push("/dashboard");
    } catch (e) { console.error(e); }
  };

  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9ff] text-[#1a1a3a]" style={{ fontFamily: "Inter, sans-serif" }}>
      <AutoConnect client={client} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      <NavBar account={account} wallet={wallet} disconnect={disconnect} handleConnect={handleConnect} scroll={scroll} />
      <HeroSection handleConnect={handleConnect} />
      <StatsBar />
      <CollectorsSection />
      <CreatorsSection handleConnect={handleConnect} />
      <FeaturesSection />
      <CtaSection handleConnect={handleConnect} />
      <PhygitalFooter scroll={scroll} />
    </div>
  );
}

/* ── NavBar ─────────────────────────────────────────────────── */
function NavBar({ account, wallet, disconnect, handleConnect, scroll }: any) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? "bg-white/80 backdrop-blur-2xl border-b border-black/5 py-3" : "bg-transparent py-5"}`}>
      <div className="flex items-center justify-between px-6 lg:px-10 py-2 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-11 h-11 transition-transform duration-500 group-hover:scale-110">
            <img src={phygitalLogo} alt="Phygital Logo" className="w-full h-full object-contain" />
          </div>
          <span className={`text-2xl font-black tracking-tighter transition-colors ${isScrolled ? "text-black" : "text-black"}`}>Phygital</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {[["How it Works","how-it-works"],["Create","create"],["Features","features"]].map(([label,id]) => (
            <button key={id} onClick={() => scroll(id)}
              className="text-sm font-bold text-black/50 hover:text-black transition-colors duration-300">
              {label}
            </button>
          ))}
          <Link href="/explore" className="text-sm font-bold text-indigo-600 flex items-center gap-1.5 hover:text-indigo-800 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Explore
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {account ? (
            <button onClick={() => disconnect(wallet!)}
              className="px-6 py-2.5 text-sm font-bold text-black/40 hover:text-red-500 transition-colors border border-black/5 rounded-xl">
              Sign Out
            </button>
          ) : (
            <button onClick={handleConnect}
              className="px-8 py-3 bg-black text-white text-sm font-black rounded-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── HeroSection (High Contrast / Stunning) ─────────────────── */
function HeroSection({ handleConnect }: any) {
  return (
    <header className="relative min-h-[90vh] flex items-center overflow-hidden bg-white pt-24 pb-12 sm:pb-0">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-70" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 opacity-50" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full relative z-10 grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/5 border border-black/5 backdrop-blur-xl"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-xs font-black text-black/60 uppercase tracking-[0.2em]">Next-Gen Physical Commerce</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-[-0.05em] leading-[0.85] text-black"
          >
            The Physical<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500">
              Goes On-Chain.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl text-black/50 max-w-xl font-medium leading-tight"
          >
            Bridge the gap between physical artifacts and digital scarcity. Print a secure identity, claim an immutable token, own the reality.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
          >
            <button onClick={handleConnect}
              className="group relative px-10 py-5 bg-black text-white font-black rounded-[24px] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3">
              <span className="relative z-10 uppercase tracking-widest text-lg">Start Minting</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
            <button onClick={handleConnect}
              className="px-10 py-5 bg-white border-2 border-black text-black font-black rounded-[24px] hover:bg-black hover:text-white transition-all duration-500 uppercase tracking-widest text-lg">
              Explore Drops
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-8 pt-4"
          >
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                  {i}
                </div>
              ))}
            </div>
            <div className="text-sm font-bold text-black/30 uppercase tracking-widest">
              Join 12,000+ Collectors
            </div>
          </motion.div>
        </div>

        {/* Right Visual (High Contrast) */}
        <div className="relative h-[600px] hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-600/5 rounded-[60px] rotate-6 scale-95" />
          <div className="absolute inset-0 bg-fuchsia-600/5 rounded-[60px] -rotate-3 scale-95" />
          
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-[380px] h-[520px] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden p-8 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src={phygitalLogo} alt="Logo" className="w-14 h-14 object-contain" />
              </div>
              <div className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                Verified
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-64 rounded-3xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 flex items-center justify-center">
                 <div className="w-32 h-32 bg-white rounded-3xl shadow-xl p-4 grid grid-cols-5 gap-1 animate-pulse">
                   {Array.from({length:25}).map((_,i) => (
                     <div key={i} className={`rounded-[1px] ${[0,1,5,6,4,9,10,14,15,19,20,21,24,12,7].includes(i)?"bg-black":"bg-black/5"}`} />
                   ))}
                 </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-black">Aether Prism #01</h3>
                <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Origin: London, UK</p>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Rarity</p>
                <p className="text-lg font-black text-indigo-600">Legendary</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-black/5 flex items-center justify-center">
                <Zap size={20} className="text-black" />
              </div>
            </div>
          </motion.div>

          {/* Floating badges */}
          <motion.div 
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-10 -right-10 px-6 py-4 bg-white shadow-2xl rounded-3xl border border-black/5 z-20 flex items-center gap-3"
          >
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
               <Shield size={20} />
             </div>
             <div className="font-black text-black tracking-tight">Authenticity<br />Guaranteed</div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

/* ── StatsBar (Transition to Dark) ─────────────────────────── */
function StatsBar() {
  const stats = [
    { val:"1.2M+", label:"Total Assets", icon:Hexagon, color:"text-indigo-600", bg:"bg-indigo-50" },
    { val:"45K+",  label:"Global Creators", icon:Globe2, color:"text-emerald-600", bg:"bg-emerald-50" },
    { val:"$850M", label:"Vaulted Value", icon:Diamond, color:"text-blue-600", bg:"bg-blue-50" },
    { val:"< 30s", label:"Claim Time", icon:Timer, color:"text-fuchsia-600", bg:"bg-fuchsia-50" },
  ];
  return (
    <section className="relative z-30 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s,i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white border border-black/5 rounded-[32px] p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500"
            >
              <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <s.icon className={s.color} size={28} />
              </div>
              <div className="text-4xl font-black text-black tracking-tight mb-2">{s.val}</div>
              <div className="text-xs font-black text-black/30 uppercase tracking-[0.2em]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CollectorsSection (Journey) ── */
function CollectorsSection() {
  const steps = [
    { n:"01", icon:Smartphone, title:"Scan Artifact", desc:"Activate the NFC prism or scan the high-res QR embedded in your physical artifact. No app required.", color:"#4f46e5" },
    { n:"02", icon:Shield, title:"Claim Digital Twin", desc:"Sign in via Google or Passkey. Mint the 1:1 on-chain verification token to your private vault in seconds.", color:"#ec4899" },
    { n:"03", icon:Diamond, title:"Vault or Trade", desc:"Hold your digital twin for governance points, list it on our marketplace, or showcase it in your social gallery.", color:"#10b981" },
  ];
  return (
    <section id="how-it-works" className="w-full py-32 sm:py-48 bg-[#f1f3f9] scroll-mt-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <motion.span className="text-indigo-600 font-black tracking-[0.3em] uppercase text-xs mb-6 block">The Protocol</motion.span>
          <motion.h2 className="text-6xl sm:text-8xl font-black text-black tracking-tighter leading-none">
            Physical to<br />Immutable.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {steps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center text-center p-12 bg-white rounded-[48px] shadow-xl shadow-black/5"
            >
              <div className="w-24 h-24 rounded-[32px] bg-black text-white flex items-center justify-center mb-10 shadow-2xl shadow-black/20 group-hover:-translate-y-4 transition-transform">
                <s.icon size={40} />
              </div>
              <h3 className="text-3xl font-black text-black mb-6 tracking-tight">{s.title}</h3>
              <p className="text-black/40 text-lg font-medium leading-relaxed">{s.desc}</p>
              <div className="absolute top-6 right-8 text-5xl font-black text-black/5 select-none">{s.n}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CreatorsSection (The World - Dark & Magical) ── */
function CreatorsSection({ handleConnect }: any) {
  return (
    <section id="create" className="w-full py-40 bg-[#0c0c1d] scroll-mt-20 relative overflow-hidden">
      {/* Abstract Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          {/* Left: 3D Visual (No Text) */}
          <div className="flex-1 w-full order-2 lg:order-1 flex justify-center relative">
            <div className="relative w-72 h-72 sm:w-[500px] sm:h-[500px]">
              <div className="absolute inset-0 border-[3px] border-indigo-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-10 border border-white/5 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
              
              <motion.div 
                animate={{ scale: [1, 1.02, 1], rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-[#111124] shadow-[0_0_100px_rgba(99,102,241,0.3)] flex items-center justify-center overflow-hidden border border-white/10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_80%)]" />
                {/* Abstract Symbol instead of text */}
                <div className="w-40 h-40 bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 group">
                   <div className="w-20 h-20 bg-white rounded-full mix-blend-overlay animate-pulse" />
                   <img src={phygitalLogo} alt="Logo" className="absolute w-24 h-24 p-2 opacity-80" />
                </div>
              </motion.div>

              {[
                { top: "15%", left: "85%", icon: Palette, color: "text-indigo-400" },
                { top: "65%", left: "0%", icon: Cpu, color: "text-fuchsia-400" },
                { top: "85%", left: "75%", icon: Watch, color: "text-emerald-400" }
              ].map((obj, i) => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl z-20 group"
                  style={{ top: obj.top, left: obj.left }}
                >
                  <obj.icon size={32} className={`${obj.color} group-hover:scale-125 transition-transform`} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 w-full text-center lg:text-left order-1 lg:order-2">
            <motion.span className="text-fuchsia-500 font-black tracking-[0.4em] uppercase text-xs mb-8 block">Global Deployment</motion.span>
            <motion.h2 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-[0.8] mb-10">
              The World is<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">Digital Now.</span>
            </motion.h2>
            <p className="text-xl text-white/40 leading-relaxed mb-12 max-w-md mx-auto lg:mx-0 font-medium">
              Join the ecosystem of creators linking physical masterpieces to digital permanence. One scan, eternal ownership.
            </p>
            <button onClick={handleConnect}
              className="group relative px-12 py-6 bg-white text-black font-black rounded-[28px] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.1)] uppercase tracking-[0.2em] text-lg">
              Start Your Voyage
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FeaturesSection (White Background) ── */
function FeaturesSection() {
  const features = [
    { title:"Instant Verification", desc:"AI-powered authentication for every physical artifact in your collection. Trustless and instant.", icon:Search, span:"col-span-1 sm:col-span-2", bg:"bg-indigo-50", text:"text-indigo-600" },
    { title:"Secure Vaulting", desc:"Military-grade multi-sig protection for your assets.", icon:Shield, bg:"bg-emerald-50", text:"text-emerald-600" },
    { title:"Universal Drops", desc:"Cross-chain compatibility. Sell on any major marketplace.", icon:Globe, bg:"bg-blue-50", text:"text-blue-600" },
    { title:"Invisible Wallets", desc:"No seed phrases. Zero friction onboarding for everyone.", icon:Zap, span:"col-span-1 sm:col-span-2", bg:"bg-fuchsia-50", text:"text-fuchsia-600" },
    { title:"Email Receipts", desc:"Automated confirmation for every claim or trade.", icon:Mail, bg:"bg-rose-50", text:"text-rose-600" },
    { title:"Certificate Export", desc:"Branded PDF authenticity certificates available instantly.", icon:FileText, bg:"bg-amber-50", text:"text-amber-600" },
  ];
  return (
    <section id="features" className="w-full py-40 bg-white scroll-mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <h2 className="text-6xl sm:text-8xl font-black tracking-tighter text-black mb-10">Built for Scale.</h2>
          <p className="text-xl text-black/40 max-w-2xl mx-auto font-medium leading-relaxed">Industrial-grade infrastructure for the next generation of physical drops and high-value artifacts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`group relative overflow-hidden rounded-[48px] p-12 bg-[#f8f9ff] border border-black/5 hover:shadow-2xl transition-all duration-500 ${f.span || ""}`}
            >
              <div className={`w-20 h-20 ${f.bg} rounded-[32px] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                <f.icon className={f.text} size={36} />
              </div>
              <h3 className="text-4xl font-black text-black mb-6 tracking-tight">{f.title}</h3>
              <p className="text-black/40 text-lg font-medium leading-relaxed mb-10">{f.desc}</p>
              <div className="text-[10px] font-black tracking-[0.4em] text-black/20 uppercase">Protocol Infrastructure</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CtaSection (Stunning Redesign) ────────────────────────── */
function CtaSection({ handleConnect }: any) {
  return (
    <section className="w-full py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-fuchsia-900/20" />
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[60px] p-16 sm:p-24"
        >
          <h2 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-[0.8] mb-12">
            Claim Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 underline decoration-indigo-500/30 underline-offset-[20px]">Identity.</span>
          </h2>
          <p className="text-xl sm:text-2xl text-white/40 mb-16 font-medium max-w-xl mx-auto">
            Ready to link your physical craft to digital permanence? The portal is open.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button onClick={handleConnect}
              className="px-14 py-6 bg-white text-black font-black rounded-3xl hover:bg-indigo-500 hover:text-white transition-all duration-500 uppercase tracking-widest text-xl shadow-2xl shadow-white/10">
              Create Drop
            </button>
            <button onClick={handleConnect}
              className="px-14 py-6 bg-black border-2 border-white/20 text-white font-black rounded-3xl hover:border-white transition-all uppercase tracking-widest text-xl">
              Buy NFT
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Phygital Footer (Redesigned) ───────────────────────────── */
function PhygitalFooter({ scroll }: { scroll: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const animRef = useRef<number>(0);
  const startedRef = useRef(false);

  const runAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const oc = off.getContext("2d")!;
    const fontSize = Math.min(W / 4.5, 240);
    oc.fillStyle = "#fff";
    oc.font = `900 ${fontSize}px Inter, sans-serif`;
    oc.textAlign = "center";
    oc.textBaseline = "middle";
    oc.letterSpacing = "2px";
    oc.fillText("PHYGITAL", W / 2, H / 2);

    const imgData = oc.getImageData(0, 0, W, H).data;
    const targets: { x: number; y: number }[] = [];
    // Increase density for "Complete Text" feel
    for (let y = 0; y < H; y += 3) {
      for (let x = 0; x < W; x += 3) {
        if (imgData[(y * W + x) * 4 + 3] > 120) targets.push({ x, y });
      }
    }
    const MAX = 3500; // Much higher density
    const sampled = targets.length > MAX
      ? targets.filter((_, i) => i % Math.ceil(targets.length / MAX) === 0)
      : targets;

    const particles = sampled.map(t => ({
      x: Math.random() * W, y: Math.random() * H + H, // Start from bottom
      tx: t.x, ty: t.y, 
      r: Math.random() * 1.8 + 1, // Slightly larger particles
      color: `hsla(${240 + Math.random() * 60}, 100%, 75%, ${0.5 + Math.random() * 0.5})`
    }));

    let frame = 0;
    const FRAMES = 120;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame = Math.min(frame + 1, FRAMES);
      particles.forEach(p => {
        // Dynamic easing for snappy assembly
        p.x += (p.tx - p.x) * 0.08;
        p.y += (p.ty - p.y) * 0.08;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (frame < FRAMES || particles.some(p => Math.abs(p.x - p.tx) > 0.5)) {
        animRef.current = requestAnimationFrame(draw);
      }
    };
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !startedRef.current) {
        startedRef.current = true;
        setTimeout(runAnimation, 150);
      }
    }, { threshold: 0.1 });
    obs.observe(section);
    return () => { obs.disconnect(); cancelAnimationFrame(animRef.current); };
  }, [runAnimation]);

  return (
    <footer ref={sectionRef as any} className="w-full bg-[#050508] text-white overflow-hidden">
      {/* High-Impact Particle Branding */}
      <div className="relative w-full border-t border-white/5" style={{ height: "clamp(200px, 25vw, 400px)" }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-4 gap-16 items-start border-t border-white/5">
        {/* Brand + Contacts */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 flex items-center justify-center">
                <img src={phygitalLogo} alt="Logo" className="w-full h-full object-contain" />
             </div>
             <span className="text-2xl font-black tracking-tighter">Phygital</span>
           </div>
           <p className="text-white/40 text-sm font-medium max-w-xs leading-relaxed">
             Bridging the atomic and the digital worlds through immutable proof of reality.
           </p>
           <div className="flex items-center gap-4">
             <a href="mailto:tanish@phygital.xyz" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Mail size={20} />
             </a>
             <a href="https://github.com/tanishsunitapareek" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Github size={20} />
             </a>
             <a href="https://linkedin.com/in/tanishsunitapareek" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Linkedin size={20} />
             </a>
           </div>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
           <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Platform</h4>
           <div className="flex flex-col gap-4">
             {[["Protocol Journey","how-it-works"],["Create Drop","create"],["Technology","features"]].map(([lbl,id]) => (
               <button key={id} onClick={() => scroll(id)} className="text-sm font-bold text-white/50 hover:text-white transition-colors text-left">{lbl}</button>
             ))}
             <Link href="/explore" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Marketplace</Link>
           </div>
        </div>

        {/* Resources */}
        <div className="space-y-6">
           <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Developer</h4>
           <div className="flex flex-col gap-4">
             <a href="https://github.com/trigno1" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/50 hover:text-white flex items-center gap-2">GitHub <ExternalLink size={14} /></a>
             <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/50 hover:text-white flex items-center gap-2">BaseScan <ExternalLink size={14} /></a>
             <a href="https://www.linkedin.com/in/tanish-sunita-pareek/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/50 hover:text-white flex items-center gap-2">LinkedIn <ExternalLink size={14} /></a>
           </div>
        </div>

        {/* Legal + Credits */}
        <div className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
           <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Credits</h4>
           <div className="space-y-1">
             <p className="text-lg font-black">Tanish S. Pareek</p>
             <p className="text-xs text-white/40 font-medium">BCA Semester 5 Project · 2025</p>
           </div>
           <div className="pt-4 border-t border-white/5 space-y-2">
             <p className="text-[10px] text-white/20 uppercase tracking-widest leading-loose">
               Built on Base Network<br />
               Privacy · Terms · Legal
             </p>
           </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 pb-12 flex justify-between items-center text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
         <span>Encrypted Connectivity</span>
         <span>Phygital Protocol v1.0</span>
      </div>
    </footer>
  );
}
