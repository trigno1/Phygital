import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  const claims = await prisma.claimRecord.findMany({
    orderBy: { claimedAt: "desc" },
    take: 50,
    select: {
      id: true,
      dropId: true,
      walletAddress: true,
      txHash: true,
      claimedAt: true,
    },
  });

  // Enrich with drop names
  const dropIds = [...new Set(claims.map((c) => c.dropId))];
  const drops = await prisma.nFT.findMany({
    where: { id: { in: dropIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(drops.map((d) => [d.id, d.name]));

  const enriched = claims.map((c) => ({
    ...c,
    dropName: nameMap[c.dropId] ?? "Unknown Drop",
  }));

  return NextResponse.json({ claims: enriched });
}
