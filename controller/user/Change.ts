import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
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