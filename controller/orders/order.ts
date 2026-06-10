import { Request, Response } from 'express';
import { prisma } from '../../config/dbConnect';
import { sendOrderReceiptEmail } from '../../utils/mailer';

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'refunded'];
const SHIPMENT_STATUSES = ['pending', 'in_transit', 'delivered', 'delayed'];

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'refunded'],
  paid: ['shipped', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  refunded: [],
};

const DEFAULT_ORDER_TIMELINE = [
  { statusLabel: 'Order Placed', description: 'Order has been placed', sortOrder: 0 },
  { statusLabel: 'Payment Confirmed', description: 'Payment received', sortOrder: 1 },
  { statusLabel: 'Order Shipped', description: 'Package handed to courier', sortOrder: 2 },
  { statusLabel: 'Out for Delivery', description: 'Package is out for delivery', sortOrder: 3 },
  { statusLabel: 'Delivered', description: 'Order delivered to customer', sortOrder: 4 },
];

const DEFAULT_TRACKING_MILESTONES = [
  { title: 'Order Placed', description: 'Order has been placed and confirmed', location: 'Online', sortOrder: 0 },
  { title: 'Package Prepared', description: 'Package prepared for shipping', location: 'Warehouse', sortOrder: 1 },
  { title: 'In Transit', description: 'Package on its way to you', location: 'Distribution Center', sortOrder: 2 },
  { title: 'Out for Delivery', description: 'Package delivery will be today', location: 'Local Hub', sortOrder: 3 },
  { title: 'Delivered', description: 'Package delivered to your address', location: 'Destination', sortOrder: 4 },
];

// seed order timeline steps when a new order is created
async function seedOrderTimeline(orderId: number, placedAt: Date) {
  for (let i = 0; i < DEFAULT_ORDER_TIMELINE.length; i++) {
    const step = DEFAULT_ORDER_TIMELINE[i];
    await prisma.orderStatusEvent.create({
      data: {
        orderId,
        statusLabel: step.statusLabel,
        description: step.description,
        completed: i === 0,
        occurredAt: i === 0 ? placedAt : null,
        sortOrder: step.sortOrder,
      },
    });
  }
}

// mark timeline steps as completed up to a given status
async function syncTimelineForStatus(orderId: number, status: string) {
  const labelMap: Record<string, string> = {
    paid: 'Payment Confirmed',
    shipped: 'Order Shipped',
    delivered: 'Delivered',
  };

  const targetLabel = labelMap[status];
  if (!targetLabel) return;

  const events = await prisma.orderStatusEvent.findMany({
    where: { orderId },
    orderBy: { sortOrder: 'asc' },
  });

  const now = new Date();
  for (const event of events) {
    if (!event.completed) {
      await prisma.orderStatusEvent.update({
        where: { id: event.id },
        data: { completed: true, occurredAt: now },
      });
    }
    if (event.statusLabel === targetLabel) break;
  }
}

// seed shipment tracking milestones when a shipment is created
async function seedShipmentTracking(shipmentId: number, placedAt: Date) {
  for (let i = 0; i < DEFAULT_TRACKING_MILESTONES.length; i++) {
    const m = DEFAULT_TRACKING_MILESTONES[i];
    await prisma.shipmentTrackingEvent.create({
      data: {
        shipmentId,
        title: m.title,
        description: m.description,
        location: m.location,
        eventStatus: i === 0 ? 'completed' : 'pending',
        occurredAt: i === 0 ? placedAt : null,
        sortOrder: m.sortOrder,
      },
    });
  }
}

// mark tracking events as completed up to a given shipment status
async function advanceShipmentTracking(shipmentId: number, shipmentStatus: string) {
  const titleMap: Record<string, string> = {
    in_transit: 'In Transit',
    delivered: 'Delivered',
  };

  const targetTitle = titleMap[shipmentStatus];
  if (!targetTitle) return;

  const events = await prisma.shipmentTrackingEvent.findMany({
    where: { shipmentId },
    orderBy: { sortOrder: 'asc' },
  });

  const now = new Date();
  for (const event of events) {
    if (event.eventStatus !== 'completed') {
      await prisma.shipmentTrackingEvent.update({
        where: { id: event.id },
        data: { eventStatus: 'completed', occurredAt: now },
      });
    }
    if (event.title === targetTitle) break;
  }
}

