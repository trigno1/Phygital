/**
 * ============================================================
 * Server Actions — Session-Based Auth (Login / Logout)
 * ============================================================
 *
 * Next.js Server Actions for wallet-based session management.
 * These run exclusively on the server (marked with "use server").
 *
 * FLOW:
 * ─────
 * 1. GENERATE PAYLOAD → Creates a unique login challenge for the wallet
 * 2. LOGIN → Verifies the signed challenge, generates a JWT, stores in cookie
 * 3. IS LOGGED IN → Checks if the JWT cookie is present and valid
 * 4. LOGOUT → Deletes the JWT cookie
 *
 * NOTE: This is separate from the API-level auth (auth-helper.ts).
 * Server actions use JWT cookies for page-level auth,
 * while API routes use wallet signatures per-request.
 */
"use server";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { cookies } from "next/headers";
import { thirdwebAuth } from "@/app/const/thirdwebAuth";

// Export the payload generator directly from the thirdweb auth instance
export const generatePayload = thirdwebAuth.generatePayload;

/**
 * Verifies a signed login payload and creates a session.
 * On success, a JWT is generated and stored as an HTTP-only cookie.
 */
export async function login(payload: VerifyLoginPayloadParams) {
  // Verify the wallet signature against the expected payload
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  console.log({ payload });
  if (verifiedPayload.valid) {
    // Generate a JWT from the verified payload
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    console.log({ jwt });
    // Store the JWT in a cookie for subsequent requests
    cookies().set("jwt", jwt);
  }
}

/**
 * Checks if the current user has a valid session.
 * Reads the JWT cookie and verifies it hasn't expired or been tampered with.
 *
 * @returns true if the user is logged in with a valid JWT
 */
export async function isLoggedIn() {
  const jwt = cookies().get("jwt");
  if (!jwt?.value) {
    return false;
  }

  // Verify the JWT signature and expiry
  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  console.log({ authResult });
  if (!authResult.valid) {
    return false;
  }
  return true;
}

/**
 * Logs the user out by deleting the JWT cookie.
 */
export async function logout() {
  cookies().delete("jwt");
}