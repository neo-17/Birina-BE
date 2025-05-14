// models/Gamosa.ts
import mongoose from 'mongoose';

const gamosaSchema = new mongoose.Schema({
  gamusa_id: { type: String, unique: true, required: true },
  weaver: { type: mongoose.Schema.Types.ObjectId, ref: 'Weaver', required: true },
  gamosa_type: { type: String, required: true },
  size: { type: String, required: true },
  loom_date: { type: Date, required: true },
  contract_address: { type: String },
  token_id: { type: String },
  qr_code_url: { type: String },
  is_minted: { type: Boolean, default: false },
  minted_at: { type: Date },
  owner_smart_account: { type: String },
  owner_eoa: { type: String },
  transfer_timestamp: { type: Date },
  is_frozen: { type: Boolean, default: false },
});

export default mongoose.model('Gamosa', gamosaSchema);
