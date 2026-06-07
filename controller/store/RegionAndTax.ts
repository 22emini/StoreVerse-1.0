import { Request, Response } from "express";
import { prisma } from '../../lib/prisma';


const parseId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
  };

  export const addRegionAndTax = async (req:Request, res:Response)=>{

try{

 
    const { storeId, country,  code, taxRate, shippingZone}= req.body;
    const parsedStoreId = parseId(storeId);
   
    if (!parsedStoreId) {
       return res.status(400).json({ message: "Valid storeId is required" });
     }
     
     
     const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
     if (!store) {
       return res.status(404).json({ message: "Store not found" });
     }
   
     const addData = await prisma.region.create({
   data:{country,  code, taxRate, shippingZone, storeId: parsedStoreId}
})
   res.status(200).json({
    message : "Data Added Sucessfully", addData
   })
}catch(error){
    res.status(500).json({
        meassge: " Failed to add Data" , error
    })
}

  }

  export const getALLRegion = async (req:Request, res:Response)=>{
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
         const fecthAll  = await prisma.region.findMany({
            where:{
                storeId:parsedStoreId}
         })
   
       res.status(200).json({
        message : "Data Fetch Sucessfully", fecthAll
       })
    }catch(error){
        res.status(500).json({
            meassge: " Failed to add Data" , error
        })
    }
    
      }
      export const   UpdateRgion = async (req:Request , res:Response)=>{

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
    
            const  updateData = await prisma.region.update({
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


