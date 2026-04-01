"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  ConnectButton,
  useActiveAccount,
  useConnectModal,
  lightTheme,
} from "thirdweb/react";

import { inAppWallet } from "thirdweb/wallets";
import { client, chain } from "@/app/const/client";
import { QrCode, ArrowLeft, AlertTriangle } from "lucide-react";

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

  const account = useActiveAccount();
  const { connect } = useConnectModal();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

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
        setMessage("🎉 NFT successfully minted on-chain!");
        setTxHash(data.txHash || null);
        setNft({ ...nft, minted: true, owner: account.address });
      } else {
        setMessage(data.error || "Claim failed");
      }
    } catch (err) {
      console.error("Claim error:", err);
      setMessage("Something went wrong while claiming.");
    } finally {
      setMinting(false);
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
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
        <p className="text-stone-500 font-medium tracking-wide">Loading NFT details...</p>
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
        className="bg-white border border-stone-100 shadow-xl rounded-3xl w-full flex flex-col items-center overflow-hidden"
      >
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
            {nft.minted ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Minted
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Available
              </span>
            )}
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

          {/* Claim button */}
          {!nft.minted && (
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
          )}

          {nft.minted && (
            <div className="w-full py-4 px-6 font-bold rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center">
              ✅ Already Claimed
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-sm font-medium w-full text-center ${
              message.includes("🎉") || message.includes("successfully")
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : message.includes("Claiming")
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
              {txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-indigo-600 font-semibold underline text-xs"
                >
                  View on BaseScan →
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-white relative selection:bg-indigo-500/30">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <QrCode className="h-4 w-4 text-indigo-600" />
            </div>
            Phygital
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto py-10 px-4">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
            <p className="text-stone-500 font-medium">Preparing...</p>
          </div>
        }>
          <ClaimContent />
        </Suspense>
      </main>
    </div>
  );
}
