/**
 * ============================================================
 * API Route: POST /api/claimNFT
 * ============================================================
 *
 * The core claim endpoint — mints an NFT to a user's wallet.
 * This is the most critical route in the entire app. It:
 *
 * 1. Validates the drop exists and is still active
 * 2. Checks expiry dates, claim limits, and password gates
 * 3. Prevents duplicate claims (one per wallet per drop)
 * 4. Mints an ERC-1155 token on-chain via Thirdweb
 * 5. Records the claim in the database atomically
 * 6. Sends email notifications to creator and claimer
 *
 * SECURITY:
 * ─────────
 * - Rate-limited by middleware (10 req/min per IP)
 * - Passwords are compared using bcrypt (constant-time)
 * - Duplicate claims are prevented by a unique DB constraint
 *
 * GAS: The admin wallet pays gas for all mints. This is why
 * rate limiting is critical — without it, a bot could drain
 * the admin wallet's ETH balance.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  createThirdwebClient,
  getContract,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { mintTo } from "thirdweb/extensions/erc1155";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { sendEmail } from "@/lib/email";
import { dropClaimedCreatorEmail, claimSuccessEmail, dropFullyClaimedEmail } from "@/lib/email-templates";

// Disable static caching — this route must always run dynamically
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // ── Parse request body ──────────────────────────────────
    const body = await request.json();
    const { id, address, password } = body;

    // Validate required fields
    if (!id || !address) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "Missing required fields: id, address",
        status: 400,
      });
    }

    // ── Step 1: Fetch the NFT drop from the database ────────
    const existing = await prisma.nFT.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse({
        code: ErrorCode.NOT_FOUND,
        message: "NFT drop not found",
        status: 404,
      });
    }

    // ── Step 2: Check if the drop has expired ───────────────
    if (existing.expiresAt && new Date() > existing.expiresAt) {
      return errorResponse({
        code: ErrorCode.EXPIRED,
        message: "This NFT drop has expired and can no longer be claimed",
        status: 410, // 410 Gone — resource no longer available
      });
    }

    // ── Step 3: Check if the drop is live yet ───────────────
    // Drops can have a future issuedAt date (scheduled launches)
    if (existing.issuedAt && new Date() < existing.issuedAt) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: `This NFT drop is not live yet. Available from ${existing.issuedAt.toLocaleDateString()}`,
        status: 425,
      });
    }

    // ── Step 4: Verify password (if the drop is password-gated) ──
    if (existing.password) {
      if (!password) {
        // Tell the frontend that a password is required
        return errorResponse({
          code: ErrorCode.UNAUTHORIZED,
          message: "This NFT requires a secret code to claim",
          status: 403,
          details: { requiresPassword: true }, // UI uses this to show password input
        });
      }
      // Compare the provided password against the bcrypt hash
      const match = await bcrypt.compare(password, existing.password);
      if (!match) {
        return errorResponse({
          code: ErrorCode.UNAUTHORIZED,
          message: "Incorrect secret code",
          status: 403,
          details: { requiresPassword: true },
        });
      }
    }

    // ── Step 5: Check global claim limit ────────────────────
    if (existing.maxClaims !== null) {
      // Multi-claim drop: check if all spots are taken
      if (existing.claimsCount >= existing.maxClaims) {
        return errorResponse({
          code: ErrorCode.LIMIT_REACHED,
          message: `This NFT drop is fully claimed (${existing.maxClaims}/${existing.maxClaims})`,
          status: 409, // 409 Conflict
        });
      }
    } else {
      // Single-claim drop (legacy): check the minted flag
      if (existing.minted) {
        return errorResponse({
          code: ErrorCode.LIMIT_REACHED,
          message: "This NFT has already been claimed",
          status: 409,
        });
      }
    }

    // ── Step 5b: Prevent duplicate claims per wallet ────────
    // The @@unique constraint on [dropId, walletAddress] ensures
    // each wallet can only claim a drop once
    const existingClaim = await prisma.claimRecord.findUnique({
      where: {
        dropId_walletAddress: {
          dropId: id,
          walletAddress: address.toLowerCase(),
        },
      },
    });

    if (existingClaim) {
      return errorResponse({
        code: ErrorCode.LIMIT_REACHED,
        message: "You have already claimed this NFT with this wallet.",
        status: 409,
      });
    }

    // ── Step 6: Initialize Thirdweb SDK for on-chain minting ──
    // The admin wallet pays the gas fees for all mints
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_API_SECRET_KEY!,
    });

    const account = privateKeyToAccount({
      client,
      privateKey: process.env.THIRDWEB_ADMIN_PRIVATE_KEY!,
    });

    const contract = getContract({
      client,
      chain: baseSepolia,
      address: process.env.NFT_CONTRACT_ADDRESS!,
    });

    // ── Step 7: Build NFT metadata for on-chain storage ─────
    // Convert { key: value } attributes to OpenSea-compatible format
    const attributesRaw = existing.attributes as Record<string, string> | null;
    const attributes = attributesRaw
      ? Object.entries(attributesRaw).map(([trait_type, value]) => ({
          trait_type,
          value: String(value),
        }))
      : [];

    // ── Step 8: Mint the NFT on-chain ───────────────────────
    // This creates a new ERC-1155 token and sends it to the claimer's wallet
    const transaction = mintTo({
      contract,
      to: address,                // Claimer's wallet receives the NFT
      nft: {
        name: existing.name,
        description: existing.description,
        image: existing.image,     // IPFS URI of the NFT image
        attributes,
        ...(existing.externalUrl && { external_url: existing.externalUrl }),
      },
      supply: BigInt(1),           // Mint exactly 1 copy
    });

    // Send the transaction and wait for it to be confirmed on-chain
    const sentTx = await sendTransaction({ transaction, account });
    const receipt = await waitForReceipt({
      client,
      chain: baseSepolia,
      transactionHash: sentTx.transactionHash,
    });

    // ── Step 9: Update the database atomically ──────────────
    // Use a transaction to ensure both operations succeed or both fail
    const txHash = receipt.transactionHash;
    const newClaimsCount = existing.claimsCount + 1;
    const isFullyClaimed =
      existing.maxClaims !== null && newClaimsCount >= existing.maxClaims;

    const [updated] = await prisma.$transaction([
      // Update the NFT record with new claim count and tx hash
      prisma.nFT.update({
        where: { id },
        data: {
          minted: existing.maxClaims === null ? true : isFullyClaimed,
          owner: address,
          txHash,
          claimsCount: { increment: 1 },
        },
      }),
      // Create a claim record (prevents duplicate claims via unique constraint)
      prisma.claimRecord.create({
        data: {
          dropId: id,
          walletAddress: address.toLowerCase(),
          txHash,
        },
      }),
    ]);

    // ── Step 10: Send email notifications (non-blocking) ────
    // Emails are fire-and-forget — they should never delay the response
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sem-project-5.vercel.app";
    const explorerBase = "https://sepolia.basescan.org/tx";

    const emailJobs = [];

    // Notify the drop creator that someone claimed their drop
    if (updated.creatorAddress) {
      const creator = await prisma.userProfile.findUnique({
        where: { address: updated.creatorAddress.toLowerCase() }
      });
      if (creator?.email) {
        emailJobs.push(sendEmail({
          to: creator.email,
          subject: `New claim on "${updated.name}"`,
          html: dropClaimedCreatorEmail({
            dropName: updated.name,
            claimerAddress: address.toLowerCase(),
            txHash: txHash,
            totalClaims: updated.claimsCount,
            maxClaims: updated.maxClaims ?? undefined,
            dashboardUrl: `${appUrl}/dashboard`,
          }),
        }));
        
        // If this claim filled the last spot, notify the creator
        if (updated.maxClaims !== null && updated.claimsCount >= updated.maxClaims) {
          emailJobs.push(sendEmail({
            to: creator.email,
            subject: `"${updated.name}" is fully claimed!`,
            html: dropFullyClaimedEmail({
              dropName: updated.name,
              totalClaims: updated.claimsCount,
              totalScans: updated.scansCount,
              dashboardUrl: `${appUrl}/dashboard`,
            }),
          }));
        }
      }
    }

    // Notify the claimer with a receipt email
    const claimer = await prisma.userProfile.findUnique({
      where: { address: address.toLowerCase() }
    });
    if (claimer?.email) {
      emailJobs.push(sendEmail({
        to: claimer.email,
        subject: `You claimed "${updated.name}"`,
        html: claimSuccessEmail({
          dropName: updated.name,
          image: updated.image,
          txHash: txHash,
          explorerUrl: `${explorerBase}/${txHash}`,
          appUrl,
        }),
      }));
    }

    // Fire all emails in parallel, don't await — response goes out immediately
    Promise.all(emailJobs).catch(console.error);

    // ── Return success with the updated NFT data ────────────
    return NextResponse.json({ success: true, nft: updated, txHash });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "An encrypted server error occurred",
      status: 500,
      details: error,
    });
  }
}
