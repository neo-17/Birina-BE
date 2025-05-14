"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/admin.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const adminSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    hashedPin: { type: String, required: true },
    salt: { type: String, required: true },
});
exports.default = mongoose_1.default.model('Admin', adminSchema);
