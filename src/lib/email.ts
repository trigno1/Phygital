/**
 * ============================================================
 * Email Helper — Resend SDK Wrapper
 * ============================================================
 *
 * A thin wrapper around the Resend email API that:
 * - NEVER throws — email failure must never break the main flow
 * - Silently skips if no API key is configured
 * - Logs failures for debugging without crashing the request
 *
 * IMPORTANT: Resend's free tier only allows sending from
 * "onboarding@resend.dev". Once you verify your own domain
 * in the Resend dashboard, update the FROM constant below.
 *
 * USAGE:
 *   import { sendEmail } from "@/lib/email";
 *   await sendEmail({ to: "user@example.com", subject: "Hello", html: "<p>Hi</p>" });
 */

import { Resend } from "resend";

// Initialize the Resend client with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Resend free tier only allows sending from onboarding@resend.dev
// unless you have a verified domain. Swap to your domain when ready.
const FROM = "Stamp <onboarding@resend.dev>";

/**
 * Sends an email using the Resend API.
 *
 * @param to      - Recipient email address
 * @param subject - Email subject line
 * @param html    - Full HTML body of the email (use templates from email-templates.ts)
 *
 * Silently returns without action if:
 * - `to` is empty (no recipient)
 * - RESEND_API_KEY is not configured
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Guard: skip if no recipient or no API key configured
  if (!to || !process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Log but never throw — email is a best-effort side effect
    console.error("[email] failed to send:", err);
  }
}
