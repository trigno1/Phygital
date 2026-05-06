const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sem-project-5.vercel.app";

function base(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body{margin:0;padding:0;background:#f7f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
    .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e3db;}
    .header{background:#1a1624;padding:28px 32px;display:flex;align-items:center;gap:12px;}
    .logo-sq{width:36px;height:36px;background:#f7f4ef;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#1a1624;transform:rotate(-6deg);}
    .logo-name{font-size:20px;font-weight:700;color:#f7f4ef;letter-spacing:-0.03em;}
    .body{padding:32px;}
    .title{font-size:22px;font-weight:700;color:#1a1624;letter-spacing:-0.02em;margin:0 0 8px;}
    .sub{font-size:15px;color:#6b6560;line-height:1.6;margin:0 0 24px;}
    .btn{display:inline-block;background:#c8442a;color:#fff!important;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;}
    .stat-row{display:flex;gap:12px;margin:20px 0;}
    .stat{flex:1;background:#f7f4ef;border-radius:10px;padding:14px;text-align:center;}
    .stat-val{font-size:26px;font-weight:800;color:#1a1624;display:block;}
    .stat-label{font-size:11px;color:#8a7f72;text-transform:uppercase;letter-spacing:0.08em;}
    .divider{height:1px;background:#f0ece6;margin:24px 0;}
    .footer{padding:20px 32px;background:#f7f4ef;font-size:12px;color:#8a7f72;text-align:center;line-height:1.6;}
    .mono{font-family:monospace;font-size:12px;background:#f7f4ef;padding:8px 12px;border-radius:6px;color:#1a1624;word-break:break-all;display:block;margin:8px 0;}
    .nft-img{width:100%;max-height:200px;object-fit:cover;border-radius:10px;margin-bottom:20px;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <span class="logo-sq">S</span>
      <span class="logo-name">Stamp</span>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      Every moment deserves a mark.<br/>
      <a href="${APP_URL}" style="color:#c8442a;">Stamp</a>
    </div>
  </div>
</body>
</html>`;
}

// 1. Welcome
export function welcomeEmail(params: { name?: string | null }) {
  return base(`
    <p class="title">Welcome to Stamp 👋</p>
    <p class="sub">
      ${params.name ? `Hey ${params.name},` : "Hey,"} you're in.
      Stamp lets you attach NFTs to anything physical — events, products, art, merch.
      Scan a QR. Own the moment.
    </p>
    <a href="${APP_URL}/dashboard" class="btn">Go to your dashboard →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#8a7f72;">
      <strong style="color:#1a1624;">Create a drop</strong> — upload an image, set your rules, get a QR code.<br/>
      <strong style="color:#1a1624;">Share the QR</strong> — print it, stick it anywhere, share the link.<br/>
      <strong style="color:#1a1624;">Watch claims roll in</strong> — your dashboard tracks every scan and claim.
    </p>
  `);
}

// 2. Drop created
export function dropCreatedEmail(params: {
  dropName: string;
  image?: string | null;
  claimUrl: string;
  maxClaims?: number | null;
  expiresAt?: string | null;
  hasPassword: boolean;
}) {
  const imgHtml = params.image
    ? `<img src="${params.image.replace("ipfs://", "https://ipfs.io/ipfs/")}" class="nft-img" alt="${params.dropName}"/>`
    : "";
  return base(`
    ${imgHtml}
    <p class="title">Your drop is live ✅</p>
    <p class="sub"><strong>${params.dropName}</strong> is ready to be claimed. Share the link or QR code wherever your audience is.</p>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-val">${params.maxClaims ?? "∞"}</span>
        <span class="stat-label">Max claims</span>
      </div>
      <div class="stat">
        <span class="stat-val">${params.expiresAt ? new Date(params.expiresAt).toLocaleDateString() : "No expiry"}</span>
        <span class="stat-label">Expires</span>
      </div>
      <div class="stat">
        <span class="stat-val">${params.hasPassword ? "🔒" : "🌐"}</span>
        <span class="stat-label">${params.hasPassword ? "Password gated" : "Public"}</span>
      </div>
    </div>
    <p style="font-size:13px;color:#6b6560;margin-bottom:4px;">Claim link:</p>
    <span class="mono">${params.claimUrl}</span><br/>
    <a href="${params.claimUrl}" class="btn">View your drop →</a>
  `);
}

// 3. Someone claimed your drop (to creator)
export function dropClaimedCreatorEmail(params: {
  dropName: string;
  claimerAddress: string;
  txHash: string;
  totalClaims: number;
  maxClaims?: number | null;
  dashboardUrl: string;
}) {
  return base(`
    <p class="title">Someone just claimed your drop 🎉</p>
    <p class="sub">A new claim just landed on <strong>${params.dropName}</strong>.</p>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-val">${params.totalClaims}</span>
        <span class="stat-label">Total claims ${params.maxClaims ? `/ ${params.maxClaims}` : ""}</span>
      </div>
    </div>
    <p style="font-size:13px;color:#6b6560;margin:16px 0 4px;">Claimer wallet:</p>
    <span class="mono">${params.claimerAddress}</span>
    <p style="font-size:13px;color:#6b6560;margin:12px 0 4px;">Transaction:</p>
    <span class="mono">${params.txHash}</span><br/>
    <a href="${params.dashboardUrl}" class="btn">View drop stats →</a>
  `);
}

// 4. Claim success (to claimer)
export function claimSuccessEmail(params: {
  dropName: string;
  image?: string | null;
  txHash: string;
  explorerUrl: string;
  appUrl: string;
}) {
  const imgHtml = params.image
    ? `<img src="${params.image.replace("ipfs://", "https://ipfs.io/ipfs/")}" class="nft-img" alt="${params.dropName}"/>`
    : "";
  return base(`
    ${imgHtml}
    <p class="title">You got your Stamp ✦</p>
    <p class="sub"><strong>${params.dropName}</strong> is now yours — permanently recorded on-chain.</p>
    <span class="mono">${params.txHash}</span><br/>
    <a href="${params.explorerUrl}" class="btn">Verify on-chain →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#8a7f72;text-align:center;">
      View all your collected NFTs in your <a href="${params.appUrl}/dashboard" style="color:#c8442a;">Stamp dashboard</a>.
    </p>
  `);
}

// 5. Drop expiring soon (to creator)
export function dropExpiringSoonEmail(params: {
  dropName: string;
  expiresAt: string;
  claimsCount: number;
  maxClaims?: number | null;
  dropUrl: string;
}) {
  const hoursLeft = Math.round((new Date(params.expiresAt).getTime() - Date.now()) / 3600000);
  return base(`
    <p class="title">Your drop expires in ${hoursLeft}h ⏳</p>
    <p class="sub"><strong>${params.dropName}</strong> will stop accepting claims in ${hoursLeft} hours. Here's where you stand:</p>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-val">${params.claimsCount}</span>
        <span class="stat-label">Claims so far</span>
      </div>
      <div class="stat">
        <span class="stat-val">${params.maxClaims ? params.maxClaims - params.claimsCount : "∞"}</span>
        <span class="stat-label">Spots remaining</span>
      </div>
    </div>
    <a href="${params.dropUrl}" class="btn">View drop →</a>
  `);
}

// 6. Drop fully claimed
export function dropFullyClaimedEmail(params: {
  dropName: string;
  totalClaims: number;
  totalScans: number;
  dashboardUrl: string;
}) {
  const conversionRate = params.totalScans > 0
    ? Math.round((params.totalClaims / params.totalScans) * 100)
    : 100;
  return base(`
    <p class="title">Your drop is fully claimed 🏁</p>
    <p class="sub">Every spot for <strong>${params.dropName}</strong> has been claimed. Here are your final stats:</p>
    <div class="stat-row">
      <div class="stat"><span class="stat-val">${params.totalClaims}</span><span class="stat-label">Total claims</span></div>
      <div class="stat"><span class="stat-val">${params.totalScans}</span><span class="stat-label">Total scans</span></div>
      <div class="stat"><span class="stat-val">${conversionRate}%</span><span class="stat-label">Conversion</span></div>
    </div>
    <a href="${params.dashboardUrl}" class="btn">See full stats →</a>
  `);
}

// 7. Password drop confirmation (to creator)
export function passwordDropEmail(params: {
  dropName: string;
  password: string;
  claimUrl: string;
}) {
  return base(`
    <p class="title">Your password-protected drop is live 🔒</p>
    <p class="sub"><strong>${params.dropName}</strong> requires a secret code to claim. Save this — it won't be shown again.</p>
    <p style="font-size:13px;color:#6b6560;margin-bottom:4px;">Secret code:</p>
    <span class="mono" style="font-size:18px;font-weight:700;letter-spacing:0.1em;text-align:center;">${params.password}</span>
    <div class="divider"></div>
    <p style="font-size:13px;color:#8a7f72;">Share this code only with your intended audience.</p><br/>
    <a href="${params.claimUrl}" class="btn">View your drop →</a>
  `);
}
