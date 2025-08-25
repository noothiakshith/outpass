/*
  Warnings:

  - The values [PENDING_TEACHER,PENDING_HOD,EXITED,COMPLETED] on the enum `OutpassStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approvedByHODId` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `exitedAt` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `fromDateTime` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `reEnteredAt` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `requestedById` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `toDateTime` on the `Outpass` table. All the data in the column will be lost.
  - You are about to drop the column `classSectionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isHosteler` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `parentPhoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rollNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupOutpassMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivateNote` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `studentId` to the `Outpass` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('MISBEHAVIOR', 'LATE_RETURN', 'FAKE_PASS', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OutpassStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."Outpass" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Outpass" ALTER COLUMN "status" TYPE "public"."OutpassStatus_new" USING ("status"::text::"public"."OutpassStatus_new");
ALTER TYPE "public"."OutpassStatus" RENAME TO "OutpassStatus_old";
ALTER TYPE "public"."OutpassStatus_new" RENAME TO "OutpassStatus";
DROP TYPE "public"."OutpassStatus_old";
ALTER TABLE "public"."Outpass" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Block" DROP CONSTRAINT "Block_blockedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Block" DROP CONSTRAINT "Block_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassSection" DROP CONSTRAINT "ClassSection_classTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassSection" DROP CONSTRAINT "ClassSection_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Department" DROP CONSTRAINT "Department_hodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupOutpassMember" DROP CONSTRAINT "GroupOutpassMember_outpassId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupOutpassMember" DROP CONSTRAINT "GroupOutpassMember_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IncidentReport" DROP CONSTRAINT "IncidentReport_outpassId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IncidentReport" DROP CONSTRAINT "IncidentReport_reportedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."IncidentReport" DROP CONSTRAINT "IncidentReport_studentInvolvedId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Outpass" DROP CONSTRAINT "Outpass_approvedByHODId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Outpass" DROP CONSTRAINT "Outpass_approvedByTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Outpass" DROP CONSTRAINT "Outpass_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrivateNote" DROP CONSTRAINT "PrivateNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrivateNote" DROP CONSTRAINT "PrivateNote_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_classSectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_departmentId_fkey";

-- DropIndex
DROP INDEX "public"."Outpass_requestedById_idx";

-- DropIndex
DROP INDEX "public"."Outpass_status_idx";

-- DropIndex
DROP INDEX "public"."User_classSectionId_idx";

-- DropIndex
DROP INDEX "public"."User_departmentId_idx";

-- DropIndex
DROP INDEX "public"."User_rollNumber_key";

-- AlterTable
ALTER TABLE "public"."Outpass" DROP COLUMN "approvedByHODId",
DROP COLUMN "exitedAt",
DROP COLUMN "fromDateTime",
DROP COLUMN "otp",
DROP COLUMN "reEnteredAt",
DROP COLUMN "rejectionReason",
DROP COLUMN "requestedById",
DROP COLUMN "toDateTime",
ADD COLUMN     "approvedByHodId" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "issuedAt" TIMESTAMP(3),
ADD COLUMN     "studentId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "classSectionId",
DROP COLUMN "departmentId",
DROP COLUMN "isActive",
DROP COLUMN "isHosteler",
DROP COLUMN "parentPhoneNumber",
DROP COLUMN "phoneNumber",
DROP COLUMN "rollNumber";

-- DropTable
DROP TABLE "public"."AuditLog";

-- DropTable
DROP TABLE "public"."Block";

-- DropTable
DROP TABLE "public"."ClassSection";

-- DropTable
DROP TABLE "public"."Department";

-- DropTable
DROP TABLE "public"."GroupOutpassMember";

-- DropTable
DROP TABLE "public"."IncidentReport";

-- DropTable
DROP TABLE "public"."PrivateNote";

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "classTeacherId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassTeacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClassTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HOD" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HOD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Security" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "type" "public"."ReportType" NOT NULL,
    "description" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "securityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNo_key" ON "public"."Student"("rollNo");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_phone_key" ON "public"."Parent"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_studentId_key" ON "public"."Parent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacher_userId_key" ON "public"."ClassTeacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HOD_userId_key" ON "public"."HOD"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Security_userId_key" ON "public"."Security"("userId");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "public"."ClassTeacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassTeacher" ADD CONSTRAINT "ClassTeacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HOD" ADD CONSTRAINT "HOD_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Security" ADD CONSTRAINT "Security_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outpass" ADD CONSTRAINT "Outpass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outpass" ADD CONSTRAINT "Outpass_approvedByTeacherId_fkey" FOREIGN KEY ("approvedByTeacherId") REFERENCES "public"."ClassTeacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outpass" ADD CONSTRAINT "Outpass_approvedByHodId_fkey" FOREIGN KEY ("approvedByHodId") REFERENCES "public"."HOD"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_securityId_fkey" FOREIGN KEY ("securityId") REFERENCES "public"."Security"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
