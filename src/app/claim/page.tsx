"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";

import {
  ConnectButton,
  useActiveAccount,
  useConnectModal,
  useDisconnect,
  lightTheme,
} from "thirdweb/react";

import { inAppWallet } from "thirdweb/wallets";
import { client, chain } from "@/app/const/client";
import { QrCode } from "lucide-react";

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  minted: boolean;
  owner?: string;
}

function ClaimContent() {
  const searchParams = useSearchParams();
  let id = searchParams.get("id");

  // 🧹 Clean encoded or nested URLs
  if (id?.includes("id=")) {
    id = id.split("id=")[1];
  }

  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [message, setMessage] = useState("");

  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const { disconnect } = useDisconnect();

  // Fetch NFT metadata
  useEffect(() => {
    if (!id) return;
    console.log("🔍 Fetching NFT for ID:", id);

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

  // Handle claim
  const handleClaim = async () => {
    if (!account?.address || !nft) return;
    setMinting(true);
    setMessage("⏳ Claiming your NFT...");

    try {
      const res = await fetch("/api/claimNFT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nft.id, address: account.address }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("🎉 NFT successfully claimed!");
        setNft({ ...nft, minted: true, owner: account.address });
      } else {
        setMessage(`⚠️ ${data.error || "Claim failed"}`);
      }
    } catch (err) {
      console.error("Claim error:", err);
      setMessage("❌ Something went wrong while claiming.");
    } finally {
      setMinting(false);
    }
  };

  // Handle wallet connection
  const handleConnect = async () => {
    await connect({
      client,
      chain,
      theme: lightTheme({
        colors: {
          primaryButtonBg: "#a855f7",
          primaryButtonText: "#ffffff",
          modalBg: "#faf9f6",
          borderColor: "#e5e7eb",
        }
      }),
      wallets: [inAppWallet()],
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500 mb-4"></div>
        <p className="text-stone-500 font-medium">Loading NFT details...</p>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <QrCode className="h-16 w-16 text-stone-300 mb-4" />
        <p className="text-stone-500 font-medium">{message || "NFT not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto">
      {/* ✅ Modern ConnectButton instead of deprecated ConnectWallet */}
      <ConnectButton
        client={client}
        chain={chain}
        theme={lightTheme({
          colors: {
            primaryButtonBg: "#a855f7",
            primaryButtonText: "#ffffff",
            modalBg: "#faf9f6",
            borderColor: "#e5e7eb",
          }
        })}
        connectModal={{
          size: "compact",
        }}
        wallets={[inAppWallet()]}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 glass-card border-white/60 p-8 rounded-3xl w-full flex flex-col items-center shadow-xl"
      >
        <span className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-sm font-medium text-fuchsia-700 mb-4">
          🎉 Claim Your NFT
        </span>
        <h2 className="text-2xl font-bold text-stone-900 mb-6">{nft.name}</h2>

        <div className="rounded-2xl overflow-hidden ring-4 ring-white shadow-lg mb-6">
          <img
            src={nft.image?.replace("ipfs://", "https://ipfs.io/ipfs/")}
            alt={nft.name}
            className="w-64 h-64 object-cover"
          />
        </div>

        <p className="text-stone-600 mb-6 font-medium leading-relaxed">{nft.description}</p>
        <div className="bg-stone-100/50 rounded-lg px-4 py-2 mb-4 border border-stone-200">
          <p className="text-xs text-stone-500 font-mono tracking-wider">ID: {nft.id}</p>
        </div>

        <div className="w-full flex items-center justify-center py-2 border-t border-b border-stone-100 mb-6 mt-2">
          <p className="text-sm font-medium text-stone-600 mr-2">Status:</p>
          {nft.minted ? (
            <span className="flex items-center text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Minted
            </span>
          ) : (
            <span className="flex items-center text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              Ready to Claim
            </span>
          )}
        </div>

        {!nft.minted && (
          <button
            onClick={account ? handleClaim : handleConnect}
            disabled={minting}
            className={`w-full py-4 px-6 font-bold rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 ${
              minting
                ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            {minting
              ? "Claiming Asset..."
              : account
              ? "Claim NFT to Wallet"
              : "Connect Wallet to Claim"}
          </button>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium w-full ${message.includes('🎉') || message.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : message.includes('⚠️') || message.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-stone-100 text-stone-600'}`}>
            {message}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-stone-50 relative selection:bg-fuchsia-500/30 py-12 px-4 flex flex-col items-center justify-center">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-300/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/30 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500 mb-4"></div>
            <p className="text-stone-500 font-medium">Preparing space...</p>
          </div>
        }>
          <ClaimContent />
        </Suspense>
      </div>
    </div>
  );
}
