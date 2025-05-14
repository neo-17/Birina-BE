import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
