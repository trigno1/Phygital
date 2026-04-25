import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    
    // Using a more robust update pattern for MongoDB
    const nft = await prisma.nFT.findUnique({
      where: { id },
      select: { scansCount: true }
    });

    if (nft) {
      await prisma.nFT.update({
        where: { id },
        data: { scansCount: (nft.scansCount || 0) + 1 },
      });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SCAN API ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
