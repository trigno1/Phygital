/**
 * ============================================================
 * Error Handler — Standardized API Error Responses
 * ============================================================
 *
 * Every API route in this app uses this module to return
 * consistent, safe error responses. It ensures:
 *
 * 1. CONSISTENT FORMAT — All errors follow the same JSON shape:
 *    { success: false, error: { code, message, timestamp, details? } }
 *
 * 2. SAFE DETAILS — Raw Error objects (with stack traces) are
 *    NEVER leaked to the client. Only safe, UI-intended details
 *    (like { requiresPassword: true }) are forwarded.
 *
 * 3. UNIQUE ERROR CODES — Each code maps to a specific failure
 *    type, making debugging easier for both developers and users.
 *
 * USAGE:
 *   return errorResponse({
 *     code: ErrorCode.NOT_FOUND,
 *     message: "NFT not found",
 *     status: 404,
 *   });
 */

import { NextResponse } from "next/server";

/**
 * Unique error codes for different failure categories.
 * The prefix indicates the subsystem:
 *   ERR_API_    → General API errors (not found, validation)
 *   ERR_AUTH_   → Authentication / authorization failures
 *   ERR_CONTRACT_ → Smart contract interaction failures
 *   ERR_DB_     → Database operation failures
 *   ERR_SERVER_ → Internal server errors
 *   ERR_GATED_  → Access gating (expired, claim limits)
 */
export enum ErrorCode {
  NOT_FOUND = "ERR_API_001",       // Resource does not exist
  VALIDATION = "ERR_API_002",      // Invalid input / missing fields
  UNAUTHORIZED = "ERR_AUTH_001",   // Signature invalid or address mismatch
  CONTRACT_FAIL = "ERR_CONTRACT_001", // On-chain operation failed
  DB_FAIL = "ERR_DB_001",         // Database query failed
  INTERNAL = "ERR_SERVER_001",    // Unexpected server error
  EXPIRED = "ERR_GATED_001",      // Drop has expired
  LIMIT_REACHED = "ERR_GATED_002", // Max claims reached or duplicate claim
}

/** Options for building an error response */
interface ErrorResponseOptions {
  code: ErrorCode;       // The error category code
  message: string;       // Human-readable message for the client
  status?: number;       // HTTP status code (default: 500)
  details?: any;         // Extra context — Error objects are stripped for safety
}

/**
 * Builds a standardized JSON error response.
 *
 * Internal Error objects are logged server-side but NEVER sent
 * to the client. Only plain objects (like { requiresPassword: true })
 * are forwarded as `details` for the frontend to act on.
 */
export function errorResponse({
  code,
  message,
  status = 500,
  details,
}: ErrorResponseOptions) {
  // Log the raw error server-side for debugging (would go to Sentry in production)
  if (details) {
    console.error(`[${code}] Internal Error Details:`, details);
  }

  // Strip Error objects to prevent leaking stack traces to the client.
  // Only forward plain objects that are intended for the UI.
  const safeDetails = (details && !(details instanceof Error)) ? details : undefined;

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        details: safeDetails,
      },
    },
    { status }
  );
}
