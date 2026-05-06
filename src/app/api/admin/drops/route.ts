import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  const drops = await prisma.nFT.findMany({
    orderBy: { claimsCount: "desc" },
    select: {
      id: true,
      name: true,
      image: true,
      category: true,
      claimsCount: true,
      scansCount: true,
      maxClaims: true,
      minted: true,
      isSoulbound: true,
      isPublic: true,
      password: true,
      expiresAt: true,
      issuedAt: true,
      createdAt: true,
      creatorAddress: true,
    },
  });

  // Don't expose raw password hash — just send a boolean
  const sanitized = drops.map(({ password, ...rest }) => ({
    ...rest,
    hasPassword: !!password,
  }));

  return NextResponse.json({ drops: sanitized });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) return auth.response as Response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.claimRecord.deleteMany({ where: { dropId: id } }),
      prisma.nFT.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
