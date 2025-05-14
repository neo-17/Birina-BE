import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import gamosaRouter from './routes/gamosa.routes';
import nftRouter from './routes/nft.routes';
import userRouter from './routes/user.routes';
import userProfileRouter from './routes/userProfile.routes';
import adminRouter from './routes/admin.routes';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000;

// Database Connection
connectDB();

// Middleware
// Allow requests from your frontend URL
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});
app.use('/api/gamosas', gamosaRouter);
app.use('/api/nft', nftRouter);
app.use('/api/users', userRouter);
app.use('/api/users', userProfileRouter);
app.use('/api/admin', adminRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
