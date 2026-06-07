import { Request, Response } from "express";
import { prisma } from '../../lib/prisma';


const parseId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
  };

export const  CreateRoleStaff = async (req:Request , res:Response)=>{
    try{
        

const{ storeId, name, email, role, status } =  req.body;
const parsedStoreId = parseId(storeId);

if (!parsedStoreId) {
  return res.status(400).json({ message: "Valid storeId is required" });
}


const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
if (!store) {
  return res.status(404).json({ message: "Store not found" });
}

const staff = await  prisma.staff.create({
data:{name, email, role, status, storeId: parsedStoreId,}
})
res.status(200).json({
    message:" Data has been added Successfully" ,staff
})

    }
    catch(error){
        console.error("An error has Occured", error)
        res.status(500).json({
            message : "Error Creating Role and Satff ", error
        })
    }

}

export const  getStaff = async (req:Request , res:Response)=>{
try{
    const { storeId } = req.params;
    const parsedStoreId = parseId(storeId);

    if (!parsedStoreId) {
      return res.status(400).json({ message: "Valid storeId is required" });
    }
    
    
    const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const fetchData = await prisma.staff.findMany({
        where:{
            storeId:parsedStoreId

        }
    })
    res.status(200).json({
        message : "Data has been Fetched", fetchData
    })
    

}catch(error){
    console.error("An error has Occured", error)
    res.status(500).json({
        message : "Error Getting  Role and Satff ", error
    })
}

}
export const   deleteStaff = async (req:Request , res:Response)=>{

    try{
        const { id } = req.params;
        const parsedId = parseId(id);

        if (!parsedId) {
          return res.status(400).json({ message: "Valid staff id is required" });
        }

        const staff = await prisma.staff.findUnique({ where: { id: parsedId } });
        if (!staff) {
          return res.status(404).json({ message: "Staff not found" });
        }

        const  DeleteData = await prisma.staff.delete({
            where: { id: parsedId }
          });
          res.status(200).json({
            message: " Data has been Deleted!!", DeleteData
          })


    }

        catch(error){
            console.error("An error has Occured", error)
            res.status(500).json({
                message : "Error  Deleting Role and Satff ", error
            })
        
        
        }
}
export const   UpdateSatff = async (req:Request , res:Response)=>{

    try{
        const { id } = req.params;
        const parsedId = parseId(id);

        if (!parsedId) {
          return res.status(400).json({ message: "Valid staff id is required" });
        }

        const staff = await prisma.staff.findUnique({ where: { id: parsedId } });
        if (!staff) {
          return res.status(404).json({ message: "Staff not found" });
        }

        const  updateData = await prisma.staff.update({
            where: { id: parsedId },
            data: {
              ...req.body,
            },
          });
          res.status(200).json({
            message: " Data has been Updated", updateData
          })


    }

        catch(error){
            console.error("An error has Occured", error)
            res.status(500).json({
                message : "Error  upadating  Role and Satff ", error
            })
        
        
        }
    }