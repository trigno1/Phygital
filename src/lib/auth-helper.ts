/**
 * ============================================================
 * Auth Helper — Wallet Signature Verification
 * ============================================================
 *
 * This module provides request-level authentication using
 * Ethereum wallet signatures (EIP-191 personal_sign).
 *
 * HOW IT WORKS:
 * ─────────────
 * 1. The frontend signs a deterministic message:
 *    "Authorize Phygital Access for 0x..."
 *    using the connected wallet (MetaMask, etc.)
 *
 * 2. The signed message + wallet address are sent as
 *    custom HTTP headers on every API request:
 *    - x-signature: the cryptographic signature
 *    - x-address:   the wallet address that signed
 *
 * 3. This helper recovers the signer from the signature
 *    and confirms it matches the claimed address.
 *
 * This means no passwords, no sessions, no JWTs are needed
 * for API auth — the wallet IS the identity.
 *
 * USAGE:
 *   const auth = await verifyAuth(request, expectedAddress);
 *   if (!auth.isValid) return auth.response!;
 *   // auth.address is the verified wallet address
 */

import { ErrorCode, errorResponse } from "./error-handler";
import { client } from "@/app/const/client";
import { verifySignature } from "thirdweb/auth";

/**
 * Verifies that the sender of a request is the owner of the wallet address.
 * Uses a signed message to confirm identity without needing a full session.
 *
 * @param request        - The incoming HTTP request (must have x-signature and x-address headers)
 * @param expectedAddress - If provided, the verified address must match this value (e.g., for my-drops).
 *                          Pass null to accept any valid wallet.
 * @returns { isValid, address?, response? }
 */
export async function verifyAuth(request: Request, expectedAddress: string | null) {
  // Extract auth headers set by the frontend
  const signature = request.headers.get("x-signature");
  const address = request.headers.get("x-address");

  // Both headers are required — reject immediately if missing
  if (!signature || !address) {
    return {
      isValid: false,
      response: errorResponse({
        code: ErrorCode.UNAUTHORIZED,
        message: "Authentication headers missing (x-signature, x-address)",
        status: 401,
      }),
    };
  }

  // If a specific address is expected (e.g. the drop creator), verify it matches
  if (expectedAddress && address.toLowerCase() !== expectedAddress.toLowerCase()) {
    return {
      isValid: false,
      response: errorResponse({
        code: ErrorCode.UNAUTHORIZED,
        message: "Wallet address mismatch",
        status: 403,
      }),
    };
  }

  try {
    // The message must match exactly what the frontend signed
    const message = `Authorize Phygital Access for ${address}`;
    
    // Thirdweb's verifySignature recovers the signer address from the
    // signature and checks it matches the provided address
    const isValid = await verifySignature({
      client,
      address,
      message,
      signature,
    });

    if (!isValid) {
      return {
        isValid: false,
        response: errorResponse({
          code: ErrorCode.UNAUTHORIZED,
          message: "Account verification failed — invalid signature",
          status: 401,
        }),
      };
    }

    // Signature is valid — the caller provably owns this wallet
    return { isValid: true, address };
  } catch (error) {
    return {
      isValid: false,
      response: errorResponse({
        code: ErrorCode.INTERNAL,
        message: "Verification service error",
        status: 500,
        details: error,
      }),
    };
  }
}
