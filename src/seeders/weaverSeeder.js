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
dotenv_1.default.config();
// Define the schema
const WeaverSchema = new mongoose_1.Schema({
    weaverId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    village: { type: String, required: true },
    subdivision: { type: String, required: true },
    district: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    imageUrl: { type: String, required: true },
});
// Create the model
const Weaver = mongoose_1.default.model('Weaver', WeaverSchema);
const mongoUrl = 'mongodb+srv://codesshyam:SweYu58XhY34HSkL@cluster0.oepulor.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
function seedWeavers() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            yield mongoose_1.default.connect(mongoUrl);
            console.log('Connected to MongoDB');
            // Clear existing data if needed
            yield Weaver.deleteMany({});
            console.log('Cleared existing Weaver data');
            const csvPath = path_1.default.join(process.cwd(), 'data', 'GBBC-Birina-Project.csv');
            const csvData = fs_1.default.readFileSync(csvPath, 'utf8');
            const { data } = papaparse_1.default.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h) => h.trim(),
            });
            console.log(`Parsed ${data.length} rows from CSV`);
            // Create a map to track unique weavers
            const weaversMap = new Map();
            for (const row of data) {
                const weaverName = (_a = row['Name of the Weaver']) === null || _a === void 0 ? void 0 : _a.trim();
                if (!weaverName) {
                    console.log(`Skipping row with missing weaver name`);
                    continue;
                }
                // Process coordinates
                const coordsText = row['Lat. Long'] || '';
                const coords = coordsText.split(',').map((c) => parseFloat(c.trim()));
                const latitude = ((_b = coords === null || coords === void 0 ? void 0 : coords[0]) === null || _b === void 0 ? void 0 : _b.toString()) || '0';
                const longitude = ((_c = coords === null || coords === void 0 ? void 0 : coords[1]) === null || _c === void 0 ? void 0 : _c.toString()) || '0';
                // Create a unique ID for the weaver (could be based on name and location)
                const weaverId = `W-${weaverName.replace(/\s+/g, '-').toLowerCase()}-${((_d = row['Village']) === null || _d === void 0 ? void 0 : _d.trim().replace(/\s+/g, '-').toLowerCase()) || 'unknown'}`;
                // Only add the weaver if we haven't seen them before
                if (!weaversMap.has(weaverId)) {
                    const weaver = {
                        weaverId: weaverId,
                        name: weaverName,
                        village: ((_e = row['Village']) === null || _e === void 0 ? void 0 : _e.trim()) || 'Unknown',
                        subdivision: ((_f = row['Sub-Division']) === null || _f === void 0 ? void 0 : _f.trim()) || 'Unknown',
                        district: ((_g = row['District']) === null || _g === void 0 ? void 0 : _g.trim()) || 'Unknown',
                        latitude: latitude,
                        longitude: longitude,
                        imageUrl: ((_h = row['Photo of the Weaver']) === null || _h === void 0 ? void 0 : _h.trim()) || '',
                    };
                    weaversMap.set(weaverId, weaver);
                }
            }
            // Convert the map to an array and save all weavers
            const weavers = Array.from(weaversMap.values());
            yield Weaver.insertMany(weavers);
            console.log(`Seeded ${weavers.length} unique weavers`);
            // Create a log of weavers for reference in other seeders
            const logDir = path_1.default.join(process.cwd(), 'logs');
            if (!fs_1.default.existsSync(logDir)) {
                fs_1.default.mkdirSync(logDir);
            }
            const weaversLogPath = path_1.default.join(logDir, 'weavers.json');
            fs_1.default.writeFileSync(weaversLogPath, JSON.stringify(Object.fromEntries(weaversMap), null, 2));
            console.log(`Weavers data saved to ${weaversLogPath}`);
            console.log('Weavers seeding complete');
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
seedWeavers();
