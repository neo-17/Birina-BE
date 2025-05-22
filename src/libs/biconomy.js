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
exports.generatePrivateKeyUser = exports.createSmartAccount = exports.walletClient = exports.account = exports.publicClient = exports.generateTokenId = exports.generateUniqueSalt = void 0;
const accounts_1 = require("viem/accounts");
const account_1 = require("@biconomy/account");
const chains_1 = require("viem/chains");
const viem_1 = require("viem");
const crypto_1 = __importDefault(require("crypto"));
const bundlerUrl = process.env.BUNDLER_URL;
const biconomyPaymasterApiKey = process.env.BICONOMY_API_KEY;
const rpcUrl = process.env.BASE_MAINNET_URL;
console.log('rpcUrl', rpcUrl);
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.base,
    transport: (0, viem_1.http)(rpcUrl)
});
exports.publicClient = publicClient;
const account = (0, accounts_1.privateKeyToAccount)(process.env.PRIVATE_KEY_SIGNER);
exports.account = account;
const walletClient = (0, viem_1.createWalletClient)({
    account,
    chain: chains_1.base,
    transport: (0, viem_1.http)(rpcUrl)
});
exports.walletClient = walletClient;
// Function to generate a unique token id for NFT in number
const generateTokenId = () => {
    try {
        const random = Math.floor(Math.random() * 10000);
        return random;
    }
    catch (error) {
        console.error(error);
    }
};
exports.generateTokenId = generateTokenId;
const generateUniqueSalt = (pin) => {
    try {
        const salt = crypto_1.default.createHash('sha256').update(pin.toString()).digest('hex');
        return salt;
    }
    catch (error) {
        console.error(error);
    }
};
exports.generateUniqueSalt = generateUniqueSalt;
const generateUniqueHash = (string, pin) => {
    try {
        const modifiedUniqueString = `${string}+${pin}+${process.env.STRONG_PEPPER}`;
        const hash = crypto_1.default.createHash('sha256').update(modifiedUniqueString).digest('hex');
        return hash;
    }
    catch (error) {
        console.error(error);
    }
};
const generatePrivateKeyUser = (username, pin) => {
    try {
        const uniqueHash = generateUniqueHash(username, pin);
        const doubleHash = generateUniqueHash(uniqueHash, pin);
        // convert to a private key
        const privateKey = `0x${doubleHash}`;
        return privateKey;
    }
    catch (error) {
        console.error(error);
    }
};
exports.generatePrivateKeyUser = generatePrivateKeyUser;
const createSmartAccount = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = (0, accounts_1.privateKeyToAccount)(privateKey);
        const smartAccount = yield (0, account_1.createSmartAccountClient)({
            signer: account,
            bundlerUrl: bundlerUrl,
            chainId: chains_1.baseSepolia.id,
            biconomyPaymasterApiKey: biconomyPaymasterApiKey,
            rpcUrl: rpcUrl
        });
        return yield smartAccount.getAccountAddress();
    }
    catch (error) {
        console.error(error);
    }
});
exports.createSmartAccount = createSmartAccount;
