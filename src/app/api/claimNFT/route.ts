import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createThirdwebClient,
  getContract,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { mintTo } from "thirdweb/extensions/erc1155";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, address, password } = body;

    if (!id || !address) {
      return NextResponse.json(
        { error: "Missing required fields: id, address" },
        { status: 400 }
      );
    }

    // 1. Fetch the NFT from DB
    const existing = await prisma.nFT.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    // 2. Check expiry
    if (existing.expiresAt && new Date() > existing.expiresAt) {
      return NextResponse.json(
        { error: "This NFT drop has expired and can no longer be claimed" },
        { status: 410 }
      );
    }

    // 3. Check if not live yet
    if (existing.issuedAt && new Date() < existing.issuedAt) {
      return NextResponse.json(
        { error: `This NFT drop is not live yet. Available from ${existing.issuedAt.toLocaleDateString()}` },
        { status: 425 }
      );
    }

    // 4. Password check
    if (existing.password) {
      if (!password) {
        return NextResponse.json(
          { error: "This NFT requires a secret code to claim", requiresPassword: true },
          { status: 403 }
        );
      }
      if (password !== existing.password) {
        return NextResponse.json(
          { error: "Incorrect secret code", requiresPassword: true },
          { status: 403 }
        );
      }
    }

    // 5. Check claim limit
    if (existing.maxClaims !== null) {
      if (existing.claimsCount >= existing.maxClaims) {
        return NextResponse.json(
          { error: `This NFT drop is fully claimed (${existing.maxClaims}/${existing.maxClaims})` },
          { status: 409 }
        );
      }
    } else {
      // Original single-claim behavior
      if (existing.minted) {
        return NextResponse.json(
          { error: "This NFT has already been claimed" },
          { status: 409 }
        );
      }
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

    // 9. Update DB
    const updated = await prisma.nFT.update({
      where: { id },
      data: {
        minted: existing.maxClaims === null ? true : isFullyClaimed,
        owner: address,
        txHash,
        claimsCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, nft: updated, txHash });
  } catch (error) {
    console.error("Claim NFT error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error while minting",
      },
      { status: 500 }
    );
  }
}
