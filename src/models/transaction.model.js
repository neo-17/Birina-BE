"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/transaction.model.ts
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    gamosa: { type: mongoose_1.Types.ObjectId, ref: 'Gamosa', required: true },
    tokenId: { type: String, required: true },
    txHash: { type: String, required: true },
    status: { type: String, enum: ['success', 'pending', 'failed'], required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Transaction', TransactionSchema);
