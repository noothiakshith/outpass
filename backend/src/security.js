import express from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { authenticateRole } from "../authmiddleware.js";

const prisma = new PrismaClient();

/**
 * Security → Verify OTP
 */
router.post("/outpass/verify", authenticateRole(["ADMIN"]), async (req, res) => {
  const { otp } = req.body;

  try {
    if (!otp) return res.status(400).json({ error: "OTP is required" });

    const outpass = await prisma.outpassRequest.findFirst({
      where: { otp, status: "APPROVED" },
      include: {
        student: {
          include: {
            user: true, // student.user exists
          },
        },
        approvedByTeacher: true, // this is already User
        approvedByHod: true,     // this is already User
      },
    });

    if (!outpass) {
      return res.status(404).json({ error: "Invalid OTP or not approved yet" });
    }

    // Optionally mark exit
    await prisma.outpassRequest.update({
      where: { id: outpass.id },
      data: { exitMarkedById: req.user.id, status: "EXITED" },
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      student: {
        fullName: outpass.student.user.name,
        rollNumber: outpass.student.user.rollNumber,
        branch: outpass.student.user.branch,
        department: outpass.student.user.department,
      },
      approvedByTeacher: {
        name: outpass.approvedByTeacher.name,
        email: outpass.approvedByTeacher.email,
      },
      approvedByHod: {
        name: outpass.approvedByHod.name,
        email: outpass.approvedByHod.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
