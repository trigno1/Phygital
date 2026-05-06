import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/claimNFT") {
    try {
      // Check if Redis is configured before attempting to limit
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn("Middleware: Upstash Redis credentials missing. Skipping rate limit.");
        return NextResponse.next();
      }

      const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Try again in a minute." },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error("Middleware Rate Limit Error:", error);
      // Fallback: Allow the request even if rate limiting fails
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/claimNFT", "/api/admin/:path*"] };
