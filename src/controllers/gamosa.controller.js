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
exports.generateQRCodeZipFile = exports.getQRDetails = exports.getGamosaByQRCode = exports.getQRCodeImage = exports.generateGamosaQRCodes = exports.deployNftForGamosa = exports.deleteGamosa = exports.updateGamosa = exports.getGamosaById = exports.getAllGamosas = exports.createGamosa = void 0;
const pinata_1 = require("../libs/pinata");
const gamosaProduct_model_1 = __importDefault(require("../models/gamosaProduct.model"));
const uuid_1 = require("uuid");
const qrcode_1 = __importDefault(require("qrcode"));
const nftDeployment_services_1 = require("../services/nftDeployment.services");
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// CREATE
const createGamosa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, type, time, district, subdivision, cluster,
        // latitude,
        // longitude,
         } = req.body;
        const newGamosa = new gamosaProduct_model_1.default({
            symbol,
            type,
            time,
            district,
            subdivision,
            cluster,
            // latitude,
            // longitude,
        });
        const savedGamosa = yield newGamosa.save();
        return res.status(201).json(savedGamosa);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createGamosa = createGamosa;
// READ ALL
const getAllGamosas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gamosas = yield gamosaProduct_model_1.default.find();
        return res.status(200).json(gamosas);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAllGamosas = getAllGamosas;
// READ ONE
const getGamosaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const gamosa = yield gamosaProduct_model_1.default.findById(id);
        if (!gamosa) {
            return res.status(404).json({ message: 'Gamosa not found' });
        }
        return res.status(200).json(gamosa);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getGamosaById = getGamosaById;
// UPDATE
const updateGamosa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { type, time, district, subdivision, cluster,
        // latitude,
        // longitude,
         } = req.body;
        const updatedGamosa = yield gamosaProduct_model_1.default.findByIdAndUpdate(id, {
            type,
            time,
            district,
            subdivision,
            cluster,
            // latitude,
            // longitude,
        }, { new: true });
        if (!updatedGamosa) {
            return res.status(404).json({ message: 'Gamosa not found' });
        }
        return res.status(200).json(updatedGamosa);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateGamosa = updateGamosa;
