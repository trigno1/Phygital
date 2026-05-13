/**
 * ============================================================
 * API Route: GET / DELETE — /api/admin/drops
 * ============================================================
 *
 * Admin-only endpoint for managing all NFT drops on the platform.
 *
 * GET  /api/admin/drops      → Lists all drops with sanitized data
 * DELETE /api/admin/drops?id= → Deletes a drop and all its claim records
 *
 * SECURITY:
 * ─────────
 * Both methods require admin wallet authentication.
 *
 * DATA SANITIZATION:
 * ──────────────────
 * The password hash is stripped from GET responses — only a
 * boolean `hasPassword` flag is sent. This prevents leaking
 * bcrypt hashes to the admin frontend.
 *
 * CASCADE DELETE:
 * ───────────────
 * When deleting a drop, all associated ClaimRecords are also
 * removed in a single atomic transaction to maintain data integrity.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

// Disable static caching
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/drops
 * Returns all drops sorted by claim count (most popular first).
 * Password hashes are replaced with a boolean flag.
 */
export async function GET(request: Request) {
  // Verify admin wallet
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  // Fetch all drops, sorted by popularity (most claimed first)
  const drops = await prisma.nFT.findMany({
    orderBy: { claimsCount: "desc" },
    select: {
      id: true,
      name: true,
      image: true,
      category: true,
      claimsCount: true,
      scansCount: true,
      maxClaims: true,
      minted: true,
      isSoulbound: true,
      isPublic: true,
      password: true,       // Fetched only to convert to boolean
      expiresAt: true,
      issuedAt: true,
      createdAt: true,
      creatorAddress: true,
    },
  });

  // Sanitize: replace password hash with a safe boolean flag
  const sanitized = drops.map(({ password, ...rest }) => ({
    ...rest,
    hasPassword: !!password,
  }));

  return NextResponse.json({ drops: sanitized });
}

/**
 * DELETE /api/admin/drops?id={dropId}
 * Deletes a drop and all its associated claim records atomically.
 */
export async function DELETE(request: Request) {
  // Verify admin wallet
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  // Extract the drop ID from the query string
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // Atomic cascade delete: remove claims first, then the drop
    await prisma.$transaction([
      prisma.claimRecord.deleteMany({ where: { dropId: id } }),
      prisma.nFT.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
