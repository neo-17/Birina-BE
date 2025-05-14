// src/routes/nft.routes.ts
import { Router } from 'express';
import { batchRegisterQRCodes, checkQRCodeRegistrationStatus, mintNFTForUser } from '../controllers/nft.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint to mint the NFT
router.post('/mint', mintNFTForUser);
router.post('/batch-register-qr-codes', batchRegisterQRCodes);
router.get('/check-qr-registration', checkQRCodeRegistrationStatus);

export default router;
