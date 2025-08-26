import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from './authroutes.js';
import studentRoutes from './src/studentroutes.js';
import teacheroutes from './src/classteacher.js';
import hodroutes from './src/hodroutes.js';
import securityroutes from './src/security.js';
import { checkAndExpireOutpasses } from './src/utils/outpassUtils.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacheroutes);
app.use('/hod', hodroutes);
app.use('/security',securityroutes)
// Auto-expiry check every 30 minutes
setInterval(async () => {
  try {
    console.log("Running automatic outpass expiry check...");
    await checkAndExpireOutpasses();
  } catch (error) {
    console.error("Error in automatic expiry check:", error);
  }
}, 30 * 60 * 1000); // 30 minutes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Automatic outpass expiry check enabled (every 30 minutes)");
});