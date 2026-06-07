import { Request, Response } from "express";
import { prisma } from '../../lib/prisma';


const parseId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
  };

  export const Customize = async (req:Request, res:Response)=>{

try{

 
    const { storeId, primaryColor, fontFamily , storeLogoUrl }= req.body;
    const parsedStoreId = parseId(storeId);
   
    if (!parsedStoreId) {
       return res.status(400).json({ message: "Valid storeId is required" });
     }
     
     
     const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
     if (!store) {
       return res.status(404).json({ message: "Store not found" });
     }
   
     const addData = await prisma.customize.create({
        data: { primaryColor, fontFamily, storeLogoUrl, storeId: parsedStoreId },
      });
   return res.status(200).json({
    message: "Data added successfully",
    addData,
   });
}catch(error){
    console.error("Customize theme error", error);
    return res.status(500).json({
        message: "Failed to add data",
    });
}

  }

  export const getColor = async (req:Request, res:Response)=>{
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
        const fetchAll = await prisma.customize.findMany({
            where: { storeId: parsedStoreId },
          });
   
       return res.status(200).json({
        message: "Data fetched successfully",
        fetchAll,
       });
    }catch(error){
        console.error("Get theme error", error);
        return res.status(500).json({
            message: "Failed to fetch data",
        });
    }
    
      }
