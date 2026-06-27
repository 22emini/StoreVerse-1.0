import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import crypto from "crypto";
import { sendEmail } from '../../lib/mailer';
import bcrypt from 'bcryptjs';
export const register = async (req:Request, res:Response) => {
    const { email } = req.body;
  
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
  
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
  
    const token = crypto.randomBytes(32).toString("hex");
  
    const user = await prisma.user.create({
      data: {
        email,
        emailVerifyCode: token,
        emailVerifyExpiry: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
      },
    });
  
    const link =
      `http://localhost:5000/api/user/verify-email?token=${token}`;
  
    await sendEmail(
      email,
      "Verify Email",
      link
    );
  
    res.status(201).json({
      message: "Verification email sent",
    });
  };

  export const verifyEmail = async (req:Request, res:Response) => {
    const { token } = req.query;
  
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyCode: token as string,
      },
    });
  
    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
      });
    }

    if (user.emailVerifyExpiry && new Date() > user.emailVerifyExpiry) {
      return res.status(400).json({
        message: "Token expired",
      });
    }
  
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        emailVerifyCode: null,
        emailVerifyExpiry: null,
      },
    });
  
    res.json({
      message: "Email verified",
    });
  };

  export const completeRegistration = async (
    req:Request, res:Response ) => {
    const { email,name,password,phoneNumber } = req.body;
  
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
  
    const hashedPassword =
      await bcrypt.hash(password, 10);
  
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        password: hashedPassword,
        phoneNumber
      },
    });
  
    res.json({
      message: "Registration completed",
    });
  };