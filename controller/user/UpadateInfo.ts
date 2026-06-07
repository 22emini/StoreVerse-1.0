import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const Update = async (req:Request, res:Response)=>{
   try{
    const id = Number(req.params.id);

    const user =
      await prisma.user.update({
        where: { id },
        data: {
          name: req.body.name,
          phoneNumber:
            req.body.phoneNumber,
        },
      });
  
    res.status(200).json({
      message: "Data has been Updated", user
    });
   }catch(error){

    console.error("An as Occured", error)
    res.status(500).json({message: 
      "Error!", error
    })
   }
}