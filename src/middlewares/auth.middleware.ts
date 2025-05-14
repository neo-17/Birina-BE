// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model';
import User from '../models/user.model';

export const authenticateAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};

export const authenticateUser = async (req: any, res: any, next: any) => {
  // Implement user authentication logic here
  const token = req.headers.authorization?.split(' ')[1];
  console.log('token', token);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  // This middleware is specific to user authentication\
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};