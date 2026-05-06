import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-helper";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = [
  "name", "bio", "location", "phone", "avatarUrl",
  "github", "linkedin", "instagram", "twitter", "website", "email"
];

/**
 * GET /api/profile?address=0x...
 * Authenticated — returns the caller's UserProfile (or empty object if none yet).
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request, null);
    if (!auth.isValid) return auth.response!;

    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return errorResponse({ code: ErrorCode.VALIDATION, message: "Missing address param", status: 400 });
    }

    if (auth.address?.toLowerCase() !== address.toLowerCase()) {
      return errorResponse({ code: ErrorCode.UNAUTHORIZED, message: "Address mismatch", status: 403 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { address: address.toLowerCase() },
    });

    return NextResponse.json({ profile: profile ?? null });
  } catch (error) {
    return errorResponse({ code: ErrorCode.INTERNAL, message: "Failed to fetch profile", status: 500, details: error });
  }
}

/**
 * PUT /api/profile
 * Authenticated — upserts the caller's UserProfile.
 */
export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request, null);
    if (!auth.isValid) return auth.response!;

    const body = await request.json();
    const { address, ...fields } = body;

    if (!address) {
      return errorResponse({ code: ErrorCode.VALIDATION, message: "Missing address", status: 400 });
    }

    if (auth.address?.toLowerCase() !== address.toLowerCase()) {
      return errorResponse({ code: ErrorCode.UNAUTHORIZED, message: "Address mismatch", status: 403 });
    }

    // Whitelist only known fields
    const sanitized: Record<string, string | null> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in fields) {
        sanitized[key] = fields[key] ? String(fields[key]).trim() : null;
      }
    }

    const profile = await prisma.userProfile.upsert({
      where: { address: address.toLowerCase() },
      update: sanitized,
      create: { address: address.toLowerCase(), ...sanitized },
    });

    if (profile.email) {
      await sendEmail({
        to: profile.email,
        subject: "Welcome to Stamp",
        html: welcomeEmail({ name: profile.name }),
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return errorResponse({ code: ErrorCode.INTERNAL, message: "Failed to save profile", status: 500, details: error });
  }
}
