"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revealUserPrivateKey = exports.getUserProfile = void 0;
// src/controllers/userProfile.controller.ts
const user_model_1 = __importDefault(require("../models/user.model"));
const gamosaProduct_model_1 = __importDefault(require("../models/gamosaProduct.model"));
const biconomy_1 = require("../libs/biconomy");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        // Example: find user by username
        // and populate each "claims.product" so we can see product info
        const user = yield user_model_1.default.findOne({ username }).populate({
            path: 'claims.product',
            model: gamosaProduct_model_1.default,
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error in getUserProfile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUserProfile = getUserProfile;
// export const updateUserPin = async (req: any, res: any) => {
//   try {
//     const { username } = req.params; // e.g. /api/users/:username/pin
//     const { oldPin, newPin } = req.body;
//     // 1. Find user
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // 2. Re-derive the old private key to confirm correctness
//     // user.salt is how we combine (username + oldPin + salt)
//     const oldDerivedKey = crypto
//       .createHash('sha256')
//       .update(username + oldPin + user.salt)
//       .digest('hex');
//     // If you want extra checks, you can do something with the oldDerivedKey,
//     // e.g. compare addresses or store a hashed version. 
//     // For an MVP, let's just assume if the user has the correct oldPin, it's valid.
//     // 3. Generate a new salt
//     const newSalt = crypto.randomBytes(16).toString('hex');
//     // 4. Optionally re-derive or not. But the point is that the user
//     //    will have a new salt, so they have a new "private key" if you do a full re-derive.
//     //    For an MVP, you can just set user.salt = newSalt.
//     user.salt = newSalt;
//     await user.save();
//     return res.status(200).json({ message: 'PIN updated successfully' });
//   } catch (error) {
//     console.error('Error in updateUserPin:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
/**
 * This is an MVP method to reveal the user's private key by re-deriving from (username + pin + salt).
 * In production, you typically do NOT allow users to just reveal private keys from server side.
 */
const revealUserPrivateKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, pin } = req.body;
        // 1. Find user
        const user = yield user_model_1.default.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 2. Re-derive private key from (username + pin + user.salt)
        const privateKey = (0, biconomy_1.generatePrivateKeyUser)(username, pin);
        // 3. Return to user (MVP). In real life, you wouldn't do this in plaintext
        return res.status(200).json({ privateKey });
    }
    catch (error) {
        console.error('Error in revealUserPrivateKey:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.revealUserPrivateKey = revealUserPrivateKey;
