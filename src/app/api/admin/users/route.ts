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

  const enriched = await Promise.all(
    profiles.map(async (profile) => {
      const [dropsCreated, claimsReceived] = await Promise.all([
        prisma.nFT.count({ where: { creatorAddress: profile.address } }),
        prisma.claimRecord.count({
          where: { walletAddress: profile.address.toLowerCase() },
        }),
      ]);
      return { profile, dropsCreated, claimsReceived };
    })
  );

  return NextResponse.json({ users: enriched });
}
