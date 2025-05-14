import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { createSmartAccount, generatePrivateKeyUser, generateUniqueSalt } from '../libs/biconomy';

export const registerUser = async (req: any, res: any) => {
  try {
    const { username, pin } = req.body;

    // 1. Check if user already exists
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      // check if the pin entered is same as for the username
      const genratedSalt = generateUniqueSalt(pin);
      if (genratedSalt !== existingUser.salt) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // user already exists
      const token = jwt.sign(
        { id: existingUser._id, username: existingUser.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      )

      return res.status(200).json({ 
        message: 'User already exists', 
        user: existingUser,
        token,
      });
    }

    // convert the user pin to salt for storage in DB
    const randomSalt = generateUniqueSalt(pin);

    // 2. Generate a private key
    const privateKey = generatePrivateKeyUser(username, pin);

    // 3. Smart account
    const smartAccount = await createSmartAccount(privateKey as string);

    // 4. Create user doc in DB
    const newUser = new User({
      username,
      salt: randomSalt,
      smartAccountAddress: smartAccount,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // 5. Return the user data (without sensitive info)
    return res.status(201).json({
      message: 'User created',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req: any, res: any) => {
    const { username, pin } = req.body;
  
    if (!username) {
      return res.status(400).json({ message: 'username is required' });
    }
    if (!pin) {
      return res.status(400).json({ message: 'PIN is required' });
    }
  
    try {
      // Find admin by email or username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Verify PIN
      const generateSalt = generateUniqueSalt(pin);
      const isPinValid = generateSalt === user.salt;

      if (!isPinValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      // Send response with token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
        },
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };