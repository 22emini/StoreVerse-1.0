import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const AddStore = async (req:Request,res:Response) =>{
    try{

        const { userId, image, storeName, category, businessAddress, country, currency, subDomain } = req.body;
         if (!userId || !storeName || !subDomain) {
            return res.status(400).json({
                message: "userId, storeName and subDomain are required",
            });
         }

         const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
          });
      
          if (!user) {
            return res.status(404).json({
              message: "User not found",
            });
          }
         const AddData = await prisma.store.create({
            data: {
                image,
                storeName,
                category,
                businessAddress,
                country,
                currency,
                subDomain,
            
                user: {
                  connect: {
                    id: Number(userId),
                  },
                },
              },
            
         })
         return res.status(200).json({
            message: "Store Data has been added Successfully",
            AddData,
         });

    } catch (error) {
        console.error("An error has occurred", error);
        return res.status(500).json({
          message: "Error creating store",
          error,
        });
       }
}

export const getStoresByUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const stores = await prisma.store.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      message: "Stores fetched successfully",
      count: stores.length,
      stores,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch stores",
    });
  }
};

export const getStore = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid store ID",
      });
    }

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

      return res.status(200).json({ meassage: "Store hase been Found",store})
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch store",
    });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid store ID",
      });
    }

    const existingStore = await prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const store = await prisma.store.update({
      where: { id },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json({
      message: "Store updated successfully",
      store,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update store",error
    });
  }
};