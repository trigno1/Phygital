import QRCode from "qrcode";

/**
 * Generates a branded QR code card as a data URL.
 * The card features:
 * - A dark gradient header with the Phygital brand name
 * - The QR code centered on a white card body
 * - The NFT/drop name below the QR code
 * - "Scan to Claim" instruction and the claim URL
 *
 * Uses an SVG-to-PNG pipeline via the qrcode library's built-in
 * canvas fallback to avoid native dependencies (no `node-canvas` or `sharp`).
 */
export async function generateBrandedQR(
  claimUrl: string,
  nftName: string
): Promise<string> {
  // 1. Generate the raw QR as a data URL (will be embedded in the SVG)
  const rawQrDataUrl = await QRCode.toDataURL(claimUrl, {
    errorCorrectionLevel: "H",
    type: "image/png",
    margin: 1,
    color: { dark: "#1e1b4b", light: "#ffffff" },
    width: 380,
  });

  // 2. Truncate the claim URL for display
  const displayUrl =
    claimUrl.length > 48 ? claimUrl.slice(0, 48) + "…" : claimUrl;

  // 3. Build an SVG branded card
  const cardWidth = 600;
  const cardHeight = 820;
  const headerHeight = 90;
  const qrSize = 380;
  const qrX = (cardWidth - qrSize) / 2;
  const qrY = headerHeight + 50;

  // Escape XML special characters in text
  const safeName = escapeXml(
    nftName.length > 36 ? nftName.slice(0, 36) + "…" : nftName
  );
  const safeUrl = escapeXml(displayUrl);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
  <defs>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f0f23"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-3%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${cardWidth}" height="${cardHeight}" rx="32" ry="32" fill="#f8f9ff"/>

  <!-- Card body with shadow -->
  <rect x="24" y="20" width="${cardWidth - 48}" height="${cardHeight - 40}" rx="28" ry="28" fill="#ffffff" filter="url(#cardShadow)"/>

  <!-- Header bar -->
  <rect x="24" y="20" width="${cardWidth - 48}" height="${headerHeight}" rx="28" ry="28" fill="url(#headerGrad)"/>
  <!-- Flatten bottom corners of header -->
  <rect x="24" y="${20 + headerHeight - 28}" width="${cardWidth - 48}" height="28" fill="url(#headerGrad)"/>

  <!-- Accent line under header -->
  <rect x="24" y="${20 + headerHeight}" width="${cardWidth - 48}" height="3" fill="url(#accentGrad)"/>

  <!-- Logo placeholder (hexagonal P) -->
  <circle cx="72" cy="${20 + headerHeight / 2}" r="22" fill="rgba(255,255,255,0.12)"/>
  <text x="72" y="${20 + headerHeight / 2 + 8}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">P</text>

  <!-- Brand name -->
  <text x="104" y="${20 + headerHeight / 2 + 2}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#ffffff" dominant-baseline="middle" letter-spacing="-0.5">Phygital</text>

  <!-- "SCAN TO CLAIM" badge -->
  <rect x="${cardWidth - 220}" y="${20 + headerHeight / 2 - 14}" width="145" height="28" rx="14" fill="rgba(255,255,255,0.12)"/>
  <text x="${cardWidth - 147}" y="${20 + headerHeight / 2 + 2}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" fill="rgba(255,255,255,0.8)" text-anchor="middle" letter-spacing="2" dominant-baseline="middle">SCAN TO CLAIM</text>

  <!-- QR Code frame -->
  <rect x="${qrX - 12}" y="${qrY - 12}" width="${qrSize + 24}" height="${qrSize + 24}" rx="20" ry="20" fill="#f8f9ff" stroke="#e5e7eb" stroke-width="1"/>

  <!-- QR Code -->
  <image x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" href="${rawQrDataUrl}" preserveAspectRatio="xMidYMid meet"/>

  <!-- NFT Name -->
  <text x="${cardWidth / 2}" y="${qrY + qrSize + 52}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#0f0f23" text-anchor="middle" letter-spacing="-0.3">${safeName}</text>

  <!-- Divider -->
  <line x1="100" y1="${qrY + qrSize + 76}" x2="${cardWidth - 100}" y2="${qrY + qrSize + 76}" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Claim URL -->
  <text x="${cardWidth / 2}" y="${qrY + qrSize + 102}" font-family="monospace" font-size="11" fill="#9ca3af" text-anchor="middle">${safeUrl}</text>

  <!-- Footer branding -->
  <text x="${cardWidth / 2}" y="${cardHeight - 42}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#c7c7d0" text-anchor="middle" letter-spacing="3">POWERED BY PHYGITAL</text>

  <!-- Decorative corner dots -->
  <circle cx="52" cy="${cardHeight - 48}" r="3" fill="#6366f1" opacity="0.3"/>
  <circle cx="${cardWidth - 52}" cy="${cardHeight - 48}" r="3" fill="#a855f7" opacity="0.3"/>
</svg>`.trim();

  // 4. Convert SVG to PNG data URL via a simple encoding.
  //    Since we cannot use node-canvas or sharp in Vercel serverless,
  //    we return the SVG as a data URL which works in all browsers
  //    and can be downloaded as an image.
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return svgDataUrl;
}

/** Escape XML/HTML special characters to prevent SVG injection. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
