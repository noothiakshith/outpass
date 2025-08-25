import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authenticateRole } from "./authmiddleware.js";
import authRoutes from './authroutes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/auth',authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});