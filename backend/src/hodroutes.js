import express from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { authenticateRole } from "../authmiddleware.js";

import QRCode from "qrcode";
import crypto from "crypto";  // also needed for OTP

const prisma = new PrismaClient();

/**
 * HOD → Get all assigned outpasses
 */
router.get(
  "/outpass/assigned",
  authenticateRole(["HOD"]),
  async (req, res) => {
    try {
      const teacher = await prisma.hODProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!teacher)
        return res.status(404).json({ error: "HOD not found" });

      const outpasses = await prisma.outpassRequest.findMany({
        where: { approvedByHodId: req.user.id },
        include: {
          student: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ outpasses });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);


router.post(
    "/outpass/approve/:id",
    authenticateRole(["HOD"]),
    async (req, res) => {
      const passid = req.params.id;
      try {
        // Verify HOD profile exists
        const hod = await prisma.hODProfile.findUnique({
          where: { userId: req.user.id },
        });
        if (!hod) return res.status(404).json({ error: "HOD not found" });

        // Fetch the outpass first to validate it's in MOVED status
        const outpass = await prisma.outpassRequest.findUnique({
          where: { id: passid },
          include: { student: { include: { user: true } } },
        });
  
        if (!outpass) return res.status(404).json({ error: "Outpass not found" });
        if (outpass.status !== "MOVED") 
          return res.status(400).json({ error: "Outpass must be moved by teacher first" });
        if (outpass.approvedByHodId !== req.user.id)
          return res.status(403).json({ error: "Not assigned to this HOD" });
  
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        
        // Set OTP expiry to 5 hours from now
        const otpExpiresAt = new Date();
        otpExpiresAt.setHours(otpExpiresAt.getHours() + 5);
  
        // QR payload
        const qrPayload = {
          outpassId: outpass.id,
          otp,
          studentName: outpass.student.user.name,
          rollNo: outpass.student.rollNo,
          department: outpass.student.department,
          branch: outpass.student.branch,
          approvedByTeacher: outpass.approvedByTeacherId,
          approvedByHod: req.user.id,
          otpExpiresAt: otpExpiresAt.toISOString(),
        };
  
        // Generate QR code
        const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));
  
        // Update outpass with approval, OTP, and QR code
        const updated = await prisma.outpassRequest.update({
          where: { id: passid },
          data: {
            status: "APPROVED",
            approvedByHodId: req.user.id,
            otp,
            otpExpiresAt,
            qrCode,
          },
          include: { student: { include: { user: true } } },
        });
  
        res.status(200).json({
          message: "Outpass approved by HOD, OTP + QR generated",
          outpass: updated,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
  
/**
 * HOD → Reject Outpass
 */
router.post(
  "/outpass/reject/:id",
  authenticateRole(["HOD"]),
  async (req, res) => {
    const passid = req.params.id;
    try {
      const hod = await prisma.hODProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!hod) return res.status(404).json({ error: "HOD not found" });

      const outpass = await prisma.outpassRequest.update({
        where: {
          id: passid,
          approvedByHodId: req.user.id,
        },
        data: {
          status: "REJECTED",
        },
      });

      res.status(200).json(outpass);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


export default router;
