// @ts-nocheck
import express from "express"
const router = express.Router()
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { authenticateRole } from "../authmiddleware.js";
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

router.post('/outpass/approve/:id', authenticateRole(["TEACHER"]), async (req, res, next) => {
  const teacherid = req.user.id;
  const passid = req.params.id;
  try {
    const outpass = await prisma.outpassRequest.update({
      where: {
        id: passid,
        approvedByTeacherId: teacherid
      },
      data: {
        status: "MOVED"
      }
    })
    console.log(outpass);
    res.status(200).json(outpass);
  }
  catch (err) {
    console.log(err);
  }
})

router.post('/outpass/reject/:id', authenticateRole(["TEACHER"]), async (req, res, next) => {
  const teacherid = req.user.id;
  const passid = req.params.id;
  try {
    const outpass = await prisma.outpassRequest.update({
      where: {
        id: passid,
        approvedByTeacherId: teacherid
      },
      data: {
        status: "REJECTED"
      }
    })
    console.log(outpass);
    res.status(200).json(outpass);
  }
  catch (err) {
    console.log(err);
  }
})

router.post(
  "/note/:studentId",
  authenticateRole(["TEACHER"]),
  async (req, res) => {
    const studentId = req.params.studentId;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Note content is required" });
    }

    try {
      // Get teacher profile
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher profile not found" });
      }

      // Check student exists
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Create note
      const newNote = await prisma.note.create({
        data: {
          teacherId: teacher.id,
          studentId: student.id,
          content,
          private: true,
        },
      });

      res.status(201).json({ message: "Note added", note: newNote });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router