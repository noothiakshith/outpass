-- CreateTable
CREATE TABLE "public"."AllowedStudentEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "AllowedStudentEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedStudentEmail_email_key" ON "public"."AllowedStudentEmail"("email");
