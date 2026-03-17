import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // or your db import

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

  return NextResponse.json({ nft });
}
