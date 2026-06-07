import express from "express";
import {
  createWarehouse,
  getWarehousesByStore,
  addInventoryItem,
  getInventoryByStore,
  getInventorySummary,
  adjustStock,
} from "../controller/inventory/inventory";

const router = express.Router();

router.post("/add-warehouse", createWarehouse);
router.get("/warehouses/:storeId", getWarehousesByStore);
router.post("/add-inventory", addInventoryItem);
router.get("/store-inventory/:storeId", getInventoryByStore);
router.get("/summary/:storeId", getInventorySummary);
router.put("/adjust-stock/:id", adjustStock);

export default router;
