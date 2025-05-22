"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gamosa_controller_1 = require("../controllers/gamosa.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Create a product
router.post('/', auth_middleware_1.authenticateAdmin, gamosa_controller_1.createGamosa);
// Get all products
router.get('/', auth_middleware_1.authenticateAdmin, gamosa_controller_1.getAllGamosas);
// Get a single product by ID
router.get('/:id', auth_middleware_1.authenticateAdmin, gamosa_controller_1.getGamosaById);
// Update a product by ID
router.put('/:id', auth_middleware_1.authenticateAdmin, gamosa_controller_1.updateGamosa);
// Delete a product by ID
router.delete('/:id', auth_middleware_1.authenticateAdmin, gamosa_controller_1.deleteGamosa);
// deploy NFT contract
router.post('/:id/deployContract', auth_middleware_1.authenticateAdmin, gamosa_controller_1.deployNftForGamosa);
router.post('/:id/generate-qr', auth_middleware_1.authenticateAdmin, gamosa_controller_1.generateGamosaQRCodes);
router.get('/qr-image/:code', gamosa_controller_1.getQRCodeImage);
router.get('/qr/:code', gamosa_controller_1.getGamosaByQRCode);
router.get('/qr/:gamosaId', gamosa_controller_1.getQRDetails);
router.get('/zip', gamosa_controller_1.generateQRCodeZipFile);
exports.default = router;
