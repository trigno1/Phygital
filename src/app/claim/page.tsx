"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import {
  ConnectButton,
  useActiveAccount,
  useConnectModal,
  lightTheme,
} from "thirdweb/react";

import { inAppWallet } from "thirdweb/wallets";
import { client, chain } from "@/app/const/client";
import { QrCode, ArrowLeft, AlertTriangle, Check, Sparkles, Twitter, Mail } from "lucide-react";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ClaimCertificate } from "@/components/claim-certificate";
import { toast } from "sonner";

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  minted: boolean;
  owner?: string;
  expiresAt?: string;
  issuedAt?: string;
  category?: string;
}

const indigoTheme = lightTheme({
  colors: {
    primaryButtonBg: "#3b3486",
    primaryButtonText: "#ffffff",
    modalBg: "#ffffff",
    borderColor: "#e5e7eb",
  }
});

function ClaimContent() {
  const searchParams = useSearchParams();
  let id = searchParams.get("id");

  // Clean encoded or nested URLs
  if (id?.includes("id=")) {
    id = id.split("id=")[1];
  }

  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimedAt, setClaimedAt] = useState<string>("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const account = useActiveAccount();
  const { connect } = useConnectModal();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // TASK 4: Fire-and-forget scan tracking
    fetch("/api/scan", {
      method: "POST",
      body: JSON.stringify({ id }),
    }).catch(() => {});

    async function fetchNFT() {
      try {
        const res = await fetch(`/api/nft?id=${id}`);
        const data = await res.json();
        if (res.ok) {
          setNft(data.nft);
        } else {
          setMessage("NFT not found.");
        }
      } catch (err) {
        console.error("Error fetching NFT:", err);
        setMessage("Failed to load NFT.");
      } finally {
        setLoading(false);
      }
    }

    fetchNFT();
  }, [id]);

  const handleClaim = async () => {
    if (!account?.address || !nft) return;
    setMinting(true);
    setMessage("Claiming your NFT...");

    try {
      const res = await fetch("/api/claimNFT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nft.id, address: account.address }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const now = new Date().toISOString();
        setMessage("🎉 NFT successfully minted on-chain!");
        setTxHash(data.txHash || null);
        setClaimedAt(now);
        setNft({ ...nft, minted: true, owner: account.address });

        // Auto-send email if user provided one
        if (email.trim()) {
          sendClaimEmail(data.txHash, now);
        }
      } else {
        const errMsg = data?.error?.message || data?.error || "Claim failed";
        setMessage(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      console.error("Claim error:", err);
      setMessage("Something went wrong while claiming.");
    } finally {
      setMinting(false);
    }
  };

  const sendClaimEmail = async (hash: string, claimed: string) => {
    if (!email.trim() || !nft || !account?.address) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/send-claim-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nftName: nft.name,
          nftImage: nft.image,
          txHash: hash,
          dropId: nft.id,
          walletAddress: account.address,
          claimedAt: claimed,
        }),
      });
      if (res.ok) {
        setEmailSent(true);
        toast.success("📧 Receipt sent to your email!");
      }
    } catch {
      // Silent fail — email is optional
    } finally {
      setSendingEmail(false);
    }
  };

  const handleConnect = async () => {
    await connect({
      client,
      chain,
      theme: indigoTheme,
      wallets: [inAppWallet({ auth: { options: ["google", "email", "passkey", "guest"] } })],
    });
  };

  // No ID state
  if (!id && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="bg-amber-50 p-4 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">No QR Code Detected</h2>
        <p className="text-stone-500 max-w-sm mb-8">
          This page requires a valid QR code scan to load an NFT. Please scan a Phygital QR code with your camera.
        </p>
        <Link href="/" className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
        <div className="w-full mb-8 flex justify-center">
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="w-full bg-white border border-stone-100 shadow-xl rounded-3xl overflow-hidden flex flex-col">
          <div className="w-full bg-indigo-50/50 border-b border-indigo-100 px-6 py-2.5">
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <div className="w-full aspect-square">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="p-6 w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!nft) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="bg-stone-100 p-4 rounded-full mb-6">
          <QrCode className="h-10 w-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">NFT Not Found</h2>
        <p className="text-stone-500 max-w-sm mb-2">{message || "This QR code doesn't match any active NFT drop."}</p>
        {id && <p className="text-xs text-stone-400 font-mono bg-stone-50 px-3 py-1.5 rounded-lg mt-2">ID: {id}</p>}
        <Link href="/" className="mt-8 text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
      {/* Wallet connect */}
      <div className="w-full mb-8 flex justify-center">
        <ConnectButton
          client={client}
          chain={chain}
          theme={indigoTheme}
          connectModal={{ size: "compact" }}
          wallets={[inAppWallet({ auth: { options: ["google", "email", "passkey", "guest"] } })]}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative"
      >
        <div className="perspective-[1500px]">
          <div className={`relative transition-transform duration-700 preserve-3d w-full ${nft.minted ? "rotate-y-180" : ""}`}>

            {/* FRONT OF CARD (Available) */}
            <div className={`bg-white border border-stone-100 shadow-xl rounded-3xl overflow-hidden w-full flex flex-col backface-hidden ${nft.minted ? "absolute top-0 left-0 opacity-0 pointer-events-none" : "relative"}`}>
              {/* Category badge */}
              {nft.category && (
                <div className="w-full bg-indigo-50 border-b border-indigo-100 px-6 py-2.5">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{nft.category}</span>
                </div>
              )}

              {/* NFT Image */}
              <div className="w-full aspect-square bg-stone-50">
                <img
                  src={nft.image?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* NFT Info */}
              <div className="p-6 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-stone-900">{nft.name}</h2>
                  <span className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Available
                  </span>
                </div>

                <p className="text-stone-500 font-medium leading-relaxed mb-6">{nft.description}</p>

                {/* Dates */}
                {(nft.issuedAt || nft.expiresAt) && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {nft.issuedAt && (
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Live From</p>
                        <p className="text-sm font-semibold text-stone-700">{new Date(nft.issuedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {nft.expiresAt && (
                      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Expires</p>
                        <p className="text-sm font-semibold text-red-700">{new Date(nft.expiresAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✉️ Optional email input */}
                {account && (
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                      <Mail className="inline h-3 w-3 mr-1 -mt-0.5" />
                      Email Receipt <span className="text-stone-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all bg-stone-50"
                    />
                    <p className="text-[10px] text-stone-400 mt-1.5 font-medium">
                      We&apos;ll send you a confirmation with your tx hash — no account needed.
                    </p>
                  </div>
                )}

                {/* Claim button */}
                <button
                  onClick={account ? handleClaim : handleConnect}
                  disabled={minting}
                  className={`w-full py-4 px-6 font-bold rounded-2xl transition-all text-base ${
                    minting
                      ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
                  }`}
                >
                  {minting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                      Claiming...
                    </span>
                  ) : account ? "Claim NFT to My Wallet" : "Connect & Claim"}
                </button>
                {message && !message.includes("🎉") && (
                  <div className="mt-4 p-3 rounded-xl text-sm font-medium w-full text-center bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* BACK OF CARD (Successfully Minted) */}
            <div className={`bg-white border border-stone-100 shadow-xl rounded-3xl overflow-hidden w-full flex flex-col items-center backface-hidden rotate-y-180 p-8 ${!nft.minted ? "absolute top-0 left-0 opacity-0 pointer-events-none" : "relative"}`}>
              <div className="w-full flex flex-col items-center text-center">
                {/* Flex Card */}
                <div className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl p-1 shadow-md mb-6 card-3d">
                  <div className="bg-white rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-100/50 rounded-full blur-3xl -z-10" />
                    <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                      <Check className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900 text-center mb-2">Claimed!</h3>
                    <p className="text-stone-500 text-sm text-center mb-6">
                      You are now the official owner.
                    </p>

                    <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-sm border border-stone-100 bg-stone-50 mb-4 flex items-center justify-center">
                      <img
                        src={nft.image?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                        className="w-full h-full object-cover"
                        alt={nft.name}
                      />
                    </div>

                    <p className="font-extrabold text-stone-800 text-center text-lg">{nft.name}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" /> Verified Phygital
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  {/* 🏅 Certificate Download */}
                  {txHash && (
                    <ClaimCertificate
                      nftName={nft.name}
                      nftDescription={nft.description}
                      nftImage={nft.image}
                      walletAddress={account?.address ?? ""}
                      txHash={txHash}
                      dropId={nft.id}
                      claimedAt={claimedAt}
                    />
                  )}

                  {/* ✉️ Email sent confirmation */}
                  {emailSent && (
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 py-3 px-4 rounded-2xl">
                      <Check className="h-4 w-4" />
                      Receipt sent to {email}
                    </div>
                  )}

                  {/* Send email button if email entered but not yet sent */}
                  {!emailSent && email && txHash && (
                    <button
                      onClick={() => sendClaimEmail(txHash, claimedAt)}
                      disabled={sendingEmail}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm rounded-2xl bg-stone-100 hover:bg-stone-200 font-bold text-stone-700 transition-all border border-stone-200"
                    >
                      <Mail className="h-4 w-4" />
                      {sendingEmail ? "Sending…" : "Send Email Receipt"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const tweetText = `I just claimed my real-world Phygital asset: ${nft.name}! 🚀\n\nCheck it out here:`;
                      const url = window.location.href;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="w-full flex items-center justify-center py-4 text-base rounded-2xl bg-[#000000] hover:bg-stone-800 font-bold text-white shadow-md transition-all"
                  >
                    <Twitter className="mr-2 h-5 w-5 fill-current" /> Share on X
                  </button>

                  <Link href="/">
                    <button className="w-full flex items-center justify-center py-4 text-base rounded-2xl bg-stone-100 hover:bg-stone-200 font-bold text-stone-700 transition-all">
                      Return to Home
                    </button>
                  </Link>

                  {txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-4 text-stone-500 hover:text-indigo-600 font-semibold text-xs transition-colors"
                    >
                      View transaction on BaseScan {`->`}
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white relative selection:bg-indigo-500/30">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[100px] animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/40 blur-[100px] animate-aurora2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link href="/" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
            <Image src="/phygital_ultra_logo.png" alt="Phygital" width={26} height={26} className="object-contain" />
            <span className="font-bold text-stone-900 tracking-tight text-lg">Phygital</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 w-full relative z-10 max-w-2xl mx-auto py-10 px-4">
        <Suspense fallback={
          <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
            <div className="w-full mb-8 flex justify-center">
              <Skeleton className="h-10 w-48 rounded-lg" />
            </div>
            <div className="w-full bg-white border border-stone-100 shadow-xl rounded-3xl overflow-hidden flex flex-col">
              <div className="w-full aspect-square">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-6 w-full flex flex-col gap-4">
                <Skeleton className="h-8 w-1/2 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-14 w-full rounded-2xl mt-4" />
              </div>
            </div>
          </div>
        }>
          <ClaimContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
