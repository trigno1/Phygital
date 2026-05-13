/**
 * ============================================================
 * API Route: GET /api/nft?id={dropId}
 * ============================================================
 *
 * Public endpoint — fetches a single NFT drop by ID.
 * Used by the /claim page to display drop details before claiming.
 *
 * SIDE EFFECT:
 * ────────────
 * Each call increments the scansCount counter asynchronously.
 * This tracks how many times the QR code / claim link was viewed,
 * giving creators a "conversion rate" metric (scans vs. claims).
 *
 * The scan increment is fire-and-forget — it doesn't block
 * the response and failures are silently logged.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, errorResponse } from "@/lib/error-handler";

// Disable static caching — scan count changes on every request
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Extract the drop ID from the query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "Missing NFT ID",
        status: 400,
      });
    }

    // Fetch the full NFT record
    const nft = await prisma.nFT.findUnique({
      where: { id },
    });

    if (!nft) {
      return errorResponse({
        code: ErrorCode.NOT_FOUND,
        message: "NFT drop not found",
        status: 404,
      });
    }

    // Increment scansCount asynchronously (fire-and-forget)
    // This doesn't block the response — the client gets the NFT data immediately
    prisma.nFT.update({
      where: { id },
      data: { scansCount: { increment: 1 } }
    }).catch(console.error);

    return NextResponse.json({ nft });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "An encrypted server error occurred while fetching the NFT",
      status: 500,
      details: error,
    });
  }
}
