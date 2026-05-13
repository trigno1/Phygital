/**
 * ============================================================
 * API Route: GET /api/my-drops
 * ============================================================
 *
 * Authenticated endpoint — returns all NFT drops created by
 * the caller's wallet. Used by the Dashboard "My Drops" tab.
 *
 * SECURITY:
 * ─────────
 * Requires wallet signature authentication AND address matching.
 * A user can only see drops they created (creatorAddress = their wallet).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { verifyAuth } from "@/lib/auth-helper";

// Disable static caching
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Extract the wallet address from the query string
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "wallet address parameter is required",
        status: 400,
      });
    }

    // Verify the caller owns this wallet (signature check)
    const auth = await verifyAuth(request, address);
    if (!auth.isValid) return auth.response!;

    // Fetch all drops created by this wallet, newest first
    const drops = await prisma.nFT.findMany({
      where: { creatorAddress: address },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        category: true,
        claimsCount: true,
        scansCount: true,
        maxClaims: true,
        minted: true,
        isSoulbound: true,
        issuedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ drops });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "An encrypted server error occurred while fetching your drops",
      status: 500,
      details: error,
    });
  }
}
