/**
 * ============================================================
 * Admin Auth — Server-Side Admin Wallet Allowlist
 * ============================================================
 *
 * This module restricts admin-only API routes to a predefined
 * set of wallet addresses stored in the ADMIN_WALLET_ADDRESSES
 * environment variable (comma-separated).
 *
 * SECURITY MODEL:
 * ───────────────
 * 1. First, the request is authenticated using verifyAuth()
 *    (wallet signature check — same as all other API routes).
 * 2. Then, the verified wallet address is checked against
 *    the server-side allowlist. Only addresses in the list
 *    are allowed through.
 *
 * The allowlist is SERVER-SIDE ONLY. The NEXT_PUBLIC_ version
 * is just for UI visibility (showing/hiding the admin link
 * in the navbar). Real security lives here.
 *
 * USAGE:
 *   const auth = await verifyAdmin(request);
 *   if (!auth.isAdmin) return auth.response as Response;
 *   // Caller is a verified admin
 */

import { verifyAuth } from "@/lib/auth-helper";

// Parse comma-separated admin wallet addresses from environment variable
// Example: "0xABC...123,0xDEF...456" → ["0xabc...123", "0xdef...456"]
const ADMIN_ADDRESSES = (process.env.ADMIN_WALLET_ADDRESSES ?? "")
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean);

/**
 * Verifies that the request comes from a wallet on the admin allowlist.
 *
 * @param request - The incoming HTTP request
 * @returns { isAdmin: true, address } on success,
 *          { isAdmin: false, response } on failure (return the response to the client)
 */
export async function verifyAdmin(request: Request) {
  // Step 1: Verify the wallet signature (proves the caller owns the wallet)
  const auth = await verifyAuth(request, null);
  if (!auth.isValid) return { isAdmin: false, response: auth.response };

  // Step 2: Check if the verified wallet is in the admin allowlist
  const isAdmin = ADMIN_ADDRESSES.includes(auth.address?.toLowerCase() ?? "");
  if (!isAdmin) {
    return {
      isAdmin: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  // Caller is both authenticated AND authorized as admin
  return { isAdmin: true, address: auth.address };
}
