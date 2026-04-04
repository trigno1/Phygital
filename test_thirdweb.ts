import { createThirdwebClient, prepareTransaction, sendTransaction } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { privateKeyToAccount, getWalletBalance } from "thirdweb/wallets";

async function main() {
  const secretKey = process.env.THIRDWEB_API_SECRET_KEY;
  const privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY;

  if (!secretKey || !privateKey) {
    console.error("Missing environment variables in .env");
    return;
  }

  try {
    const client = createThirdwebClient({ secretKey });
    const account = privateKeyToAccount({ client, privateKey });

    console.log("--- Thirdweb Write Permission Test ---");
    console.log(`Address: ${account.address}`);
    
    // Check balance first
    const balance = await getWalletBalance({ client, chain: baseSepolia, address: account.address });
    console.log(`Current Balance: ${balance.displayValue} ${balance.symbol}`);

    if (parseFloat(balance.displayValue) === 0) {
        console.error("❌ FAILED: Wallet has 0 balance. Please add funds for gas.");
        return;
    }

    console.log("\nAttempting to send a test transaction (0 ETH to self)...");
    console.log("This tests if the Secret Key is authorized for RPC write operations.");

    const transaction = prepareTransaction({
      to: account.address,
      chain: baseSepolia,
      client: client,
      value: BigInt(0),
    });

    const sentTx = await sendTransaction({ transaction, account });
    console.log("✅ SUCCESS! Transaction sent.");
    console.log("Hash:", sentTx.transactionHash);

  } catch (error: any) {
    console.error("\n❌ TEST FAILED");
    console.error("Message:", error.message || error);
    
    if (error.message?.includes("Unauthorized") || error.message?.includes("401") || error.message?.includes("permission")) {
        console.error("\nCRITICAL: Your Thirdweb Secret Key is NOT authorized for this service.");
        console.error("Go to Thirdweb Dashboard -> API Keys -> [Your Key] -> Check if 'RPC' and 'Base Sepolia' are enabled/allowed.");
    }
  }
}

main();
