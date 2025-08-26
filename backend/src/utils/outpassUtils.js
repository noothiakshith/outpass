import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Check and auto-expire outpasses based on time limits
 */
export const checkAndExpireOutpasses = async () => {
  const now = new Date();
  
  try {
    // Expire outpasses where OTP has expired (5 hours)
    const expiredByOTP = await prisma.outpassRequest.updateMany({
      where: {
        status: "APPROVED",
        otpExpiresAt: {
          lt: now
        }
      },
      data: {
        status: "EXPIRED"
      }
    });

    // Expire outpasses where overall validity has expired (end of day)
    const expiredByDate = await prisma.outpassRequest.updateMany({
      where: {
        status: {
          in: ["APPROVED", "EXITED"]
        },
        validUntil: {
          lt: now
        }
      },
      data: {
        status: "EXPIRED"
      }
    });

    console.log(`Auto-expired ${expiredByOTP.count} outpasses due to OTP expiry`);
    console.log(`Auto-expired ${expiredByDate.count} outpasses due to date expiry`);
    
    return {
      expiredByOTP: expiredByOTP.count,
      expiredByDate: expiredByDate.count
    };
  } catch (error) {
    console.error("Error in auto-expiry check:", error);
    throw error;
  }
};

/**
 * Validate if OTP is still valid
 */
export const isOTPValid = (otpExpiresAt) => {
  if (!otpExpiresAt) return false;
  return new Date() < new Date(otpExpiresAt);
};

/**
 * Validate if outpass is still valid for the day
 */
export const isOutpassValid = (validUntil) => {
  if (!validUntil) return false;
  return new Date() < new Date(validUntil);
};

/**
 * Get time remaining for OTP
 */
export const getOTPTimeRemaining = (otpExpiresAt) => {
  if (!otpExpiresAt) return null;
  
  const now = new Date();
  const expiry = new Date(otpExpiresAt);
  const diff = expiry - now;
  
  if (diff <= 0) return "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};