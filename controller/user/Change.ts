import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import { sendEmail } from '../../lib/mailer';

export const changePassword = async (
    req:Request,
    res:Response
  ) => {
   try{
    const id = Number(req.params.id);
  
    const hash =
      await bcrypt.hash(
        req.body.password,
        10
      );
  
    await prisma.user.update({
      where: { id },
      data: {
        password: hash,
      },
    });
  
    res.status(201).json({
      message:
        "Password Updated",
    });
   }catch(error){
    console.error("An has occured",error)
    res.status(500).json({
      message: "Errorrr!" ,error
    })
   }
  };

  export  const ForgotPassword = async(req: Request, res: Response)=>{
   try{
      const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
      where: { email },
      data: {
        emailVerifyCode: token,
        emailVerifyExpiry: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
      },
    });
  
    const link =
      `http://localhost:5000/api/user/ForgotPassword?token=${token}`;
  
    await sendEmail(
      email,
      "Forgot Password",
      link
    );
  
    res.status(201).json({
      message: "Verification email sent",
    });
  


   }catch(error){
    console.error("An has occured",error)
    res.status(500).json({
      message: "Failed to send mail" ,error
    })
   }
  }

    export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // 1️⃣ Validate token
    const user = await prisma.user.findFirst({
      where: { emailVerifyCode: token },
    });

    if (!user || !user.emailVerifyExpiry) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (new Date() > user.emailVerifyExpiry) {
      return res.status(400).json({ message: "Token expired" });
    }

    // 2️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Update password + clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerifyCode: null,
        emailVerifyExpiry: null,
      },
    });

    res.json({ message: "Password reset successful" });
  };