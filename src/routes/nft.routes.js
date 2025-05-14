"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/nft.routes.ts
const express_1 = require("express");
const nft_controller_1 = require("../controllers/nft.controller");
const router = (0, express_1.Router)();
// Endpoint to mint the NFT
router.post('/mint', nft_controller_1.mintNFTForUser);
router.post('/batch-register-qr-codes', nft_controller_1.batchRegisterQRCodes);
router.get('/check-qr-registration', nft_controller_1.checkQRCodeRegistrationStatus);
exports.default = router;
