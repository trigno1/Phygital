import { NextResponse } from "next/server";

export enum ErrorCode {
  NOT_FOUND = "ERR_API_001",
  VALIDATION = "ERR_API_002",
  UNAUTHORIZED = "ERR_AUTH_001",
  CONTRACT_FAIL = "ERR_CONTRACT_001",
  DB_FAIL = "ERR_DB_001",
  INTERNAL = "ERR_SERVER_001",
  EXPIRED = "ERR_GATED_001",
  LIMIT_REACHED = "ERR_GATED_002",
}

interface ErrorResponseOptions {
  code: ErrorCode;
  message: string;
  status?: number;
  details?: any;
}

/**
 * Standardized API Error Response
 * Ensures internal details are masked while providing a unique error code for support.
 */
export function errorResponse({
  code,
  message,
  status = 500,
  details,
}: ErrorResponseOptions) {
  // In a real production app, you would log 'details' or the raw error to a service like Sentry/CloudWatch here.
  if (details) {
    console.error(`[${code}] Internal Error Details:`, details);
  }

  // Sanitize details: If it's an Error object, we don't want to leak it in production.
  // We only want to return details if they are intended for the UI (like { requiresPassword: true }).
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
