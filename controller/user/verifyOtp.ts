import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Simple OTP verification – returns a success message only
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // Find user and OTP fields
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, loginOtpCode: true, loginOtpExpiry: true },
  });

  if (!user || !user.loginOtpCode) {
    return res.status(400).json({ message: 'OTP not generated' });
  }

  // Expiry check
  if (user.loginOtpExpiry && new Date() > user.loginOtpExpiry) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  // Validate OTP value
  if (user.loginOtpCode !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  // Clear OTP after successful verification
  await prisma.user.update({
    where: { id: user.id },
    data: { loginOtpCode: null, loginOtpExpiry: null },
  });

  return res.json({ message: 'OTP verified successfully' });
};
