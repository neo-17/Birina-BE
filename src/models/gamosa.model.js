"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Gamosa.ts
const mongoose_1 = __importDefault(require("mongoose"));
const gamosaSchema = new mongoose_1.default.Schema({
    gamusa_id: { type: String, unique: true, required: true },
    weaver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Weaver', required: true },
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
exports.default = mongoose_1.default.model('Gamosa', gamosaSchema);
