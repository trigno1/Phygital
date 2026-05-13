/**
 * ============================================================
 * Middleware — Rate Limiting with Upstash Redis
 * ============================================================
 *
 * Next.js Edge Middleware that runs BEFORE every matched route.
 * Currently protects:
 *   - /api/claimNFT    → rate-limited (10 requests/minute per IP)
 *   - /api/admin/*     → matched but passed through (admin auth is handled in routes)
 *
 * WHY RATE LIMIT?
 * ───────────────
 * The claimNFT endpoint triggers an on-chain transaction (costs gas).
 * Without rate limiting, a bot could spam claims and drain the
 * admin wallet's gas balance. 10 req/min per IP is generous for
 * legitimate users but blocks automated abuse.
 *
 * UPSTASH REDIS:
 * ──────────────
 * Uses a sliding window algorithm backed by Upstash (serverless Redis).
 * If Upstash credentials are missing, the middleware gracefully skips
 * rate limiting and allows the request through (fail-open).
 *
 * MATCHER CONFIG:
 * ───────────────
 * Only the paths in `config.matcher` trigger this middleware.
 * All other routes (pages, static assets, other APIs) bypass it.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configure the rate limiter: 10 requests per 1-minute sliding window
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),                    // Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,                            // Track usage metrics in Upstash dashboard
});

/**
 * Edge Middleware function — runs before matched API routes.
 * Rate-limits the claimNFT endpoint to prevent gas-draining abuse.
 */
export async function middleware(req: NextRequest) {
  // Only rate-limit the claim endpoint (the most expensive operation)
  if (req.nextUrl.pathname === "/api/claimNFT") {
    try {
      // Guard: if Upstash isn't configured, skip rate limiting entirely
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn("Middleware: Upstash Redis credentials missing. Skipping rate limit.");
        return NextResponse.next();
      }

      // Identify the caller by their IP address (from reverse proxy header)
      const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(ip);
      
      // Block the request if the rate limit is exceeded
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Try again in a minute." },
          { status: 429 }
        );
      }
    } catch (error) {
      // Fail-open: if Redis is down, allow the request rather than blocking all claims
      console.error("Middleware Rate Limit Error:", error);
      return NextResponse.next();
    }
  }

  // All other matched routes pass through without rate limiting
  return NextResponse.next();
}

// Only run this middleware for these URL patterns
export const config = { matcher: ["/api/claimNFT", "/api/admin/:path*"] };
