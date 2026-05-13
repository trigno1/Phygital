/**
 * ============================================================
 * API Route: GET /api/explore
 * ============================================================
 *
 * Public endpoint — no authentication required.
 * Returns all active NFT drops that creators have marked as public.
 *
 * FILTERING LOGIC:
 * ────────────────
 * A drop appears on the explore page only if ALL of these are true:
 *   ✅ isPublic = true        (creator opted in)
 *   ✅ Not expired             (expiresAt is null or in the future)
 *   ✅ Already live             (issuedAt is null or in the past)
 *   ✅ Not fully claimed        (claimsCount < maxClaims, or maxClaims is null)
 *
 * SENSITIVE FIELDS:
 * ─────────────────
 * The `password` and `creatorAddress` fields are NOT included
 * in the select clause to prevent leaking sensitive data.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Disable static caching — drop availability changes in real time
export const dynamic = "force-dynamic";

/**
 * GET /api/explore
 * Returns all publicly visible, active, claimable NFT drops.
 */
export async function GET() {
  try {
    const now = new Date();

    // Fetch all public drops that are currently live and not expired
    const drops = await prisma.nFT.findMany({
      where: {
        isPublic: true,           // Only creator-approved public drops
        OR: [
          { expiresAt: null },     // No expiry set
          { expiresAt: { gt: now } }, // Or hasn't expired yet
        ],
        AND: [
          {
            OR: [
              { issuedAt: null },     // No start date set
              { issuedAt: { lte: now } }, // Or already past the start date
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        category: true,
        claimsCount: true,
        maxClaims: true,
        scansCount: true,
        expiresAt: true,
        issuedAt: true,
        isSoulbound: true,
        createdAt: true,
        // Note: password and creatorAddress are intentionally excluded
      },
      orderBy: { createdAt: "desc" }, // Newest first
    });

    // Filter out drops that have been fully claimed
    const available = drops.filter(
      (d) => d.maxClaims === null || d.claimsCount < d.maxClaims
    );

    return NextResponse.json({ drops: available });
  } catch (error) {
    console.error("[explore] fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drops" },
      { status: 500 }
    );
  }
}
