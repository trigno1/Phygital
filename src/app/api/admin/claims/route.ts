/**
 * ============================================================
 * API Route: GET /api/admin/claims
 * ============================================================
 *
 * Admin-only endpoint — returns the 50 most recent claim records,
 * enriched with the drop name for each claim.
 *
 * ENRICHMENT:
 * ───────────
 * Claim records only store dropId, not the drop name.
 * This route does a second query to fetch drop names and
 * merges them into each claim record so the admin UI can
 * display human-readable drop names instead of raw IDs.
 *
 * This avoids a Prisma relation (which would require a
 * foreign key — not ideal for MongoDB's flexible schema).
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

  // ── Fetch the 50 most recent claims ───────────────────────
  const claims = await prisma.claimRecord.findMany({
    orderBy: { claimedAt: "desc" },
    take: 50,
    select: {
      id: true,
      dropId: true,
      walletAddress: true,
      txHash: true,
      claimedAt: true,
    },
  });

  // ── Enrich with drop names ────────────────────────────────
  // Extract unique drop IDs to avoid duplicate queries
  const dropIds = [...new Set(claims.map((c) => c.dropId))];
  // Fetch only the IDs and names (minimal data transfer)
  const drops = await prisma.nFT.findMany({
    where: { id: { in: dropIds } },
    select: { id: true, name: true },
  });
  // Build a lookup map: dropId → dropName
  const nameMap = Object.fromEntries(drops.map((d) => [d.id, d.name]));

  // Merge drop names into claim records
  const enriched = claims.map((c) => ({
    ...c,
    dropName: nameMap[c.dropId] ?? "Unknown Drop",
  }));

  return NextResponse.json({ claims: enriched });
}
