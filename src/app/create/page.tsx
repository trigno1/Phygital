"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import {
  QrCode, Sparkles, PartyPopper, Calendar, ArrowLeft, ArrowRight,
  Download, CheckCircle2, Tag, Plus, Trash2, Upload, Lock,
  ShieldCheck, Globe, Users, Image as ImageIcon, Eye, EyeOff,
  ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
type Purpose = "fun" | "event" | "other" | null;
interface Attribute { key: string; value: string; }
interface FormData {
  name: string;
  description: string;
  imageUrl: string;         // manual URL
  imageFile: File | null;   // direct upload
  imagePreview: string;     // resolved preview URL
  issuedAt: string;
  expiresAt: string;
  otherPurpose: string;
  attributes: Attribute[];
  maxClaims: string;        // "" = single-claim
  password: string;
  isSoulbound: boolean;
  externalUrl: string;
}

const PURPOSE_OPTIONS = [
  {
    id: "fun" as Purpose,
    icon: <PartyPopper className="h-8 w-8 mb-3 text-amber-500" />,
    label: "For Fun",
    description: "A collectible to share with friends or fans",
    color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50/50",
    selected: "border-amber-500 bg-amber-50/80 shadow-amber-200/50",
  },
  {
    id: "event" as Purpose,
    icon: <Calendar className="h-8 w-8 mb-3 text-indigo-500" />,
    label: "For an Event",
    description: "A proof-of-attendance token for a gathering",
    color: "border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/50",
    selected: "border-indigo-500 bg-indigo-50/80 shadow-indigo-200/50",
  },
  {
    id: "other" as Purpose,
    icon: <Sparkles className="h-8 w-8 mb-3 text-fuchsia-500" />,
    label: "Something Else",
    description: "Tell us what you have in mind",
    color: "border-stone-200 hover:border-fuchsia-400 hover:bg-fuchsia-50/50",
    selected: "border-fuchsia-500 bg-fuchsia-50/80 shadow-fuchsia-200/50",
  },
];

