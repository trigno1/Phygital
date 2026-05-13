/**
 * ============================================================
 * API Route: POST /api/create-nft
 * ============================================================
 *
 * Creates a new NFT drop in the database and generates a
 * branded QR code that links to the claim page.
 *
 * This does NOT mint on-chain yet — the actual blockchain
 * transaction happens when someone claims the drop via
 * /api/claimNFT. This is a "lazy minting" pattern that
 * saves gas costs until a real user wants to claim.
 *
 * FEATURES:
 * ─────────
 * - Wallet signature authentication (only the creator can create)
 * - Password protection via bcrypt hashing
 * - Branded QR code generation with fallback
 * - Email notification to creator on success
 *
 * RETURNS: { id, qrDataUrl, claimUrl }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { verifyAuth } from "@/lib/auth-helper";
import { generateBrandedQR } from "@/lib/branded-qr";
import { sendEmail } from "@/lib/email";
import { dropCreatedEmail, passwordDropEmail } from "@/lib/email-templates";

// Disable static caching — this route always runs dynamically
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // ── Parse all fields from the request body ──────────────
    const body = await request.json();
    const {
      name,
      description,
      image,            // IPFS URI from the upload endpoint
      category,         // Optional category tag (e.g., "Event", "Art")
      issuedAt,         // Optional: scheduled start date
      expiresAt,        // Optional: expiry date
      attributes,       // Optional: key-value metadata pairs
      maxClaims,        // Optional: max number of claims (null = unlimited)
      password,         // Optional: secret code to gate claims
      isSoulbound,      // If true, NFT cannot be transferred after claim
      isPublic,         // If true, appears on the /explore page
      externalUrl,      // Optional: link to external resource
      creatorAddress,   // Wallet address of the creator
    } = body;

    // Validate the three required fields
    if (!name || !description || !image) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "Missing required fields: name, description, image",
        status: 400,
      });
    }

    // FIX 5: Input length validation to prevent oversized payloads
    const NAME_MAX = 100;
    const DESC_MAX = 1000;
    const URL_MAX = 500;

    if (name?.length > NAME_MAX) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: `Name must be ${NAME_MAX} characters or fewer`,
        status: 400,
      });
    }
    if (description?.length > DESC_MAX) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: `Description must be ${DESC_MAX} characters or fewer`,
        status: 400,
      });
    }
    if (externalUrl && externalUrl.length > URL_MAX) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: `External URL must be ${URL_MAX} characters or fewer`,
        status: 400,
      });
    }

    // ── Authenticate: verify the wallet signature ───────────
    // Ensures the caller actually owns the creatorAddress wallet
    const auth = await verifyAuth(request, creatorAddress);
    if (!auth.isValid) return auth.response!;

    // ── Hash the password if provided ───────────────────────
    // bcrypt with 10 salt rounds — the plain password is NEVER stored
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // ── Create the NFT record in MongoDB ────────────────────
    // Note: This is just the database record. The actual on-chain
    // minting happens later when someone calls /api/claimNFT.
    const nft = await prisma.nFT.create({
      data: {
        name,
        description,
        image,
        category: category || null,
        issuedAt: issuedAt ? new Date(issuedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        attributes: attributes || null,
        maxClaims: maxClaims ? parseInt(maxClaims, 10) : null,
        password: hashedPassword,     // Store the HASH, never the plain password
        isSoulbound: isSoulbound ?? false,
        isPublic: isPublic ?? false,
        externalUrl: externalUrl || null,
        creatorAddress: creatorAddress || null,
        minted: false,                // Not minted yet (lazy minting)
        claimsCount: 0,               // No claims yet
      },
    });

    // ── Generate the claim URL ──────────────────────────────
    const url = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    const claimUrl = `${origin}/claim?id=${nft.id}`;

    // ── Generate branded QR code ────────────────────────────
    // Try the branded version first (with logo + NFT name),
    // fall back to a plain QR code if branded generation fails
    let qrDataUrl: string;
    try {
      qrDataUrl = await generateBrandedQR(claimUrl, nft.name);
    } catch {
      // Fallback to raw QR if branded generation fails
      qrDataUrl = await QRCode.toDataURL(claimUrl, {
        errorCorrectionLevel: "H",   // High error correction (survives logo overlay)
        type: "image/png",
        margin: 2,
        color: { dark: "#1e1b4b", light: "#ffffff" },
        width: 512,
      });
    }

    // ── Send email notifications to the creator ─────────────
    // Non-blocking: uses .catch() so email failures don't delay the response
    if (creatorAddress) {
      const creator = await prisma.userProfile.findUnique({
        where: { address: creatorAddress.toLowerCase() }
      });
      if (creator?.email) {
        // Notify creator that their drop is live
        sendEmail({
          to: creator.email,
          subject: `Your drop "${nft.name}" is live`,
          html: dropCreatedEmail({
            dropName: nft.name,
            image: nft.image,
            claimUrl,
            maxClaims: nft.maxClaims ?? undefined,
            expiresAt: nft.expiresAt?.toISOString(),
            hasPassword: !!password,
          }),
        }).catch(console.error);
        
        // If password-protected, email the plain password to the creator
        // (This is the only time the plain password is accessible — it's
        // hashed in the database and can't be recovered later)
        if (password) {
          sendEmail({
            to: creator.email,
            subject: `Secret code for "${nft.name}"`,
            html: passwordDropEmail({
              dropName: nft.name,
              password: password,   // The plain password, before hashing
              claimUrl,
            }),
          }).catch(console.error);
        }
      }
    }

    // ── Return the drop ID, QR code, and claim link ─────────
    return NextResponse.json({ id: nft.id, qrDataUrl, claimUrl });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "An encrypted server error occurred while creating the NFT",
      status: 500,
      details: error instanceof Error ? error.message : "Internal error",
    });
  }
}
