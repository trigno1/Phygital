"use client";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type Tab = "overview" | "drops" | "users" | "claims" | "system";

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function tw(a: string) { return a; }

export default function AdminPage() {
  const account = useActiveAccount();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [drops, setDrops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const adminAddr = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ?? "";
  const isAdmin = account?.address?.toLowerCase() === adminAddr.toLowerCase();

  async function getHeaders() {
    const message = `Authorize Phygital Access for ${account!.address}`;
    const sig = await account!.signMessage({ message });
    return { "Content-Type": "application/json", "x-signature": sig, "x-address": account!.address };
  }

  useEffect(() => {
    if (!isAdmin || !account) return;
    (async () => {
      const h = await getHeaders();
      const [s, d, u, c] = await Promise.all([
        fetch("/api/admin/stats", { headers: h }).then(r => r.json()),
        fetch("/api/admin/drops", { headers: h }).then(r => r.json()),
        fetch("/api/admin/users", { headers: h }).then(r => r.json()),
        fetch("/api/admin/claims", { headers: h }).then(r => r.json()),
      ]);
      setStats(s); setDrops(d.drops ?? []); setUsers(u.users ?? []); setClaims(c.claims ?? []);
      setLoading(false);
    })();
  }, [isAdmin, account?.address]);

  async function deleteDrop(id: string) {
    if (!confirm("Delete this drop and all its claim records?")) return;
    setDeleting(id);
    const h = await getHeaders();
    await fetch(`/api/admin/drops?id=${id}`, { method: "DELETE", headers: h });
    setDrops(drops.filter(d => d.id !== id));
    setDeleting(null);
  }

  if (!account) return <div className="flex items-center justify-center min-h-screen text-stone-500">Connect your wallet to access admin.</div>;
  if (!isAdmin) return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">Access Denied — Not an admin wallet.</div>;
  if (loading) return <div className="flex items-center justify-center min-h-screen text-stone-400">Loading admin data…</div>;

  const navItems: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "drops", label: "All Drops" },
    { id: "users", label: "Users" },
    { id: "claims", label: "Claims Feed" },
    { id: "system", label: "System" },
  ];

  const conversion = stats.totalScans > 0 ? ((stats.totalClaims / stats.totalScans) * 100).toFixed(1) : "0.0";
  const topClaims = drops[0]?.claimsCount ?? 1;

  return (
    <div className="flex min-h-screen bg-stone-50 font-sans">
      {/* Sidebar */}
      <aside className="w-44 min-h-screen bg-white border-r border-stone-100 flex flex-col py-6 px-3 gap-1 fixed top-0 left-0">
        <div className="flex items-center gap-2 px-2 mb-6">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <span className="font-black text-sm text-stone-900">Admin</span>
        </div>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === n.id ? "border-l-2 border-stone-900 bg-stone-50 font-semibold text-stone-900" : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"}`}>
            {n.label}
          </button>
        ))}
        <div className="mt-auto px-2">
          <Link href="/dashboard" className="text-xs text-stone-400 hover:text-stone-600">← Dashboard</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-44 flex-1 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-stone-900">{navItems.find(n => n.id === tab)?.label}</h1>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Base Sepolia</span>
          </div>
          <span className="font-mono text-xs text-stone-400">{account.address.slice(0,6)}…{account.address.slice(-4)}</span>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Drops", value: stats.totalDrops },
                { label: "Total Claims", value: stats.totalClaims },
                { label: "Unique Wallets", value: stats.uniqueWallets },
                { label: "Total Scans", value: stats.totalScans },
              ].map(c => (
                <div key={c.label} className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{c.label}</p>
                  <p className="text-3xl font-black text-stone-900">{c.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Conversion Rate</p>
                <p className="text-3xl font-black text-indigo-600">{conversion}%</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Soulbound Drops</p>
                <p className="text-3xl font-black text-stone-900">{stats.soulboundDrops}</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Active Drops</p>
                <p className="text-3xl font-black text-stone-900">{stats.activeDrops}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Top Drops by Claims</p>
                <div className="space-y-2">
                  {drops.slice(0, 6).map(d => (
                    <div key={d.id}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-stone-700 truncate max-w-[180px]">{d.name}</span>
                        <span className="font-bold text-stone-500">{d.claimsCount}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round((d.claimsCount / topClaims) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Live Claims Feed</p>
                <div className="space-y-2">
                  {claims.slice(0, 8).map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.txHash ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span className="font-medium text-stone-700 truncate">{c.dropName}</span>
                      <span className="text-stone-400 ml-auto flex-shrink-0">{timeAgo(c.claimedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Claims Over Last 7 Days</p>
              <div className="flex items-end gap-2 h-24">
                {(stats.claimsChart ?? []).map((d: any, i: number) => {
                  const max = Math.max(...(stats.claimsChart ?? []).map((x: any) => x.count), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${Math.round((d.count / max) * 80)}px`, minHeight: d.count > 0 ? "4px" : "2px" }} />
                      <span className="text-[9px] text-stone-400 font-bold">{d.label.split(",")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ALL DROPS ── */}
        {tab === "drops" && (
          <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 bg-stone-50">
                {["Drop","Creator","Claims","Scans","Conv%","Max","Status","Pass","Actions"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-bold text-stone-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {drops.map(d => {
                  const now = new Date();
                  const expired = d.expiresAt && new Date(d.expiresAt) < now;
                  const full = d.maxClaims && d.claimsCount >= d.maxClaims;
                  const status = expired ? "Expired" : full ? "Full" : "Active";
                  const sc = { Active: "text-emerald-600 bg-emerald-50", Expired: "text-red-500 bg-red-50", Full: "text-amber-600 bg-amber-50" }[status]!;
                  const conv = d.scansCount > 0 ? ((d.claimsCount / d.scansCount) * 100).toFixed(0) : "0";
                  return (
                    <tr key={d.id} className="border-b border-stone-50 hover:bg-stone-50 transition">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <img src={d.image?.replace("ipfs://","https://ipfs.io/ipfs/")} className="w-8 h-8 rounded-lg object-cover bg-stone-100" alt="" />
                          <span className="font-medium text-stone-800 truncate max-w-[140px]">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-stone-400">{d.creatorAddress ? `${d.creatorAddress.slice(0,6)}…${d.creatorAddress.slice(-4)}` : "—"}</td>
                      <td className="px-3 py-2.5 font-bold text-stone-700">{d.claimsCount}</td>
                      <td className="px-3 py-2.5 text-stone-500">{d.scansCount}</td>
                      <td className="px-3 py-2.5 text-stone-500">{conv}%</td>
                      <td className="px-3 py-2.5 text-stone-500">{d.maxClaims ?? "∞"}</td>
                      <td className="px-3 py-2.5"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc}`}>{status}</span></td>
                      <td className="px-3 py-2.5 text-center">{d.hasPassword ? "🔒" : "—"}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/claim?id=${d.id}`)}
                            className="text-xs px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold text-stone-600 transition">Copy</button>
                          <button onClick={() => deleteDrop(d.id)} disabled={deleting === d.id}
                            className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 font-bold text-red-500 transition disabled:opacity-50">
                            {deleting === d.id ? "…" : "Del"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 bg-stone-50">
                {["","Wallet","Name","Drops","Claims","Joined"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-bold text-stone-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.map(({ profile: p, dropsCreated, claimsReceived }: any) => (
                  <>
                    <tr key={p.id} onClick={() => setExpandedUser(expandedUser === p.id ? null : p.id)}
                      className="border-b border-stone-50 hover:bg-stone-50 transition cursor-pointer">
                      <td className="px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600">
                          {(p.name || p.address).slice(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-stone-500">{p.address.slice(0,6)}…{p.address.slice(-4)}</td>
                      <td className="px-3 py-2.5 font-medium text-stone-800">{p.name || "—"}</td>
                      <td className="px-3 py-2.5 font-bold text-stone-700">{dropsCreated}</td>
                      <td className="px-3 py-2.5 text-stone-500">{claimsReceived}</td>
                      <td className="px-3 py-2.5 text-stone-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                    {expandedUser === p.id && (
                      <tr key={`${p.id}-exp`} className="bg-stone-50 border-b border-stone-100">
                        <td colSpan={6} className="px-6 py-3 text-xs text-stone-500 space-y-1">
                          {p.bio && <p><span className="font-bold">Bio:</span> {p.bio}</p>}
                          {p.location && <p><span className="font-bold">Location:</span> {p.location}</p>}
                          {p.github && <p><span className="font-bold">GitHub:</span> {p.github}</p>}
                          {p.twitter && <p><span className="font-bold">Twitter:</span> {p.twitter}</p>}
                          {p.linkedin && <p><span className="font-bold">LinkedIn:</span> {p.linkedin}</p>}
                          {p.website && <p><span className="font-bold">Website:</span> {p.website}</p>}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CLAIMS FEED ── */}
        {tab === "claims" && (
          <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 bg-stone-50">
                {["","Drop","Wallet","Tx Hash","Time"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-bold text-stone-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50 transition">
                    <td className="px-3 py-2.5"><span className={`w-2 h-2 rounded-full inline-block ${c.txHash ? "bg-emerald-500" : "bg-amber-400"}`} /></td>
                    <td className="px-3 py-2.5 font-medium text-stone-800">{c.dropName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-stone-500">{c.walletAddress.slice(0,6)}…{c.walletAddress.slice(-4)}</td>
                    <td className="px-3 py-2.5">
                      {c.txHash ? (
                        <a href={`https://sepolia.basescan.org/tx/${c.txHash}`} target="_blank" rel="noreferrer"
                          className="font-mono text-xs text-indigo-500 hover:underline">{c.txHash.slice(0,10)}…</a>
                      ) : <span className="text-amber-500 text-xs font-bold">Pending</span>}
                    </td>
                    <td className="px-3 py-2.5 text-stone-400 text-xs">{timeAgo(c.claimedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SYSTEM ── */}
        {tab === "system" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-stone-100 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Security Checklist</p>
              <div className="space-y-3">
                {[
                  { ok: !!process.env.NEXT_PUBLIC_APP_URL, label: "Rate Limiting (Upstash)", note: process.env.UPSTASH_REDIS_REST_URL ? "Active" : "Inactive — add UPSTASH vars" },
                  { ok: true, label: "Password Hashing (bcrypt)", note: "Active" },
                  { ok: true, label: "Wallet Signature Auth", note: "Active" },
                  { ok: false, label: "Image MIME Validation", note: "⚠ Not yet implemented" },
                  { ok: false, label: "Test Coverage", note: "⚠ No test files found" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className={`text-base ${item.ok ? "text-emerald-500" : "text-amber-400"}`}>{item.ok ? "✅" : "⚠️"}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.label}</p>
                      <p className="text-xs text-stone-400">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-stone-100 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Infrastructure</p>
              <div className="space-y-3">
                {[
                  { label: "Network", value: "Base Sepolia" },
                  { label: "Database", value: "MongoDB via Prisma" },
                  { label: "Storage", value: "Thirdweb IPFS" },
                  { label: "Auth", value: "Thirdweb Wallet Signatures" },
                  { label: "Total Records", value: `${stats.totalDrops} drops · ${stats.totalClaims} claims` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-stone-50">
                    <span className="text-sm text-stone-500 font-medium">{item.label}</span>
                    <span className="text-sm font-bold text-stone-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
