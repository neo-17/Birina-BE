"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Weaver.ts
const mongoose_1 = __importDefault(require("mongoose"));
const weaverSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    photo_url: { type: String },
    village: { type: String, required: true },
    sub_division: { type: String, required: true },
    district: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
});
exports.default = mongoose_1.default.model('Weaver', weaverSchema);
