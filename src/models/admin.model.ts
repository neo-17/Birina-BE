// src/models/admin.model.ts
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  hashedPin: { type: String, required: true },
  salt: { type: String, required: true },
});

export default mongoose.model('Admin', adminSchema);
