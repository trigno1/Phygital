/**
 * ============================================================
 * Thirdweb Client & Chain Configuration
 * ============================================================
 *
 * Central configuration for the Thirdweb SDK used throughout
 * the app for wallet connections, contract interactions, and
 * on-chain reads.
 *
 * CLIENT ID:
 * ──────────
 * The NEXT_PUBLIC_THIRDWEB_CLIENT_ID is your project identifier
 * from the Thirdweb dashboard (thirdweb.com/dashboard).
 * It's safe to expose in the browser (that's what NEXT_PUBLIC_ means).
 * The fallback "000..." prevents build failures when the env var
 * isn't set (e.g., during CI/CD preview builds).
 *
 * CHAIN:
 * ──────
 * We use Base Sepolia (testnet) for development.
 * Switch to `base` (mainnet) for production.
 */

import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

// NEXT_PUBLIC_ prefix makes this available in both server and client code
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "00000000000000000000000000000000"; // Fallback for Vercel build step

// Shared Thirdweb client instance — used for wallet connections, contract calls, etc.
export const client = createThirdwebClient({ clientId });

// The blockchain network this app operates on (Base Sepolia = testnet)
export const chain = baseSepolia;