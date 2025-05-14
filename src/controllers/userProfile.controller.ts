// src/controllers/userProfile.controller.ts
import User from '../models/user.model';
import Product from '../models/gamosaProduct.model';
import { generatePrivateKeyUser } from '../libs/biconomy';
import transactionModel from '../models/transaction.model';

export const getUserProfile = async (req: any, res: any) => {
  try {
    const { username } = req.params;

    // Example: find user by username
    // and populate each "claims.product" so we can see product info
    const user = await User.findOne({ username }).populate({
      path: 'claims.product',
      model: Product,
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// export const updateUserPin = async (req: any, res: any) => {
//   try {
//     const { username } = req.params; // e.g. /api/users/:username/pin
//     const { oldPin, newPin } = req.body;

//     // 1. Find user
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // 2. Re-derive the old private key to confirm correctness
//     // user.salt is how we combine (username + oldPin + salt)
//     const oldDerivedKey = crypto
//       .createHash('sha256')
//       .update(username + oldPin + user.salt)
//       .digest('hex');
//     // If you want extra checks, you can do something with the oldDerivedKey,
//     // e.g. compare addresses or store a hashed version. 
//     // For an MVP, let's just assume if the user has the correct oldPin, it's valid.

//     // 3. Generate a new salt
//     const newSalt = crypto.randomBytes(16).toString('hex');

//     // 4. Optionally re-derive or not. But the point is that the user
//     //    will have a new salt, so they have a new "private key" if you do a full re-derive.
//     //    For an MVP, you can just set user.salt = newSalt.
//     user.salt = newSalt;
//     await user.save();

//     return res.status(200).json({ message: 'PIN updated successfully' });
//   } catch (error) {
//     console.error('Error in updateUserPin:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

/**
 * This is an MVP method to reveal the user's private key by re-deriving from (username + pin + salt).
 * In production, you typically do NOT allow users to just reveal private keys from server side.
 */
export const revealUserPrivateKey = async (req: any, res: any) => {
  try {
    const { username, pin } = req.body;

    // 1. Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Re-derive private key from (username + pin + user.salt)
    const privateKey = generatePrivateKeyUser(username, pin);

    // 3. Return to user (MVP). In real life, you wouldn't do this in plaintext
    return res.status(200).json({ privateKey });
  } catch (error) {
    console.error('Error in revealUserPrivateKey:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};