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
exports.uploadNftImageToIpfs = uploadNftImageToIpfs;
const jimp_1 = __importDefault(require("jimp"));
const path_1 = __importDefault(require("path"));
const buffer_1 = require("buffer");
const pinata_1 = require("../libs/pinata");
const buffer_2 = require("buffer");
// Define configurations for each template
const TEMPLATE_CONFIGS = {
    'gamosa': [
        {
            fileName: 'BIRINA_NFT.jpeg',
            username: {
                x: 750, // Center horizontally (1500 / 2)
                y: 1440 // Near the bottom (20px padding from the bottom of the 1500px image)
            },
            tokenId: {
                x: 750, // Center horizontally (1500 / 2)
                y: 1400 // Just above the username with 40px space
            },
        }
    ]
};
function getRandomTemplate(productType) {
    const templates = TEMPLATE_CONFIGS['gamosa'];
    if (!templates) {
        throw new Error(`No templates found for product type: ${productType}`);
    }
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
}
function uploadNftImageToIpfs(username, type, tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get random template configuration based on product type
            const template = getRandomTemplate('gamosa');
            console.log('template', template);
            const templatePath = path_1.default.join(process.cwd(), 'public', template.fileName);
            console.log('templatePath', templatePath);
            // Load the template image
            const image = yield jimp_1.default.read(templatePath);
            console.log('image', image);
            // Load fonts
            const font = yield jimp_1.default.loadFont(jimp_1.default.FONT_SANS_32_BLACK);
            // Add username
            image.print(font, template.username.x, template.username.y, username);
            // Add token ID
            image.print(font, template.tokenId.x, template.tokenId.y, `#${tokenId}`);
            // Convert image to buffer
            const imageBuffer = yield image.getBufferAsync(jimp_1.default.MIME_PNG);
            console.log('imageBuffer', imageBuffer);
            const blob = new buffer_2.Blob([imageBuffer], { type: 'image/png' });
            console.log('blob', blob);
            const file = new buffer_1.File([blob], 'gamosa-birina', { type: 'image/png' });
            console.log('file', file);
            const result = yield pinata_1.pinata.upload.file(file);
            console.log('result', result);
            console.log(`Url: https:ipfs.io/ipfs/${result.IpfsHash}`);
            return `https:ipfs.io/ipfs/${result.IpfsHash}`;
        }
        catch (error) {
            console.error('Error generating and uploading NFT image:', error);
            throw new Error('Failed to generate and upload NFT image');
        }
    });
}
