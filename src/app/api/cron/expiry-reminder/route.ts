/**
 * ============================================================
 * API Route: GET /api/cron/expiry-reminder
 * ============================================================
 *
 * Scheduled cron job that sends email reminders to drop creators
 * when their drops are about to expire (within the next 24 hours).
 *
 * SCHEDULE: Runs every hour (configured in vercel.json)
 *
 * HOW IT WORKS:
 * ─────────────
 * 1. Vercel Cron hits this endpoint every hour with a Bearer token
 * 2. The route finds all drops expiring in the 23–24 hour window
 *    that haven't already received a reminder
 * 3. For each drop, it looks up the creator's email via UserProfile
 * 4. Sends a "your drop expires in X hours" email
 * 5. Marks the drop as reminderSent=true to prevent duplicates
 *
 * SECURITY:
 * ─────────
 * Protected by CRON_SECRET — only Vercel's cron scheduler
 * (which sends the correct Bearer token) can trigger this.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { dropExpiringSoonEmail } from "@/lib/email-templates";

// Disable static caching
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // ── Auth: Only allow Vercel Cron with the correct secret ──
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Find drops expiring in the next 48 hours ──────────────
  // Since the cron only runs once per day (Hobby plan limit),
  // we use a 48-hour window to ensure no drops are missed.
  // The reminderSent flag prevents duplicate emails.
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const drops = await prisma.nFT.findMany({
    where: {
      expiresAt: { gte: new Date(), lte: in48h }, // Expires within next 48 hours
      reminderSent: false,                    // Haven't sent a reminder yet
      creatorAddress: { not: null },          // Has a creator to notify
    },
  });

  // ── Send reminder emails ──────────────────────────────────
  let sent = 0;
  for (const drop of drops) {
    // Look up the creator's email from their profile
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
      // Mark as sent to prevent duplicate reminders
      await prisma.nFT.update({
        where: { id: drop.id },
        data: { reminderSent: true },
      });
      sent++;
    }
  }

  // Return the count of emails sent (useful for monitoring)
  return NextResponse.json({ sent });
}
