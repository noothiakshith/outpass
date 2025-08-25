-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'CLASS_TEACHER', 'HOD', 'SECURITY', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."OutpassType" AS ENUM ('CASUAL', 'EMERGENCY', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."OutpassStatus" AS ENUM ('PENDING_TEACHER', 'PENDING_HOD', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXITED', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rollNumber" TEXT,
    "phoneNumber" TEXT,
    "parentPhoneNumber" TEXT,
    "role" "public"."Role" NOT NULL,
    "isHosteler" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" TEXT,
    "classSectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hodId" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "classTeacherId" TEXT NOT NULL,

    CONSTRAINT "ClassSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Outpass" (
    "id" TEXT NOT NULL,
    "type" "public"."OutpassType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."OutpassStatus" NOT NULL DEFAULT 'PENDING_TEACHER',
    "fromDateTime" TIMESTAMP(3) NOT NULL,
    "toDateTime" TIMESTAMP(3) NOT NULL,
    "qrCode" TEXT,
    "otp" TEXT,
    "rejectionReason" TEXT,
    "exitedAt" TIMESTAMP(3),
    "reEnteredAt" TIMESTAMP(3),
    "requestedById" TEXT NOT NULL,
    "approvedByTeacherId" TEXT,
    "approvedByHODId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outpass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroupOutpassMember" (
    "id" TEXT NOT NULL,
    "outpassId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "GroupOutpassMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Block" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "blockedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IncidentReport" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outpassId" TEXT NOT NULL,
    "studentInvolvedId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "details" JSONB,
    "actorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rollNumber_key" ON "public"."User"("rollNumber");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "public"."User"("departmentId");

-- CreateIndex
CREATE INDEX "User_classSectionId_idx" ON "public"."User"("classSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "public"."Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_hodId_key" ON "public"."Department"("hodId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSection_classTeacherId_key" ON "public"."ClassSection"("classTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSection_name_departmentId_key" ON "public"."ClassSection"("name", "departmentId");

-- CreateIndex
CREATE INDEX "Outpass_requestedById_idx" ON "public"."Outpass"("requestedById");

-- CreateIndex
CREATE INDEX "Outpass_status_idx" ON "public"."Outpass"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GroupOutpassMember_outpassId_studentId_key" ON "public"."GroupOutpassMember"("outpassId", "studentId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "public"."AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_targetId_targetType_idx" ON "public"."AuditLog"("targetId", "targetType");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "public"."ClassSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassSection" ADD CONSTRAINT "ClassSection_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassSection" ADD CONSTRAINT "ClassSection_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outpass" ADD CONSTRAINT "Outpass_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outpass" ADD CONSTRAINT "Outpass_approvedByTeacherId_fkey" FOREIGN KEY ("approvedByTeacherId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outpass" ADD CONSTRAINT "Outpass_approvedByHODId_fkey" FOREIGN KEY ("approvedByHODId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupOutpassMember" ADD CONSTRAINT "GroupOutpassMember_outpassId_fkey" FOREIGN KEY ("outpassId") REFERENCES "public"."Outpass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupOutpassMember" ADD CONSTRAINT "GroupOutpassMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IncidentReport" ADD CONSTRAINT "IncidentReport_outpassId_fkey" FOREIGN KEY ("outpassId") REFERENCES "public"."Outpass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IncidentReport" ADD CONSTRAINT "IncidentReport_studentInvolvedId_fkey" FOREIGN KEY ("studentInvolvedId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IncidentReport" ADD CONSTRAINT "IncidentReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateNote" ADD CONSTRAINT "PrivateNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateNote" ADD CONSTRAINT "PrivateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
