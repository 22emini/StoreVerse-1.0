import express from "express";
import {
  addProduct,
  getProduct,
  getProductsByStore,
  updateProduct,
  bulkUploadProducts,
} from "../controller/product/Product";

const router = express.Router();

router.post("/add-product", addProduct);
router.get("/get-product/:id", getProduct);
router.get("/store-products/:storeId", getProductsByStore);
router.put("/update-product/:id", updateProduct);
router.post("/bulk-upload", bulkUploadProducts);

export default router;
