/**
 * ============================================================
 * API Route: POST /api/upload
 * ============================================================
 *
 * Handles image uploads for NFT drops.
 * Uploads the file to IPFS (decentralized storage) via
 * Thirdweb's storage service and returns the IPFS URI.
 *
 * SECURITY:
 * ─────────
 * - Only allows JPEG, PNG, GIF, and WebP files (explicit allowlist)
 * - Enforces a 10MB max file size to prevent abuse
 * - No executable files or scripts can be uploaded
 *
 * IPFS STORAGE:
 * ─────────────
 * Files are stored on IPFS (InterPlanetary File System), a
 * decentralized storage network. The returned URI looks like:
 *   ipfs://QmXxx...
 *
 * This URI is later used as the NFT's image when minting on-chain.
 * IPFS guarantees the image is permanent and tamper-proof.
 */

import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

// Disable static caching
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── File type validation (explicit allowlist) ───────────
    // Only safe image formats are allowed — no PDFs, SVGs, or executables
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // ── File size validation ────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    // ── Upload to IPFS via Thirdweb Storage ─────────────────
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_API_SECRET_KEY!,
    });

    // Returns an IPFS URI like "ipfs://QmXxx..."
    const uri = await upload({ client, files: [file] });

    return NextResponse.json({ uri });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
