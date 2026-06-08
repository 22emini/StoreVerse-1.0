import  { Request , Response} from 'express';
import { prisma} from "../../lib/prisma"


const parseId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
  };
  


export const createCustomer = async (req:Request, res:Response)=>{
    try{
        const { storeId , ...customerFileds} = req.body;
        const parseStoreId = parseId(storeId)


       if(!parseStoreId){
        return res.status(400).json({
            message : "valid Store Id is Required"
        })}
        const checkId = await prisma.store.findUnique({
            where:{
                id: parseStoreId
            }
        })
        if(!checkId){
            return res.status(404).json({
                message: "Store not found"
            })
        }


         const  addCustomer = await prisma.customer.create({
            data:{
                ...customerFileds,
                storeId: parseStoreId
            }
         })
         return res.status(200).json({
            message: " Customer has been added Successfully", addCustomer
         })
        } catch(error){
        console.error("An error has Occurred", error)
        res.status(500).json({

         message: "An erro has Occurred",error

        })
    }
}

export const getCustomers = async (req:Request, res:Response)=>{

try{
    const storeId = parseId(req.params.storeId);
    if (!storeId) {
      return res.status(400).json({ message: "Invalid store ID" });
    }
 const customer = await prisma.customer.findMany({
        where:{
            storeId
        }
    })
    if(customer.length === 0){
        return res.status(404) .json({
            message : " No customer found, please Add a Customer!",
            count:customer.length ,
            customer

        })
    }
    return res.status(200).json({
        message:"Customer Data Has been fetched!",
        count:customer.length,
        customer
    })
   
   }

    catch(error){
        console.error("An error has Occurred", error)
        res.status(500).json({

         message: "An erro has Occurred",error

        })
    }

}

export const  getCustomerById =async (req:Request, res:Response)=>{

    try{
 
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const  customer = await prisma.customer.findUnique({
      where: { customerId: id },
      include: { store: true },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ customer });}
    catch(error){
        console.error("An error has Occurred", error)
        res.status(500).json({

         message: "Failed to Fetch Id",error

        })
    }
}

export const editCustomer = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
  
      const existing = await prisma.customer.findUnique({
        where: { customerId: id },
      });
  
      if (!existing) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      const { storeId: _ignored, ...updates } = req.body;
  
      const customer = await prisma.customer.update({
        where: { customerId: id },
        data: updates,
      });
  
      return res.status(200).json({
        message: "Customer updated successfully",
        customer,
      });
    } catch (error) {
      console.error("An error has Occurred", error);
      return res.status(500).json({
        message: "Failed to update customer profile",error
      });
    }
  };

  export const UploadData = async (req: Request, res: Response) => {


    
  }