// GET /store/:storeId/summary
export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) return res.status(400).json({ message: 'Valid storeId is required' });

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalOrders = await prisma.order.count({ where: { storeId } });
    const pending = await prisma.order.count({ where: { storeId, status: 'pending' } });
    const inTransit = await prisma.order.count({ where: { storeId, status: 'shipped' } });
    const delivered = await prisma.order.count({ where: { storeId, status: 'delivered' } });
    const thisMonth = await prisma.order.count({ where: { storeId, createdAt: { gte: thisMonthStart } } });
    const lastMonth = await prisma.order.count({ where: { storeId, createdAt: { gte: lastMonthStart, lt: thisMonthStart } } });

    let growthPercent = 0;
    if (lastMonth === 0) {
      growthPercent = thisMonth > 0 ? 100 : 0;
    } else {
      growthPercent = Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10;
    }

    return res.status(200).json({ totalOrders, growthPercent, pending, inTransit, delivered });
  } catch (error: any) {
    console.error('getOrderSummary error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /store/:storeId
export const getOrders = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) return res.status(400).json({ message: 'Valid storeId is required' });

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const status = req.query.status as string | undefined;
    const search = (req.query.search as string | undefined)?.trim() || '';

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        ...(status && ORDER_STATUSES.includes(status) && { status }),
        ...(search && {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        createdAt: true,
        itemCount: true,
        total: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ orders });
  } catch (error: any) {
    console.error('getOrders error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /:orderId
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const param = req.params.orderId;
    const numericId = parseInt(param);

    let order = null;
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    }
    if (!order) {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    const timeline = await prisma.orderStatusEvent.findMany({ where: { orderId: order.id }, orderBy: { sortOrder: 'asc' } });
    const shipment = await prisma.shipment.findFirst({ where: { orderId: order.id } });
    const refund = await prisma.orderRefund.findFirst({ where: { orderId: order.id }, orderBy: { processedAt: 'desc' } });

    return res.status(200).json({
      order: {
        ...order,
        lineItems: items.map((item) => ({
          ...item,
          variantAttributes: item.variantAttributes ? JSON.parse(item.variantAttributes) : {},
        })),
        timeline,
        shipment: shipment ?? null,
        refund: refund ?? null,
        refundableAmount: parseFloat(order.total).toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// POST /
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { storeId: rawStoreId, customerId, customerName, customerEmail, customerPhone,
      paymentMethod, transactionId, paymentStatus, status, tax, shippingFee, shipping, items } = req.body;

    const storeId = parseInt(rawStoreId);
    if (isNaN(storeId)) return res.status(400).json({ message: 'Valid storeId is required' });

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one line item is required' });
    }

    let resolvedName = customerName;
    let resolvedEmail = customerEmail;
    let resolvedPhone = customerPhone;
    const parsedCustomerId = customerId ? parseInt(customerId) : null;

    if (parsedCustomerId) {
      const customer = await prisma.customer.findFirst({ where: { customerId: parsedCustomerId, storeId } });
      if (!customer) return res.status(404).json({ message: 'Customer not found for this store' });
      resolvedName = resolvedName ?? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
      resolvedEmail = resolvedEmail ?? customer.email;
      resolvedPhone = resolvedPhone ?? customer.phone;
    }

    let subtotal = 0;
    let itemCount = 0;
    const lineRows = [];

    for (const line of items) {
      const qty = parseInt(line.quantity) || 1;
      const unitPrice = parseFloat(line.unitPrice ?? line.price) || 0;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      itemCount += qty;

      lineRows.push({
        productId: line.productId ? parseInt(line.productId) : undefined,
        productName: String(line.productName ?? line.name ?? 'Item'),
        variantAttributes: line.variantAttributes ? JSON.stringify(line.variantAttributes) : null,
        quantity: qty,
        unitPrice: unitPrice.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      });
    }

    const taxAmount = parseFloat(tax) || 0;
    const shippingAmount = parseFloat(shippingFee) || 0;
    const total = subtotal + taxAmount + shippingAmount;

    const initialStatus = ORDER_STATUSES.includes(status) ? status : 'pending';
    const initialPayment = paymentStatus ?? (initialStatus === 'paid' ? 'paid' : 'pending');
    const ship = shipping ?? {};

    const created = await prisma.order.create({
      data: {
        storeId,
        orderNumber: 'TEMP',
        customerId: parsedCustomerId ?? undefined,
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        customerPhone: resolvedPhone,
        status: initialStatus,
        paymentStatus: initialPayment,
        paymentMethod: paymentMethod ?? null,
        transactionId: transactionId ?? null,
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        shippingFee: shippingAmount.toFixed(2),
        total: total.toFixed(2),
        itemCount,
        shippingRecipient: ship.recipient ?? resolvedName,
        shippingStreet: ship.street ?? ship.address,
        shippingCity: ship.city,
        shippingState: ship.state,
        shippingPostal: ship.postal ?? ship.postalCode,
        shippingCountry: ship.country,
        items: { create: lineRows },
      },
    });

    const orderNumber = `ORD-${String(created.id).padStart(3, '0')}`;
    await prisma.order.update({ where: { id: created.id }, data: { orderNumber } });

    await seedOrderTimeline(created.id, created.createdAt);
    if (initialStatus !== 'pending') {
      await syncTimelineForStatus(created.id, initialStatus);
    }

    const order = await prisma.order.findUnique({ where: { id: created.id } });
    return res.status(201).json({ message: 'Order created successfully', order });
  } catch (error: any) {
    console.error('createOrder error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// PATCH /:orderId/status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const param = req.params.orderId;
    const numericId = parseInt(param);

    let order = null;
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    }
    if (!order) {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const newStatus = req.body.status?.trim().toLowerCase();
    if (!newStatus || !ORDER_STATUSES.includes(newStatus)) {
      return res.status(400).json({ message: `status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }

    if (order.status === 'refunded') {
      return res.status(400).json({ message: 'Refunded orders cannot change status' });
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({ message: `Cannot transition from ${order.status} to ${newStatus}`, allowedTransitions: allowed });
    }

    const paymentStatus = newStatus === 'paid' ? 'paid' : newStatus === 'refunded' ? 'refunded' : order.paymentStatus;

    await prisma.order.update({ where: { id: order.id }, data: { status: newStatus, paymentStatus } });
    await syncTimelineForStatus(order.id, newStatus);

    if (newStatus === 'shipped') {
      const { courier, trackingId, estimatedDelivery } = req.body;
      const destinationParts = [order.shippingStreet, order.shippingCity, order.shippingState, order.shippingCountry].filter(Boolean);
      const destination = destinationParts.join(', ') || '—';

      const existingShipment = await prisma.shipment.findFirst({ where: { orderId: order.id } });

      if (existingShipment) {
        await prisma.shipment.update({
          where: { id: existingShipment.id },
          data: {
            status: 'in_transit',
            courier: courier ?? existingShipment.courier,
            trackingId: trackingId ?? existingShipment.trackingId,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : existingShipment.estimatedDelivery,
            destination: destination || existingShipment.destination,
          },
        });
        await advanceShipmentTracking(existingShipment.id, 'in_transit');
      } else {
        const shipment = await prisma.shipment.create({
          data: {
            storeId: order.storeId,
            orderId: order.id,
            courier: courier ?? null,
            trackingId: trackingId ?? null,
            destination,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
            status: 'in_transit',
          },
        });
        await seedShipmentTracking(shipment.id, new Date());
        await advanceShipmentTracking(shipment.id, 'in_transit');
      }
    }

    if (newStatus === 'delivered') {
      const shipment = await prisma.shipment.findFirst({ where: { orderId: order.id } });
      if (shipment) {
        await prisma.shipment.update({ where: { id: shipment.id }, data: { status: 'delivered' } });
        await advanceShipmentTracking(shipment.id, 'delivered');
      }
    }

    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    return res.status(200).json({ message: 'Order status updated', order: updated });
  } catch (error: any) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// POST /:orderId/refund
export const processRefund = async (req: Request, res: Response) => {
  try {
    const param = req.params.orderId;
    const numericId = parseInt(param);

    let order = null;
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    }
    if (!order) {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'refunded') {
      return res.status(400).json({ message: 'Order has already been refunded' });
    }

    if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Refund is only allowed for paid, shipped, or delivered orders' });
    }

    const existingRefund = await prisma.orderRefund.findFirst({ where: { orderId: order.id } });
    if (existingRefund) {
      return res.status(400).json({ message: 'A refund has already been processed for this order' });
    }

    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    if (!reason) return res.status(400).json({ message: 'Refund reason is required' });

    const orderTotal = parseFloat(order.total);
    const requestedAmount = req.body.amount !== undefined ? parseFloat(req.body.amount) : orderTotal;
    if (requestedAmount <= 0 || requestedAmount > orderTotal) {
      return res.status(400).json({ message: `Refund amount must be between 0.01 and ${orderTotal}` });
    }

    const refund = await prisma.orderRefund.create({
      data: { orderId: order.id, amount: requestedAmount.toFixed(2), reason },
    });

    await prisma.order.update({ where: { id: order.id }, data: { status: 'refunded', paymentStatus: 'refunded' } });

    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    return res.status(200).json({
      message: 'Refund processed successfully. This action cannot be undone.',
      refund,
      order: updated,
    });
  } catch (error: any) {
    console.error('processRefund error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// POST /:orderId/receipt
export const sendReceipt = async (req: Request, res: Response) => {
  try {
    const param = req.params.orderId;
    const numericId = parseInt(param);

    let order = null;
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    }
    if (!order) {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.customerEmail) {
      return res.status(400).json({ message: 'Order has no customer email for receipt delivery' });
    }

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });

    const sent = await sendOrderReceiptEmail({
      to: order.customerEmail,
      customerName: order.customerName ?? 'Customer',
      orderNumber: order.orderNumber,
      total: order.total,
      items: items.map((i) => ({ name: i.productName, quantity: i.quantity, lineTotal: i.lineTotal })),
    });

    if (!sent) return res.status(500).json({ message: 'Failed to send receipt email' });
    return res.status(200).json({ message: 'Receipt sent successfully' });
  } catch (error: any) {
    console.error('sendReceipt error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /store/:storeId/shipments/summary
export const getShipmentSummary = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) return res.status(400).json({ message: 'Valid storeId is required' });

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const totalShipments = await prisma.shipment.count({ where: { storeId } });
    const pending = await prisma.shipment.count({ where: { storeId, status: 'pending' } });
    const inTransit = await prisma.shipment.count({ where: { storeId, status: 'in_transit' } });
    const delivered = await prisma.shipment.count({ where: { storeId, status: 'delivered' } });
    const delayed = await prisma.shipment.count({ where: { storeId, status: 'delayed' } });

    return res.status(200).json({
      totalShipments,
      pending,
      inTransit,
      delivered,
      delayed,
      alert: delayed > 0 ? { message: `${delayed} shipment(s) delayed`, delayed } : null,
    });
  } catch (error: any) {
    console.error('getShipmentSummary error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /store/:storeId/shipments
export const getShipments = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) return res.status(400).json({ message: 'Valid storeId is required' });

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const status = req.query.status as string | undefined;
    const search = (req.query.search as string | undefined)?.trim() || '';

    const rows = await prisma.shipment.findMany({
      where: {
        storeId,
        ...(status && SHIPMENT_STATUSES.includes(status) && { status }),
        ...(search && {
          OR: [
            { trackingId: { contains: search, mode: 'insensitive' } },
            { courier: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { order: { select: { orderNumber: true, customerName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const shipments = rows.map((s) => ({
      id: s.id,
      orderId: s.order.orderNumber,
      customerName: s.order.customerName,
      courier: s.courier,
      trackingId: s.trackingId,
      destination: s.destination,
      estimatedDeliveryDate: s.estimatedDelivery,
      status: s.status,
    }));

    return res.status(200).json({ shipments });
  } catch (error: any) {
    console.error('getShipments error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// PATCH /shipment/:shipmentId/status
export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId);
    if (isNaN(shipmentId)) return res.status(400).json({ message: 'Valid shipmentId is required' });

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    const newStatus = req.body.status?.trim().toLowerCase();
    if (!newStatus || !SHIPMENT_STATUSES.includes(newStatus)) {
      return res.status(400).json({ message: `status must be one of: ${SHIPMENT_STATUSES.join(', ')}` });
    }

    const isOnTrack = req.body.isOnTrack !== undefined ? Boolean(req.body.isOnTrack) : newStatus !== 'delayed';

    await prisma.shipment.update({ where: { id: shipmentId }, data: { status: newStatus, isOnTrack } });
    await advanceShipmentTracking(shipmentId, newStatus);

    if (newStatus === 'delivered') {
      await prisma.order.update({ where: { id: shipment.orderId }, data: { status: 'delivered' } });
      await syncTimelineForStatus(shipment.orderId, 'delivered');
    }

    const updated = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    return res.status(200).json({ message: 'Shipment status updated', shipment: updated });
  } catch (error: any) {
    console.error('updateShipmentStatus error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /track/:trackingId
export const trackByTrackingId = async (req: Request, res: Response) => {
  try {
    const trackingId = req.params.trackingId?.trim();
    if (!trackingId) return res.status(400).json({ message: 'trackingId is required' });

    const shipment = await prisma.shipment.findFirst({ where: { trackingId } });
    if (!shipment) return res.status(404).json({ message: 'Tracking ID not found' });

    const order = await prisma.order.findUnique({ where: { id: shipment.orderId } });
    const history = await prisma.shipmentTrackingEvent.findMany({ where: { shipmentId: shipment.id }, orderBy: { sortOrder: 'asc' } });

    const statusLabels: Record<string, string> = { pending: 'Pending', in_transit: 'In Transit', delivered: 'Delivered', delayed: 'Delayed' };
    const statusMessages: Record<string, string> = {
      pending: 'Your order is being prepared for shipment.',
      in_transit: 'Your package is on its way and will be delivered soon.',
      delivered: 'Your package has been delivered.',
      delayed: 'Your shipment is delayed. We are working to resolve this.',
    };

    return res.status(200).json({
      orderId: order?.orderNumber,
      trackingId: shipment.trackingId,
      courier: shipment.courier,
      destination: shipment.destination,
      estimatedDelivery: shipment.estimatedDelivery,
      currentStatus: statusLabels[shipment.status] ?? shipment.status,
      statusMessage: statusMessages[shipment.status] ?? '',
      isOnTrack: shipment.isOnTrack,
      history: history.map((e) => ({
        title: e.title,
        description: e.description,
        location: e.location,
        timestamp: e.occurredAt,
        status: e.eventStatus === 'completed' ? 'Completed' : 'Pending',
      })),
    });
  } catch (error: any) {
    console.error('trackByTrackingId error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /shipment/:shipmentId/track
export const trackShipment = async (req: Request, res: Response) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId);
    if (isNaN(shipmentId)) return res.status(400).json({ message: 'Valid shipmentId is required' });

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    const order = await prisma.order.findUnique({ where: { id: shipment.orderId } });
    const history = await prisma.shipmentTrackingEvent.findMany({ where: { shipmentId: shipment.id }, orderBy: { sortOrder: 'asc' } });

    const statusLabels: Record<string, string> = { pending: 'Pending', in_transit: 'In Transit', delivered: 'Delivered', delayed: 'Delayed' };
    const statusMessages: Record<string, string> = {
      pending: 'Your order is being prepared for shipment.',
      in_transit: 'Your package is on its way and will be delivered soon.',
      delivered: 'Your package has been delivered.',
      delayed: 'Your shipment is delayed. We are working to resolve this.',
    };

    return res.status(200).json({
      orderId: order?.orderNumber,
      trackingId: shipment.trackingId,
      courier: shipment.courier,
      destination: shipment.destination,
      estimatedDelivery: shipment.estimatedDelivery,
      currentStatus: statusLabels[shipment.status] ?? shipment.status,
      statusMessage: statusMessages[shipment.status] ?? '',
      isOnTrack: shipment.isOnTrack,
      history: history.map((e) => ({
        title: e.title,
        description: e.description,
        location: e.location,
        timestamp: e.occurredAt,
        status: e.eventStatus === 'completed' ? 'Completed' : 'Pending',
      })),
    });
  } catch (error: any) {
    console.error('trackShipment error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};