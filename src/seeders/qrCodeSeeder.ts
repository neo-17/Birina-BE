import mongoose, { Document, Schema } from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Define TypeScript interfaces for our data structures
interface QRCode extends Document {
  code: string;
  claimed: boolean;
  claimedBy: string | null;
  claimedNFTUrl: string | null;
  mintedTokenId: string | null;
  gamosaId: string;
}

// Define the schema
const QRCodeSchema = new Schema<QRCode>({
  code: { type: String, required: true, unique: true },
  claimed: { type: Boolean, default: false },
  claimedBy: { type: String, default: null },
  claimedNFTUrl: { type: String, default: null },
  mintedTokenId: { type: String, default: null },
  gamosaId: { type: String, required: true, ref: 'GamosaProduct' },
});

// Create the model
const QRCode = mongoose.model<QRCode>('QRCode', QRCodeSchema);

const mongoUrl: string = 'mongodb+srv://codesshyam:CrOBpfd63tEsv9gp@cluster0.z2npy82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Read the data from CSV
interface CSVRow {
  [key: string]: string;
}

async function seedQRCodes(): Promise<void> {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing data if needed
    await QRCode.deleteMany({});
    console.log('Cleared existing QRCode data');

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
    const qrCodesData: QRCode[] = [];
    const qrCodesLog: Record<string, any> = {};

    for (const row of data) {
      const gamosaId = row['Gamusa ID']?.trim();
      
      if (!gamosaId) {
        console.log(`Skipping row with missing Gamosa ID`);
        continue;
      }

      // Generate a QR code for this gamosa
      const qrCode = {
        code: uuidv4(),
        claimed: false,
        claimedBy: null,
        claimedNFTUrl: null,
        mintedTokenId: null,
        gamosaId: gamosaId
      };
      
      qrCodesData.push(qrCode as any);
      qrCodesLog[gamosaId] = qrCode.code;
    }

    // Save all QR codes
    await QRCode.insertMany(qrCodesData);
    console.log(`Seeded ${qrCodesData.length} QR codes`);
    
    // Write QR codes to log file for reference
    const qrCodesLogPath: string = path.join(logDir, 'qr_codes.json');
    fs.writeFileSync(qrCodesLogPath, JSON.stringify(qrCodesLog, null, 2));
    console.log(`QR codes saved to ${qrCodesLogPath}`);

    console.log('QR Codes seeding complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Missing import for papaparse
import papa from 'papaparse';

// Run the script
seedQRCodes();