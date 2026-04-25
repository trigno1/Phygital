# Phygital — Physical NFT Drops Platform

![Phygital Logo](./public/logo.png)

**Turn any physical object into an on-chain NFT. Scan a QR. Claim in seconds. Zero crypto knowledge required.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Thirdweb](https://img.shields.io/badge/Thirdweb-v5-7C3AED?style=flat-square)](https://thirdweb.com)
[![Network](https://img.shields.io/badge/Base%20Sepolia-Testnet-0052FF?style=flat-square&logo=coinbase)](https://base.org)
[![ERC-1155](https://img.shields.io/badge/Token-ERC--1155-627EEA?style=flat-square&logo=ethereum&logoColor=white)](https://eips.ethereum.org/EIPS/eip-1155)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

[Quick Start](#quick-start) • [Features](#features) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

---

## How It Works

**🎨 Creator** &nbsp;→&nbsp; Upload image, set traits, generate QR, print & share

**📱 Collector** &nbsp;→&nbsp; Scan QR code, login with Google/email, tap "Claim", NFT in wallet

**⛓️ Blockchain** &nbsp;→&nbsp; ERC-1155 mint, on-chain ownership, verifiable on BaseScan

> **No seed phrases. No gas fees. No app downloads.** Collectors claim NFTs in under 30 seconds using just a phone camera and a Google/email account.

---

## Features

### For Collectors

| Feature | Description |
| :--- | :--- |
| 📷 **Instant QR Claiming** | Scan any Phygital QR with your phone camera — no app required |
| 🔐 **Invisible Smart Wallets** | Sign in with Google, email, or passkey — a self-custody wallet is created silently in the background |
| ⚡ **Zero Gas Fees** | All transaction costs are sponsored by the platform's backend wallet |
| 🎉 **Confetti & Animations** | Premium claim experience with micro-animations and real-time transaction feedback |

### For Creators

| Feature | Description |
| :--- | :--- |
| 🖼️ **IPFS Image Upload** | Upload artwork directly — stored permanently and immutably on the decentralized web |
| 🏷️ **Custom Attributes** | Add unlimited key-value traits (e.g., `Rarity: Legendary`, `Event: TechConf 2026`) visible on marketplaces |
| 👥 **Claim Limits** | Set a max number of unique wallets that can claim — QR auto-locks when full |
| 🔑 **Secret Code Gate** | Password-protect drops — only people you share the code with can claim |
| 🛡️ **Soulbound NFTs** | Mark as non-transferable — perfect for diplomas, certificates, and attendance proofs |
| 📅 **Time-Gated Drops** | Set availability windows with `issuedAt` and `expiresAt` date ranges |
| 🔗 **External URL Embedding** | Embed a link in NFT metadata that renders on all marketplaces |
| 📊 **Creator Dashboard** | Track all your drops, view claim analytics, scan counts, and manage from one place |
| 📋 **Copy Claim Link** | Share claim links directly without printing a QR code |
| 🌐 **Multi-Chain UI (Beta)** | Network selector UI prepared for Ethereum, Polygon, BNB, and Solana expansion |

---

## Architecture

```mermaid
graph TD
    subgraph "Physical World"
        A[🏷️ Physical Object with QR]
    end

    subgraph "Frontend — Next.js 14"
        B[📱 Collector scans QR]
        C[🔐 Social/Email Login]
        D[🎨 Creator Dashboard]
        E[📤 IPFS Upload]
    end

    subgraph "Backend — API Routes"
        F["/api/create-nft"]
        G["/api/claimNFT"]
        H["/api/my-drops"]
        I["/api/nft/:id"]
        J["/api/upload"]
    end

    subgraph "Infrastructure"
        K[(MongoDB via Prisma)]
        L[Thirdweb SDK v5]
        M[Base Sepolia Network]
    end

    A -->|Camera scan| B
    B -->|Auth| C
    C -->|Smart Wallet| L
    L -->|Gasless Mint| M
    D -->|Upload| E
    E -->|Store| F
    F -->|Save metadata| K
    G -->|Verify + Mint| L
    G -->|Update claims| K
    H -->|Query by creator| K
    I -->|Fetch NFT data| K
```text

### Request Flow — Claiming an NFT

```text
1. Collector scans QR → redirected to /claim?id=<nft_id>
2. Frontend triggers social login → Thirdweb creates smart wallet
3. POST /api/claimNFT { id, address, password? }
4. Server validates: exists? → expired? → live yet? → password? → claim limit?
5. Thirdweb SDK mints ERC-1155 to collector's wallet (gasless, backend-signed)
6. Prisma updates: claimsCount++, minted flag, owner address, txHash
7. Frontend shows confetti + transaction link to BaseScan
```text

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | SSR, API routes, file-based routing |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety |
| **Web3** | [Thirdweb SDK v5](https://thirdweb.com/) | Smart wallets, contract interactions, gasless transactions |
| **Smart Contract** | [ERC-1155 Edition](https://eips.ethereum.org/EIPS/eip-1155) | Multi-token standard for NFT drops |
| **Blockchain** | [Base Sepolia](https://base.org/) | L2 testnet — low-cost, high-speed transactions |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Prisma ORM](https://www.prisma.io/) | Type-safe queries, cloud-hosted data |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first responsive design |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Premium micro-interactions and page transitions |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/) | Accessible primitives + icon system |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |
| **QR Generation** | [node-qrcode](https://github.com/soldair/node-qrcode) + [html5-qrcode](https://github.com/mebjas/html5-qrcode) | Server-side generation + client-side scanning |
| **Hosting** | [Vercel](https://vercel.com/) | Edge deployment with CI/CD |
| **Containerization** | [Docker Compose](https://www.docker.com/) | Local PostgreSQL + Redis services |
| **Analytics** | [Vercel Speed Insights](https://vercel.com/docs/speed-insights) | Core Web Vitals monitoring |
| **Fonts** | [Geist Sans & Mono](https://vercel.com/font) | Premium Vercel typography |

---

## Performance Benchmarks

The application is optimized for the **Base Network** to ensure sub-second interactions and minimal bundle footprints.

### Build Metrics

| Metric | Value |
| :--- | :--- |
| Build Time | ~45.2s (optimized production build) |
| First Load JS (Shared) | 102 kB (Gzipped) |
| Dashboard Route | 124 kB |
| Prisma Client Generation | 57ms |

### Network & UX

| Metric | Value |
| :--- | :--- |
| QR Decoding Speed | < 200ms |
| Social Login Latency | ~1.2s (wallet creation + auth) |
| Transaction Confirmation | ~450ms (Base Sepolia average) |

### Optimization Graph
![Performance Benchmarks](./public/benchmarks.png)

---

## Project Structure

```text
phygital/
├── .github/                    # GitHub templates (issues, PRs)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── prisma/
│   ├── schema.prisma           # MongoDB data model (NFT schema)
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed script for test data
├── public/
│   ├── logo.png                # Phygital brand logo
│   ├── benchmarks.png          # Performance benchmark chart
│   └── networks/               # Chain logos (Base, ETH, SOL, etc.)
├── scripts/
│   └── generateQRCodes.ts      # Bulk QR code generation utility
├── src/
│   ├── app/
│   │   ├── api/                # Next.js API routes
│   │   │   ├── claimNFT/       # POST — Mint NFT to collector
│   │   │   ├── create-nft/     # POST — Create new NFT drop
│   │   │   ├── my-drops/       # GET  — Creator's drops (auth'd)
│   │   │   ├── nft/            # GET  — Public NFT metadata
│   │   │   └── upload/         # POST — IPFS image upload
│   │   ├── claim/              # Claim page (QR scan destination)
│   │   ├── create/             # Multi-step drop creation wizard
│   │   ├── dashboard/          # Creator analytics dashboard
│   │   ├── layout.tsx          # Root layout (providers, fonts)
│   │   ├── page.tsx            # Landing page entry
│   │   ├── error.tsx           # Global error boundary
│   │   └── not-found.tsx       # Custom 404 page
│   ├── components/
│   │   ├── landing-page.tsx    # Hero, features, CTAs
│   │   ├── dashboard.tsx       # Analytics & drop management
│   │   ├── claim-nft.tsx       # Claim flow UI
│   │   ├── QRScanner.tsx       # Camera-based QR scanner
│   │   ├── footer.tsx          # Site footer with credits
│   │   └── ui/                 # Reusable UI primitives
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth-helper.ts      # Signature-based wallet verification
│   │   ├── error-handler.ts    # Standardized API error responses
│   │   └── utils.ts            # Shared utilities (cn, etc.)
│   └── providers/
│       └── ThirdwebProviderWrapper.tsx
├── docker-compose.yml          # PostgreSQL + Redis for local dev
├── vercel.json                 # Vercel deployment config
├── tailwind.config.ts          # Tailwind theme & animations
├── package.json
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE                     # MIT License
```text

---

## Security

This project implements several layers of security hardening:

- **Signature-Based Authentication** — Sensitive API routes (`create-nft`, `my-drops`) require wallet signature verification via `x-signature` and `x-address` headers
- **Server-Side Validation** — All inputs are validated server-side with proper error codes (`ERR_API_001` through `ERR_SERVER_001`)
- **Password Masking** — Drop passwords are never exposed in public API responses
- **Claim Gating** — Expiry dates, availability windows, claim limits, and secret codes are all enforced server-side
- **Standardized Error Handling** — Structured error responses hide internal details while providing traceable error codes
- **Private Key Isolation** — Admin wallet private keys live exclusively in environment variables, never in client bundles

For full details, see [`SECURITY.md`](./SECURITY.md).

---

## Quick Start

### Prerequisites

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| [Node.js](https://nodejs.org/) | 18+ | Runtime |
| [Docker](https://www.docker.com/) | Latest | Local database services |
| [Thirdweb Account](https://thirdweb.com/) | — | Client ID & Secret Key |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | — | Cloud database (or local) |

### 1. Clone the Repository

```bash
git clone https://github.com/trigno1/phygital-nft-platform.git
cd phygital-nft-platform
```text

### 2. Install Dependencies

```bash
npm install
```text

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/phygital_db?retryWrites=true&w=majority"

# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_API_SECRET_KEY=your_secret_key
THIRDWEB_ACCESS_TOKEN=your_access_token

# Backend Wallet (pays gas for collectors)
BACKEND_WALLET_ADDRESS="0x..."
ADMIN_WALLET_ADDRESS="0x..."
THIRDWEB_ADMIN_PRIVATE_KEY=0x...

# Deployed ERC-1155 Edition Contract
NFT_CONTRACT_ADDRESS="0x..."
ENCRYPTION_PASSWORD="your_strong_password"

# Local Services (optional)
REDIS_URL="redis://localhost:6379"
POSTGRES_CONNECTION_URL="postgresql://engine:engine@localhost:5432/engine"
```text

### 4. Start Local Services (Optional)

```bash
docker-compose up -d
```text

This spins up PostgreSQL 15 and Redis 7 containers for local development.

### 5. Generate Prisma Client & Run

```bash
npx prisma generate
npm run dev
```text

The app will be live at <http://localhost:3000> 🎉

### 6. Seed Test Data (Optional)

```bash
npm run seed
```text

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with test NFT data |
| `npm run generate:qrs` | Bulk generate QR codes for existing drops |

---

## Data Model

The core NFT schema (defined in `prisma/schema.prisma`) with MongoDB:

```prisma
model NFT {
  id             String    @id @default(cuid()) @map("_id")
  name           String
  description    String
  image          String
  minted         Boolean   @default(false)
  owner          String?
  creatorAddress String?
  txHash         String?
  attributes     Json?
  category       String?
  qrPath         String?
  externalUrl    String?
  password       String?
  isSoulbound    Boolean   @default(false)
  maxClaims      Int?
  claimsCount    Int       @default(0)
  scansCount     Int       @default(0)
  issuedAt       DateTime?
  expiresAt      DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```text

---

## API Reference

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/create-nft` | ✅ Signature | Create a new NFT drop with metadata and QR code |
| `POST` | `/api/claimNFT` | ❌ Public | Claim (mint) an NFT to a wallet address |
| `GET` | `/api/nft/[id]` | ❌ Public | Fetch public NFT metadata by ID |
| `GET` | `/api/my-drops` | ✅ Signature | Fetch all drops created by authenticated wallet |
| `POST` | `/api/upload` | ✅ Signature | Upload an image to IPFS |

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

> Please also review our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

```text
MIT License — Copyright (c) 2026 Tanish Sunita Pareek
```text

---

## Documentation

| Document | Description |
| :--- | :--- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | How to contribute, code style, and PR process |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | Community standards (Contributor Covenant) |
| [`SECURITY.md`](./SECURITY.md) | Vulnerability reporting policy |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version history and release notes |
| [`LICENSE`](./LICENSE) | MIT License |

---

---

## Developed By

**Tanish Sunita Pareek** · *Full-Stack & Web3 Developer*

[![GitHub](https://img.shields.io/badge/GitHub-trigno1-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/trigno1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Tanish%20Sunita%20Pareek-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tanish-sunita-pareek/)

Built with ❤️ for the Phygital Future · ⭐ **Star this repo** if you found it useful!

