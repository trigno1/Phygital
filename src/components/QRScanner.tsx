'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const qrcodeRegionId = "html5qr-code-full-region";

const QRScanner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (open) {
      const initializeScanner = () => {
        if (!scannerRef.current && document.getElementById(qrcodeRegionId)) {
          scannerRef.current = new Html5QrcodeScanner(
            qrcodeRegionId,
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            false
          );
          scannerRef.current.render(onScanSuccess, onScanFailure);
        }
      };

      setTimeout(initializeScanner, 100);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [open]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    setIsScanning(true);

    // If the QR encodes a full URL (e.g. https://yourdomain.com/claim?id=abc123),
    // navigate directly to the path+query rather than double-wrapping it.
    if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
      try {
        const url = new URL(decodedText);
        // Navigate to the path and search params on this app (strips the external domain)
        router.push(url.pathname + url.search);
      } catch {
        router.push(`/claim?id=${encodeURIComponent(decodedText)}`);
      }
    } else {
      // Raw ID or relative path — wrap it normally
      router.push(`/claim?id=${encodeURIComponent(decodedText)}`);
    }
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  return (
    <>
      <style>{`
        #${qrcodeRegionId} {
          border: none !important;
        }
        #${qrcodeRegionId} img {
          max-width: 100%;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        #${qrcodeRegionId} button {
          background-color: #3b3486 !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 10px 16px !important;
          border: none !important;
          font-weight: 600 !important;
          margin: 6px 4px !important;
          cursor: pointer !important;
          transition: all 0.2s;
        }
        #${qrcodeRegionId} button:hover {
          background-color: #2e2865 !important;
        }
        #${qrcodeRegionId} select {
          padding: 8px !important;
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          margin-bottom: 10px !important;
          width: 100%;
          max-width: 300px;
        }
        #${qrcodeRegionId} a {
          color: #3b3486 !important;
          font-weight: 500 !important;
          text-decoration: none !important;
        }
        #${qrcodeRegionId} span {
          color: #6b7280 !important;
          font-weight: 500 !important;
          font-size: 0.9rem !important;
        }
        #html5-qrcode-anchor-scan-type-change {
          text-decoration: none !important;
          display: inline-block;
          margin-top: 12px;
        }
      `}</style>
      <Button onClick={() => setOpen(true)} className="w-full">Scan QR Code</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:min-h-[90vh] md:max-w-[500px] md:max-h-[85vh] bg-white overflow-y-auto overflow-x-hidden border-none shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b border-stone-100">
            <DialogTitle className="text-stone-900 text-2xl font-bold">Scan Asset</DialogTitle>
            <DialogClose className="text-stone-400 hover:text-stone-700" />
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 relative">
            {/* The QR Scanner region must stay in the DOM to avoid breaking html5-qrcode's stream lifecycle */}
            <div className="w-full flex flex-col items-center">
              <div id={qrcodeRegionId} className="w-full max-w-[400px] text-stone-800 rounded-xl overflow-hidden relative">
                {isScanning && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                    <p className="text-sm font-bold text-indigo-900 tracking-wide">AUTHENTICATING...</p>
                  </div>
                )}
              </div>
              <p className="mt-8 text-sm font-medium text-stone-500 text-center">
                Align the QR code within the frame or upload an image to instantly claim your asset.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;