// DELETE
const deleteGamosa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedProduct = yield gamosaProduct_model_1.default.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Gamosa not found' });
        }
        return res.status(200).json({ message: 'Gamosa deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteGamosa = deleteGamosa;
const deployNftForGamosa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const gamosa = yield gamosaProduct_model_1.default.findById(id);
        if (!gamosa) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // We'll use the product name and "PNFT" as symbol, for example.
        // You might want to store name/symbol in the product model as well.
        const gamosaId = `${gamosa._id}`;
        const type = gamosa.gamosaType || 'gNFT';
        const symbol = 'BRN';
        const weaverName = gamosa.weaverName;
        const village = gamosa.village;
        const subdivision = gamosa.subdivision;
        const district = gamosa.district;
        const latitude = gamosa.latitude;
        const longitude = gamosa.longitude;
        const wentIntoTheLoom = gamosa.wentIntoTheLoom;
        const jsonIpfsMetadata = {
            gamosaId,
            type,
            symbol,
            weaverName,
            village,
            subdivision,
            district,
            latitude,
            longitude,
            wentIntoTheLoom
        };
        const uploadToIpfs = yield pinata_1.pinata.upload.json(jsonIpfsMetadata);
        const ipfsUrl = `https://ipfs.io/ipfs/${uploadToIpfs.IpfsHash}`;
        // Deploy the contract
        const contractAddress = yield (0, nftDeployment_services_1.deployGamosaNFTContract)(gamosaId, weaverName, type, symbol, village, subdivision, district, latitude, longitude, wentIntoTheLoom);
        // Update the product with the new contract address
        gamosa.contractAddress = contractAddress;
        gamosa.ipfsUrl = ipfsUrl;
        yield gamosa.save();
        return res.status(200).json({
            message: 'Gamosa Contract deployed successfully',
            contractAddress,
        });
    }
    catch (error) {
        console.error('Error deploying contract for product:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deployNftForGamosa = deployNftForGamosa;
const generateGamosaQRCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, count } = req.params;
        const gamosa = yield gamosaProduct_model_1.default.findById(id);
        if (!gamosa) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const qrCount = count;
        const newCodes = [];
        for (let i = 0; i < qrCount; i++) {
            // You can also generate shorter codes if you like, e.g. substring of uuid
            newCodes.push({
                code: (0, uuid_1.v4)(),
                claimed: false,
                claimedBy: null,
                mintedTokenId: null,
            });
        }
        gamosa.qrCodes.push(...newCodes);
        yield gamosa.save();
        return res.status(200).json({
            message: `Generated ${qrCount} QR codes`,
            qrCodes: newCodes,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.generateGamosaQRCodes = generateGamosaQRCodes;
const getQRCodeImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        // Here we search which product has that code in its qrCodes array.
        const product = yield gamosaProduct_model_1.default.findOne({ 'qrCodes.code': code });
        if (!product) {
            return res.status(404).send('Invalid QR code');
        }
        // The URL that the QR code points to (User Flow page).
        // For example: https://your-frontend.com/scan?code=XYZ
        // or a shorter route like https://your-frontend.com/p/XYZ
        const url = `${process.env.FE_URL}/p/${code}`;
        // Generate QR as data URL or PNG buffer
        const qrDataUrl = yield qrcode_1.default.toDataURL(url);
        // Convert base64 dataURL to actual image
        const img = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        // Send as PNG
        res.setHeader('Content-Type', 'image/png');
        return res.send(img);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});
exports.getQRCodeImage = getQRCodeImage;
const getGamosaByQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        // Find product that has qrCodes.code == code
        const gamosa = yield gamosaProduct_model_1.default.findOne({ 'qrCodes.code': code });
        if (!gamosa) {
            return res.status(404).json({ message: 'Invalid QR code' });
        }
        // We can find the specific QR object
        const qrObj = gamosa.qrCodes.find((qr) => qr.code === code);
        if (!qrObj) {
            return res.status(404).json({ message: 'Invalid QR code' });
        }
        return res.status(200).json({
            gamosa,
            qrCode: qrObj,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getGamosaByQRCode = getGamosaByQRCode;
const getQRDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gamosaId } = req.params;
        const product = yield gamosaProduct_model_1.default.findById(gamosaId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product.qrCodes);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getQRDetails = getQRDetails;
const generateQRCodeZipFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield gamosaProduct_model_1.default.find();
        if (!products || products.length === 0) {
            return res.status(404).send('No Gamosas found');
        }
        console.log(products.length);
        // Ensure output directory exists
        const outputDir = path_1.default.join(__dirname, '../output');
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        // Create a unique ZIP file name using timestamp
        const fileName = `qrcodes_${Date.now()}.zip`;
        const filePath = path_1.default.join(outputDir, fileName);
        const output = fs_1.default.createWriteStream(filePath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        // Handle archive errors
        archive.on('error', (err) => {
            throw err;
        });
        // Pipe archive to file
        archive.pipe(output);
        // Add QR images to the ZIP
        for (const product of products) {
            for (const qr of product.qrCodes) {
                const code = qr.code;
                const url = `${process.env.FE_URL}/p/${code}`;
                const qrDataUrl = yield qrcode_1.default.toDataURL(url);
                const imgBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
                const fileEntryName = `${product._id}_${code}.png`;
                archive.append(imgBuffer, { name: fileEntryName });
            }
        }
        yield archive.finalize();
        // Respond when the file is written
        output.on('close', () => {
            res.status(200).json({
                message: 'QR code ZIP file generated successfully',
                filePath: filePath,
                size: archive.pointer(), // bytes
            });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
exports.generateQRCodeZipFile = generateQRCodeZipFile;
