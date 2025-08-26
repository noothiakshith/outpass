import express from "express";
import { z } from "zod";
import { authenticateRole } from "../authmiddleware.js";
import { PrismaClient } from "@prisma/client";
import { getOTPTimeRemaining, checkAndExpireOutpasses } from "./utils/outpassUtils.js";

const prisma = new PrismaClient();
const router = express.Router();

// ------------------ Zod Schema ------------------
const outpassSchema = z.object({
  reason: z.string(),
  type: z.enum(["CASUAL", "EMERGENCY"]),
});

// ------------------ Student Creates Outpass ------------------
router.post(
  "/outpass/request",
  authenticateRole(["STUDENT"]),
  async (req, res) => {
    try {
      const { reason, type } = outpassSchema.parse(req.body);
      const userId = req.user.id;

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          classTeacher: { include: { user: true } },
          hod: { include: { user: true } },
        },
      });

      if (!studentProfile)
        return res.status(404).json({ error: "Student profile not found" });

      if (!studentProfile.classTeacher || !studentProfile.hod)
        return res.status(400).json({
          error: "Student does not have a class teacher or HOD assigned",
        });

      // Set outpass date to today only
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999); // End of today

      const outpass = await prisma.outpassRequest.create({
        data: {
          studentId: studentProfile.id,
          reason,
          type,
          status: "PENDING",
          outpassDate: today,
          validUntil: endOfToday, // Outpass expires at end of day
          approvedByTeacherId: studentProfile.classTeacher.user.id,
          approvedByHodId: studentProfile.hod.user.id,
        },
      });

      return res.status(201).json({
        message: "Outpass request created and sent to class teacher & HOD",
        outpass,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ------------------ Student Gets Their Own Outpasses ------------------
router.get(
  "/outpass/mine",
  authenticateRole(["STUDENT"]),
  async (req, res) => {
    try {
      // Run expiry check first
      await checkAndExpireOutpasses();

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!studentProfile)
        return res.status(404).json({ error: "Student profile not found" });

      const outpasses = await prisma.outpassRequest.findMany({
        where: { studentId: studentProfile.id },
        include: {
          approvedByTeacher: { select: { id: true, name: true, email: true } },
          approvedByHod: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Add time remaining info for approved outpasses
      const outpassesWithTimeInfo = outpasses.map(outpass => ({
        ...outpass,
        otpTimeRemaining: outpass.status === "APPROVED" ? getOTPTimeRemaining(outpass.otpExpiresAt) : null,
      }));

      return res.status(200).json({ outpasses: outpassesWithTimeInfo });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/outpass/assigned",
  authenticateRole(["TEACHER"]),
  async (req, res) => {
    try {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!teacher)
        return res.status(404).json({ error: "Teacher not found" });

      const outpasses = await prisma.outpassRequest.findMany({
        where: { approvedByTeacherId: req.user.id },
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


router.get(
    "/outpass/:id",
    authenticateRole(["STUDENT"]),
    async (req, res) => {
      try {
        const outpassId = req.params.id;
        const userId = req.user.id;
  
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId },
        });
  
        if (!studentProfile)
          return res.status(404).json({ error: "Student profile not found" });
  
        const outpass = await prisma.outpassRequest.findFirst({
          where: {
            id: outpassId,
            studentId: studentProfile.id,
          },
          include: {
            student: { include: { user: true } },
            approvedByTeacher: { select: { id: true, name: true, email: true } },
            approvedByHod: { select: { id: true, name: true, email: true } },
          },
        });
  
        if (!outpass)
          return res.status(404).json({ error: "Outpass not found" });
  
        res.status(200).json({ outpass });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  
export default router;
