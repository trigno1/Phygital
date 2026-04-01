import { getContract } from "thirdweb";
import { chain, client } from "@/app/const/client";

export const contractAddress = "0xe5492494c0423394A4a1FaaB6E733C35580F9BF9"; // qr_code_nft Edition on Base Sepolia
export const tokenContractAddress = "0x39Ed619e237eeb1d890B0a4DFc93a7984451c9C3";
export const contract = getContract({
    client: client,
    chain: chain,
    address: contractAddress
});

export const tokenContract = getContract({
    client: client,
    chain: chain,
    address: tokenContractAddress
});