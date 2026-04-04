import { createThirdwebClient, getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { name } from "thirdweb/extensions/common";
import { getWalletBalance } from "thirdweb/wallets";
import { privateKeyToAccount } from "thirdweb/wallets";

async function main() {
  const secretKey = process.env.THIRDWEB_API_SECRET_KEY;
  const privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY;
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

  if (!secretKey || !privateKey || !contractAddress) {
    console.error("Missing environment variables in .env");
    return;
  }

  try {
    const client = createThirdwebClient({ secretKey });
    const account = privateKeyToAccount({ client, privateKey });
    const contract = getContract({
      client,
      chain: baseSepolia,
      address: contractAddress as `0x${string}`,
    });

    console.log("--- Thirdweb Connectivity Test ---");
    console.log("Testing Secret Key...");
    const contractName = await name({ contract });
    console.log("✅ Secret Key is valid. Contract Name:", contractName);

    console.log("\nTesting Wallet Balance...");
    const balance = await getWalletBalance({
      client,
      chain: baseSepolia,
      address: account.address,
    });
    console.log(`Address: ${account.address}`);
    console.log(`Balance: ${balance.displayValue} ${balance.symbol}`);
    
    if (parseFloat(balance.displayValue) < 0.001) {
        console.warn("⚠️  LOW BALANCE: Your admin wallet might not have enough gas to mint NFTs.");
    } else {
        console.log("✅ Balance looks sufficient for gas.");
    }

  } catch (error: any) {
    console.error("\n❌ TEST FAILED");
    console.error("Message:", error.message || error);
    if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
        console.error("Reason: The THIRDWEB_API_SECRET_KEY in your .env is invalid or doesn't have permissions.");
    }
  }
}

main();
