import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "00000000000000000000000000000000"; // Fallback for Vercel build step

export const client = createThirdwebClient({ clientId });

export const chain = baseSepolia;