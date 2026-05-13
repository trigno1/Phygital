/**
 * ============================================================
 * Thirdweb Auth — Server-Side JWT Authentication
 * ============================================================
 *
 * Configures Thirdweb's built-in auth system for server-side
 * JWT (JSON Web Token) generation and verification.
 *
 * This is used by the login/logout server actions in
 * src/app/action/auth.ts to manage user sessions via cookies.
 *
 * HOW IT WORKS:
 * ─────────────
 * 1. User connects wallet and signs a "login payload" on the client
 * 2. Server verifies the signature using the admin private key
 * 3. If valid, a JWT is generated and stored in an HTTP cookie
 * 4. Subsequent requests include the JWT cookie for session auth
 *
 * ADMIN PRIVATE KEY:
 * ──────────────────
 * The THIRDWEB_ADMIN_PRIVATE_KEY is the private key of the
 * admin wallet that signs JWTs. This is a SERVER-ONLY secret
 * — it must NEVER be exposed to the browser.
 */

import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "./client";

// Server-only secret — never expose to the browser
const privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY || "";

if (!privateKey) {
  throw new Error("Missing THIRDWEB_ADMIN_PRIVATE_KEY in .env file.");
}

// Create the Thirdweb auth instance with domain and admin account
export const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "", // Your app's domain for JWT audience
  adminAccount: privateKeyToAccount({ client, privateKey }),   // Signs JWTs with this wallet
});