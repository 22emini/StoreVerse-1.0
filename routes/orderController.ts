import express from "express";
import {
  getOrderSummary,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  processRefund,
  sendReceipt,
  getShipmentSummary,
  getShipments,
  updateShipmentStatus,
  trackByTrackingId,
  trackShipment,
} from '../controller/orders/order';

const router = express.Router();

// ── Static / specific routes first (must come before /:storeId) ──────────────
router.get('/summary/:storeId', getOrderSummary);
router.get('/order/:orderId', getOrderById);
router.get('/shipments/summary/:storeId', getShipmentSummary);
router.get('/shipments/:storeId', getShipments);
router.get('/shipment/track/:shipmentId', trackShipment);
router.get('/track/:trackingId', trackByTrackingId);

router.post('/', createOrder);
router.patch('/status/:orderId', updateOrderStatus);
router.post('/refund/:orderId', processRefund);
router.post('/receipt/:orderId', sendReceipt);
router.patch('/shipment/status/:shipmentId', updateShipmentStatus);

// ── Dynamic catch-all last (/:storeId must be after all static prefixes) ──────
router.get('/:storeId', getOrders);

export default router;
