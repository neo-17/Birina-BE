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
exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const biconomy_1 = require("../libs/biconomy");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, pin } = req.body;
        // 1. Check if user already exists
        let existingUser = yield user_model_1.default.findOne({ username });
        if (existingUser) {
            // check if the pin entered is same as for the username
            const genratedSalt = (0, biconomy_1.generateUniqueSalt)(pin);
            if (genratedSalt !== existingUser.salt) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // user already exists
            const token = jsonwebtoken_1.default.sign({ id: existingUser._id, username: existingUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({
                message: 'User already exists',
                user: existingUser,
                token,
            });
        }
        // convert the user pin to salt for storage in DB
        const randomSalt = (0, biconomy_1.generateUniqueSalt)(pin);
        // 2. Generate a private key
        const privateKey = (0, biconomy_1.generatePrivateKeyUser)(username, pin);
        // 3. Smart account
        const smartAccount = yield (0, biconomy_1.createSmartAccount)(privateKey);
        // 4. Create user doc in DB
        const newUser = new user_model_1.default({
            username,
            salt: randomSalt,
            smartAccountAddress: smartAccount,
        });
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' } // Token expires in 1 hour
        );
        // 5. Return the user data (without sensitive info)
        return res.status(201).json({
            message: 'User created',
            user: newUser,
            token,
        });
    }
    catch (error) {
        console.error('Error in registerUser:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, pin } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'username is required' });
    }
    if (!pin) {
        return res.status(400).json({ message: 'PIN is required' });
    }
    try {
        // Find admin by email or username
        const user = yield user_model_1.default.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Verify PIN
        const generateSalt = (0, biconomy_1.generateUniqueSalt)(pin);
        const isPinValid = generateSalt === user.salt;
        if (!isPinValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' } // Token expires in 1 hour
        );
        // Send response with token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
            },
        });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.loginUser = loginUser;
