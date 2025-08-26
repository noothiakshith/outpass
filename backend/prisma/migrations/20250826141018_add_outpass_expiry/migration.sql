-- AlterEnum
ALTER TYPE "public"."OutpassStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "public"."OutpassRequest" ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "outpassDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
