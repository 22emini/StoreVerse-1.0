import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const fetchUser = async (req:Request, res:Response)=>{
  try{
    const id = Number (req.params.id);
  const user = await prisma.user.findUnique({
    where: { id},omit :{password:true}
  })
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message : "User Fetch Succcesfully", user
  })
  } catch(error){
 res.status(500).json({
  message: "Failed to  get   User"
 })
  }
}

export const getAllUser = async (req: Request, res: Response)=>{


    try{
   const users = await prisma.user.findMany({
  omit: {
    password: true,
    emailVerified: true,
    emailVerifyCode: true,
    emailVerifyExpiry: true,
    loginOtpCode: true,
    loginOtpExpiry: true,
  }
})
   res.status(200).json({message: "Users Fetched Successfully", count:users.length, users})
   
    }catch(error){
        res.status(500).json({message: "Failed to fetch  All users"})
    }
}
