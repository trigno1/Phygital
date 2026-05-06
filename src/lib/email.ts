import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend free tier only allows sending from onboarding@resend.dev
// unless you have a verified domain. Swap to your domain when ready.
const FROM = "Stamp <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!to || !process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] failed to send:", err);
    // never throw — email failure must never break the main flow
  }
}
