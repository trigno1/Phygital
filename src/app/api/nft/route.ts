import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing NFT ID" }, { status: 400 });
    }

    const nft = await prisma.nFT.findUnique({
      where: { id },
    });

    if (!nft) {
      return NextResponse.json({ message: "NFT not found" }, { status: 404 });
    }

    // Increment scansCount asynchronously
    prisma.nFT.update({
      where: { id },
      data: { scansCount: { increment: 1 } }
    }).catch(console.error);

    return NextResponse.json({ nft });
  } catch (error) {
    console.error("Database or Server Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
