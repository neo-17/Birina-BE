"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QRCodeSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    claimed: { type: Boolean, default: false },
    claimedBy: { type: String, default: null },
    claimedNFTUrl: { type: String, default: null },
    mintedTokenId: { type: String, default: null },
});
const GamosaProductSchema = new mongoose_1.Schema({
    gamosaId: { type: String, required: true },
    weaverName: { type: String, required: true },
    gamosaType: { type: String, required: true },
    gamosaSize: { type: String, required: true },
    village: { type: String, required: true },
    subdivision: { type: String, required: true },
    district: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    wentIntoTheLoom: { type: String, required: true },
    weaverImageUrl: { type: String, required: true },
    ipfsUrl: { type: String },
    qrCodes: { type: [QRCodeSchema], default: [] },
    contractAddress: { type: String },
});
exports.default = (0, mongoose_1.model)('GamosaProduct', GamosaProductSchema);
