/**
 * ============================================================
 * API Route: GET / PUT — /api/profile
 * ============================================================
 *
 * Manages user profiles linked to wallet addresses.
 *
 * GET  /api/profile?address=0x... → Fetch the user's profile
 * PUT  /api/profile               → Create or update profile
 *
 * Both endpoints require wallet signature authentication.
 * Users can only read/write their OWN profile (address must match).
 *
 * FIELD ALLOWLIST:
 * ────────────────
 * Only the fields in ALLOWED_FIELDS are accepted in PUT requests.
 * This prevents injection of arbitrary fields into the database.
 *
 * WELCOME EMAIL:
 * ──────────────
 * When a user provides an email, a welcome email is sent
 * to introduce them to the Stamp platform.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-helper";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

// Disable static caching
export const dynamic = "force-dynamic";

// Only these fields can be saved via the PUT endpoint.
// This whitelist prevents arbitrary field injection.
const ALLOWED_FIELDS = [
  "name", "bio", "location", "phone", "avatarUrl",
  "github", "linkedin", "instagram", "twitter", "website", "email"
];

/**
 * GET /api/profile?address=0x...
 * Authenticated — returns the caller's UserProfile (or null if none exists yet).
 */
export async function GET(request: Request) {
  try {
    // Verify the wallet signature (no specific address required)
    const auth = await verifyAuth(request, null);
    if (!auth.isValid) return auth.response!;

    // Extract the address from the query string
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return errorResponse({ code: ErrorCode.VALIDATION, message: "Missing address param", status: 400 });
    }

    // Ensure the authenticated wallet matches the requested address
    // (users can only read their own profile)
    if (auth.address?.toLowerCase() !== address.toLowerCase()) {
      return errorResponse({ code: ErrorCode.UNAUTHORIZED, message: "Address mismatch", status: 403 });
    }

    // Look up the profile (returns null if the user hasn't created one yet)
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
 * Authenticated — creates or updates the caller's UserProfile.
 * Uses Prisma's upsert: creates if new, updates if existing.
 */
export async function PUT(request: Request) {
  try {
    // Verify wallet signature
    const auth = await verifyAuth(request, null);
    if (!auth.isValid) return auth.response!;

    const body = await request.json();
    const { address, ...fields } = body;

    if (!address) {
      return errorResponse({ code: ErrorCode.VALIDATION, message: "Missing address", status: 400 });
    }

    // Users can only update their own profile
    if (auth.address?.toLowerCase() !== address.toLowerCase()) {
      return errorResponse({ code: ErrorCode.UNAUTHORIZED, message: "Address mismatch", status: 403 });
    }

    // Sanitize: only accept whitelisted fields, trim strings, convert empty to null
    const sanitized: Record<string, string | null> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in fields) {
        sanitized[key] = fields[key] ? String(fields[key]).trim() : null;
      }
    }

    // Upsert: create the profile if it doesn't exist, update if it does
    const profile = await prisma.userProfile.upsert({
      where: { address: address.toLowerCase() },
      update: sanitized,
      create: { address: address.toLowerCase(), ...sanitized },
    });

    // Send a welcome email if the user has provided their email
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
