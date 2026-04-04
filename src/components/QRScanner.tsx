'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  X, 
  RefreshCcw, 
  Image as ImageIcon,
  QrCode,
  Maximize2,
  ScanLine
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRScannerProps {
  trigger?: React.ReactNode;
}

const QRScanner: React.FC<QRScannerProps> = ({ trigger }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'error'>('loading');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrcodeRegionId = "qr-reader-core";

  // Initialize and handle camera
  useEffect(() => {
    if (open && activeTab === 'camera') {
      const startCamera = async () => {
        try {
          if (scannerRef.current) {
            await scannerRef.current.stop();
          }
          
          const html5QrCode = new Html5Qrcode(qrcodeRegionId);
          scannerRef.current = html5QrCode;
          setCameraStatus('loading');

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };
          
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            () => {} // Ignore failures during continuous scan
          );
          
          setCameraStatus('active');
        } catch (err) {
          console.error("Camera start error:", err);
          setCameraStatus('error');
          setError("Could not access camera. Please check permissions.");
        }
      };

      // Small delay to ensure the DOM element with qrcodeRegionId is rendered
      const timer = setTimeout(startCamera, 300);
      return () => clearTimeout(timer);
    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    }
  }, [open, activeTab]);

  const onScanSuccess = (decodedText: string) => {
    setIsScanning(true);
    // Cleanup first
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    
    // Determine path
    let targetPath = `/claim?id=${encodeURIComponent(decodedText)}`;
    if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
      try {
        const url = new URL(decodedText);
        targetPath = url.pathname + url.search;
      } catch (e) {}
    }
    
    setTimeout(() => {
      router.push(targetPath);
      setOpen(false);
      setIsScanning(false);
    }, 800);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const html5QrCode = new Html5Qrcode(qrcodeRegionId);
      const result = await html5QrCode.scanFile(file, true);
      onScanSuccess(result);
    } catch (err) {
      console.error("File scan error:", err);
      setError("Could not find a valid QR code in this image.");
      setIsScanning(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger ? (
          trigger
        ) : (
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <QrCode className="w-5 h-5" />
            Scan Phygital Asset
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setError(null);
          setIsScanning(false);
        }
      }}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-black text-stone-900 tracking-tight">Scan QR Code</DialogTitle>
            </div>
          </DialogHeader>

          {/* Custom Tabs */}
          <div className="px-6 flex gap-2 mb-6">
            <button 
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'camera' 
                ? "bg-indigo-50 text-indigo-600 border-2 border-indigo-100" 
                : "bg-stone-50 text-stone-400 hover:bg-stone-100 border-2 border-transparent"
              }`}
            >
              <Camera className="w-4 h-4" /> Camera
            </button>
            <button 
              onClick={() => setActiveTab('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'file' 
                ? "bg-indigo-50 text-indigo-600 border-2 border-indigo-100" 
                : "bg-stone-50 text-stone-400 hover:bg-stone-100 border-2 border-transparent"
              }`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>

          <div className="px-6 pb-8">
            <div className="relative aspect-square w-full bg-stone-900 rounded-[28px] overflow-hidden group shadow-inner">
              
              {/* Scanner Container */}
              <div id={qrcodeRegionId} className="absolute inset-0 w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

              {/* Overlays */}
              <AnimatePresence>
                {activeTab === 'camera' && cameraStatus === 'active' && !isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 pointer-events-none"
                  >
                    {/* Corner Borders */}
                    <div className="absolute inset-0 border-[40px] border-black/40" />
                    <div className="absolute top-[10%] left-[10%] w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    <div className="absolute top-[10%] right-[10%] w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    <div className="absolute bottom-[10%] left-[10%] w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    <div className="absolute bottom-[10%] right-[10%] w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    
                    {/* Laser Line Animation */}
                    <motion.div 
                      animate={{ top: ["15%", "85%", "15%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    />
                  </motion.div>
                )}

                {activeTab === 'file' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-stone-50 z-20 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                      <ImageIcon className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h4 className="text-xl font-bold text-stone-900 mb-2">Select Image</h4>
                    <p className="text-stone-500 text-sm mb-8 max-w-[240px]">
                      Upload a photo of the Phygital asset's QR code from your gallery.
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden" 
                      accept="image/*"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl"
                    >
                      Browse Gallery
                    </Button>
                  </motion.div>
                )}

                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-40 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <ScanLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="mt-4 font-black text-stone-900 tracking-widest text-sm uppercase">Authenticating...</p>
                  </motion.div>
                )}
                
                {error && activeTab === 'camera' && cameraStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-30 bg-stone-900 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="p-4 bg-red-500/20 rounded-full mb-4">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-white font-bold mb-6">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" /> Retry
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-stone-400">
              <Maximize2 className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Secure Verification Tunnel</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;