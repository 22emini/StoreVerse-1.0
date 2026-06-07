import { Request, Response } from "express";
import { prisma } from '../../lib/prisma';
import { getStockStatus } from "../../utils/inventory.utils";


export const createWarehouse = async (req:Request, res:Response) => {
  try {
    const { storeId, name } = req.body;

    if (!storeId || !name) {
      return res.status(400).json({
        message: 'storeId and warehouse name are required',
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        storeId: Number(storeId),
        name,
      },
    });

    return res.status(201).json({
      message: 'Warehouse created',
      warehouse,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create warehouse',
      error
    });
  }
};



export const getWarehousesByStore = async (req:Request, res:Response) => {
  try {
    const storeId = Number(req.params.storeId);

    const warehouses = await prisma.warehouse.findMany({
      where: { storeId },
    });

    return res.json({
      count: warehouses.length,
      warehouses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch warehouses',
    });
  }
};


export const addInventoryItem = async (req:Request, res:Response) => {
  try {
    const {
      storeId,
      productId,
      warehouseId,
      quantity = 0,
    } = req.body;

    const item = await prisma.inventory.create({
      data: {
        storeId: Number(storeId),
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        quantity: Number(quantity),
      },
    });

    return res.status(201).json({
      message: 'Inventory added',
      item,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to add inventory',
    });
  }
};


export const getInventoryByStore = async (req:Request, res:Response) => {
  try {
    const storeId = Number(req.params.storeId);

    const inventory = await prisma.inventory.findMany({
      where: { storeId },
      include: {
        product: true,
        warehouse: true,
      },
    });

    const items = inventory.map((item) => ({
      id: item.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      warehouse: item.warehouse.name,
      status: getStockStatus(item.quantity),
      updatedAt: item.updatedAt,
    }));

    return res.json(items);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch inventory',
    });
  }
};

export const getInventorySummary = async (req:Request, res:Response)=> {
  try {
    const storeId = Number(req.params.storeId);

    const inventory = await prisma.inventory.findMany({
      where: { storeId },
    });

    const summary = {
      totalStock: inventory.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      inStock: inventory.filter(
        (item) => item.quantity > 10
      ).length,
      lowStock: inventory.filter(
        (item) => item.quantity > 0 && item.quantity <= 10
      ).length,
      outOfStock: inventory.filter(
        (item) => item.quantity === 0
      ).length,
    };

    return res.json(summary);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to get summary',
    });
  }
};

export const adjustStock = async (req:Request, res:Response) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    const item = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: Number(quantity),
      },
    });

    return res.json({
      message: 'Stock updated',
      item,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update stock',
    });
  }
};