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
exports.deployNFT = exports.getAdmins = exports.removeAdmin = exports.addAdmin = exports.loginAdmin = exports.registerAdmin = void 0;
const admin_model_1 = __importDefault(require("../models/admin.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// src/controllers/admin.controller.ts
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, pin } = req.body;
        // Check if any admin already exists
        const adminCount = yield admin_model_1.default.countDocuments();
        if (adminCount > 0) {
            return res
                .status(403)
                .json({ message: 'Admin registration is disabled after initial setup' });
        }
        // Proceed with admin registration
        const existingAdmin = yield admin_model_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt();
        const hashedPin = yield bcryptjs_1.default.hash(pin, salt);
        const newAdmin = new admin_model_1.default({ email, username, hashedPin, salt });
        yield newAdmin.save();
        return res.status(201).json({ message: 'Admin registered successfully' });
    }
    catch (error) {
        console.error('Error registering admin:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.registerAdmin = registerAdmin;
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, pin } = req.body;
    if (!username && !email) {
        return res.status(400).json({ message: 'Email or username is required' });
    }
    if (!pin) {
        return res.status(400).json({ message: 'PIN is required' });
    }
    try {
        // Find admin by email or username
        const admin = yield admin_model_1.default.findOne({ $or: [{ email }, { username }] });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Verify PIN
        const isPinValid = yield bcryptjs_1.default.compare(pin, admin.hashedPin);
        if (!isPinValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' } // Token expires in 1 hour
        );
        // Send response with token
        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
            },
        });
    }
    catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.loginAdmin = loginAdmin;
// src/controllers/admin.controller.ts
const addAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, pin } = req.body;
        const existingAdmin = yield admin_model_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt();
        const hashedPin = yield bcryptjs_1.default.hash(pin, salt);
        const newAdmin = new admin_model_1.default({ email, username, hashedPin, salt });
        yield newAdmin.save();
        return res.status(201).json({ message: 'Admin added successfully' });
    }
    catch (error) {
        console.error('Error adding admin:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addAdmin = addAdmin;
const removeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = req.params;
        // Prevent self-deletion
        if (req.admin.id === adminId) {
            return res.status(400).json({ message: 'You cannot remove yourself' });
        }
        const admin = yield admin_model_1.default.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        yield admin_model_1.default.findByIdAndDelete(adminId);
        return res.status(200).json({ message: 'Admin removed successfully' });
    }
    catch (error) {
        console.error('Error removing admin:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.removeAdmin = removeAdmin;
const getAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_model_1.default.find();
        return res.status(200).json(admins);
    }
    catch (error) {
        console.error('Error getting admins:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAdmins = getAdmins;
const deployNFT = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        throw error;
    }
});
exports.deployNFT = deployNFT;
