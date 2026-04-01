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
    const { id, address } = body;

    if (!id || !address) {
      return NextResponse.json(
        { error: "Missing required fields: id, address" },
        { status: 400 }
      );
    }

    // 1. Validate NFT exists and hasn't been claimed
    const existing = await prisma.nFT.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    if (existing.minted) {
      return NextResponse.json(
        { error: "This NFT has already been claimed" },
        { status: 409 }
      );
    }

    // 2. Set up Thirdweb client (server-side uses secretKey)
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_API_SECRET_KEY!,
    });

    // 3. Create backend wallet account from private key (this pays gas)
    const account = privateKeyToAccount({
      client,
      privateKey: process.env.THIRDWEB_ADMIN_PRIVATE_KEY!,
    });

    // 4. Reference the deployed ERC-1155 Edition contract on Base Sepolia
    const contract = getContract({
      client,
      chain: baseSepolia,
      address: process.env.NFT_CONTRACT_ADDRESS!,
    });

    // 5. Build NFT attributes in the standard OpenSea trait format
    const attributesRaw = existing.attributes as Record<string, string> | null;
    const attributes = attributesRaw
      ? Object.entries(attributesRaw).map(([trait_type, value]) => ({
          trait_type,
          value: String(value),
        }))
      : [];

    // 6. Mint the NFT on-chain — backend wallet signs & pays gas, NFT goes to user
    const transaction = mintTo({
      contract,
      to: address,
      nft: {
        name: existing.name,
        description: existing.description,
        image: existing.image, // IPFS URI — Thirdweb handles gateway resolution
        attributes,
      },
      supply: BigInt(1), // Mint 1 edition to the claimant
    });

    const sentTx = await sendTransaction({ transaction, account });
    const receipt = await waitForReceipt({
      client,
      chain: baseSepolia,
      transactionHash: sentTx.transactionHash,
    });

    const txHash = receipt.transactionHash;

    // 7. Mark as claimed in DB with owner address and on-chain tx hash
    const updated = await prisma.nFT.update({
      where: { id },
      data: {
        minted: true,
        owner: address,
        txHash,
      },
    });

    return NextResponse.json({ success: true, nft: updated, txHash });
  } catch (error) {
    console.error("Claim NFT error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error while minting",
      },
      { status: 500 }
    );
  }
}
