import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  const [
    totalDrops,
    claimsAgg,
    scansAgg,
    soulboundDrops,
    activeDrops,
    recentClaims,
    uniqueWalletsRaw,
  ] = await Promise.all([
    prisma.nFT.count(),
    prisma.nFT.aggregate({ _sum: { claimsCount: true } }),
    prisma.nFT.aggregate({ _sum: { scansCount: true } }),
    prisma.nFT.count({ where: { isSoulbound: true } }),
    prisma.nFT.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.claimRecord.findMany({
      orderBy: { claimedAt: "desc" },
      take: 200,
      select: { claimedAt: true },
    }),
    prisma.claimRecord.groupBy({ by: ["walletAddress"] }),
  ]);

  const totalClaims = claimsAgg._sum.claimsCount ?? 0;
  const totalScans = scansAgg._sum.scansCount ?? 0;
  const uniqueWallets = uniqueWalletsRaw.length;

  // Build 7-day chart data
  const now = new Date();
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    const count = recentClaims.filter((c) => {
      const t = new Date(c.claimedAt);
      return t >= start && t <= end;
    }).length;
    days.push({ label, count });
  }

  return NextResponse.json({
    totalDrops,
    totalClaims,
    totalScans,
    uniqueWallets,
    soulboundDrops,
    activeDrops,
    claimsChart: days,
  });
}
