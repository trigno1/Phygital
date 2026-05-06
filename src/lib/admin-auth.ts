import { verifyAuth } from "@/lib/auth-helper";

const ADMIN_ADDRESSES = (process.env.ADMIN_WALLET_ADDRESSES ?? "")
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean);

export async function verifyAdmin(request: Request) {
  const auth = await verifyAuth(request, null);
  if (!auth.isValid) return { isAdmin: false, response: auth.response };

  const isAdmin = ADMIN_ADDRESSES.includes(auth.address?.toLowerCase() ?? "");
  if (!isAdmin) {
    return {
      isAdmin: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { isAdmin: true, address: auth.address };
}
