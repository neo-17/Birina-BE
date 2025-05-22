"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
// Define the schema
const QRCodeSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    claimed: { type: Boolean, default: false },
    claimedBy: { type: String, default: null },
    claimedNFTUrl: { type: String, default: null },
    mintedTokenId: { type: String, default: null },
    gamosaId: { type: String, required: true, ref: 'GamosaProduct' },
});
// Create the model
const QRCode = mongoose_1.default.model('QRCode', QRCodeSchema);
const mongoUrl = 'mongodb+srv://codesshyam:CrOBpfd63tEsv9gp@cluster0.z2npy82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
function seedQRCodes() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            yield mongoose_1.default.connect(mongoUrl);
            console.log('Connected to MongoDB');
            // Clear existing data if needed
            yield QRCode.deleteMany({});
            console.log('Cleared existing QRCode data');
            const csvPath = path_1.default.join(process.cwd(), 'data', 'GBBC-Birina-Project.csv');
            const csvData = fs_1.default.readFileSync(csvPath, 'utf8');
            const { data } = papaparse_1.default.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h) => h.trim(),
            });
            console.log(`Parsed ${data.length} rows from CSV`);
            // Create a log directory if it doesn't exist
            const logDir = path_1.default.join(process.cwd(), 'logs');
            if (!fs_1.default.existsSync(logDir)) {
                fs_1.default.mkdirSync(logDir);
            }
            // Create a log file for QR codes
            const qrCodesData = [];
            const qrCodesLog = {};
            for (const row of data) {
                const gamosaId = (_a = row['Gamusa ID']) === null || _a === void 0 ? void 0 : _a.trim();
                if (!gamosaId) {
                    console.log(`Skipping row with missing Gamosa ID`);
                    continue;
                }
                // Generate a QR code for this gamosa
                const qrCode = {
                    code: (0, uuid_1.v4)(),
                    claimed: false,
                    claimedBy: null,
                    claimedNFTUrl: null,
                    mintedTokenId: null,
                    gamosaId: gamosaId
                };
                qrCodesData.push(qrCode);
                qrCodesLog[gamosaId] = qrCode.code;
            }
            // Save all QR codes
            yield QRCode.insertMany(qrCodesData);
            console.log(`Seeded ${qrCodesData.length} QR codes`);
            // Write QR codes to log file for reference
            const qrCodesLogPath = path_1.default.join(logDir, 'qr_codes.json');
            fs_1.default.writeFileSync(qrCodesLogPath, JSON.stringify(qrCodesLog, null, 2));
            console.log(`QR codes saved to ${qrCodesLogPath}`);
            console.log('QR Codes seeding complete');
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Missing import for papaparse
const papaparse_1 = __importDefault(require("papaparse"));
// Run the script
seedQRCodes();
