/**
 * ============================================================
 * Utility: cn() — Class Name Merger
 * ============================================================
 *
 * Combines multiple CSS class strings intelligently using:
 *   - clsx: Handles conditional classes (falsy values are ignored)
 *   - tailwind-merge: Resolves Tailwind CSS conflicts
 *     (e.g., "p-4 p-6" → "p-6")
 *
 * USAGE:
 *   cn("bg-red-500", isActive && "bg-blue-500", "text-white")
 *   // → "bg-blue-500 text-white" (if isActive is true)
 *   // → "bg-red-500 text-white"  (if isActive is false)
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
