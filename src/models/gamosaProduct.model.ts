import { Schema, model } from 'mongoose';

const QRCodeSchema = new Schema({
  code: { type: String, required: true },
  claimed: { type: Boolean, default: false },
  claimedBy: { type: String, default: null },
  claimedNFTUrl: { type: String, default: null },
  mintedTokenId: { type: String, default: null },
});

const GamosaProductSchema = new Schema(
  {
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
  }
)

export default model('GamosaProduct', GamosaProductSchema);
