/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AllowedStudentEmail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HOD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Outpass` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Parent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Security` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('STUDENT', 'TEACHER', 'HOD', 'ADMIN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OutpassStatus" ADD VALUE 'EXITED';
ALTER TYPE "public"."OutpassStatus" ADD VALUE 'REENTERED';

-- DropForeignKey
ALTER TABLE "public"."ClassTeacher" DROP CONSTRAINT "ClassTeacher_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HOD" DROP CONSTRAINT "HOD_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Outpass" DROP CONSTRAINT "Outpass_approvedByHodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Outpass" DROP CONSTRAINT "Outpass_approvedByTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Outpass" DROP CONSTRAINT "Outpass_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Parent" DROP CONSTRAINT "Parent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_securityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Security" DROP CONSTRAINT "Security_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_classTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "branch" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "rollNumber" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL;

-- DropTable
DROP TABLE "public"."AllowedStudentEmail";

-- DropTable
DROP TABLE "public"."ClassTeacher";

-- DropTable
DROP TABLE "public"."HOD";

-- DropTable
DROP TABLE "public"."Outpass";

-- DropTable
DROP TABLE "public"."Parent";

-- DropTable
DROP TABLE "public"."Report";

-- DropTable
DROP TABLE "public"."Security";

-- DropTable
DROP TABLE "public"."Student";

-- DropEnum
DROP TYPE "public"."ReportType";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classTeacherId" TEXT,
    "hodId" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HODProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "HODProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OutpassRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "public"."OutpassType" NOT NULL,
    "status" "public"."OutpassStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedByTeacherId" TEXT,
    "approvedByHodId" TEXT,
    "qrCode" TEXT,
    "otp" TEXT,
    "validUntil" TIMESTAMP(3),
    "exitMarkedById" TEXT,
    "reentryMarkedById" TEXT,

    CONSTRAINT "OutpassRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Note" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IncidentReport" (
    "id" TEXT NOT NULL,
    "outpassId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_OutpassGroupMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OutpassGroupMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "public"."StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "public"."TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HODProfile_userId_key" ON "public"."HODProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "public"."AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "_OutpassGroupMembers_B_index" ON "public"."_OutpassGroupMembers"("B");

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "public"."TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "public"."HODProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HODProfile" ADD CONSTRAINT "HODProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutpassRequest" ADD CONSTRAINT "OutpassRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutpassRequest" ADD CONSTRAINT "OutpassRequest_approvedByTeacherId_fkey" FOREIGN KEY ("approvedByTeacherId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutpassRequest" ADD CONSTRAINT "OutpassRequest_approvedByHodId_fkey" FOREIGN KEY ("approvedByHodId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutpassRequest" ADD CONSTRAINT "OutpassRequest_exitMarkedById_fkey" FOREIGN KEY ("exitMarkedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutpassRequest" ADD CONSTRAINT "OutpassRequest_reentryMarkedById_fkey" FOREIGN KEY ("reentryMarkedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IncidentReport" ADD CONSTRAINT "IncidentReport_outpassId_fkey" FOREIGN KEY ("outpassId") REFERENCES "public"."OutpassRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IncidentReport" ADD CONSTRAINT "IncidentReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OutpassGroupMembers" ADD CONSTRAINT "_OutpassGroupMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."OutpassRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OutpassGroupMembers" ADD CONSTRAINT "_OutpassGroupMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
