import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" },
  });

  const [dropCounts, claimCounts] = await Promise.all([
    prisma.nFT.groupBy({
      by: ["creatorAddress"],
      _count: { id: true },
      where: { creatorAddress: { not: null } },
    }),
    prisma.claimRecord.groupBy({
      by: ["walletAddress"],
      _count: { id: true },
    }),
  ]);

  const dropMap = new Map(
    dropCounts.map((r) => [r.creatorAddress!.toLowerCase(), r._count.id])
  );
  const claimMap = new Map(
    claimCounts.map((r) => [r.walletAddress.toLowerCase(), r._count.id])
  );

  const enriched = profiles.map((profile) => ({
    profile,
    dropsCreated: dropMap.get(profile.address.toLowerCase()) ?? 0,
    claimsReceived: claimMap.get(profile.address.toLowerCase()) ?? 0,
  }));

  return NextResponse.json({ users: enriched });
}
