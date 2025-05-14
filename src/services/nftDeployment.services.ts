import { createWalletClient, http, parseAbi, WalletClient, Hex, createPublicClient, Abi } from 'viem';
import { baseSepolia } from 'viem/chains';
import abi from '../../abi/Gamosa.json';
import dotenv from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';

dotenv.config();

const DEPLOYER_PRIVATE_KEY = process.env.PRIVATE_KEY_SIGNER!;
const RPC_URL = process.env.BASE_SEPOLIA_URL!;
// Or you could store chain in .env or select dynamically. For now, let's assume sepolia.

function getChainConfig() {
  return baseSepolia
}

const publicClient = createPublicClient({
    chain: getChainConfig(),
    transport: http(RPC_URL),
});

const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY as Hex);

export async function deployGamosaNFTContract(
  gamosaId: string,
  weaverName: string,
  gamosaType: string,
  gamosaSize: string,
  village: string,
  subdivision: string,
  district: string,
  latitude: string,
  longitude: string,
  wentIntoTheLoom: string,
): Promise<string> {
  try {
    // 1) Create the wallet client
    const chainConfig = getChainConfig();
    const walletClient: WalletClient = createWalletClient({
      chain: chainConfig,
      transport: http(RPC_URL),
      account: account,
    });

    // 2) Deploy the contract
    const hash = await walletClient.deployContract({
      abi: abi.abi,
      bytecode: abi.bytecode as Hex,
      account: account,
      chain: baseSepolia,
      args: [
        gamosaId,
        weaverName,
        gamosaType,
        gamosaSize,
        village,
        subdivision,
        district,
        latitude,
        longitude,
        wentIntoTheLoom
      ],
    });

    // 3) Wait for deployment (we get the address after the TX is mined)
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error('No contract address in receipt.');
    }

    return receipt.contractAddress;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}
