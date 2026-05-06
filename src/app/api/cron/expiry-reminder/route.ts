import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { dropExpiringSoonEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const in23h = new Date(Date.now() + 23 * 60 * 60 * 1000);

  const drops = await prisma.nFT.findMany({
    where: {
      expiresAt: { gte: in23h, lte: in24h },
      reminderSent: false,
      creatorAddress: { not: null },
    },
  });

  let sent = 0;
  for (const drop of drops) {
    const creator = await prisma.userProfile.findUnique({
      where: { address: drop.creatorAddress! },
    });
    if (creator?.email) {
      await sendEmail({
        to: creator.email,
        subject: `"${drop.name}" expires in 24 hours`,
        html: dropExpiringSoonEmail({
          dropName: drop.name,
          expiresAt: drop.expiresAt!.toISOString(),
          claimsCount: drop.claimsCount,
          maxClaims: drop.maxClaims,
          dropUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      });
      await prisma.nFT.update({
        where: { id: drop.id },
        data: { reminderSent: true },
      });
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
