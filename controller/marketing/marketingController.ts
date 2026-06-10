 import { Request, Response }  from "express";
 import { prisma } from "../../lib/prisma" 


 const parseId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
  };
  
 export const createCampaign = async (req:Request,  res:Response ) =>{

try{
const { storeId , ...Fields} = req.body;
 const parseStoreId = parseId(storeId)

 if(!parseStoreId){
    return res.status(400).json({
        message:"Store Id is required"
    })
 }
  const store = await prisma.store.findUnique({ where: { id: parseStoreId } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
 const add = await prisma.campaign.create({

    data:{
        ...Fields,
        storeId:parseStoreId,
        
    
    }
 })
res.status(201).json({
   message: " Campaign Created Successfully",
   data: add
});

}catch(error){

    console.log("An Error has Occurred", error);
    res.status(500).json({
 message:"Error has occurred in the Creatation of Campaign" , error

    })
}


 }

// Get campaigns by store
export const getCampaignsByStore = async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const parsedStoreId = parseId(storeId);
  if (!parsedStoreId) {
    return res.status(400).json({ message: "Store Id is required" });
  }
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { storeId: parsedStoreId },
    });
    res.status(200).json({ message:"Campaigns fetched successfully",count: campaigns.length, data: campaigns });
  } catch (error) {
    console.log("Error fetching campaigns", error);
    res.status(500).json({ message: "Error retrieving campaigns", error });
  }
};

export const   deleteMarketing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId = parseId(id);
  if (!parsedId) {
    return res.status(400).json({ message: "Store Id is required" });
  }
  try {
    const campaigns = await prisma.campaign.delete({
      where: { id: parsedId },
    });
    res.status(200).json({ message:"Campaign deleted successfully",data: campaigns });
  } catch (error) {
    console.log("Error fetching campaigns", error);
    res.status(500).json({ message: "Error deleting campaigns", error });
  }
};
