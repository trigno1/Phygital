import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, errorResponse } from "@/lib/error-handler";
import { verifyAuth } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return errorResponse({
        code: ErrorCode.VALIDATION,
        message: "wallet address parameter is required",
        status: 400,
      });
    }

    // Secure Verification: Ensure the request is authorized by the wallet owner
    const auth = await verifyAuth(request, address);
    if (!auth.isValid) return auth.response!;

    const drops = await prisma.nFT.findMany({
      where: { creatorAddress: address },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        category: true,
        claimsCount: true,
        scansCount: true,
        maxClaims: true,
        minted: true,
        isSoulbound: true,
        issuedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ drops });
  } catch (error) {
    return errorResponse({
      code: ErrorCode.INTERNAL,
      message: "An encrypted server error occurred while fetching your drops",
      status: 500,
      details: error,
    });
  }
}
