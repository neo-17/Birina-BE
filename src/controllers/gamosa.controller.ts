import { pinata } from '../libs/pinata';
import Gamosa from '../models/gamosaProduct.model';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode'
import { deployGamosaNFTContract } from '../services/nftDeployment.services';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

// CREATE
export const createGamosa = async (req: any, res: any) => {
  try {
    const {
      symbol,
      type,
      time,
      district,
      subdivision,
      cluster,
      // latitude,
      // longitude,
    } = req.body;

    const newGamosa = new Gamosa({
      symbol,
      type,
      time,
      district,
      subdivision,
      cluster,
      // latitude,
      // longitude,
    });

    const savedGamosa = await newGamosa.save();
    return res.status(201).json(savedGamosa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// READ ALL
export const getAllGamosas = async (req: any, res: any) => {
  try {
    const gamosas = await Gamosa.find();
    return res.status(200).json(gamosas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// READ ONE
export const getGamosaById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const gamosa = await Gamosa.findById(id);
    if (!gamosa) {
      return res.status(404).json({ message: 'Gamosa not found' });
    }
    return res.status(200).json(gamosa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE
export const updateGamosa = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const {
      type,
      time,
      district,
      subdivision,
      cluster,
      // latitude,
      // longitude,
    } = req.body;

    const updatedGamosa = await Gamosa.findByIdAndUpdate(
      id,
      {
        type,
        time,
        district,
        subdivision,
        cluster,
        // latitude,
        // longitude,
      },
      { new: true }
    );

    if (!updatedGamosa) {
      return res.status(404).json({ message: 'Gamosa not found' });
    }

    return res.status(200).json(updatedGamosa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE
export const deleteGamosa = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Gamosa.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Gamosa not found' });
    }
    return res.status(200).json({ message: 'Gamosa deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deployNftForGamosa = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const gamosa = await Gamosa.findById(id);

    if (!gamosa) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // We'll use the product name and "PNFT" as symbol, for example.
    // You might want to store name/symbol in the product model as well.
    const gamosaId = `${gamosa._id}`
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
    
    const uploadToIpfs = await pinata.upload.json(jsonIpfsMetadata);

    const ipfsUrl = `https://ipfs.io/ipfs/${uploadToIpfs.IpfsHash}`;

    // Deploy the contract
    const contractAddress = await deployGamosaNFTContract(
      gamosaId,
      weaverName,
      type,
      symbol,
      village,
      subdivision,
      district,
      latitude,
      longitude,
      wentIntoTheLoom
    );

    // Update the product with the new contract address
    gamosa.contractAddress = contractAddress;
    gamosa.ipfsUrl = ipfsUrl;
    await gamosa.save();

    return res.status(200).json({
      message: 'Gamosa Contract deployed successfully',
      contractAddress,
    });
  } catch (error) {
    console.error('Error deploying contract for product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const generateGamosaQRCodes = async (req: any, res: any) => {
  try {
    const { id, count } = req.params;
    const gamosa = await Gamosa.findById(id);
    if (!gamosa) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const qrCount = count;
    const newCodes = [];
    for (let i = 0; i < qrCount; i++) {
      // You can also generate shorter codes if you like, e.g. substring of uuid
      newCodes.push({
        code: uuidv4(),
        claimed: false,
        claimedBy: null,
        mintedTokenId: null,
      });
    }

    gamosa.qrCodes.push(...newCodes);
    await gamosa.save();

    return res.status(200).json({
      message: `Generated ${qrCount} QR codes`,
      qrCodes: newCodes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQRCodeImage = async (req: any, res: any) => {
  try {
    const { code } = req.params;

    // Here we search which product has that code in its qrCodes array.
    const product = await Gamosa.findOne({ 'qrCodes.code': code });
    if (!product) {
      return res.status(404).send('Invalid QR code');
    }

    // The URL that the QR code points to (User Flow page).
    // For example: https://your-frontend.com/scan?code=XYZ
    // or a shorter route like https://your-frontend.com/p/XYZ
    const url = `${process.env.FE_URL}/p/${code}`;

    // Generate QR as data URL or PNG buffer
    const qrDataUrl = await QRCode.toDataURL(url);

    // Convert base64 dataURL to actual image
    const img = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // Send as PNG
    res.setHeader('Content-Type', 'image/png');
    return res.send(img);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

export const getGamosaByQRCode = async (req: any, res: any) => {
  try {
    const { code } = req.params;

    // Find product that has qrCodes.code == code
    const gamosa = await Gamosa.findOne({ 'qrCodes.code': code });

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQRDetails = async (req: any, res: any) => {
  try {
    const { gamosaId } = req.params;
    const product = await Gamosa.findById(gamosaId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product.qrCodes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const generateQRCodeZipFile = async (req: any, res: any) => {
  try {
    const products = await Gamosa.find();

    if (!products || products.length === 0) {
      return res.status(404).send('No Gamosas found');
    }

    console.log(products.length);
    // Ensure output directory exists
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create a unique ZIP file name using timestamp
    const fileName = `qrcodes_${Date.now()}.zip`;
    const filePath = path.join(outputDir, fileName);
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

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
        const qrDataUrl = await QRCode.toDataURL(url);
        const imgBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const fileEntryName = `${product._id}_${code}.png`;

        archive.append(imgBuffer, { name: fileEntryName });
      }
    }

    await archive.finalize();

    // Respond when the file is written
    output.on('close', () => {
      res.status(200).json({
        message: 'QR code ZIP file generated successfully',
        filePath: filePath,
        size: archive.pointer(), // bytes
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};
