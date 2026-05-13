/**
 * ============================================================
 * API Route: GET /api/admin/stats
 * ============================================================
 *
 * Admin-only endpoint — returns comprehensive platform analytics.
 * Protected by wallet-based admin authentication.
 *
 * METRICS RETURNED:
 * ─────────────────
 * - totalDrops:     Total NFT drops ever created
 * - totalClaims:    Sum of all claims across all drops
 * - totalScans:     Sum of all QR code scans across all drops
 * - uniqueWallets:  Number of distinct wallet addresses that claimed
 * - soulboundDrops: Number of non-transferable drops
 * - activeDrops:    Number of drops that haven't expired yet
 * - claimsChart:    7-day claims chart data for the dashboard graph
 *
 * PERFORMANCE:
 * ────────────
 * All database queries run in parallel via Promise.all()
 * for maximum speed. The chart data is computed from the
 * most recent 200 claim records.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

// Disable static caching
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // ── Admin authentication ──────────────────────────────────
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  // ── Run all analytics queries in parallel ─────────────────
  const [
    totalDrops,
    claimsAgg,
    scansAgg,
    soulboundDrops,
    activeDrops,
    recentClaims,
    uniqueWalletsRaw,
  ] = await Promise.all([
    prisma.nFT.count(),                                              // Total drops ever created
    prisma.nFT.aggregate({ _sum: { claimsCount: true } }),           // Sum of all claims
    prisma.nFT.aggregate({ _sum: { scansCount: true } }),            // Sum of all scans
    prisma.nFT.count({ where: { isSoulbound: true } }),              // Non-transferable drops
    prisma.nFT.count({ where: { expiresAt: { gt: new Date() } } }), // Not-yet-expired drops
    prisma.claimRecord.findMany({                                    // Recent 200 claims for chart
      orderBy: { claimedAt: "desc" },
      take: 200,
      select: { claimedAt: true },
    }),
    prisma.claimRecord.groupBy({ by: ["walletAddress"] }),           // Unique claiming wallets
  ]);

  // Extract totals from aggregation results
  const totalClaims = claimsAgg._sum.claimsCount ?? 0;
  const totalScans = scansAgg._sum.scansCount ?? 0;
  const uniqueWallets = uniqueWalletsRaw.length;

  // ── Build 7-day claims chart data ─────────────────────────
  // Creates an array of { label, count } for each of the last 7 days
  const now = new Date();
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    // Format: "Mon, Jan 1"
    const label = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    // Define the start and end of this calendar day
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    // Count how many of the recent claims fall within this day
    const count = recentClaims.filter((c) => {
      const t = new Date(c.claimedAt);
      return t >= start && t <= end;
    }).length;
    days.push({ label, count });
  }

  return NextResponse.json({
    totalDrops,
    totalClaims,
    totalScans,
    uniqueWallets,
    soulboundDrops,
    activeDrops,
    claimsChart: days,
  });
}
