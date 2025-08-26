import express from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { authenticateRole } from "../authmiddleware.js";
import { isOTPValid, isOutpassValid, checkAndExpireOutpasses } from "./utils/outpassUtils.js";

const prisma = new PrismaClient();

/**
 * Security → Verify OTP with expiry validation
 */
router.post("/outpass/verify", authenticateRole(["ADMIN"]), async (req, res) => {
  const { otp } = req.body;

  try {
    if (!otp) return res.status(400).json({ error: "OTP is required" });

    // First run auto-expiry check
    await checkAndExpireOutpasses();

    const outpass = await prisma.outpassRequest.findFirst({
      where: { otp, status: "APPROVED" },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        approvedByTeacher: true,
        approvedByHod: true,
      },
    });

    if (!outpass) {
      return res.status(404).json({ error: "Invalid OTP or outpass not approved/expired" });
    }

    // Check if OTP is still valid (5 hours)
    if (!isOTPValid(outpass.otpExpiresAt)) {
      // Mark as expired
      await prisma.outpassRequest.update({
        where: { id: outpass.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ error: "OTP has expired (valid for 5 hours only)" });
    }

    // Check if outpass is still valid for the day
    if (!isOutpassValid(outpass.validUntil)) {
      await prisma.outpassRequest.update({
        where: { id: outpass.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ error: "Outpass has expired (valid for today only)" });
    }

    // Mark exit
    await prisma.outpassRequest.update({
      where: { id: outpass.id },
      data: { exitMarkedById: req.user.id, status: "EXITED" },
    });

    return res.status(200).json({
      message: "OTP verified successfully - Student can exit",
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
      validUntil: outpass.validUntil,
      otpExpiresAt: outpass.otpExpiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

/**
 * Security → Manual expiry check (for admin/cron)
 */
router.post("/outpass/check-expiry", authenticateRole(["ADMIN"]), async (req, res) => {
  try {
    const result = await checkAndExpireOutpasses();
    res.status(200).json({
      message: "Expiry check completed",
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Security → Get expired outpasses
 */
router.get("/outpass/expired", authenticateRole(["ADMIN"]), async (req, res) => {
  try {
    const expiredOutpasses = await prisma.outpassRequest.findMany({
      where: { status: "EXPIRED" },
      include: {
        student: {
          include: { user: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ expiredOutpasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});