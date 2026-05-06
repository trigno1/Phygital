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

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, address, password } = body;

    if (!id || !address) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "Missing required fields: id, address",
        status: 400,
      });
    }

    // 1. Fetch the NFT from DB
    const existing = await prisma.nFT.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse({
        code: ErrorCode.NOT_FOUND,
        message: "NFT drop not found",
        status: 404,
      });
    }

    // 2. Check expiry
    if (existing.expiresAt && new Date() > existing.expiresAt) {
      return errorResponse({
        code: ErrorCode.EXPIRED,
        message: "This NFT drop has expired and can no longer be claimed",
        status: 410,
      });
    }

    // 3. Check if not live yet
    if (existing.issuedAt && new Date() < existing.issuedAt) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: `This NFT drop is not live yet. Available from ${existing.issuedAt.toLocaleDateString()}`,
        status: 425,
      });
    }

    // 4. Password check
    if (existing.password) {
      if (!password) {
        return errorResponse({
          code: ErrorCode.UNAUTHORIZED,
          message: "This NFT requires a secret code to claim",
          status: 403,
          details: { requiresPassword: true },
        });
      }
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

    // 5. Check global claim limit
    if (existing.maxClaims !== null) {
      if (existing.claimsCount >= existing.maxClaims) {
        return errorResponse({
          code: ErrorCode.LIMIT_REACHED,
          message: `This NFT drop is fully claimed (${existing.maxClaims}/${existing.maxClaims})`,
          status: 409,
        });
      }
    } else {
      // Original single-claim behavior
      if (existing.minted) {
        return errorResponse({
          code: ErrorCode.LIMIT_REACHED,
          message: "This NFT has already been claimed",
          status: 409,
        });
      }
    }

    // 5b. ✅ DUPLICATE CLAIM PREVENTION — Check per-wallet claim record
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

    // 6. Set up Thirdweb client
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

    // 7. Build NFT metadata
    const attributesRaw = existing.attributes as Record<string, string> | null;
    const attributes = attributesRaw
      ? Object.entries(attributesRaw).map(([trait_type, value]) => ({
          trait_type,
          value: String(value),
        }))
      : [];

    // 8. Mint on-chain
    const transaction = mintTo({
      contract,
      to: address,
      nft: {
        name: existing.name,
        description: existing.description,
        image: existing.image,
        attributes,
        ...(existing.externalUrl && { external_url: existing.externalUrl }),
      },
      supply: BigInt(1),
    });

    const sentTx = await sendTransaction({ transaction, account });
    const receipt = await waitForReceipt({
      client,
      chain: baseSepolia,
      transactionHash: sentTx.transactionHash,
    });

    const txHash = receipt.transactionHash;
    const newClaimsCount = existing.claimsCount + 1;
    const isFullyClaimed =
      existing.maxClaims !== null && newClaimsCount >= existing.maxClaims;

    // 9. Update DB + record claim record atomically
    const [updated] = await prisma.$transaction([
      prisma.nFT.update({
        where: { id },
        data: {
          minted: existing.maxClaims === null ? true : isFullyClaimed,
          owner: address,
          txHash,
          claimsCount: { increment: 1 },
        },
      }),
      prisma.claimRecord.create({
        data: {
          dropId: id,
          walletAddress: address.toLowerCase(),
          txHash,
        },
      }),
    ]);

    // Fire emails non-blocking
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sem-project-5.vercel.app";
    const explorerBase = "https://sepolia.basescan.org/tx";

    const emailJobs = [];

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

    Promise.all(emailJobs).catch(console.error);

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
