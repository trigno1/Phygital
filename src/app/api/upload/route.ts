import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_API_SECRET_KEY!,
    });

    // Upload to IPFS via Thirdweb Storage
    const uri = await upload({ client, files: [file] });

    return NextResponse.json({ uri });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
