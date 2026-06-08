import { prisma } from "../../lib/prisma";
import { Request, Response } from "express";


const parseId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};


const parseStock = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const stock = Number(value);
  return Number.isNaN(stock) ? undefined : stock;
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { storeId, ...productFields } = req.body;
    const parsedStoreId = parseId(storeId);

    if (!parsedStoreId) {
      return res.status(400).json({ message: "Valid storeId is required" });
    }

    const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const product = await prisma.product.create({
      data: {
        ...productFields,
        storeId: parsedStoreId,
        stock: parseStock(productFields.stock),
      },
    });

    return res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add product" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
};

export const getProductsByStore = async (req: Request, res: Response) => {
  try {
    const storeId = parseId(req.params.storeId);
    if (!storeId) {
      return res.status(400).json({ message: "Invalid store ID" });
    }

    const products = await prisma.product.findMany({ where: { storeId } });
  
    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { storeId: _ignored, ...updates } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updates,
        stock: parseStock(req.body.stock),
      },
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update product" });
  }
};

export const bulkUploadProducts = async (req: Request, res: Response) => {
  try {
    const { storeId, products } = req.body;
    const parsedStoreId = parseId(storeId);

    if (!parsedStoreId) {
      return res.status(400).json({ message: "Valid storeId is required" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products must be a non-empty array" });
    }

    const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const result = await prisma.product.createMany({
      data: products.map((product: Record<string, unknown>) => ({
        ...product,
        storeId: parsedStoreId,
        stock: parseStock(product.stock) ?? null,
      })),
    });

    return res.status(201).json({
      message: `${result.count} products uploaded successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to upload products" });
  }
};
