import express from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { authenticateRole } from "../authmiddleware.js";
import qr from "qrcode";
import crypto from "crypto";

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

/**
 * HOD → Approve Outpass
 */
router.post(
  "/outpass/approve/:id",
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
          status: "APPROVED",
        },
      });

      res.status(200).json(outpass);
    } catch (err) {
      console.log(err);
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

/**
 * HOD → Generate OTP for Outpass
 */
router.post(
  "/outpass/otp/:id",
  authenticateRole(["HOD"]),
  async (req, res) => {
    const passid = req.params.id;
    try {
    const checkpassstatus = await prisma.outpassRequest.findUnique({
        where:{
            id:passid,
            status:"APPROVED"
        }
    })
    if(checkpassstatus){
        
      const otp = crypto.randomInt(100000, 999999).toString();

      const outpass = await prisma.outpassRequest.update({
        where: { id: passid, approvedByHodId: req.user.id },
        data: { otp },
      });

      res.status(200).json({ message: "OTP generated", otp });
    }
    else{
        res.status(400).json({message:"rejected"})
    }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate OTP" });
    }
  }
);

/**
 * HOD → Generate QR Code for Outpass
 */
router.get(
  "/outpass/qr/:id",
  authenticateRole(["HOD"]),
  async (req, res) => {
    const passid = req.params.id;
    try {
      const outpass = await prisma.outpassRequest.findUnique({
        where: { id: passid },
        include: { student: { include: { user: true } } },
      });

      if (!outpass) return res.status(404).json({ error: "Outpass not found" });

      const qrData = {
        passId: outpass.id,
        student: outpass.student.user.email,
        status: outpass.status,
        otp: outpass.otp || "N/A",
      };

      const qrCode = await qr.toDataURL(JSON.stringify(qrData));

      res.status(200).json({ qrCode });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate QR" });
    }
  }
);

export default router;
