import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "@biconomy/account"; 
import { baseSepolia } from "viem/chains"; 
import { createPublicClient, createWalletClient, Hex, http, parseEther } from "viem"; 
import crypto from 'crypto';

const bundlerUrl = process.env.BUNDLER_URL as string; 
const biconomyPaymasterApiKey = process.env.BICONOMY_API_KEY as string;
const rpcUrl = process.env.BASE_SEPOLIA_URL as string;

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_URL as string)
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY_SIGNER as Hex);

const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.BASE_RPC_URL)
});

// Function to generate a unique token id for NFT in number
const generateTokenId = () => {
    try {
        const random = Math.floor(Math.random() * 10000)
        return random
    } catch (error) {
        console.error(error)
    }
}

const generateUniqueSalt = (pin: number) => {
    try {
        const salt = crypto.createHash('sha256').update(pin.toString()).digest('hex')
        return salt
    } catch (error) {
        console.error(error)
    }
}

const generateUniqueHash = (string: string, pin: number) => {
    try {
        const modifiedUniqueString = `${string}+${pin}+${process.env.STRONG_PEPPER}`
        const hash = crypto.createHash('sha256').update(modifiedUniqueString).digest('hex')
        return hash
    } catch (error) {
        console.error(error)
    }
}

const generatePrivateKeyUser = (username: string, pin: number) => {
    try {
        const uniqueHash = generateUniqueHash(username, pin) as string
        const doubleHash = generateUniqueHash(uniqueHash, pin)
        // convert to a private key
        const privateKey = `0x${doubleHash}`
        return privateKey
    } catch (error) {
        console.error(error)
    }
}

const createSmartAccount = async (privateKey: string) => {
    try {
        const account = privateKeyToAccount(privateKey as Hex)
        const smartAccount = await createSmartAccountClient({
            signer: account,
            bundlerUrl: bundlerUrl,
            chainId: baseSepolia.id,
            biconomyPaymasterApiKey: biconomyPaymasterApiKey,
            rpcUrl: rpcUrl
        })

        return await smartAccount.getAccountAddress()
    } catch (error) {
        console.error(error)
    }
} 

export { generateUniqueSalt, generateTokenId, publicClient, account, walletClient, createSmartAccount, generatePrivateKeyUser }