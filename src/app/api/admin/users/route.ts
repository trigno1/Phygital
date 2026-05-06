import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  // Source of truth: all wallets that have ever claimed or created
  const [claimCounts, dropCounts, profiles] = await Promise.all([
    prisma.claimRecord.groupBy({
      by: ["walletAddress"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.nFT.groupBy({
      by: ["creatorAddress"],
      _count: { id: true },
      where: { creatorAddress: { not: null } },
    }),
    prisma.userProfile.findMany(),
  ]);

  const profileMap = new Map(
    profiles.map((p) => [p.address.toLowerCase(), p])
  );
  const dropMap = new Map(
    dropCounts.map((r) => [r.creatorAddress!.toLowerCase(), r._count.id])
  );

  // Also collect wallets that only created drops (no claims yet)
  const allWallets = new Set([
    ...claimCounts.map((r) => r.walletAddress.toLowerCase()),
    ...dropCounts.map((r) => r.creatorAddress!.toLowerCase()),
  ]);

  const users = Array.from(allWallets).map((addr) => {
    const profile = profileMap.get(addr);
    const claimsReceived =
      claimCounts.find((r) => r.walletAddress.toLowerCase() === addr)
        ?._count.id ?? 0;
    const dropsCreated = dropMap.get(addr) ?? 0;
    return {
      profile: profile ?? {
        id: addr,
        address: addr,
        name: null,
        bio: null,
        location: null,
        avatar: null,
        github: null,
        twitter: null,
        linkedin: null,
        website: null,
        createdAt: new Date().toISOString(),
      },
      dropsCreated,
      claimsReceived,
    };
  });

  // Sort: most active first
  users.sort((a, b) => b.dropsCreated + b.claimsReceived - (a.dropsCreated + a.claimsReceived));

  return NextResponse.json({ users });
}

