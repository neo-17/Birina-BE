// models/Weaver.ts
import mongoose from 'mongoose';

const weaverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo_url: { type: String },
  village: { type: String, required: true },
  sub_division: { type: String, required: true },
  district: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export default mongoose.model('Weaver', weaverSchema);
