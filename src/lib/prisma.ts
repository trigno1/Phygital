/**
 * ============================================================
 * Prisma Client — Singleton Database Connection
 * ============================================================
 *
 * This file creates a single shared instance of PrismaClient
 * so the entire app reuses ONE database connection pool.
 *
 * WHY A SINGLETON?
 * ────────────────
 * In development, Next.js hot-reloads modules frequently.
 * Each reload would create a NEW PrismaClient, opening fresh
 * database connections until MongoDB's connection limit is hit.
 *
 * By caching the instance on `globalThis`, we ensure only one
 * PrismaClient exists regardless of how many hot-reloads occur.
 *
 * In production, modules are loaded once, so the singleton
 * pattern is still correct but less critical.
 *
 * USAGE:
 *   import { prisma } from "@/lib/prisma";
 *   const users = await prisma.userProfile.findMany();
 */

import { PrismaClient } from "@prisma/client";

// Use the global object to persist the client across hot-reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Only log errors and warnings to keep the console clean
    log: ["error", "warn"],
  });

// In development, cache the client on globalThis to survive hot-reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
