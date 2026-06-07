import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { sendEmail } from '../../lib/mailer';

// Login with password then generate OTP
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.password) return res.status(400).json({ message: 'Password not set' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { loginOtpCode: otp, loginOtpExpiry: otpExpiry },
  });

  await sendEmail(
    user.email,
    'Your StoreVerse login OTP',
    `Your one-time password (OTP) is: ${otp}\n\nIt expires in 5 minutes. If you did not request this, you can ignore this email.`
  );

  res.json({ message: 'OTP sent to email' });
};
