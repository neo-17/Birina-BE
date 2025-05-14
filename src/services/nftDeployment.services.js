"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployGamosaNFTContract = deployGamosaNFTContract;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const Gamosa_json_1 = __importDefault(require("../../abi/Gamosa.json"));
const dotenv_1 = __importDefault(require("dotenv"));
const accounts_1 = require("viem/accounts");
dotenv_1.default.config();
const DEPLOYER_PRIVATE_KEY = process.env.PRIVATE_KEY_SIGNER;
const RPC_URL = process.env.BASE_SEPOLIA_URL;
// Or you could store chain in .env or select dynamically. For now, let's assume sepolia.
function getChainConfig() {
    return chains_1.baseSepolia;
}
const publicClient = (0, viem_1.createPublicClient)({
    chain: getChainConfig(),
    transport: (0, viem_1.http)(RPC_URL),
});
const account = (0, accounts_1.privateKeyToAccount)(DEPLOYER_PRIVATE_KEY);
function deployGamosaNFTContract(gamosaId, weaverName, gamosaType, gamosaSize, village, subdivision, district, latitude, longitude, wentIntoTheLoom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1) Create the wallet client
            const chainConfig = getChainConfig();
            const walletClient = (0, viem_1.createWalletClient)({
                chain: chainConfig,
                transport: (0, viem_1.http)(RPC_URL),
                account: account,
            });
            // 2) Deploy the contract
            const hash = yield walletClient.deployContract({
                abi: Gamosa_json_1.default.abi,
                bytecode: Gamosa_json_1.default.bytecode,
                account: account,
                chain: chains_1.baseSepolia,
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
            const receipt = yield publicClient.waitForTransactionReceipt({ hash });
            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt.');
            }
            return receipt.contractAddress;
        }
        catch (error) {
            console.error('Error deploying contract:', error);
            throw error;
        }
    });
}
