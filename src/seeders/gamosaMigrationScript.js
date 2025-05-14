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
const papaparse_1 = __importDefault(require("papaparse"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
// Define the schemas
const QRCodeSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    claimed: { type: Boolean, default: false },
    claimedBy: { type: String, default: null },
    claimedNFTUrl: { type: String, default: null },
    mintedTokenId: { type: String, default: null },
});
const GamosaProductSchema = new mongoose_1.Schema({
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
});
// Create the model
const GamosaProduct = mongoose_1.default.model('GamosaProduct', GamosaProductSchema);
const mongoUrl = 'mongodb+srv://codesshyam:SweYu58XhY34HSkL@cluster0.oepulor.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// Generate QR code function
function generateQRCode() {
    return {
        code: (0, uuid_1.v4)(),
        claimed: false,
        claimedBy: null,
        claimedNFTUrl: null,
        mintedTokenId: null
    };
}
function populateGamosaProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        try {
            yield mongoose_1.default.connect(mongoUrl);
            console.log('Connected to MongoDB');
            // Clear existing data if needed
            yield GamosaProduct.deleteMany({});
            console.log('Cleared existing GamosaProduct data');
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
            const qrLogPath = path_1.default.join(logDir, 'qr_codes.json');
            const qrCodes = {};
            for (const row of data) {
                const weaverName = (_a = row['Name of the Weaver']) === null || _a === void 0 ? void 0 : _a.trim();
                const gamosaId = (_b = row['Gamusa ID']) === null || _b === void 0 ? void 0 : _b.trim();
                if (!weaverName || !gamosaId) {
                    console.log(`Skipping row with missing data: Weaver=${weaverName}, Gamosa ID=${gamosaId}`);
                    continue;
                }
                // Process the loom date
                let loomDateString = '';
                const loomRaw = (_c = row['Went into the Loom']) === null || _c === void 0 ? void 0 : _c.trim();
                if (loomRaw) {
                    const match = loomRaw.match(/(\d+)(st|nd|rd|th)\s+(\w+)\s+(\d+)/);
                    if (match) {
                        const [, day, , month, year] = match;
                        const loomDate = new Date(`${month} ${day}, ${year}`);
                        loomDateString = loomDate.toISOString();
                    }
                    else {
                        loomDateString = new Date().toISOString(); // Use current date if format doesn't match
                    }
                }
                else {
                    loomDateString = new Date().toISOString(); // Use current date if missing
                }
                // Process coordinates
                const coordsText = row['Lat. Long'] || '';
                const coords = coordsText.split(',').map((c) => parseFloat(c.trim()));
                const latitude = ((_d = coords === null || coords === void 0 ? void 0 : coords[0]) === null || _d === void 0 ? void 0 : _d.toString()) || '0';
                const longitude = ((_e = coords === null || coords === void 0 ? void 0 : coords[1]) === null || _e === void 0 ? void 0 : _e.toString()) || '0';
                // Generate a single QR code for this gamosa
                const qrCode = generateQRCode();
                // Store the QR code in our log
                qrCodes[gamosaId] = qrCode.code;
                // Create the GamosaProduct
                const gamosaProduct = new GamosaProduct({
                    gamosaId: gamosaId,
                    weaverName: weaverName,
                    gamosaType: ((_f = row['Gamosa Type']) === null || _f === void 0 ? void 0 : _f.trim()) || 'Standard',
                    gamosaSize: ((_g = row['Gamosa Size']) === null || _g === void 0 ? void 0 : _g.trim()) || 'Standard Size',
                    village: ((_h = row['Village']) === null || _h === void 0 ? void 0 : _h.trim()) || 'Unknown',
                    subdivision: ((_j = row['Sub-Division']) === null || _j === void 0 ? void 0 : _j.trim()) || 'Unknown',
                    district: ((_k = row['District']) === null || _k === void 0 ? void 0 : _k.trim()) || 'Unknown',
                    latitude: latitude,
                    longitude: longitude,
                    wentIntoTheLoom: loomDateString,
                    weaverImageUrl: ((_l = row['Photo of the Weaver']) === null || _l === void 0 ? void 0 : _l.trim()) || '',
                    ipfsUrl: '', // Empty as requested
                    qrCodes: [qrCode],
                    contractAddress: '', // Empty as requested
                });
                yield gamosaProduct.save();
                console.log(`Created GamosaProduct: ${gamosaId} with QR code`);
            }
            // Write QR codes to log file
            fs_1.default.writeFileSync(qrLogPath, JSON.stringify(qrCodes, null, 2));
            console.log(`QR codes saved to ${qrLogPath}`);
            console.log('GamosaProduct population complete');
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
// Run the script
populateGamosaProducts();
