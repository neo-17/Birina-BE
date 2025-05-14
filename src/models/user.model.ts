// src/models/user.model.ts
import { Schema, model, Types } from 'mongoose';

// Update UserClaimSchema to reference the product
const UserClaimSchema = new Schema({
  gamosa: { type: Schema.Types.ObjectId, ref: 'Gamosa', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'GamosaProduct' },  // Add this line to reference the product
  tokenId: { type: Number, default: null },  // If you parse out the minted tokenId
  claimedAt: { type: Date, default: Date.now },  // When the user claimed it
  claimedNFTUrl: { type: String, default: null },
});

// The rest of your User schema remains the same
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    salt: { type: String, required: true },
    smartAccountAddress: { type: String },
    claims: {
      type: [UserClaimSchema],
      default: [],
    },
    transactions: [{ type: Types.ObjectId, ref: 'Transaction' }],
  },
  {
    timestamps: true,
  }
);

export default model('User', UserSchema);
