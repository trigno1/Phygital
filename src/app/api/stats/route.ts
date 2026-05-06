import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalDrops, totalClaimsAgg, uniqueWallets] = await Promise.all([
      prisma.nFT.count(),
      prisma.nFT.aggregate({ _sum: { claimsCount: true } }),
      prisma.claimRecord
        .groupBy({ by: ["walletAddress"] })
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      totalDrops,
      totalClaims: totalClaimsAgg._sum.claimsCount ?? 0,
      totalWallets: uniqueWallets,
    });
  } catch {
    return NextResponse.json({
      totalDrops: 0,
      totalClaims: 0,
      totalWallets: 0,
    });
  }
}
