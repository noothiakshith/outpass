-- CreateTable
CREATE TABLE "public"."allowedStudentEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "allowedStudentEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "allowedStudentEmail_email_key" ON "public"."allowedStudentEmail"("email");
