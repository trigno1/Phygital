/**
 * ============================================================
 * API Route: GET /api/qr?id={dropId}
 * ============================================================
 *
 * Authenticated endpoint — regenerates the QR code for a drop.
 * Only the creator of the drop can regenerate its QR code.
 *
 * USE CASE:
 * ─────────
 * If a creator loses their original QR code, they can regenerate
 * it from the dashboard. The QR always points to the same
 * /claim?id={dropId} URL.
 *
 * Uses the branded QR generator (with logo + drop name) with
 * a plain QR code as fallback.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { verifyAuth } from "@/lib/auth-helper";
import { generateBrandedQR } from "@/lib/branded-qr";

// Disable static caching
export const dynamic = "force-dynamic";

/**
 * GET /api/qr?id={dropId}
 * Authenticated — regenerates QR code for a drop the caller created.
 * Requires x-signature + x-address headers matching the drop's creatorAddress.
 */
export async function GET(request: Request) {
  try {
    // Extract the drop ID from the query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "Missing required query param: id",
        status: 400,
      });
    }

    // Authenticate the request (verify wallet signature)
    const auth = await verifyAuth(request, null);
    if (!auth.isValid) return auth.response!;

    // Fetch the drop from the database
    const nft = await prisma.nFT.findUnique({ where: { id } });

    if (!nft) {
      return errorResponse({
        code: ErrorCode.NOT_FOUND,
        message: "NFT drop not found",
        status: 404,
      });
    }

    // Ensure the caller is the creator of this drop
    if (
      nft.creatorAddress &&
      auth.address?.toLowerCase() !== nft.creatorAddress.toLowerCase()
    ) {
      return errorResponse({
        code: ErrorCode.UNAUTHORIZED,
        message: "You are not the creator of this drop",
        status: 403,
      });
    }

    // ── Generate the claim URL ──────────────────────────────
    const url = new URL(request.url);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    const claimUrl = `${origin}/claim?id=${nft.id}`;

    // ── Generate branded QR code (with fallback) ────────────
    let qrDataUrl: string;
    try {
      qrDataUrl = await generateBrandedQR(claimUrl, nft.name);
    } catch {
      // Fallback to plain QR if branded generation fails
      qrDataUrl = await QRCode.toDataURL(claimUrl, {
        errorCorrectionLevel: "H",
        type: "image/png",
        margin: 2,
        color: { dark: "#1e1b4b", light: "#ffffff" },
        width: 512,
      });
    }

    return NextResponse.json({ qrDataUrl, claimUrl });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "Failed to regenerate QR code",
      status: 500,
      details: error,
    });
  }
}
