'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogOut, CreditCard } from "lucide-react"
import { AutoConnect, ConnectButton, lightTheme, MediaRenderer, useActiveAccount, useActiveWallet, useActiveWalletConnectionStatus, useConnectionManager, useDisconnect, useReadContract } from 'thirdweb/react'
import { chain, client } from '@/app/const/client'
import { contract } from '@/app/contract'
import { getOwnedNFTs } from 'thirdweb/extensions/erc1155'
import QRScanner from './QRScanner'
import { inAppWallet } from "thirdweb/wallets"

export function DashboardComponent() {
  const account = useActiveAccount();
  const status = useActiveWalletConnectionStatus();
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const { data: ownedNFTs, isLoading: isLoadingOwnedNFTs } = useReadContract(
    getOwnedNFTs,
    {
      contract: contract,
      address: account?.address as string,
    }
  );

  const customLightTheme = lightTheme({
    colors: {
      primaryButtonBg: "#a855f7", // fuchsia-500
      primaryButtonText: "#ffffff",
      modalBg: "#faf9f6", // warm off-white
      borderColor: "#e5e7eb", // gray-200
    }
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 relative selection:bg-fuchsia-500/30">
      <AutoConnect client={client} />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-300/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/30 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="glass relative z-10 border-b border-stone-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-500">
            Dashboard
          </h1>
          {account && wallet && (
            <Button 
              onClick={() => disconnect(wallet)} 
              variant="outline" 
              className="flex items-center text-stone-700 border-stone-200 bg-white/50 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-medium shadow-sm"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          {account ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* User Profile */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 glass-card border-white/60">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-start space-y-4">
                      <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Account</span>
                      <ConnectButton 
                        client={client} 
                        theme={customLightTheme}
                        chain={chain}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Summary, Balance, and Scan Button */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Total NFTs */}
                  <Card className="glass-card border-white/60">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-start space-y-2">
                        <div className="flex items-center text-stone-500 mb-2">
                          <Wallet className="h-5 w-5 mr-3 text-fuchsia-500" />
                          <span className="text-sm font-medium">Total NFTs</span>
                        </div>
                        <span className="text-4xl font-bold text-stone-900 text-glow">
                          {ownedNFTs?.length.toString() || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Balance */}
                  <Card className="glass-card border-white/60">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-start space-y-2">
                        <div className="flex items-center text-stone-500 mb-2">
                          <CreditCard className="h-5 w-5 mr-3 text-blue-500" />
                          <span className="text-sm font-medium">Balance</span>
                        </div>
                        <span className="text-4xl font-bold text-stone-900 text-glow">
                          0.00
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scan NFT Button */}
                  <div className="col-span-2 lg:col-span-1 flex items-stretch">
                    <div className="w-full glass-card border-white/60 rounded-xl flex items-center justify-center p-4 hover:border-fuchsia-300 transition-all duration-300 group">
                      <QRScanner />
                    </div>
                  </div>
                </div>
              </div>

              {/* NFT Collection */}
              <Card className="mt-8 glass-card border-white/60 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-300/20 blur-[80px] rounded-full pointer-events-none" />
                <CardHeader className="border-b border-stone-200/50 pb-6">
                  <CardTitle className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                    <span className="w-2 h-8 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"></span>
                    Your NFT Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 relative z-10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {!isLoadingOwnedNFTs && ownedNFTs ? (
                      ownedNFTs.length > 0 ? (
                        ownedNFTs.map((nft) => (
                          <div 
                            key={nft.id} 
                            className="bg-white/80 border border-white/60 p-4 rounded-xl shadow-sm flex flex-col items-center hover:-translate-y-1 hover:border-fuchsia-300 hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="rounded-lg overflow-hidden ring-2 ring-stone-100 group-hover:ring-fuchsia-200 transition-all">
                              <MediaRenderer
                                client={client}
                                src={nft.metadata.image}
                                width='120px'
                                height='120px'
                                style={{ 
                                  objectFit: 'cover',
                                  backgroundColor: 'rgba(0,0,0,0.02)'
                                }}
                              />
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-stone-800 text-center tracking-wide group-hover:text-fuchsia-600 transition-colors">
                              {nft.metadata.name}
                            </h3>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-stone-500">
                          <Wallet className="h-16 w-16 mb-4 opacity-30 text-stone-400" />
                          <p className="text-lg text-stone-600">No NFTs found in this wallet.</p>
                          <p className="text-sm mt-2 text-stone-400">Scan a QR code to claim your first asset!</p>
                        </div>
                      )
                    ) : (
                       <div className="col-span-full py-12 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500 mb-4"></div>
                          <p className="text-stone-500">Loading collection...</p>
                       </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              {status === "connecting" ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"></div>
                  <p className="mt-6 text-stone-500 font-medium tracking-wide">Connecting wallet...</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center glass-card p-12 rounded-3xl border border-white/60 max-w-md mx-auto">
                  <Wallet className="h-16 w-16 text-fuchsia-500 mb-6 drop-shadow-[0_4px_10px_rgba(168,85,247,0.2)]" />
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Welcome Back</h2>
                  <p className="text-stone-500 mb-8 max-w-xs">Connect your wallet or continue as a guest to access your dashboard.</p>
                  <ConnectButton 
                    client={client} 
                    theme={customLightTheme}
                    wallets={[
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
                          ]
                        },
                      })
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}