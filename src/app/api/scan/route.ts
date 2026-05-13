/**
 * ============================================================
 * API Route: POST /api/scan
 * ============================================================
 *
 * Lightweight scan counter endpoint — increments the scansCount
 * for a given drop when its QR code is scanned.
 *
 * This is a separate, lightweight endpoint specifically for
 * QR code scan tracking (as opposed to the /api/nft route
 * which also increments scans but returns full NFT data).
 *
 * Uses a read-then-write pattern (findUnique → update) for
 * compatibility with MongoDB's update semantics.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Disable static caching
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Extract the drop ID from the request body
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    
    // Read the current scan count first (MongoDB-compatible pattern)
    const nft = await prisma.nFT.findUnique({
      where: { id },
      select: { scansCount: true }
    });

    // Only increment if the NFT exists
    if (nft) {
      await prisma.nFT.update({
        where: { id },
        data: { scansCount: (nft.scansCount || 0) + 1 },
      });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SCAN API ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