export default function CreatePage() {
  const router = useRouter();
  const account = useActiveAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [purpose, setPurpose] = useState<Purpose>(null);
  const [form, setForm] = useState<FormData>({
    name: "", description: "", imageUrl: "", imageFile: null,
    imagePreview: "", issuedAt: "", expiresAt: "", otherPurpose: "",
    attributes: [{ key: "", value: "" }],
    maxClaims: "", password: "", isSoulbound: false, externalUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ id: string; qrDataUrl: string; claimUrl: string } | null>(null);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const selectedOption = PURPOSE_OPTIONS.find((p) => p.id === purpose);

  // ── Image handling ─────────────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Please use an image under 2MB for direct upload, or paste a URL instead.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageFile: file, imagePreview: localPreview, imageUrl: "" }));

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setForm((f) => ({ ...f, imageUrl: base64String }));
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("Error reading file locally.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed — try pasting a URL instead.");
      setIsUploading(false);
    }
  };

  // ── Attributes ─────────────────────────────────────────────────────────────
  const addAttr = () => setForm((f) => ({ ...f, attributes: [...f.attributes, { key: "", value: "" }] }));
  const removeAttr = (i: number) => setForm((f) => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }));
  const updateAttr = (i: number, field: "key" | "value", val: string) =>
    setForm((f) => {
      const attrs = [...f.attributes];
      attrs[i] = { ...attrs[i], [field]: val };
      return { ...f, attributes: attrs };
    });

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      setError("Please fill in the required fields.");
      return;
    }
    const imageToUse = form.imageUrl || form.imagePreview;
    if (!imageToUse) {
      setError("Please upload an image or paste an image URL.");
      return;
    }
    if (isUploading) {
      setError("Please wait for the image to finish uploading to IPFS.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      if (!account) {
        setError("Please connect your wallet to create a drop.");
        return;
      }

      const validAttrs = form.attributes
        .filter((a) => a.key.trim() && a.value.trim())
        .reduce((acc, a) => ({ ...acc, [a.key.trim()]: a.value.trim() }), {});

      // Secure Verification: Request a one-time signature to authorize creation
      const message = `Authorize Phygital Access for ${account.address}`;
      const signature = await account.signMessage({ message });

      const res = await fetch("/api/create-nft", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-signature": signature,
          "x-address": account.address,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          image: imageToUse,
          category: purpose === "other" ? form.otherPurpose : purpose,
          issuedAt: form.issuedAt || undefined,
          expiresAt: form.expiresAt || undefined,
          attributes: Object.keys(validAttrs).length > 0 ? validAttrs : undefined,
          maxClaims: form.maxClaims ? parseInt(form.maxClaims, 10) : undefined,
          password: form.password || undefined,
          isSoulbound: form.isSoulbound,
          externalUrl: form.externalUrl || undefined,
          creatorAddress: account.address,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setStep(3);
        toast.success("QR Drop created!", { description: `"${form.name}" is live and ready to distribute.` });
      } else {
        setError(data.message || "Something went wrong.");
        toast.error("Failed to create drop", { description: data.message });
      }
    } catch (err) {
      console.error(err);
      setError("Authorization or Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.qrDataUrl;
    a.download = `phygital-qr-${result.id.slice(0, 8)}.png`;
    a.click();
  };

  const resetForm = () => {
    setStep(1); setPurpose(null); setResult(null); setError("");
    setForm({ name: "", description: "", imageUrl: "", imageFile: null, imagePreview: "",
      issuedAt: "", expiresAt: "", otherPurpose: "", attributes: [{ key: "", value: "" }],
      maxClaims: "", password: "", isSoulbound: false, externalUrl: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <Image src="/logo.png" alt="Phygital Logo" width={24} height={24} className="rounded" /> Create Drop
          </div>
          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-stone-50 border border-stone-200 p-1.5 rounded-full shadow-inner">
            {[ 
              { num: 1, label: "Details" }, 
              { num: 2, label: "Media" }, 
              { num: 3, label: "Options" } 
            ].map((s) => (
              <div 
                key={s.num} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold leading-none ${
                  s.num === step 
                    ? "bg-indigo-600 shadow-sm text-white" 
                    : s.num < step 
                    ? "text-indigo-700 bg-indigo-100" 
                    : "text-stone-400 font-semibold"
                }`}
              >
                <div className={`flex items-center justify-center h-4 w-4 rounded-full text-[10px] ${
                  s.num === step ? "bg-white text-indigo-600" : s.num < step ? "bg-indigo-600 text-white" : "bg-stone-200 text-stone-500"
                }`}>
                  {s.num < step ? "✓" : s.num}
                </div>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative z-10 max-w-3xl mx-auto px-4 pt-12 pb-24">

        {/* ── STEP 1: Purpose ── */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="h-3.5 w-3.5" /> New NFT Drop
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-4 leading-tight">
              What is this NFT for?
            </h1>
            <p className="text-stone-500 text-lg mb-12 max-w-lg">
              Create a physical QR code that anyone can scan to instantly claim a unique digital asset on the blockchain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10">
              {PURPOSE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPurpose(option.id)}
                  className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200 shadow-sm ${
                    purpose === option.id ? option.selected + " shadow-lg" : option.color + " bg-white"
                  }`}
                >
                  {option.icon}
                  <h3 className="font-bold text-stone-900 mb-1">{option.label}</h3>
                  <p className="text-xs text-stone-500">{option.description}</p>
                </button>
              ))}
            </div>

            {purpose === "other" && (
              <input
                type="text" value={form.otherPurpose}
                onChange={(e) => setForm({ ...form, otherPurpose: e.target.value })}
                placeholder="Tell us about your NFT..."
                className="w-full max-w-md px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-8"
              />
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!purpose || (purpose === "other" && !form.otherPurpose)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── STEP 2: NFT Details ── */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-medium mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {selectedOption?.icon}
                <span className="text-sm font-semibold text-stone-400 uppercase tracking-widest">{selectedOption?.label}</span>
              </div>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Tell us about your NFT</h2>
              <p className="text-stone-500 mt-2">This is exactly what collectors will see when they scan your QR code.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  NFT Name <span className="text-red-400">*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Summit 2026 — Early Bird"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the story or context behind this NFT..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
                  required
                />
              </div>

              {/* Network Selection (In Testing) */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500" /> Blockchain Network</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">Multi-Chain Beta</span>
                </label>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 md:p-4 border-2 border-indigo-500 bg-indigo-50/40 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-[#0052FF] flex flex-shrink-0 items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                         <img src="https://cryptologos.cc/logos/base-logo.png?v=029" className="w-full h-full object-cover scale-[1.3] brightness-[1.5]" alt="Base" onError={(e) => (e.currentTarget.style.display = 'none')} />
                       </div>
                       <div>
                         <p className="font-bold text-stone-900 text-sm">Base Sepolia</p>
                         <p className="text-xs text-stone-500 font-medium">Testnet • Currently Active</p>
                       </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 md:p-4 border border-stone-200 bg-stone-50/80 rounded-xl opacity-70 cursor-not-allowed cursor-help" title="Mainnet deployment is currently in beta testing">
                    <div className="flex items-center gap-3">
                       <div className="flex -space-x-2">
                         <div className="w-8 h-8 rounded-full bg-[#627EEA] ring-2 ring-white flex items-center justify-center z-30 shadow-sm overflow-hidden p-[7px] border border-stone-100">
                           <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="Ethereum" className="w-full h-full object-contain brightness-0 invert" />
                         </div>
                         <div className="w-8 h-8 rounded-full bg-[#8247E5] ring-2 ring-white flex items-center justify-center z-20 shadow-sm overflow-hidden p-1 border border-stone-100">
                           <img src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=029" alt="Polygon" className="w-full h-full object-contain brightness-0 invert" />
                         </div>
                         <div className="w-8 h-8 rounded-full bg-black ring-2 ring-white flex items-center justify-center z-10 shadow-sm overflow-hidden p-[7px] border border-stone-100">
                           <img src="https://cryptologos.cc/logos/solana-sol-logo.svg?v=029" alt="Solana" className="w-full h-full object-contain" />
                         </div>
                       </div>
                       <div className="ml-3">
                         <p className="font-bold text-stone-900 text-sm flex items-center gap-2">Mainnets <span className="bg-amber-100 text-amber-700 text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider border border-amber-200">In Testing</span></p>
                         <p className="text-xs text-stone-500 font-medium leading-tight mt-0.5">Ethereum, Polygon, Solana, Base</p>
                       </div>
                    </div>
                    <Lock className="h-4 w-4 text-stone-400" />
                  </div>
                </div>
              </div>

              {/* Image Upload + URL */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-indigo-500" /> NFT Image <span className="text-red-400">*</span></span>
                </label>

                {/* Upload zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all mb-3"
                >
                  {form.imagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={form.imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-stone-100" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-stone-700">{form.imageFile?.name}</p>
                        {isUploading ? (
                          <p className="text-xs text-indigo-600 font-medium mt-1">⏳ Uploading to IPFS...</p>
                        ) : form.imageUrl ? (
                          <p className="text-xs text-emerald-600 font-medium mt-1">✅ Uploaded to IPFS</p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <Upload className="h-8 w-8" />
                      <p className="text-sm font-semibold">Click to upload image</p>
                      <p className="text-xs">PNG, JPG, GIF, WEBP — max 10MB · Stored on IPFS</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-stone-100" />
                  <span className="text-xs text-stone-400 font-semibold">OR paste a URL</span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>

                <input type="url" value={!form.imageFile ? form.imageUrl : ""}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value, imageFile: null, imagePreview: "" })}
                  placeholder="https://... or ipfs://..."
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                />
                {/* URL preview */}
                {!form.imageFile && form.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 w-24 h-24 bg-stone-50">
                    <img src={form.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>

              {/* Attributes Builder */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-violet-500" /> Attributes / Traits</span>
                </label>
                <p className="text-xs text-stone-400 mb-3">Add custom properties that appear on your NFT (e.g. Rarity: Legendary, Event: TechConf)</p>
                <div className="space-y-2">
                  {form.attributes.map((attr, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={attr.key}
                        onChange={(e) => updateAttr(i, "key", e.target.value)}
                        placeholder="Trait name"
                        className="flex-1 px-3 py-2.5 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      />
                      <input type="text" value={attr.value}
                        onChange={(e) => updateAttr(i, "value", e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-3 py-2.5 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      />
                      <button type="button" onClick={() => removeAttr(i)}
                        className="p-2.5 rounded-xl border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addAttr}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mt-1 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                    <Plus className="h-4 w-4" /> Add Attribute
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" /> Available From
                  </label>
                  <input type="datetime-local" value={form.issuedAt}
                    onChange={(e) => setForm({ ...form, issuedAt: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-xs text-stone-400 mt-1">When the QR becomes active (optional)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-red-400" /> Expires On
                  </label>
                  <input type="datetime-local" value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-xs text-stone-400 mt-1">Last date to claim (optional)</p>
                </div>
              </div>

              {/* ── ADVANCED OPTIONS ── */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <button type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-stone-50 hover:bg-stone-100 transition-colors">
                  <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Advanced Options
                    <span className="text-xs font-normal text-stone-400">— claim limit, password, soulbound</span>
                  </span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                </button>

                {showAdvanced && (
                  <div className="px-5 py-5 space-y-5 border-t border-stone-200">
                    {/* Max Claims */}
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">
                        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-amber-500" /> Claim Limit</span>
                      </label>
                      <p className="text-xs text-stone-400 mb-2">How many unique wallets can claim this NFT. Leave empty for single-claim (first person only).</p>
                      <input type="number" min="1" max="100000" value={form.maxClaims}
                        onChange={(e) => setForm({ ...form, maxClaims: e.target.value })}
                        placeholder="e.g. 50 — leave empty for single claim"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">
                        <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-rose-500" /> Secret Code Gate</span>
                      </label>
                      <p className="text-xs text-stone-400 mb-2">Require a password to claim. Only people you tell the code to can mint this NFT.</p>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="e.g. summit2026 — leave empty for no gate"
                          className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* External URL */}
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">
                        <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-sky-500" /> External URL</span>
                      </label>
                      <p className="text-xs text-stone-400 mb-2">A link embedded in the NFT metadata — useful for linking to an event page or website.</p>
                      <input type="url" value={form.externalUrl}
                        onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                        placeholder="https://your-event.com (optional)"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                      />
                    </div>

                    {/* Soulbound Toggle */}
                    <div className="flex items-start gap-4">
                      <button type="button"
                        onClick={() => setForm({ ...form, isSoulbound: !form.isSoulbound })}
                        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${form.isSoulbound ? "bg-indigo-600" : "bg-stone-200"}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.isSoulbound ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-indigo-500" /> Soulbound (Non-transferable)
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          NFT is permanently locked to the claiming wallet. Perfect for certificates, diplomas, or attendance proofs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting || isUploading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
                >
                  {isSubmitting ? (
                    <><div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> Generating QR Code...</>
                  ) : isUploading ? (
                    <><div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> Uploading Image...</>
                  ) : (
                    <><QrCode className="h-5 w-5" /> Generate QR Code</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && result && (
          <div className="flex flex-col items-center text-center">
            <div className="bg-emerald-50 p-4 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">Your QR is ready!</h2>
            <p className="text-stone-500 mb-8 max-w-md leading-relaxed">
              Print it, share it, hide it. Anyone who scans it will be able to claim{" "}
              <strong>{form.name}</strong> to their invisible wallet.
            </p>

            {/* Summary badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {form.maxClaims && (
                <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Users className="h-3 w-3" /> Max {form.maxClaims} claims
                </span>
              )}
              {form.password && (
                <span className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Password protected
                </span>
              )}
              {form.isSoulbound && (
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Soulbound
                </span>
              )}
              {form.expiresAt && (
                <span className="bg-stone-50 border border-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Expires {new Date(form.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* QR Display */}
            <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 shadow-2xl mb-8 inline-flex flex-col items-center">
              <img src={result.qrDataUrl} alt="QR Code" className="w-56 h-56 rounded-xl" />
              <p className="mt-4 text-xs text-stone-400 font-mono break-all max-w-xs">{result.claimUrl}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md hover:shadow-lg">
                <Download className="h-5 w-5" /> Download QR
              </button>
              <button onClick={resetForm}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold py-3 rounded-2xl transition-all">
                <Sparkles className="h-5 w-5 text-indigo-500" /> Create Another
              </button>
            </div>

            <Link href="/dashboard" className="mt-6 text-stone-400 hover:text-stone-700 text-sm font-medium transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
