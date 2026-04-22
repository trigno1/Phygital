'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wallet, LogOut, CreditCard, QrCode, X, ExternalLink,
  Plus, Copy, Check, ShieldCheck, Lock, Users, Calendar,
  BarChart2, Sparkles, Activity, Download, Compass, User,
} from "lucide-react"
import {
  AutoConnect, ConnectButton, lightTheme, MediaRenderer,
  useActiveAccount, useActiveWallet, useActiveWalletConnectionStatus,
  useDisconnect, useReadContract,
} from 'thirdweb/react'
import { chain, client } from '@/app/const/client'
import { contract } from '@/app/contract'
import { getOwnedNFTs } from 'thirdweb/extensions/erc1155'
import QRScanner from './QRScanner'
import { inAppWallet } from "thirdweb/wallets"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

type Tab = "collected" | "drops"

interface Drop {
  id: string
  name: string
  description: string
  image: string
  category: string | null
  claimsCount: number
  scansCount: number
  maxClaims: number | null
  minted: boolean
  isSoulbound: boolean
  password: string | null
  expiresAt: string | null
  issuedAt: string | null
  createdAt: string
}

export function DashboardComponent() {
  const account = useActiveAccount()
  const status = useActiveWalletConnectionStatus()
  const { disconnect } = useDisconnect()
  const wallet = useActiveWallet()
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("collected")
  const [myDrops, setMyDrops] = useState<Drop[]>([])
  const [dropsLoading, setDropsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrLoadingId, setQrLoadingId] = useState<string | null>(null)

  const { data: ownedNFTs, isLoading: isLoadingOwnedNFTs } = useReadContract(
    getOwnedNFTs,
    { contract, address: account?.address as string }
  )

  const fetchMyDrops = useCallback(async () => {
    if (!account?.address) return
    setDropsLoading(true)
    try {
      const message = `Authorize Phygital Access for ${account.address}`
      const signature = await account.signMessage({ message })

      const res = await fetch(`/api/my-drops?address=${account.address}`, {
        headers: {
          "x-signature": signature,
          "x-address": account.address,
        },
      })
      const data = await res.json()
      if (res.ok) setMyDrops(data.drops)
    } catch {
      toast.error("Could not fetch your drops")
    } finally {
      setDropsLoading(false)
    }
  }, [account?.address])

  useEffect(() => {
    if (activeTab === "drops" && account?.address) fetchMyDrops()
  }, [activeTab, account?.address, fetchMyDrops])

  const copyClaimLink = async (id: string) => {
    const url = `${window.location.origin}/claim?id=${id}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success("Claim link copied!", { description: "Share it anywhere — no QR needed." })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const downloadQR = async (drop: Drop) => {
    if (!account) return
    setQrLoadingId(drop.id)
    try {
      const message = `Authorize Phygital Access for ${account.address}`
      const signature = await account.signMessage({ message })
      const res = await fetch(`/api/qr?id=${drop.id}`, {
        headers: {
          "x-signature": signature,
          "x-address": account.address,
        },
      })
      const data = await res.json()
      if (!res.ok) { toast.error("Failed to regenerate QR"); return }
      const link = document.createElement("a")
      link.href = data.qrDataUrl
      link.download = `phygital-qr-${drop.name.replace(/\s+/g, "-").toLowerCase()}.png`
      link.click()
      toast.success("QR downloaded!", { description: `phygital-qr-${drop.name.toLowerCase()}.png` })
    } catch {
      toast.error("Could not download QR")
    } finally {
      setQrLoadingId(null)
    }
  }

  const customLightTheme = lightTheme({
    colors: {
      primaryButtonBg: "#3b3486",
      primaryButtonText: "#ffffff",
      modalBg: "#ffffff",
      borderColor: "#e5e7eb",
    }
  })

  const getDropStatus = (drop: Drop) => {
    const now = new Date()
    if (drop.expiresAt && new Date(drop.expiresAt) < now) return { label: "Expired", color: "text-red-600 bg-red-50 border-red-200" }
    if (drop.maxClaims && drop.claimsCount >= drop.maxClaims) return { label: "Sold Out", color: "text-amber-600 bg-amber-50 border-amber-200" }
    return { label: "Active", color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] text-black relative selection:bg-indigo-500/30" style={{ fontFamily: "Inter, sans-serif" }}>
      <AutoConnect client={client} />

      {/* Background Ambience — matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-70" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 opacity-50" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
      </div>

      {/* Header — monochrome pill style */}
      <header className="relative z-10 border-b border-black/5 bg-white/60 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto py-3 px-4 sm:px-6 lg:px-10 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-110">
              <Image src="/phygital_ultra_logo.png" alt="Phygital Logo" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black text-black tracking-tighter">Phygital</span>
          </Link>
          {account && wallet && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/explore">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black/60 hover:text-black bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-all">
                  <Compass className="h-4 w-4" /> <span className="hidden sm:inline">Explore</span>
                </button>
              </Link>
              <Link href="/profile">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black/60 hover:text-black bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-all">
                  <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
                </button>
              </Link>
              <Link href="/create">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black/60 hover:text-black bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-all">
                  <QrCode className="h-4 w-4" /> <span className="hidden sm:inline">Create</span>
                </button>
              </Link>
              <button onClick={() => { if (wallet) disconnect(wallet); toast.success("Signed out successfully") }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto py-10 px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="sm:px-0">
          {account ? (
            <>
              {/* Greeting */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }} 
                className="mb-10"
              >
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/5 border border-black/5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em]">Base Sepolia Network</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-[-0.04em] leading-[1.05]">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500 font-mono tracking-normal text-3xl sm:text-4xl lg:text-5xl">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                </h2>
                <p className="text-black/40 mt-3 font-medium text-lg sm:text-xl max-w-2xl">Here's an overview of your Phygital assets.</p>
              </motion.div>

              {/* Stats row */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.1 }} 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {/* Wallet card */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white border border-black/5 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] p-6 sm:p-8">
                  <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Connected Wallet</span>
                  <div className="mt-4">
                    <ConnectButton client={client} theme={customLightTheme} chain={chain} />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Collected NFTs stat */}
                  <div className="bg-white border border-black/5 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center bg-black/5 w-11 h-11 rounded-2xl mb-4">
                        <Wallet className="h-5 w-5 text-black/70" />
                      </div>
                      <span className="text-xs font-bold text-black/40 uppercase tracking-wider">Collected</span>
                      <div className="text-5xl font-black text-black tracking-tight mt-1">{ownedNFTs?.length ?? 0}</div>
                    </div>
                  </div>

                  {/* My Drops stat */}
                  <div className="bg-white border border-black/5 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center bg-black/5 w-11 h-11 rounded-2xl mb-4">
                        <Activity className="h-5 w-5 text-black/70" />
                      </div>
                      <span className="text-xs font-bold text-black/40 uppercase tracking-wider">Drops</span>
                      <div className="text-5xl font-black text-black tracking-tight mt-1">{myDrops.length}</div>
                    </div>
                  </div>

                  {/* QR Scanner CTA */}
                  <div className="col-span-2 lg:col-span-1 flex items-stretch">
                    <QRScanner trigger={
                      <div className="w-full h-full bg-black rounded-[28px] p-6 flex flex-col items-start justify-between relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        {/* Decorative */}
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
                        
                        <div className="relative z-10 p-2.5 bg-white/10 rounded-2xl backdrop-blur-md mb-2 group-hover:rotate-12 transition-transform duration-500">
                          <QrCode className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="relative z-10 w-full mt-auto">
                          <h3 className="text-white font-black text-xl tracking-tight leading-tight mb-1 group-hover:translate-x-1 transition-transform uppercase">
                            Scan Asset
                          </h3>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em]">Instant Auth</span>
                            <div className="h-1 w-8 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white w-1/3 animate-shimmer" />
                            </div>
                          </div>
                        </div>

                        {/* Animated glint */}
                        <div className="absolute inset-0 border border-white/10 rounded-[28px]" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      </div>
                    } />
                  </div>
                </div>
              </motion.div>

              {/* ── TABS ── */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.2 }} 
                className="mt-14"
              >
                <div className="flex items-center gap-2 mb-8">
                  {([
                    { id: "collected" as Tab, label: "My Collection", icon: Wallet },
                    { id: "drops" as Tab, label: "My Drops", icon: BarChart2 },
                  ] as { id: Tab; label: string; icon: React.ElementType }[]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-2.5 font-black text-sm rounded-full transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
                          : "text-black/40 hover:text-black hover:bg-black/5"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                      {tab.id === "collected" && ownedNFTs && ownedNFTs.length > 0 && (
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          activeTab === tab.id ? "bg-white/20 text-white" : "bg-black/5 text-black/50"
                        }`}>
                          {ownedNFTs.length}
                        </span>
                      )}
                      {tab.id === "drops" && myDrops.length > 0 && (
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          activeTab === tab.id ? "bg-white/20 text-white" : "bg-black/5 text-black/50"
                        }`}>
                          {myDrops.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── COLLECTED NFTs Panel ── */}
                {activeTab === "collected" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4 }} 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
                  >
                    {!isLoadingOwnedNFTs && ownedNFTs ? (
                      ownedNFTs.length > 0 ? (
                        ownedNFTs.map((nft) => (
                          <div key={nft.id} onClick={() => setSelectedNFT(nft)}
                            className="bg-white border border-black/5 p-3.5 rounded-[20px] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] flex flex-col items-center hover:scale-[1.03] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 group cursor-pointer">
                            <div className="rounded-[14px] overflow-hidden w-full aspect-square relative bg-[#f8f9ff]">
                              <MediaRenderer client={client} src={nft.metadata.image} width='100%' height='100%'
                                style={{ objectFit: 'cover', borderRadius: '14px' }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-xs font-black uppercase tracking-wider">View Details →</p>
                              </div>
                            </div>
                            <div className="mt-4 mb-2 w-full text-left px-1">
                              <span className="text-[10px] font-black text-black/30 mb-1 block uppercase tracking-[0.15em]">Asset</span>
                              <h3 className="text-sm font-bold text-black truncate">{nft.metadata.name}</h3>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-black/5 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] mt-4">
                          <div className="bg-black/5 p-5 rounded-2xl mb-6 relative">
                            <Wallet className="h-10 w-10 text-black/70 relative z-10" />
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-black text-black mb-3 tracking-[-0.03em]">Build your collection</h3>
                          <p className="text-base text-black/40 text-center max-w-md mb-8 leading-relaxed font-medium">
                            Your smart wallet is empty. Scan a physical Phygital QR code to instantly mint a digital asset.
                          </p>
                          <div className="w-full max-w-sm px-4">
                            <QRScanner trigger={
                              <div className="w-full bg-black rounded-[20px] p-5 flex items-center gap-4 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md relative z-10">
                                  <QrCode className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left relative z-10">
                                  <h3 className="text-white font-black text-sm tracking-tight uppercase">Launch Scanner</h3>
                                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Connect Physical Asset</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                              </div>
                            } />
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="bg-white border border-black/5 p-3.5 rounded-[20px] shadow-sm flex flex-col items-center">
                            <Skeleton className="rounded-[14px] w-full aspect-square mb-4" />
                            <div className="w-full text-left px-1 flex flex-col gap-2">
                              <Skeleton className="h-3 w-1/3" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── MY DROPS Panel ── */}
                {activeTab === "drops" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4 }}
                  >
                    {dropsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white border border-black/5 rounded-[24px] shadow-sm p-6 flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                              <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
                              <div className="flex-1 flex flex-col gap-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <Skeleton className="h-14 rounded-xl" />
                              <Skeleton className="h-14 rounded-xl" />
                              <Skeleton className="h-14 rounded-xl" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : myDrops.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center bg-white border border-black/5 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] mt-4 text-center px-4">
                        <div className="bg-black/5 p-5 rounded-2xl mb-6">
                          <Sparkles className="h-10 w-10 text-black/70" />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-black mb-3 tracking-[-0.03em]">No drops yet</h3>
                        <p className="text-base text-black/40 max-w-md mb-8 leading-relaxed font-medium">
                          Create your first NFT drop and distribute it as a QR code anywhere in the physical world.
                        </p>
                        <Link href="/create">
                          <button className="group relative px-8 py-4 bg-black text-white font-black rounded-[20px] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-2 uppercase tracking-widest text-sm">
                            <Plus className="h-4 w-4" /> Create Your First Drop
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {myDrops.map((drop) => {
                          const status = getDropStatus(drop)
                          const progress = drop.maxClaims
                            ? Math.min(100, Math.round((drop.claimsCount / drop.maxClaims) * 100))
                            : null

                          return (
                            <div key={drop.id} className="bg-white border border-black/5 rounded-[24px] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-4 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:scale-[1.01] transition-all duration-300 group">
                              {/* Top: image + name */}
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#f8f9ff] border border-black/5 flex-shrink-0">
                                  <img
                                    src={drop.image?.startsWith("ipfs://")
                                      ? drop.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                                      : drop.image}
                                    alt={drop.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-black text-black text-sm truncate">{drop.name}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${status.color}`}>
                                      {status.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-black/30 line-clamp-2 font-medium">{drop.description}</p>
                                </div>
                              </div>

                              {/* Analytics */}
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div className="bg-black/[0.03] rounded-xl py-2.5 border border-black/5">
                                    <p className="text-[9px] uppercase font-black text-black/30 mb-0.5 tracking-wider">Scans</p>
                                    <p className="text-sm font-black text-black">{drop.scansCount || 0}</p>
                                  </div>
                                  <div className="bg-black/[0.03] rounded-xl py-2.5 border border-black/5">
                                    <p className="text-[9px] uppercase font-black text-black/30 mb-0.5 tracking-wider">Claims</p>
                                    <p className="text-sm font-black text-black">{drop.claimsCount}{drop.maxClaims ? `/${drop.maxClaims}` : ""}</p>
                                  </div>
                                  <div className="bg-black/[0.03] rounded-xl py-2.5 border border-black/5">
                                    <p className="text-[9px] uppercase font-black text-black/30 mb-0.5 tracking-wider">Conversion</p>
                                    <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                                      {drop.scansCount > 0 ? Math.round((drop.claimsCount / drop.scansCount) * 100) : 0}%
                                    </p>
                                  </div>
                                </div>
                                {progress !== null && (
                                  <div className="w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_100%] rounded-full transition-all animate-[splash-gradient-shift_3s_linear_infinite]"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-1.5">
                                {drop.isSoulbound && (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-black/50 bg-black/[0.03] border border-black/5 px-2 py-0.5 rounded-full">
                                    <ShieldCheck className="h-2.5 w-2.5" /> Soulbound
                                  </span>
                                )}
                                {drop.password && (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-black/50 bg-black/[0.03] border border-black/5 px-2 py-0.5 rounded-full">
                                    <Lock className="h-2.5 w-2.5" /> Gated
                                  </span>
                                )}
                                {drop.category && (
                                  <span className="text-[10px] font-black text-black/40 bg-black/[0.03] border border-black/5 px-2 py-0.5 rounded-full capitalize">
                                    {drop.category}
                                  </span>
                                )}
                                {drop.expiresAt && (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-black/40 bg-black/[0.03] border border-black/5 px-2 py-0.5 rounded-full">
                                    <Calendar className="h-2.5 w-2.5" /> {new Date(drop.expiresAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2 border-t border-black/5">
                                <button
                                  onClick={() => copyClaimLink(drop.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black text-black/60 bg-black/[0.03] hover:bg-black/[0.07] border border-black/5 py-2.5 rounded-[14px] transition-all"
                                >
                                  {copiedId === drop.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  {copiedId === drop.id ? "Copied!" : "Copy Link"}
                                </button>
                                <a
                                  href={`/claim?id=${drop.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black text-black/60 bg-black/[0.03] hover:bg-black/[0.07] border border-black/5 py-2.5 rounded-[14px] transition-all"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                                </a>
                                <button
                                  onClick={() => downloadQR(drop)}
                                  disabled={qrLoadingId === drop.id}
                                  className="flex items-center justify-center gap-1 text-xs font-black text-black/60 bg-black/[0.03] hover:bg-black/[0.07] border border-black/5 py-2.5 px-3.5 rounded-[14px] transition-all disabled:opacity-60"
                                  title="Re-download QR Code"
                                >
                                  {qrLoadingId === drop.id
                                    ? <span className="animate-spin h-3 w-3 border border-black/40 border-t-transparent rounded-full" />
                                    : <Download className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              {status === "connecting" ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-black/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
                  </div>
                  <p className="text-black/40 font-bold text-sm uppercase tracking-[0.2em]">Authenticating</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white p-12 sm:p-16 rounded-[28px] border border-black/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] max-w-lg mx-auto">
                  <div className="bg-black/5 p-5 rounded-2xl mb-8">
                    <Wallet className="h-12 w-12 text-black/70" />
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-black mb-4 tracking-[-0.04em]">
                    Welcome{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500">Back</span>
                  </h2>
                  <p className="text-black/40 mb-10 max-w-sm leading-relaxed font-medium text-base">Connect your invisible wallet or continue as a guest to access your dashboard.</p>
                  <ConnectButton client={client} theme={customLightTheme}
                    wallets={[inAppWallet({ auth: { options: ["google", "email", "passkey", "guest"] } })]} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* NFT Details Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setSelectedNFT(null)} />
          <div className="bg-white rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Gradient header strip */}
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500" />
            <div className="flex items-center justify-between p-5 border-b border-black/5">
              <h3 className="font-black text-lg text-black tracking-tight">Asset Details</h3>
              <button onClick={() => setSelectedNFT(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="h-5 w-5 text-black/40" />
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-[16px] overflow-hidden aspect-square w-full bg-[#f8f9ff] mb-6 border border-black/5">
                <MediaRenderer client={client} src={selectedNFT.metadata.image} width="100%" height="100%" style={{ objectFit: 'cover' }} />
              </div>
              <h4 className="text-xl font-black text-black mb-2 truncate tracking-tight" title={selectedNFT.metadata.name}>{selectedNFT.metadata.name}</h4>
              {selectedNFT.metadata.description && (
                <p className="text-black/40 mb-6 text-sm leading-relaxed line-clamp-3 font-medium">{selectedNFT.metadata.description}</p>
              )}
              <div className="bg-black/[0.03] rounded-[16px] p-4 border border-black/5 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black/40 font-bold">Token ID</span>
                  <span className="font-mono font-black text-black">#{selectedNFT.id.toString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black/40 font-bold">Network</span>
                  <span className="font-black text-black">Base Sepolia</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black/40 font-bold">Standard</span>
                  <span className="font-black text-black">ERC-1155</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <a
                  href={`https://testnets.opensea.io/assets/base-sepolia/0xe5492494c0423394A4a1FaaB6E733C35580F9BF9/${selectedNFT.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white py-3.5 px-4 rounded-[16px] font-black text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] uppercase tracking-wider"
                  onClick={() => toast.info("Opening on OpenSea Testnet...")}
                >
                  View on OpenSea <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={`https://sepolia.basescan.org/token/0xe5492494c0423394A4a1FaaB6E733C35580F9BF9?a=${selectedNFT.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-black/[0.04] hover:bg-black/[0.08] text-black py-3.5 px-4 rounded-[16px] font-black text-sm transition-all border border-black/5 uppercase tracking-wider"
                  onClick={() => toast.info("Opening BaseScan...")}
                >
                  Verify on BaseScan <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}