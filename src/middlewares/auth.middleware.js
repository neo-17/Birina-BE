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
exports.authenticateUser = exports.authenticateAdmin = void 0;
// src/middleware/auth.middleware.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const authenticateAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = yield admin_model_1.default.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.admin = admin;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized access' });
    }
});
exports.authenticateAdmin = authenticateAdmin;
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Implement user authentication logic here
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    console.log('token', token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    // This middleware is specific to user authentication\
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_model_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized access' });
    }
});
exports.authenticateUser = authenticateUser;
