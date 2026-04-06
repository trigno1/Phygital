import { ErrorCode, errorResponse } from "./error-handler";
import { client } from "@/app/const/client";
import { verifySignature } from "thirdweb/auth";

/**
 * Verifies that the sender of a request is the owner of the address.
 * Uses a signed message to confirm identity without needing a full session.
 */
export async function verifyAuth(request: Request, expectedAddress: string | null) {
  const signature = request.headers.get("x-signature");
  const address = request.headers.get("x-address");

  if (!signature || !address) {
    return {
      isValid: false,
      response: errorResponse({
        code: ErrorCode.UNAUTHORIZED,
        message: "Authentication headers missing (x-signature, x-address)",
        status: 401,
      }),
    };
  }

  // If a specific address is expected (e.g. for my-drops), check it matches.
  if (expectedAddress && address.toLowerCase() !== expectedAddress.toLowerCase()) {
    return {
      isValid: false,
      response: errorResponse({
        code: ErrorCode.UNAUTHORIZED,
        message: "Wallet address mismatch",
        status: 403,
      }),
    };
  }

  try {
    const message = `Authorize Phygital Access for ${address}`;
    
    const isValid = await verifySignature({
      client,
      address,
      message,
      signature,
    });

    if (!isValid) {
      return {
        isValid: false,
        response: errorResponse({
          code: ErrorCode.UNAUTHORIZED,
          message: "Account verification failed — invalid signature",
          status: 401,
        }),
      };
    }

    return { isValid: true, address };
  } catch (error) {
    return {
      isValid: false,
      response: errorResponse({
        code: ErrorCode.INTERNAL,
        message: "Verification service error",
        status: 500,
        details: error,
      }),
    };
  }
}
