import adminModel from "../models/admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// src/controllers/admin.controller.ts
export const registerAdmin = async (req: any, res: any) => {
    try {
      const { email, username, pin } = req.body;
  
      // Check if any admin already exists
      const adminCount = await adminModel.countDocuments();

      if (adminCount > 0) {
        return res
          .status(403)
          .json({ message: 'Admin registration is disabled after initial setup' });
      }
  
      // Proceed with admin registration
      const existingAdmin = await adminModel.findOne({ $or: [{ email }, { username }] });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
  
      const salt = await bcrypt.genSalt();
      const hashedPin = await bcrypt.hash(pin, salt);
  
      const newAdmin = new adminModel({ email, username, hashedPin, salt });
      await newAdmin.save();
  
      return res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      console.error('Error registering admin:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  export const loginAdmin = async (req: any, res: any) => {
    const { username, email, pin } = req.body;
  
    if (!username && !email) {
      return res.status(400).json({ message: 'Email or username is required' });
    }
    if (!pin) {
      return res.status(400).json({ message: 'PIN is required' });
    }
  
    try {
      // Find admin by email or username
      const admin = await adminModel.findOne({ $or: [{ email }, { username }] });

      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Verify PIN
      const isPinValid = await bcrypt.compare(pin, admin.hashedPin);
      if (!isPinValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, username: admin.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      // Send response with token
      res.status(200).json({
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error('Error logging in admin:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
// src/controllers/admin.controller.ts
export const addAdmin = async (req: any, res: any) => {
    try {
      const { email, username, pin } = req.body;
  
      const existingAdmin = await adminModel.findOne({ $or: [{ email }, { username }] });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
  
      const salt = await bcrypt.genSalt();
      const hashedPin = await bcrypt.hash(pin, salt);
  
      const newAdmin = new adminModel({ email, username, hashedPin, salt });
      await newAdmin.save();
  
      return res.status(201).json({ message: 'Admin added successfully' });
    } catch (error) {
      console.error('Error adding admin:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const removeAdmin = async (req: any, res: any) => {
    try {
      const { adminId } = req.params;
  
      // Prevent self-deletion
      if (req.admin.id === adminId) {
        return res.status(400).json({ message: 'You cannot remove yourself' });
      }
  
      const admin = await adminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      await adminModel.findByIdAndDelete(adminId);
      return res.status(200).json({ message: 'Admin removed successfully' });
    } catch (error) {
      console.error('Error removing admin:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
export const getAdmins = async (req: any, res: any) => {
    try {
      const admins = await adminModel.find();
      return res.status(200).json(admins);
    } catch (error) {
      console.error('Error getting admins:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

export const deployNFT = async (req: any, res: any) => {
  try {
    
  } catch (error) {
    throw error
  }
}