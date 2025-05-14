"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/user.model.ts
const mongoose_1 = require("mongoose");
// Update UserClaimSchema to reference the product
const UserClaimSchema = new mongoose_1.Schema({
    gamosa: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Gamosa', required: true },
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'GamosaProduct' }, // Add this line to reference the product
    tokenId: { type: Number, default: null }, // If you parse out the minted tokenId
    claimedAt: { type: Date, default: Date.now }, // When the user claimed it
    claimedNFTUrl: { type: String, default: null },
});
// The rest of your User schema remains the same
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    salt: { type: String, required: true },
    smartAccountAddress: { type: String },
    claims: {
        type: [UserClaimSchema],
        default: [],
    },
    transactions: [{ type: mongoose_1.Types.ObjectId, ref: 'Transaction' }],
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('User', UserSchema);
