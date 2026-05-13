/**
 * ============================================================
 * API Route: GET /api/admin/users
 * ============================================================
 *
 * Admin-only endpoint — returns all platform users with their
 * activity metrics (drops created, claims received).
 *
 * DATA SOURCE:
 * ─────────────
 * Instead of only showing users with profiles, this route
 * discovers ALL wallets that have ever interacted with the
 * platform by merging data from three sources:
 *
 *   1. claimRecord   → wallets that claimed drops
 *   2. NFT           → wallets that created drops
 *   3. UserProfile   → wallets that set up profiles
 *
 * Wallets without profiles get a placeholder profile object
 * with nulls, so the admin UI can still display them.
 *
 * SORTING: Most active users first (drops + claims combined).
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

  // ── Fetch all activity data in parallel ───────────────────
  const [claimCounts, dropCounts, profiles] = await Promise.all([
    // Count claims per wallet (how many NFTs each wallet has claimed)
    prisma.claimRecord.groupBy({
      by: ["walletAddress"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // Count drops per creator (how many NFTs each wallet has created)
    prisma.nFT.groupBy({
      by: ["creatorAddress"],
      _count: { id: true },
      where: { creatorAddress: { not: null } },
    }),
    // Fetch all user profiles
    prisma.userProfile.findMany(),
  ]);

  // ── Build lookup maps for O(1) access ─────────────────────
  const profileMap = new Map(
    profiles.map((p) => [p.address.toLowerCase(), p])
  );
  const dropMap = new Map(
    dropCounts.map((r) => [r.creatorAddress!.toLowerCase(), r._count.id])
  );

  // ── Collect ALL unique wallet addresses ───────────────────
  // This ensures wallets that only created drops (no claims) still appear
  const allWallets = new Set([
    ...claimCounts.map((r) => r.walletAddress.toLowerCase()),
    ...dropCounts.map((r) => r.creatorAddress!.toLowerCase()),
  ]);

  // ── Build the enriched user list ──────────────────────────
  const users = Array.from(allWallets).map((addr) => {
    const profile = profileMap.get(addr);
    // Look up this wallet's claim count from the grouped data
    const claimsReceived =
      claimCounts.find((r) => r.walletAddress.toLowerCase() === addr)
        ?._count.id ?? 0;
    const dropsCreated = dropMap.get(addr) ?? 0;
    return {
      // Use the real profile if it exists, otherwise create a placeholder
      profile: profile ?? {
        id: addr,
        address: addr,
        name: null,
        bio: null,
        location: null,
        avatar: null,
        github: null,
        twitter: null,
        linkedin: null,
        website: null,
        createdAt: new Date().toISOString(),
      },
      dropsCreated,
      claimsReceived,
    };
  });

  // Sort by total activity (most active first)
  users.sort((a, b) => b.dropsCreated + b.claimsReceived - (a.dropsCreated + a.claimsReceived));

  return NextResponse.json({ users });
}
