import dotenv from 'dotenv'
import { PinataSDK } from "pinata-web3";

dotenv.config()

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY_URL!,
});
