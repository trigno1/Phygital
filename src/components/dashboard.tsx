'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wallet, LogOut, CreditCard, QrCode, X, ExternalLink,
  Plus, Copy, Check, ShieldCheck, Lock, Users, Calendar,
  BarChart2, Sparkles, Activity,
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

  const { data: ownedNFTs, isLoading: isLoadingOwnedNFTs } = useReadContract(
    getOwnedNFTs,
    { contract, address: account?.address as string }
  )

  const fetchMyDrops = useCallback(async () => {
    if (!account?.address) return
    setDropsLoading(true)
    try {
      const res = await fetch(`/api/my-drops?address=${account.address}`)
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
    <div className="flex flex-col min-h-screen bg-white text-stone-900 relative selection:bg-indigo-500/30">
      <AutoConnect client={client} />

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      {/* Header */}
      <header className="glass relative z-10 border-b border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Phygital Logo" width={32} height={32} className="rounded-xl shadow-sm" />
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Phygital</h1>
          </Link>
          {account && wallet && (
            <div className="flex items-center gap-3">
              <Link href="/create">
                <Button variant="outline" className="flex items-center text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-all font-semibold shadow-sm">
                  <QrCode className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Create QR</span>
                </Button>
              </Link>
              <Button onClick={() => { disconnect(wallet); toast.success("Signed out successfully") }} variant="outline"
                className="flex items-center text-stone-600 border-stone-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium shadow-sm">
                <LogOut className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          {account ? (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-white/80 backdrop-blur-md border-stone-100 shadow-sm rounded-2xl">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-start space-y-4">
                      <span className="text-sm font-semibold text-stone-400 uppercase tracking-widest">Connected Wallet</span>
                      <ConnectButton client={client} theme={customLightTheme} chain={chain} />
                    </div>
                  </CardContent>
                </Card>

                <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white/80 backdrop-blur-md border border-stone-100 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="pt-6 relative z-10">
                      <div className="flex flex-col items-start space-y-2">
                        <div className="flex items-center justify-center bg-indigo-50 w-10 h-10 rounded-full mb-2">
                          <Wallet className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-stone-500">Collected NFTs</span>
                        <span className="text-4xl font-bold text-stone-900 tracking-tight">{ownedNFTs?.length ?? 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-md border border-stone-100 shadow-sm rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="pt-6 relative z-10">
                      <div className="flex flex-col items-start space-y-2">
                        <div className="flex items-center justify-center bg-blue-50 w-10 h-10 rounded-full mb-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-stone-500">My Drops</span>
                        <span className="text-4xl font-bold text-stone-900 tracking-tight">{myDrops.length}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="col-span-2 lg:col-span-1 flex items-stretch">
                    <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-center p-4 hover:bg-indigo-50 transition-all duration-300">
                      <QRScanner />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TABS ── */}
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-8 border-b border-stone-100 pb-0">
                  {([
                    { id: "collected" as Tab, label: "My Collection", icon: Wallet },
                    { id: "drops" as Tab, label: "My Drops", icon: BarChart2 },
                  ] as { id: Tab; label: string; icon: React.ElementType }[]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
                        activeTab === tab.id
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                      {tab.id === "collected" && ownedNFTs && ownedNFTs.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {ownedNFTs.length}
                        </span>
                      )}
                      {tab.id === "drops" && myDrops.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {myDrops.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── COLLECTED NFTs Panel ── */}
                {activeTab === "collected" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {!isLoadingOwnedNFTs && ownedNFTs ? (
                      ownedNFTs.length > 0 ? (
                        ownedNFTs.map((nft) => (
                          <div key={nft.id} onClick={() => setSelectedNFT(nft)}
                            className="bg-white border border-stone-100 p-3 rounded-2xl shadow-sm flex flex-col items-center hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer">
                            <div className="rounded-xl overflow-hidden w-full aspect-square relative bg-stone-50">
                              <MediaRenderer client={client} src={nft.metadata.image} width='100%' height='100%'
                                style={{ objectFit: 'cover', borderRadius: '0.75rem' }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-xs font-medium">View Details →</p>
                              </div>
                            </div>
                            <div className="mt-4 mb-2 w-full text-left px-1">
                              <span className="text-xs font-semibold text-indigo-500 mb-1 block uppercase tracking-wider">Asset</span>
                              <h3 className="text-sm font-bold text-stone-800 truncate">{nft.metadata.name}</h3>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-stone-50/50 border border-stone-200 border-dashed rounded-3xl mt-4">
                          <div className="bg-indigo-100/50 p-5 rounded-full mb-6 relative">
                            <div className="absolute inset-0 bg-indigo-200 animate-ping rounded-full opacity-20" />
                            <Wallet className="h-10 w-10 text-indigo-600 relative z-10" />
                          </div>
                          <h3 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">Build your collection now</h3>
                          <p className="text-base text-stone-500 text-center max-w-md mb-8 leading-relaxed">
                            Your smart wallet is empty. Scan a physical Phygital QR code to instantly mint a digital asset.
                          </p>
                          <div className="w-full max-w-sm px-4"><QRScanner /></div>
                        </div>
                      )
                    ) : (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-6" />
                        <p className="text-stone-500 font-medium tracking-wide">Syncing blockchain...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── MY DROPS Panel ── */}
                {activeTab === "drops" && (
                  <div>
                    {dropsLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-6" />
                        <p className="text-stone-500 font-medium tracking-wide">Loading your drops...</p>
                      </div>
                    ) : myDrops.length === 0 ? (
                      <div className="py-16 flex flex-col items-center justify-center bg-stone-50/50 border border-stone-200 border-dashed rounded-3xl mt-4 text-center px-4">
                        <div className="bg-indigo-100/50 p-5 rounded-full mb-6">
                          <Sparkles className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">No drops yet</h3>
                        <p className="text-base text-stone-500 max-w-md mb-8 leading-relaxed">
                          Create your first NFT drop and distribute it as a QR code anywhere in the physical world.
                        </p>
                        <Link href="/create">
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl shadow-md">
                            <Plus className="mr-2 h-4 w-4" /> Create Your First Drop
                          </Button>
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
                            <div key={drop.id} className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-lg hover:border-stone-200 transition-all group">
                              {/* Top: image + name */}
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
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
                                    <h3 className="font-bold text-stone-900 text-sm truncate">{drop.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                                      {status.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-400 line-clamp-2">{drop.description}</p>
                                </div>
                              </div>

                              {/* Analytics */}
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div className="bg-stone-50 rounded-lg py-2 border border-stone-100">
                                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">Scans</p>
                                    <p className="text-sm font-bold text-stone-800">{drop.scansCount || 0}</p>
                                  </div>
                                  <div className="bg-stone-50 rounded-lg py-2 border border-stone-100">
                                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">Claims</p>
                                    <p className="text-sm font-bold text-stone-800">{drop.claimsCount}{drop.maxClaims ? `/${drop.maxClaims}` : ""}</p>
                                  </div>
                                  <div className="bg-stone-50 rounded-lg py-2 border border-stone-100">
                                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">Conversion</p>
                                    <p className="text-sm font-bold text-indigo-600">
                                      {drop.scansCount > 0 ? Math.round((drop.claimsCount / drop.scansCount) * 100) : 0}%
                                    </p>
                                  </div>
                                </div>
                                {progress !== null && (
                                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-1.5">
                                {drop.isSoulbound && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    <ShieldCheck className="h-2.5 w-2.5" /> Soulbound
                                  </span>
                                )}
                                {drop.password && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                                    <Lock className="h-2.5 w-2.5" /> Gated
                                  </span>
                                )}
                                {drop.category && (
                                  <span className="text-[10px] font-bold text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full capitalize">
                                    {drop.category}
                                  </span>
                                )}
                                {drop.expiresAt && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                    <Calendar className="h-2.5 w-2.5" /> {new Date(drop.expiresAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-1 border-t border-stone-50">
                                <button
                                  onClick={() => copyClaimLink(drop.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 py-2 rounded-xl transition-all"
                                >
                                  {copiedId === drop.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  {copiedId === drop.id ? "Copied!" : "Copy Link"}
                                </button>
                                <a
                                  href={`/claim?id=${drop.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200 py-2 rounded-xl transition-all"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                                </a>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              {status === "connecting" ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600" />
                  <p className="mt-6 text-stone-500 font-medium tracking-wide">Authenticating...</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-md p-12 rounded-[2rem] border border-stone-100 shadow-xl max-w-md mx-auto">
                  <div className="bg-indigo-50 p-4 rounded-full mb-6">
                    <Wallet className="h-12 w-12 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-3 tracking-tight">Welcome Back</h2>
                  <p className="text-stone-500 mb-8 max-w-xs leading-relaxed">Connect your invisible wallet or continue as a guest to access your dashboard.</p>
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
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedNFT(null)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h3 className="font-bold text-lg text-stone-900">Asset Details</h3>
              <button onClick={() => setSelectedNFT(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-xl overflow-hidden aspect-square w-full bg-stone-50 mb-6 border border-stone-100">
                <MediaRenderer client={client} src={selectedNFT.metadata.image} width="100%" height="100%" style={{ objectFit: 'cover' }} />
              </div>
              <h4 className="text-xl font-bold text-stone-900 mb-2 truncate" title={selectedNFT.metadata.name}>{selectedNFT.metadata.name}</h4>
              {selectedNFT.metadata.description && (
                <p className="text-stone-500 mb-6 text-sm leading-relaxed line-clamp-3">{selectedNFT.metadata.description}</p>
              )}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Token ID</span>
                  <span className="font-mono font-medium text-stone-900">#{selectedNFT.id.toString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Network</span>
                  <span className="font-medium text-stone-900">Base Sepolia</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Standard</span>
                  <span className="font-medium text-stone-900">ERC-1155</span>
                </div>
              </div>
              <a
                href={`https://testnets.opensea.io/assets/base-sepolia/0xe5492494c0423394A4a1FaaB6E733C35580F9BF9/${selectedNFT.id}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                onClick={() => toast.info("Opening on OpenSea Testnet...")}
              >
                View on OpenSea <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}