/**
 * ============================================================
 * Smart Contract References
 * ============================================================
 *
 * This file exports pre-configured contract instances for the
 * two smart contracts used by the Phygital platform:
 *
 * 1. contractAddress (Edition / ERC-1155):
 *    The main NFT contract where all Phygital drops are minted.
 *    ERC-1155 allows multiple copies of the same NFT (editions),
 *    which is perfect for Phygital drops with maxClaims > 1.
 *
 * 2. tokenContractAddress:
 *    A secondary token contract (used for utility/rewards tokens).
 *
 * Both contracts are deployed on Base Sepolia (testnet).
 * These instances can be imported anywhere in the app for
 * read/write operations.
 *
 * USAGE:
 *   import { contract } from "@/app/contract";
 *   const totalSupply = await readContract({ contract, method: "..." });
 */

import { getContract } from "thirdweb";
import { chain, client } from "@/app/const/client";

// Main NFT Edition contract (ERC-1155) on Base Sepolia
export const contractAddress = "0xe5492494c0423394A4a1FaaB6E733C35580F9BF9"; // qr_code_nft Edition on Base Sepolia
// Secondary token contract
export const tokenContractAddress = "0x39Ed619e237eeb1d890B0a4DFc93a7984451c9C3";

// Pre-configured contract instance for the main NFT contract
export const contract = getContract({
    client: client,
    chain: chain,
    address: contractAddress
});

// Pre-configured contract instance for the token contract
export const tokenContract = getContract({
    client: client,
    chain: chain,
    address: tokenContractAddress
});