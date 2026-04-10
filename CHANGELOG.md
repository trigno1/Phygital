# Changelog

All notable changes to the **Phygital NFT Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-10

### Added
- **Core Platform**: Full Next.js 14 application with App Router support.
- **Web3 Integration**: Thirdweb V5 SDK with support for social, email, and passkey 'invisible' wallets.
- **Blockchain**: Deployment configuration for Base Sepolia Testnet.
- **Smart Contracts**: ERC-1155 NFT edition support for phygital claims.
- **Creator Tools**: Dashboard for uploading assets to IPFS and configuring drop parameters (limits, secrets, soulbound).
- **Physical Integration**: Automatic QR code generation script for physical distribution.
- **Documentation**: Professional README with tech stack benchmarks, CODE_OF_CONDUCT, CONTRIBUTING guidelines, and SECURITY policy.
- **Branding**: Official Phygital logo and premium UI components.

### Fixed
- QR Scanner UI polish and optimized loading states.
- Dynamic claim link generation based on environment variables.

### Performance
- Optimized build times (~45s).
- Efficient bundle management with route-based code splitting.
