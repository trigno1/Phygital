'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Sparkles, Tag } from "lucide-react"
import { ConnectButton, lightTheme, MediaRenderer, useActiveAccount } from 'thirdweb/react'
import { chain, client } from '@/app/const/client'
import ReactConfetti from 'react-confetti'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import { Footer } from "@/components/footer"

type Attribute = {
  [key: string]: string | number;
};

type ClaimNft = {
  name: string;
  description: string;
  image: string;
  attributes: Attribute;
  minted: boolean;
  owner: string;
  id: string;
};

interface ClaimNftProps {
  nft: ClaimNft;
}

export function ClaimNft({ nft }: ClaimNftProps) {
  const router = useRouter()
  const account = useActiveAccount();
  const [isClaiming, setIsClaiming] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleClaim = async () => {
    setIsClaiming(true)
    try {
      const response = await fetch('/api/claimNFT', {
        method: 'POST',
        body: JSON.stringify({ 
          id: nft.id, 
          address: account?.address 
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowModal(true)
        setShowConfetti(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative text-stone-900 selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]" />
      </div>

      {showConfetti && <ReactConfetti style={{ zIndex: 100 }} />}

      {/* Header */}
      <header className="glass relative z-10 border-b border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-200 pl-0"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>

          <ConnectButton
            client={client}
            theme={lightTheme({
              colors: {
                primaryButtonBg: "#4f46e5",
                primaryButtonText: "#ffffff",
              }
            })}
            chain={chain}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full relative z-10 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Direct Claim
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Claim Your NFT
          </h1>
          <p className="mt-4 text-stone-500 max-w-lg mx-auto">
            Connect your wallet to securely receive this digital asset directly into your portfolio.
          </p>
        </div>

        <div className="w-full max-w-md bg-white border border-stone-100 rounded-[2rem] shadow-xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
          {/* Subtle inner background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-100/50 rounded-full blur-3xl -z-10" />

          <div className="w-64 h-64 mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-stone-50 flex items-center justify-center">
            <MediaRenderer
              client={client}
              src={nft.image}
              width='100%'
              height='100%'
              style={{ objectFit: 'cover' }}
            />
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mb-2 text-center">{nft.name}</h2>
          <p className="text-stone-500 text-center mb-8 text-sm leading-relaxed">
            {nft.description}
          </p>

          {/* Attributes */}
          {nft.attributes && Object.keys(nft.attributes).length > 0 && (
            <div className="w-full mb-8">
              <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-500" /> Attributes
              </h3>
              <div className="grid grid-cols-2 gap-3 w-full">
                {Object.keys(nft.attributes).map((key) => (
                  <div key={key} className="flex flex-col bg-stone-50 border border-stone-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{key}</p>
                    <p className="text-sm font-medium text-stone-800 break-words">
                      {nft.attributes[key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full mt-auto pt-4 border-t border-stone-100">
            {nft.minted ? (
              <Button disabled className="w-full py-6 text-lg rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Check className="mr-2 h-5 w-5" /> Already Claimed
              </Button>
            ) : (
              account ? (
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full py-6 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isClaiming ? (
                    <><div className="animate-spin mr-3 h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> Minting Asset...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Claim Now</>
                  )}
                </Button>
              ) : (
                <Button disabled className="w-full py-6 text-lg rounded-2xl bg-stone-100 text-stone-400 font-bold border border-stone-200">
                  Connect Wallet First
                </Button>
              )
            )}
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white rounded-3xl border-stone-100 shadow-2xl sm:max-w-md p-8">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-stone-900">Successfully Claimed!</DialogTitle>
            <DialogDescription className="text-stone-500 text-base mt-2">
              The NFT <b>{nft.name}</b> has been safely minted and sent to your wallet. You can now view it in your dashboard collection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex-col sm:flex-col gap-3">
            <Button onClick={() => router.push('/dashboard')} className="w-full py-6 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white">
              Go to Dashboard
            </Button>
            <Button onClick={() => setShowModal(false)} variant="outline" className="w-full py-6 text-lg rounded-2xl border-stone-200 text-stone-600 hover:bg-stone-50 font-bold sm:ml-0">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}