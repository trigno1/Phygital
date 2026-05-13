/**
 * ============================================================
 * API Route: GET /api/stats
 * ============================================================
 *
 * Public endpoint — returns platform-wide statistics for the
 * landing page StatsBar component.
 *
 * METRICS:
 * ────────
 * - totalDrops:  Number of NFT drops created on the platform
 * - totalClaims: Sum of all claimsCount across all drops
 * - totalWallets: Number of unique wallet addresses that have claimed
 *
 * PERFORMANCE:
 * ────────────
 * Uses aggregate queries and groupBy for efficient counting
 * without loading individual records into memory.
 *
 * GRACEFUL FALLBACK:
 * ──────────────────
 * On any error, returns zeroes instead of a 500 error.
 * The landing page should always render, even if the DB is down.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Disable static caching — stats change in real time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Run all three queries in parallel for speed
    const [totalDrops, totalClaimsAgg, uniqueWallets] = await Promise.all([
      // Count all NFT drops ever created
      prisma.nFT.count(),
      // Sum all claims across all drops (using aggregate, not count)
      prisma.nFT.aggregate({ _sum: { claimsCount: true } }),
      // Count unique wallet addresses from claim records
      prisma.claimRecord
        .groupBy({ by: ["walletAddress"] })
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      totalDrops,
      totalClaims: totalClaimsAgg._sum.claimsCount ?? 0,
      totalWallets: uniqueWallets,
    });
  } catch {
    // Graceful fallback: return zeroes if the database is unreachable
    return NextResponse.json({
      totalDrops: 0,
      totalClaims: 0,
      totalWallets: 0,
    });
  }
}
