import mongoose, { Document, Schema } from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import papa from 'papaparse';

dotenv.config();

// Define TypeScript interfaces for our data structures
interface Weaver extends Document {
  weaverId: string;
  name: string;
  village: string;
  subdivision: string;
  district: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
}

interface CSVRow {
  [key: string]: string;
}

// Define the schema
const WeaverSchema = new Schema<Weaver>({
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
const Weaver = mongoose.model<Weaver>('Weaver', WeaverSchema);

const mongoUrl: string = 'mongodb+srv://codesshyam:SweYu58XhY34HSkL@cluster0.oepulor.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function seedWeavers(): Promise<void> {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing data if needed
    await Weaver.deleteMany({});
    console.log('Cleared existing Weaver data');

    const csvPath: string = path.join(process.cwd(), 'data', 'GBBC-Birina-Project.csv');
    const csvData: string = fs.readFileSync(csvPath, 'utf8');
    const { data } = papa.parse<CSVRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    console.log(`Parsed ${data.length} rows from CSV`);
    
    // Create a map to track unique weavers
    const weaversMap = new Map<string, Weaver>();

    for (const row of data) {
      const weaverName = row['Name of the Weaver']?.trim();
      
      if (!weaverName) {
        console.log(`Skipping row with missing weaver name`);
        continue;
      }

      // Process coordinates
      const coordsText = row['Lat. Long'] || '';
      const coords = coordsText.split(',').map((c: string) => parseFloat(c.trim()));
      const latitude = coords?.[0]?.toString() || '0';
      const longitude = coords?.[1]?.toString() || '0';

      // Create a unique ID for the weaver (could be based on name and location)
      const weaverId = `W-${weaverName.replace(/\s+/g, '-').toLowerCase()}-${row['Village']?.trim().replace(/\s+/g, '-').toLowerCase() || 'unknown'}`;
      
      // Only add the weaver if we haven't seen them before
      if (!weaversMap.has(weaverId)) {
        const weaver = {
          weaverId: weaverId,
          name: weaverName,
          village: row['Village']?.trim() || 'Unknown',
          subdivision: row['Sub-Division']?.trim() || 'Unknown',
          district: row['District']?.trim() || 'Unknown',
          latitude: latitude,
          longitude: longitude,
          imageUrl: row['Photo of the Weaver']?.trim() || '',
        };
        
        weaversMap.set(weaverId, weaver as any);
      }
    }

    // Convert the map to an array and save all weavers
    const weavers = Array.from(weaversMap.values());
    await Weaver.insertMany(weavers);
    
    console.log(`Seeded ${weavers.length} unique weavers`);
    
    // Create a log of weavers for reference in other seeders
    const logDir: string = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    const weaversLogPath: string = path.join(logDir, 'weavers.json');
    fs.writeFileSync(weaversLogPath, JSON.stringify(Object.fromEntries(weaversMap), null, 2));
    console.log(`Weavers data saved to ${weaversLogPath}`);

    console.log('Weavers seeding complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
seedWeavers();