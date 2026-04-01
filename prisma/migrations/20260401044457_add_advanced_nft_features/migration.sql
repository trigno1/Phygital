-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "claimsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "isSoulbound" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxClaims" INTEGER,
ADD COLUMN     "password" TEXT;
