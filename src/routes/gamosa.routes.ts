import { Router } from 'express';
import { createGamosa, deleteGamosa, getAllGamosas, getGamosaById, updateGamosa, deployNftForGamosa, generateGamosaQRCodes, getQRCodeImage, getGamosaByQRCode, getQRDetails } from '../controllers/gamosa.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Create a product
router.post('/', authenticateAdmin, createGamosa);

// Get all products
router.get('/', authenticateAdmin, getAllGamosas);

// Get a single product by ID
router.get('/:id', authenticateAdmin, getGamosaById);

// Update a product by ID
router.put('/:id', authenticateAdmin, updateGamosa);

// Delete a product by ID
router.delete('/:id', authenticateAdmin, deleteGamosa);

// deploy NFT contract
router.post('/:id/deployContract', authenticateAdmin, deployNftForGamosa);

router.post('/:id/generate-qr', authenticateAdmin, generateGamosaQRCodes);

router.get('/qr-image/:code', getQRCodeImage);

router.get('/qr/:code', getGamosaByQRCode);

router.get('/qr/:gamosaId', getQRDetails);

export default router;
