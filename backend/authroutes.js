// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();
const router = express.Router();


const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollNo: z.string().min(1, "Roll number is required")
});

// POST /signup
router.post("/signup", async (req, res) => {
  try {

    const { name, email, password, rollNo } = signupSchema.parse(req.body);
    const allowed = await prisma.allowedStudentEmail.findUnique({
      where: { email }
    });

    if (!allowed) {
      return res.status(400).json({ error: "This email is not allowed to register" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT"
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
