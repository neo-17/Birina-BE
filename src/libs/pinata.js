"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinata = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pinata_web3_1 = require("pinata-web3");
dotenv_1.default.config();
exports.pinata = new pinata_web3_1.PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL,
});
