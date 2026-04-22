"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  AutoConnect,
} from "thirdweb/react";
import { client } from "@/app/const/client";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Camera, Copy, Check, LogOut, ArrowLeft,
  Github, Linkedin, Instagram, Twitter, Globe,
  Phone, MapPin, FileText, Sparkles, Save,
} from "lucide-react";

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  phone: string;
  avatarUrl: string;
  github: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  website: string;
}

const EMPTY: ProfileData = {
  name: "", bio: "", location: "", phone: "",
  avatarUrl: "", github: "", linkedin: "",
  instagram: "", twitter: "", website: "",
};

export default function ProfilePage() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [original, setOriginal] = useState<ProfileData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (!loading && !account) router.push("/");
  }, [account, loading, router]);

  // Stop loading immediately if wallet check resolves with no account
  useEffect(() => {
    // Give wallet time to auto-connect (~1s), then stop loading if still nothing
    const timer = setTimeout(() => {
      if (!account) {
        setLoading(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    if (!account?.address) return;

    async function fetchProfile() {
      try {
        const message = `Authorize Phygital Access for ${account!.address}`;
        const signature = await account!.signMessage({ message });

        const res = await fetch(`/api/profile?address=${account!.address}`, {
          headers: { "x-signature": signature, "x-address": account!.address },
        });
        const data = await res.json();
        if (res.ok && data.profile) {
          const p = {
            name: data.profile.name ?? "",
            bio: data.profile.bio ?? "",
            location: data.profile.location ?? "",
            phone: data.profile.phone ?? "",
            avatarUrl: data.profile.avatarUrl ?? "",
            github: data.profile.github ?? "",
            linkedin: data.profile.linkedin ?? "",
            instagram: data.profile.instagram ?? "",
            twitter: data.profile.twitter ?? "",
            website: data.profile.website ?? "",
          };
          setProfile(p);
          setOriginal(p);
        }
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.ipfsUrl) {
        setProfile((p) => ({ ...p, avatarUrl: data.ipfsUrl }));
        toast.success("Avatar uploaded to IPFS!");
      } else {
        toast.error("Avatar upload failed");
        setAvatarPreview(null);
      }
    } catch {
      toast.error("Upload error");
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!account?.address) return;
    setSaving(true);
    try {
      const message = `Authorize Phygital Access for ${account.address}`;
      const signature = await account.signMessage({ message });

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-signature": signature,
          "x-address": account.address,
        },
        body: JSON.stringify({ address: account.address, ...profile }),
      });

      if (res.ok) {
        setOriginal(profile);
        toast.success("Profile saved!", { description: "Your changes are live." });
      } else {
        const d = await res.json();
        toast.error(d?.error?.message ?? "Save failed");
      }
    } catch {
      toast.error("Save failed — please try again");
    } finally {
      setSaving(false);
    }
  };

  const copyAddress = async () => {
    if (!account?.address) return;
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDirty = JSON.stringify(profile) !== JSON.stringify(original);

  const displayAvatar = avatarPreview
    ?? (profile.avatarUrl?.startsWith("ipfs://")
      ? profile.avatarUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
      : profile.avatarUrl || null);

  if (!account && !loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white text-stone-900 relative selection:bg-indigo-500/20">
      <AutoConnect client={client} />

      {/* Background aurora */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-200/30 blur-[120px] animate-aurora2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* Header */}
      <header className="glass relative z-10 border-b border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/phygital_ultra_logo.png" alt="Phygital Logo" width={28} height={28} className="rounded-xl shadow-sm" />
            <span className="text-xl font-extrabold text-stone-900 tracking-tight">Phygital</span>
          </Link>
          {wallet && (
            <button
              onClick={() => { disconnect(wallet); toast.success("Signed out"); router.push("/"); }}
              className="flex items-center gap-2 text-stone-500 hover:text-red-500 transition-colors font-medium text-sm"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 relative z-10">
        {/* Page heading */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Account</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">My Profile</h1>
          <p className="text-stone-500 mt-1 font-medium">Customize your identity on Phygital</p>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <div className="bg-white border border-stone-100 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm">
              <Skeleton className="w-28 h-28 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
            <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6 animate-in fade-in duration-300">

            {/* ── LEFT: Avatar Card ── */}
            <div className="bg-white/80 backdrop-blur-md border border-stone-100 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm h-fit">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg">
                  {displayAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <span className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 border-2 border-white flex items-center justify-center shadow-md transition-colors"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Display name or address */}
              <div className="text-center">
                <p className="font-bold text-stone-900 text-base">
                  {profile.name || "Unnamed Collector"}
                </p>
                {profile.location && (
                  <p className="text-xs text-stone-500 mt-0.5 flex items-center justify-center gap-1">
                    <MapPin className="h-2.5 w-2.5" /> {profile.location}
                  </p>
                )}
              </div>

              {/* Wallet address */}
              <div className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-stone-700 truncate flex-1">
                    {account?.address?.slice(0,8)}…{account?.address?.slice(-6)}
                  </p>
                  <button onClick={copyAddress} className="flex-shrink-0 text-stone-400 hover:text-indigo-600 transition-colors">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Bio preview */}
              {profile.bio && (
                <p className="text-xs text-stone-500 text-center leading-relaxed line-clamp-4 border-t border-stone-100 pt-3 w-full">
                  {profile.bio}
                </p>
              )}

              {/* Social icons */}
              {(profile.github || profile.linkedin || profile.instagram || profile.twitter || profile.website) && (
                <div className="flex items-center gap-3 pt-1">
                  {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-stone-800 transition-colors"><Github className="h-4 w-4" /></a>}
                  {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-blue-600 transition-colors"><Linkedin className="h-4 w-4" /></a>}
                  {profile.instagram && <a href={profile.instagram} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-pink-600 transition-colors"><Instagram className="h-4 w-4" /></a>}
                  {profile.twitter && <a href={profile.twitter} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors"><Twitter className="h-4 w-4" /></a>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-indigo-600 transition-colors"><Globe className="h-4 w-4" /></a>}
                </div>
              )}
            </div>

            {/* ── RIGHT: Edit Form ── */}
            <div className="bg-white/80 backdrop-blur-md border border-stone-100 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-5">

                {/* Display Name */}
                <FormField icon={<User className="h-4 w-4 text-indigo-500" />} label="Display Name">
                  <input
                    type="text"
                    placeholder="e.g. Tanish Pareek"
                    maxLength={50}
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className={inputCls}
                  />
                </FormField>

                {/* Bio */}
                <FormField icon={<FileText className="h-4 w-4 text-violet-500" />} label="Bio">
                  <div className="relative">
                    <textarea
                      placeholder="Tell the world who you are…"
                      maxLength={160}
                      rows={3}
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      className={`${inputCls} resize-none`}
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] text-stone-400 font-medium">
                      {profile.bio.length}/160
                    </span>
                  </div>
                </FormField>

                {/* Location + Phone — 2 col */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField icon={<MapPin className="h-4 w-4 text-rose-400" />} label="Location">
                    <input
                      type="text"
                      placeholder="Mumbai, India"
                      maxLength={60}
                      value={profile.location}
                      onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                      className={inputCls}
                    />
                  </FormField>
                  <FormField icon={<Phone className="h-4 w-4 text-emerald-500" />} label="Phone">
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      maxLength={20}
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className={inputCls}
                    />
                  </FormField>
                </div>

                {/* Social Links */}
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> Social Links
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { key: "github", icon: <Github className="h-3.5 w-3.5" />, placeholder: "github.com/username", color: "text-stone-600" },
                      { key: "linkedin", icon: <Linkedin className="h-3.5 w-3.5" />, placeholder: "linkedin.com/in/username", color: "text-blue-600" },
                      { key: "instagram", icon: <Instagram className="h-3.5 w-3.5" />, placeholder: "instagram.com/username", color: "text-pink-500" },
                      { key: "twitter", icon: <Twitter className="h-3.5 w-3.5" />, placeholder: "x.com/username", color: "text-stone-900" },
                      { key: "website", icon: <Globe className="h-3.5 w-3.5" />, placeholder: "https://yoursite.com", color: "text-indigo-500" },
                    ].map(({ key, icon, placeholder, color }) => (
                      <div key={key} className="relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${color}`}>{icon}</span>
                        <input
                          type="url"
                          placeholder={placeholder}
                          value={profile[key as keyof ProfileData]}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      isDirty && !saving
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
                        : "bg-stone-100 text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isDirty ? "Save Changes" : "No Changes"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all";

function FormField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
