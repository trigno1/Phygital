import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { verifyAuth } from "@/lib/auth-helper";
import { generateBrandedQR } from "@/lib/branded-qr";
import { sendEmail } from "@/lib/email";
import { dropCreatedEmail, passwordDropEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      image,
      category,
      issuedAt,
      expiresAt,
      attributes,
      maxClaims,
      password,
      isSoulbound,
      isPublic,
      externalUrl,
      creatorAddress,
    } = body;

    if (!name || !description || !image) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "Missing required fields: name, description, image",
        status: 400,
      });
    }

    // Secure Verification: Ensure the request is authorized by the wallet owner
    const auth = await verifyAuth(request, creatorAddress);
    if (!auth.isValid) return auth.response!;

    // TASK 1: Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create the NFT record in the database
    const nft = await prisma.nFT.create({
      data: {
        name,
        description,
        image,
        category: category || null,
        issuedAt: issuedAt ? new Date(issuedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        attributes: attributes || null,
        maxClaims: maxClaims ? parseInt(maxClaims, 10) : null,
        password: hashedPassword,
        isSoulbound: isSoulbound ?? false,
        isPublic: isPublic ?? false,
        externalUrl: externalUrl || null,
        creatorAddress: creatorAddress || null,
        minted: false,
        claimsCount: 0,
      },
    });

    // Determine the base URL dynamically from the request origin
    const url = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    
    // Generate QR code pointing to /claim?id=<nft.id>
    const claimUrl = `${origin}/claim?id=${nft.id}`;

    // Generate branded QR card with logo + NFT name
    let qrDataUrl: string;
    try {
      qrDataUrl = await generateBrandedQR(claimUrl, nft.name);
    } catch {
      // Fallback to raw QR if branded generation fails
      qrDataUrl = await QRCode.toDataURL(claimUrl, {
        errorCorrectionLevel: "H",
        type: "image/png",
        margin: 2,
        color: { dark: "#1e1b4b", light: "#ffffff" },
        width: 512,
      });
    }

    if (creatorAddress) {
      const creator = await prisma.userProfile.findUnique({
        where: { address: creatorAddress.toLowerCase() }
      });
      if (creator?.email) {
        // Send email non-blocking
        sendEmail({
          to: creator.email,
          subject: `Your drop "${nft.name}" is live`,
          html: dropCreatedEmail({
            dropName: nft.name,
            image: nft.image,
            claimUrl,
            maxClaims: nft.maxClaims ?? undefined,
            expiresAt: nft.expiresAt?.toISOString(),
            hasPassword: !!password,
          }),
        }).catch(console.error);
        
        if (password) {
          sendEmail({
            to: creator.email,
            subject: `Secret code for "${nft.name}"`,
            html: passwordDropEmail({
              dropName: nft.name,
              password: password,
              claimUrl,
            }),
          }).catch(console.error);
        }
      }
    }

    return NextResponse.json({ id: nft.id, qrDataUrl, claimUrl });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "An encrypted server error occurred while creating the NFT",
      status: 500,
      details: error,
    });
  }
}
