// src/models/transaction.model.ts
import { Schema, model, Types } from 'mongoose';

const TransactionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    gamosa: { type: Types.ObjectId, ref: 'Gamosa', required: true },
    tokenId: { type: String, required: true },
    txHash: { type: String, required: true },
    status: { type: String, enum: ['success', 'pending', 'failed'], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default model('Transaction', TransactionSchema);
