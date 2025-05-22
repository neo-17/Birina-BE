import mongoose, { Document, Schema } from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Define TypeScript interfaces for our data structures
interface QRCode {
  code: string;
  claimed: boolean;
  claimedBy: string | null;
  claimedNFTUrl: string | null;
  mintedTokenId: string | null;
}

interface GamosaProduct extends Document {
  gamosaId: string;
  weaverName: string;
  gamosaType: string;
  gamosaSize: string;
  village: string;
  subdivision: string;
  district: string;
  latitude: string;
  longitude: string;
  wentIntoTheLoom: string;
  weaverImageUrl: string;
  ipfsUrl?: string;
  qrCodes: QRCode[];
  contractAddress?: string;
}

interface CSVRow {
  [key: string]: string;
}

// Define the schemas
const QRCodeSchema = new Schema<QRCode>({
  code: { type: String, required: true },
  claimed: { type: Boolean, default: false },
  claimedBy: { type: String, default: null },
  claimedNFTUrl: { type: String, default: null },
  mintedTokenId: { type: String, default: null },
});

const GamosaProductSchema = new Schema<GamosaProduct>({
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
const GamosaProduct = mongoose.model<GamosaProduct>('GamosaProduct', GamosaProductSchema);

const mongoUrl: string = 'mongodb+srv://codesshyam:YeBxawqoO0ES80co@cluster0.aulmwma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Generate QR code function
function generateQRCode(): QRCode {
  return {
    code: uuidv4(),
    claimed: false,
    claimedBy: null,
    claimedNFTUrl: null,
    mintedTokenId: null
  };
}

interface QRCodeLog {
  [gamosaId: string]: string;
}

async function populateGamosaProducts(): Promise<void> {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing data if needed
    await GamosaProduct.deleteMany({});
    console.log('Cleared existing GamosaProduct data');

    const csvPath: string = path.join(process.cwd(), 'data', 'GBBC-Birina-Project.csv');
    const csvData: string = fs.readFileSync(csvPath, 'utf8');
    const { data } = papa.parse<CSVRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    console.log(`Parsed ${data.length} rows from CSV`);
    
    // Create a log directory if it doesn't exist
    const logDir: string = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    // Create a log file for QR codes
    const qrLogPath: string = path.join(logDir, 'qr_codes.json');
    const qrCodes: QRCodeLog = {};

    for (const row of data) {
      const weaverName = row['Name of the Weaver']?.trim();
      const gamosaId = row['Gamusa ID']?.trim();
      
      if (!weaverName || !gamosaId) {
        console.log(`Skipping row with missing data: Weaver=${weaverName}, Gamosa ID=${gamosaId}`);
        continue;
      }

      // Process the loom date
      let loomDateString: string = '';
      const loomRaw = row['Went into the Loom']?.trim();
      if (loomRaw) {
        const match = loomRaw.match(/(\d+)(st|nd|rd|th)\s+(\w+)\s+(\d+)/);
        if (match) {
          const [, day, , month, year] = match;
          const loomDate = new Date(`${month} ${day}, ${year}`);
          loomDateString = loomDate.toISOString();
        } else {
          loomDateString = new Date().toISOString(); // Use current date if format doesn't match
        }
      } else {
        loomDateString = new Date().toISOString(); // Use current date if missing
      }

      // Process coordinates
      const coordsText = row['Lat. Long'] || '';
      const coords = coordsText.split(',').map((c: string) => parseFloat(c.trim()));
      const latitude = coords?.[0]?.toString() || '0';
      const longitude = coords?.[1]?.toString() || '0';

      // Generate a single QR code for this gamosa
      const qrCode = generateQRCode();
      
      // Store the QR code in our log
      qrCodes[gamosaId] = qrCode.code;

      // Create the GamosaProduct
      const gamosaProduct = new GamosaProduct({
        gamosaId: gamosaId,
        weaverName: weaverName,
        gamosaType: row['Gamosa Type']?.trim() || 'Standard',
        gamosaSize: row['Gamosa Size']?.trim() || 'Standard Size',
        village: row['Village']?.trim() || 'Unknown',
        subdivision: row['Sub-Division']?.trim() || 'Unknown',
        district: row['District']?.trim() || 'Unknown',
        latitude: latitude,
        longitude: longitude,
        wentIntoTheLoom: loomDateString,
        weaverImageUrl: row['Photo of the Weaver']?.trim() || '',
        ipfsUrl: '',  // Empty as requested
        qrCodes: [qrCode],
        contractAddress: '',  // Empty as requested
      });

      await gamosaProduct.save();
      console.log(`Created GamosaProduct: ${gamosaId} with QR code`);
    }

    // Write QR codes to log file
    fs.writeFileSync(qrLogPath, JSON.stringify(qrCodes, null, 2));
    console.log(`QR codes saved to ${qrLogPath}`);

    console.log('GamosaProduct population complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateGamosaProducts();