import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ message: "address param required" }, { status: 400 });
    }

    const drops = await prisma.nFT.findMany({
      where: { creatorAddress: address },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        category: true,
        claimsCount: true,
        scansCount: true,
        maxClaims: true,
        minted: true,
        isSoulbound: true,
        password: true,
        expiresAt: true,
        issuedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ drops });
  } catch (error) {
    console.error("My drops error:", error);
    return NextResponse.json(
      { message: "Failed to fetch drops: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
