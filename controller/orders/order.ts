import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { sendEmail } from '../../lib/mailer';

// GET /store/:storeId/summary
export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId as string);
    if (isNaN(storeId)) {
      return res.status(400).json({ message: 'Valid storeId is required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

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
      if (thisMonth > 0) {
        growthPercent = 100;
      } else {
        growthPercent = 0;
      }
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
    const storeId = parseInt(req.params.storeId as string);
    if (isNaN(storeId)) {
      return res.status(400).json({ message: 'Valid storeId is required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'refunded'];
    const status = req.query.status as string | undefined;
    const search = req.query.search ? (req.query.search as string).trim() : '';

    // Build where clause step by step
    const where: any = { storeId };

    if (status && validStatuses.includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
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

    return res.status(200).json({count: orders.length , orders});
  } catch (error: any) {
    console.error('getOrders error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /:orderId
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const param = req.params.orderId as string;

    // Try to find by numeric id first, otherwise by order number
    let order = null;
    const numericId = parseInt(param);
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    } else {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    const timeline = await prisma.orderStatusEvent.findMany({ where: { orderId: order.id }, orderBy: { sortOrder: 'asc' } });
    const shipment = await prisma.shipment.findFirst({ where: { orderId: order.id } });
    const refund = await prisma.orderRefund.findFirst({ where: { orderId: order.id }, orderBy: { processedAt: 'desc' } });

    // Parse variantAttributes from string to object for each item
    const lineItems = [];
    for (const item of items) {
      const parsedItem: any = { ...item };
      if (item.variantAttributes) {
        parsedItem.variantAttributes = JSON.parse(item.variantAttributes);
      } else {
        parsedItem.variantAttributes = {};
      }
      lineItems.push(parsedItem);
    }

    const totalFloat = parseFloat(order.total);
    const refundableAmount = isNaN(totalFloat) ? '0.00' : totalFloat.toFixed(2);

    return res.status(200).json({
      order: {
        ...order,
        lineItems,
        timeline,
        shipment: shipment ?? null,
        refund: refund ?? null,
        refundableAmount,
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
    const {
      storeId: rawStoreId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      transactionId,
      paymentStatus,
      status,
      tax,
      shippingFee,
      shipping,
      items,
    } = req.body;

    const storeId = parseInt(rawStoreId);
    if (isNaN(storeId)) {
      return res.status(400).json({ message: 'Valid storeId is required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one line item is required' });
    }

    // Resolve customer info
    let resolvedName = customerName;
    let resolvedEmail = customerEmail;
    let resolvedPhone = customerPhone;

    if (customerId != null && customerId !== '') {
      const parsedCustomerId = parseInt(customerId);
      const customer = await prisma.customer.findFirst({ where: { customerId: parsedCustomerId, storeId } });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found for this store' });
      }
      if (!resolvedName) {
        resolvedName = ((customer.firstName ?? '') + ' ' + (customer.lastName ?? '')).trim();
      }
      if (!resolvedEmail) {
        resolvedEmail = customer.email;
      }
      if (!resolvedPhone) {
        resolvedPhone = customer.phone;
      }
    }

    // Calculate totals from items
    let subtotal = 0;
    let itemCount = 0;
    const lineRows = [];

    for (const line of items) {
      const qty = parseInt(line.quantity) || 1;
      const unitPrice = parseFloat(line.unitPrice ?? line.price) || 0;
      const lineTotal = unitPrice * qty;

      subtotal = subtotal + lineTotal;
      itemCount = itemCount + qty;

      const row: any = {
        productName: String(line.productName ?? line.name ?? 'Item'),
        variantAttributes: line.variantAttributes ? JSON.stringify(line.variantAttributes) : null,
        quantity: qty,
        unitPrice: unitPrice.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };

      if (line.productId) {
        const pid = parseInt(line.productId);
        const productExists = await prisma.product.findUnique({ where: { id: pid } });
        if (!productExists) {
          return res.status(400).json({ message: `Product with id ${pid} not found` });
        }
        row.productId = pid;
      }

      lineRows.push(row);
    }

    const taxAmount = parseFloat(tax) || 0;
    const shippingAmount = parseFloat(shippingFee) || 0;
    const total = subtotal + taxAmount + shippingAmount;

    // Determine order status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'refunded'];
    let initialStatus = 'pending';
    if (status && validStatuses.includes(status)) {
      initialStatus = status;
    }

    let initialPayment = paymentStatus;
    if (!initialPayment) {
      if (initialStatus === 'paid') {
        initialPayment = 'paid';
      } else {
        initialPayment = 'pending';
      }
    }

    const ship = shipping ?? {};

    // Create the order (orderNumber is set to TEMP first, then updated after we have the id)
    const created = await prisma.order.create({
      data: {
        storeId,
        orderNumber: 'TEMP',
        customerId: customerId ? parseInt(customerId) : undefined,
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

    // Generate a readable order number like ORD-001
    const orderNumber = 'ORD-' + String(created.id).padStart(3, '0');
    await prisma.order.update({ where: { id: created.id }, data: { orderNumber } });

    // Seed timeline steps
    const timelineSteps = [
      { statusLabel: 'Order Placed', description: 'Order has been placed', sortOrder: 0 },
      { statusLabel: 'Payment Confirmed', description: 'Payment received', sortOrder: 1 },
      { statusLabel: 'Order Shipped', description: 'Package handed to courier', sortOrder: 2 },
      { statusLabel: 'Out for Delivery', description: 'Package is out for delivery', sortOrder: 3 },
      { statusLabel: 'Delivered', description: 'Order delivered to customer', sortOrder: 4 },
    ];

    for (let i = 0; i < timelineSteps.length; i++) {
      const step = timelineSteps[i];
      await prisma.orderStatusEvent.create({
        data: {
          orderId: created.id,
          statusLabel: step.statusLabel,
          description: step.description,
          completed: i === 0,
          occurredAt: i === 0 ? created.createdAt : null,
          sortOrder: step.sortOrder,
        },
      });
    }

    // If order wasn't created as pending, sync the timeline forward
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
    const param = req.params.orderId as string;
    let order = null;
    const numericId = parseInt(param);
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    } else {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.status) {
      return res.status(500).json({ message: 'Order has an invalid status in the database' });
    }

    const body = req.body ?? {};
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'refunded'];
    const newStatus = body.status ? String(body.status).trim().toLowerCase() : '';

    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'status must be one of: pending, paid, shipped, delivered, refunded' });
    }

    if (order.status === 'refunded') {
      return res.status(400).json({ message: 'Refunded orders cannot change status' });
    }

    // Check if transition is allowed
    const allowedTransitions: Record<string, string[]> = {
      pending: ['paid', 'refunded'],
      paid: ['shipped', 'refunded'],
      shipped: ['delivered', 'refunded'],
      delivered: ['refunded'],
      refunded: [],
    };

    const allowed = allowedTransitions[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot transition from ${order.status} to ${newStatus}`,
        allowedTransitions: allowed,
      });
    }

    // Update payment status based on new order status
    let newPaymentStatus = order.paymentStatus;
    if (newStatus === 'paid') {
      newPaymentStatus = 'paid';
    } else if (newStatus === 'refunded') {
      newPaymentStatus = 'refunded';
    }

    await prisma.order.update({ where: { id: order.id }, data: { status: newStatus, paymentStatus: newPaymentStatus } });
    await syncTimelineForStatus(order.id, newStatus);

    // If order is now shipped, create or update the shipment
    if (newStatus === 'shipped') {
      const courier = body.courier;
      const trackingId = body.trackingId;
      const estimatedDelivery = body.estimatedDelivery;

      const addressParts = [order.shippingStreet, order.shippingCity, order.shippingState, order.shippingCountry];
      const filteredParts = addressParts.filter(Boolean);
      const destination = filteredParts.length > 0 ? filteredParts.join(', ') : '—';

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

        // Seed tracking milestones for new shipment
        const milestones = [
          { title: 'Order Placed', description: 'Order has been placed and confirmed', location: 'Online', sortOrder: 0 },
          { title: 'Package Prepared', description: 'Package prepared for shipping', location: 'Warehouse', sortOrder: 1 },
          { title: 'In Transit', description: 'Package on its way to you', location: 'Distribution Center', sortOrder: 2 },
          { title: 'Out for Delivery', description: 'Package delivery will be today', location: 'Local Hub', sortOrder: 3 },
          { title: 'Delivered', description: 'Package delivered to your address', location: 'Destination', sortOrder: 4 },
        ];

        for (let i = 0; i < milestones.length; i++) {
          const m = milestones[i];
          await prisma.shipmentTrackingEvent.create({
            data: {
              shipmentId: shipment.id,
              title: m.title,
              description: m.description,
              location: m.location,
              eventStatus: i === 0 ? 'completed' : 'pending',
              occurredAt: i === 0 ? new Date() : null,
              sortOrder: m.sortOrder,
            },
          });
        }

        await advanceShipmentTracking(shipment.id, 'in_transit');
      }
    }

    // If order is delivered, update the shipment too
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
    const param = req.params.orderId as string;
    let order = null;
    const numericId = parseInt(param);
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    } else {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'refunded') {
      return res.status(400).json({ message: 'Order has already been refunded' });
    }

    if (order.status !== 'paid' && order.status !== 'shipped' && order.status !== 'delivered') {
      return res.status(400).json({ message: 'Refund is only allowed for paid, shipped, or delivered orders' });
    }

    const existingRefund = await prisma.orderRefund.findFirst({ where: { orderId: order.id } });
    if (existingRefund) {
      return res.status(400).json({ message: 'A refund has already been processed for this order' });
    }

    const reason = req.body.reason ? req.body.reason.trim() : '';
    if (!reason) {
      return res.status(400).json({ message: 'Refund reason is required' });
    }

    const orderTotal = parseFloat(order.total);
    let requestedAmount = orderTotal;
    if (req.body.amount !== undefined) {
      requestedAmount = parseFloat(String(req.body.amount));
    }

    if (requestedAmount <= 0 || requestedAmount > orderTotal) {
      return res.status(400).json({ message: `Refund amount must be between 0.01 and ${orderTotal}` });
    }

    const refund = await prisma.orderRefund.create({
      data: {
        orderId: order.id,
        amount: requestedAmount.toFixed(2),
        reason,
      },
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
    const param = req.params.orderId as string;
    let order = null;
    const numericId = parseInt(param);
    if (!isNaN(numericId)) {
      order = await prisma.order.findUnique({ where: { id: numericId } });
    } else {
      order = await prisma.order.findFirst({ where: { orderNumber: param.toUpperCase() } });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.customerEmail) {
      return res.status(400).json({ message: 'Order has no customer email for receipt delivery' });
    }

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });

    // Build email body
    let emailBody = `Hello ${order.customerName ?? 'Customer'},\n`;
    emailBody += `Thank you for your order. Here is your receipt for order ${order.orderNumber}.\n`;
    emailBody += `Total: ${order.total}\n\n`;
    emailBody += 'Items:\n';
    for (const item of items) {
      emailBody += `- ${item.productName} x ${item.quantity}: ${item.lineTotal}\n`;
    }

    const subject = `Receipt for Order ${order.orderNumber}`;
    await sendEmail(order.customerEmail, subject, emailBody);

    return res.status(200).json({ message: 'Receipt sent successfully' });
  } catch (error: any) {
    console.error('sendReceipt error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /store/:storeId/shipments/summary
export const getShipmentSummary = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId as string);
    if (isNaN(storeId)) {
      return res.status(400).json({ message: 'Valid storeId is required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const totalShipments = await prisma.shipment.count({ where: { storeId } });
    const pending = await prisma.shipment.count({ where: { storeId, status: 'pending' } });
    const inTransit = await prisma.shipment.count({ where: { storeId, status: 'in_transit' } });
    const delivered = await prisma.shipment.count({ where: { storeId, status: 'delivered' } });
    const delayed = await prisma.shipment.count({ where: { storeId, status: 'delayed' } });

    let alert = null;
    if (delayed > 0) {
      alert = { message: `${delayed} shipment(s) delayed`, delayed };
    }

    return res.status(200).json({ totalShipments, pending, inTransit, delivered, delayed, alert });
  } catch (error: any) {
    console.error('getShipmentSummary error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /store/:storeId/shipments
export const getShipments = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId as string);
    if (isNaN(storeId)) {
      return res.status(400).json({ message: 'Valid storeId is required' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const validShipmentStatuses = ['pending', 'in_transit', 'delivered', 'delayed'];
    const status = req.query.status as string | undefined;
    const search = req.query.search ? (req.query.search as string).trim() : '';

    const where: any = { storeId };

    if (status && validShipmentStatuses.includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { trackingId: { contains: search, mode: 'insensitive' } },
        { courier: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.shipment.findMany({
      where,
      include: { order: { select: { orderNumber: true, customerName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const shipments = [];
    for (const s of rows) {
      shipments.push({
        id: s.id,
        orderId: s.order.orderNumber,
        customerName: s.order.customerName,
        courier: s.courier,
        trackingId: s.trackingId,
        destination: s.destination,
        estimatedDeliveryDate: s.estimatedDelivery,
        status: s.status,
      });
    }

    return res.status(200).json({ shipments });
  } catch (error: any) {
    console.error('getShipments error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// PATCH /shipment/:shipmentId/status
export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId as string);
    if (isNaN(shipmentId)) {
      return res.status(400).json({ message: 'Valid shipmentId is required' });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const validShipmentStatuses = ['pending', 'in_transit', 'delivered', 'delayed'];
    const newStatus = req.body.status ? req.body.status.trim().toLowerCase() : '';

    if (!newStatus || !validShipmentStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'status must be one of: pending, in_transit, delivered, delayed' });
    }

    let isOnTrack = newStatus !== 'delayed';
    if (req.body.isOnTrack !== undefined) {
      isOnTrack = Boolean(req.body.isOnTrack);
    }

    await prisma.shipment.update({ where: { id: shipmentId }, data: { status: newStatus, isOnTrack } });
    await advanceShipmentTracking(shipmentId, newStatus);

    // If shipment is delivered, update the order status too
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
    const trackingId = req.params.trackingId ? (req.params.trackingId as string).trim() : '';
    if (!trackingId) {
      return res.status(400).json({ message: 'trackingId is required' });
    }

    const shipment = await prisma.shipment.findFirst({ where: { trackingId } });
    if (!shipment) {
      return res.status(404).json({ message: 'Tracking ID not found' });
    }

    const order = await prisma.order.findUnique({ where: { id: shipment.orderId } });
    const history = await prisma.shipmentTrackingEvent.findMany({
      where: { shipmentId: shipment.id },
      orderBy: { sortOrder: 'asc' },
    });

    // Map status to human-readable labels
    let currentStatusLabel = shipment.status;
    if (shipment.status === 'pending') currentStatusLabel = 'Pending';
    else if (shipment.status === 'in_transit') currentStatusLabel = 'In Transit';
    else if (shipment.status === 'delivered') currentStatusLabel = 'Delivered';
    else if (shipment.status === 'delayed') currentStatusLabel = 'Delayed';

    let statusMessage = '';
    if (shipment.status === 'pending') statusMessage = 'Your order is being prepared for shipment.';
    else if (shipment.status === 'in_transit') statusMessage = 'Your package is on its way and will be delivered soon.';
    else if (shipment.status === 'delivered') statusMessage = 'Your package has been delivered.';
    else if (shipment.status === 'delayed') statusMessage = 'Your shipment is delayed. We are working to resolve this.';

    const historyList = [];
    for (const e of history) {
      historyList.push({
        title: e.title,
        description: e.description,
        location: e.location,
        timestamp: e.occurredAt,
        status: e.eventStatus === 'completed' ? 'Completed' : 'Pending',
      });
    }

    return res.status(200).json({
      orderId: order ? order.orderNumber : null,
      trackingId: shipment.trackingId,
      courier: shipment.courier,
      destination: shipment.destination,
      estimatedDelivery: shipment.estimatedDelivery,
      currentStatus: currentStatusLabel,
      statusMessage,
      isOnTrack: shipment.isOnTrack,
      history: historyList,
    });
  } catch (error: any) {
    console.error('trackByTrackingId error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// GET /shipment/:shipmentId/track
export const trackShipment = async (req: Request, res: Response) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId as string);
    if (isNaN(shipmentId)) {
      return res.status(400).json({ message: 'Valid shipmentId is required' });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const order = await prisma.order.findUnique({ where: { id: shipment.orderId } });
    const history = await prisma.shipmentTrackingEvent.findMany({
      where: { shipmentId: shipment.id },
      orderBy: { sortOrder: 'asc' },
    });

    // Map status to human-readable labels
    let currentStatusLabel = shipment.status;
    if (shipment.status === 'pending') currentStatusLabel = 'Pending';
    else if (shipment.status === 'in_transit') currentStatusLabel = 'In Transit';
    else if (shipment.status === 'delivered') currentStatusLabel = 'Delivered';
    else if (shipment.status === 'delayed') currentStatusLabel = 'Delayed';

    let statusMessage = '';
    if (shipment.status === 'pending') statusMessage = 'Your order is being prepared for shipment.';
    else if (shipment.status === 'in_transit') statusMessage = 'Your package is on its way and will be delivered soon.';
    else if (shipment.status === 'delivered') statusMessage = 'Your package has been delivered.';
    else if (shipment.status === 'delayed') statusMessage = 'Your shipment is delayed. We are working to resolve this.';

    const historyList = [];
    for (const e of history) {
      historyList.push({
        title: e.title,
        description: e.description,
        location: e.location,
        timestamp: e.occurredAt,
        status: e.eventStatus === 'completed' ? 'Completed' : 'Pending',
      });
    }

    return res.status(200).json({
      orderId: order ? order.orderNumber : null,
      trackingId: shipment.trackingId,
      courier: shipment.courier,
      destination: shipment.destination,
      estimatedDelivery: shipment.estimatedDelivery,
      currentStatus: currentStatusLabel,
      statusMessage,
      isOnTrack: shipment.isOnTrack,
      history: historyList,
    });
  } catch (error: any) {
    console.error('trackShipment error:', error);
    return res.status(500).json({ message: 'An error has occurred', error: error.message });
  }
};

// ─── Helper functions used internally ────────────────────────────────────────

// Mark timeline steps as completed up to the given order status
async function syncTimelineForStatus(orderId: number, status: string) {
  let targetLabel = '';
  if (status === 'paid') targetLabel = 'Payment Confirmed';
  else if (status === 'shipped') targetLabel = 'Order Shipped';
  else if (status === 'delivered') targetLabel = 'Delivered';

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

// Mark shipment tracking events as completed up to the given shipment status
async function advanceShipmentTracking(shipmentId: number, shipmentStatus: string) {
  let targetTitle = '';
  if (shipmentStatus === 'in_transit') targetTitle = 'In Transit';
  else if (shipmentStatus === 'delivered') targetTitle = 'Delivered';

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
    if (event.title === targetTitle) {
      break;
    }
  }
}