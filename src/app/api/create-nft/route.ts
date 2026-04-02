import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      image,
      category,
      issuedAt,
      expiresAt,
      attributes,
      maxClaims,
      password,
      isSoulbound,
      externalUrl,
      creatorAddress,
    } = body;

    if (!name || !description || !image) {
      return NextResponse.json(
        { message: "Missing required fields: name, description, image" },
        { status: 400 }
      );
    }

    // Create the NFT record in the database
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
        password: password || null,
        isSoulbound: isSoulbound ?? false,
        externalUrl: externalUrl || null,
        creatorAddress: creatorAddress || null,
        minted: false,
        claimsCount: 0,
      },
    });

    // Determine the base URL dynamically from the request origin
    const url = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    
    // Generate QR code pointing to /claim?id=<nft.id>
    const claimUrl = `${origin}/claim?id=${nft.id}`;

    const qrDataUrl = await QRCode.toDataURL(claimUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
      width: 512,
    });

    return NextResponse.json({ id: nft.id, qrDataUrl, claimUrl });
  } catch (error) {
    console.error("Create NFT error:", error);
    return NextResponse.json(
      { message: "Failed to create NFT: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
