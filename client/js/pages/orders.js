/**
 * Orders Page — list, detail, create, status updates, refunds, receipts
 */
const OrdersPage = {
  async render() {
    Topbar.setTitle('Orders');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();
    const params = Router.getParams();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    // Detail view
    if (params.id) {
      return this.renderDetail(params.id);
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const [summaryRes, ordersRes] = await Promise.allSettled([
        api.get(`/orders/summary/${store.id}`),
        api.get(`/orders/${store.id}`),
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : {};
      const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.orders || []) : [];

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Orders</h1>
            <p class="page-subtitle">${summary.totalOrders || 0} total orders</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="OrdersPage.openCreateModal()">+ Create Order</button>
          </div>
        </div>

        <div class="stat-cards animate-fade-in">
          <div class="stat-card">
            <div class="stat-icon blue">🛒</div>
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">${summary.totalOrders || 0}</div>
            <div class="stat-trend ${(summary.growthPercent || 0) >= 0 ? 'up' : 'down'}">
              ${(summary.growthPercent || 0) >= 0 ? '↑' : '↓'} ${Math.abs(summary.growthPercent || 0)}%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">⏳</div>
            <div class="stat-label">Pending</div>
            <div class="stat-value">${summary.pending || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon teal">🚚</div>
            <div class="stat-label">In Transit</div>
            <div class="stat-value">${summary.inTransit || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">✓</div>
            <div class="stat-label">Delivered</div>
            <div class="stat-value">${summary.delivered || 0}</div>
          </div>
        </div>

        <div id="orders-table" style="margin-top:var(--space-6);"></div>
      `;

      this._orders = orders;
      this.renderOrdersTable(orders);

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  renderOrdersTable(orders) {
    const store = AppStore.getStore();
    Table.render('orders-table', {
      columns: [
        { key: 'orderNumber', label: 'Order', render: (r) => `<strong>${r.orderNumber}</strong>` },
        { key: 'customerName', label: 'Customer' },
        { key: 'itemCount', label: 'Items' },
        { key: 'total', label: 'Total', render: (r) => `${store.currency || '$'}${r.total}` },
        { key: 'status', label: 'Status', render: (r) => {
          const map = { pending: 'badge-warning', paid: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', refunded: 'badge-error' };
          return `<span class="badge ${map[r.status] || 'badge-neutral'}"><span class="dot"></span>${r.status}</span>`;
        }},
        { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
      ],
      rows: orders,
      onRowClick: (row) => Router.navigate(`orders?id=${row.id}`),
      emptyText: 'No orders yet',
      emptyIcon: '🛒',
      filterOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'refunded', label: 'Refunded' },
      ],
      onFilter: async (status) => {
        const store = AppStore.getStore();
        const url = status ? `/orders/${store.id}?status=${status}` : `/orders/${store.id}`;
        try {
          const data = await api.get(url);
          OrdersPage.renderOrdersTable(data.orders || []);
        } catch (err) { Toast.error(err.message); }
      },
    });
  },

  async renderDetail(orderId) {
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();
    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/orders/order/${orderId}`);
      const o = data.order;

      content.innerHTML = `
        <div class="page-header">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <button class="btn btn-ghost" onclick="Router.navigate('orders')">← Back</button>
            <div>
              <h1>${o.orderNumber}</h1>
              <p class="page-subtitle">Created ${new Date(o.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div class="page-actions">
            <button class="btn" onclick="OrdersPage.sendReceipt(${o.id})">📧 Send Receipt</button>
            ${o.status !== 'refunded' ? `<button class="btn btn-danger" onclick="OrdersPage.openRefundModal(${o.id}, '${o.refundableAmount}')">↩ Refund</button>` : ''}
            ${o.status !== 'refunded' ? `<button class="btn btn-primary" onclick="OrdersPage.openStatusModal(${o.id}, '${o.status}')">Update Status</button>` : ''}
          </div>
        </div>

        <div class="order-detail-grid animate-fade-in">
          <div class="order-info-section">
            <!-- Order Info -->
            <div class="card">
              <div class="card-header"><h4>Order Details</h4><span class="badge ${this.badgeClass(o.status)}"><span class="dot"></span>${o.status}</span></div>
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Customer</span><span class="info-value">${o.customerName || '—'}</span></div>
                <div class="info-item"><span class="info-label">Email</span><span class="info-value">${o.customerEmail || '—'}</span></div>
                <div class="info-item"><span class="info-label">Phone</span><span class="info-value">${o.customerPhone || '—'}</span></div>
                <div class="info-item"><span class="info-label">Payment</span><span class="info-value">${o.paymentMethod || '—'} <span class="badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}">${o.paymentStatus}</span></span></div>
              </div>
            </div>

            <!-- Line Items -->
            <div class="card">
              <div class="card-header"><h4>Items (${o.itemCount})</h4></div>
              <table class="line-items-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th style="text-align:right">Total</th></tr></thead>
                <tbody>
                  ${(o.lineItems || []).map(item => `
                    <tr>
                      <td>${item.productName}${item.variantAttributes && Object.keys(item.variantAttributes).length ? ` <span class="text-secondary text-xs">(${Object.values(item.variantAttributes).join(', ')})</span>` : ''}</td>
                      <td>${item.quantity}</td>
                      <td>${store.currency || '$'}${item.unitPrice}</td>
                      <td style="text-align:right">${store.currency || '$'}${item.lineTotal}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row"><td colspan="3">Subtotal</td><td style="text-align:right">${store.currency || '$'}${o.subtotal}</td></tr>
                  <tr><td colspan="3" style="color:var(--color-text-secondary);border:none;">Tax</td><td style="text-align:right;border:none;">${store.currency || '$'}${o.tax}</td></tr>
                  <tr><td colspan="3" style="color:var(--color-text-secondary);border:none;">Shipping</td><td style="text-align:right;border:none;">${store.currency || '$'}${o.shippingFee}</td></tr>
                  <tr class="total-row"><td colspan="3"><strong>Total</strong></td><td style="text-align:right"><strong>${store.currency || '$'}${o.total}</strong></td></tr>
                </tbody>
              </table>
            </div>

            <!-- Shipping -->
            <div class="card">
              <div class="card-header"><h4>Shipping Address</h4></div>
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Recipient</span><span class="info-value">${o.shippingRecipient || '—'}</span></div>
                <div class="info-item"><span class="info-label">Street</span><span class="info-value">${o.shippingStreet || '—'}</span></div>
                <div class="info-item"><span class="info-label">City</span><span class="info-value">${o.shippingCity || '—'}</span></div>
                <div class="info-item"><span class="info-label">State</span><span class="info-value">${o.shippingState || '—'}</span></div>
                <div class="info-item"><span class="info-label">Postal</span><span class="info-value">${o.shippingPostal || '—'}</span></div>
                <div class="info-item"><span class="info-label">Country</span><span class="info-value">${o.shippingCountry || '—'}</span></div>
              </div>
            </div>

            ${o.refund ? `
              <div class="card" style="border-color:var(--color-error);">
                <div class="card-header"><h4 style="color:var(--color-error);">Refund</h4></div>
                <div class="info-grid">
                  <div class="info-item"><span class="info-label">Amount</span><span class="info-value">${store.currency || '$'}${o.refund.amount}</span></div>
                  <div class="info-item"><span class="info-label">Reason</span><span class="info-value">${o.refund.reason}</span></div>
                  <div class="info-item"><span class="info-label">Processed</span><span class="info-value">${new Date(o.refund.processedAt).toLocaleString()}</span></div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Timeline -->
          <div>
            <div class="card">
              <div class="card-header"><h4>Timeline</h4></div>
              <div class="timeline">
                ${(o.timeline || []).map((t, i) => {
                  const cls = t.completed ? 'completed' : '';
                  return `
                    <div class="timeline-item ${cls}">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <h4>${t.statusLabel}</h4>
                        <p>${t.description || ''}</p>
                        ${t.occurredAt ? `<p style="margin-top:2px;">${new Date(t.occurredAt).toLocaleString()}</p>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            ${o.shipment ? `
              <div class="card" style="margin-top:var(--space-4);">
                <div class="card-header"><h4>Shipment</h4></div>
                <div class="info-grid">
                  <div class="info-item"><span class="info-label">Courier</span><span class="info-value">${o.shipment.courier || '—'}</span></div>
                  <div class="info-item"><span class="info-label">Tracking ID</span><span class="info-value">${o.shipment.trackingId || '—'}</span></div>
                  <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-info">${o.shipment.status}</span></span></div>
                  <div class="info-item"><span class="info-label">Destination</span><span class="info-value">${o.shipment.destination || '—'}</span></div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div><button class="btn" onclick="Router.navigate('orders')">← Back</button></div>`;
    }
  },

  badgeClass(status) {
    return { pending: 'badge-warning', paid: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', refunded: 'badge-error' }[status] || 'badge-neutral';
  },

  openStatusModal(orderId, currentStatus) {
    const transitions = { pending: ['paid'], paid: ['shipped'], shipped: ['delivered'] };
    const allowed = transitions[currentStatus] || [];

    Modal.open({
      title: 'Update Order Status',
      body: `
        <p style="margin-bottom:var(--space-3);font-size:var(--font-size-sm);color:var(--color-text-secondary);">Current status: <strong>${currentStatus}</strong></p>
        <div class="form-group">
          <label class="form-label">New Status</label>
          <select class="select" name="status">
            ${allowed.map(s => `<option value="${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </div>
        ${allowed.includes('shipped') ? `
          <div class="form-group"><label class="form-label">Courier</label><input class="input" name="courier" placeholder="DHL, FedEx, etc."></div>
          <div class="form-group"><label class="form-label">Tracking ID</label><input class="input" name="trackingId" placeholder="TRK-123456"></div>
          <div class="form-group"><label class="form-label">Estimated Delivery</label><input class="input" name="estimatedDelivery" type="date"></div>
        ` : ''}
      `,
      submitText: 'Update',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        await api.patch(`/orders/status/${orderId}`, data);
        Modal.close();
        Toast.success('Order status updated!');
        Router.navigate(`orders?id=${orderId}`);
      },
    });
  },

  openRefundModal(orderId, maxAmount) {
    Modal.open({
      title: 'Process Refund',
      body: `
        <p style="margin-bottom:var(--space-3);font-size:var(--font-size-sm);color:var(--color-text-secondary);">Max refundable: <strong>$${maxAmount}</strong></p>
        <div class="form-group">
          <label class="form-label">Amount</label>
          <input class="input" name="amount" type="number" step="0.01" value="${maxAmount}">
        </div>
        <div class="form-group">
          <label class="form-label">Reason *</label>
          <textarea class="textarea" name="reason" placeholder="Reason for refund" required></textarea>
        </div>
      `,
      submitText: 'Process Refund',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.reason) { Toast.error('Reason is required'); throw new Error('Validation'); }
        await api.post(`/orders/refund/${orderId}`, data);
        Modal.close();
        Toast.success('Refund processed!');
        Router.navigate(`orders?id=${orderId}`);
      },
    });
  },

  async sendReceipt(orderId) {
    try {
      await api.post(`/orders/receipt/${orderId}`, {});
      Toast.success('Receipt sent to customer!');
    } catch (err) {
      Toast.error(err.message);
    }
  },

  openCreateModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Create Order',
      size: 'lg',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Customer Name</label><input class="input" name="customerName"></div>
          <div class="form-group"><label class="form-label">Customer Email</label><input class="input" name="customerEmail" type="email"></div>
        </div>
        <div class="form-group"><label class="form-label">Customer Phone</label><input class="input" name="customerPhone"></div>

        <hr style="border:none;border-top:1px solid var(--color-divider);margin:var(--space-4) 0;">
        <h4 style="margin-bottom:var(--space-3);">Items</h4>
        <div id="order-items-list">
          <div class="form-row" style="margin-bottom:var(--space-2);">
            <input class="input" name="item_name_0" placeholder="Product name">
            <input class="input" name="item_qty_0" type="number" value="1" placeholder="Qty" style="max-width:80px;">
            <input class="input" name="item_price_0" type="number" step="0.01" placeholder="Price">
          </div>
        </div>
        <button class="btn btn-sm" type="button" onclick="OrdersPage.addItemRow()">+ Add item</button>

        <hr style="border:none;border-top:1px solid var(--color-divider);margin:var(--space-4) 0;">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tax</label><input class="input" name="tax" type="number" step="0.01" value="0"></div>
          <div class="form-group"><label class="form-label">Shipping Fee</label><input class="input" name="shippingFee" type="number" step="0.01" value="0"></div>
        </div>
        <div class="form-group"><label class="form-label">Payment Method</label><input class="input" name="paymentMethod" placeholder="e.g. card, cash, transfer"></div>
      `,
      submitText: 'Create Order',
      onSubmit: async () => {
        const formData = Modal.getFormData();
        const items = [];
        let i = 0;
        while (formData[`item_name_${i}`] !== undefined) {
          if (formData[`item_name_${i}`]) {
            items.push({
              productName: formData[`item_name_${i}`],
              quantity: parseInt(formData[`item_qty_${i}`]) || 1,
              unitPrice: formData[`item_price_${i}`] || '0',
            });
          }
          i++;
        }
        if (items.length === 0) { Toast.error('Add at least one item'); throw new Error('Validation'); }

        const body = {
          storeId: store.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          tax: formData.tax,
          shippingFee: formData.shippingFee,
          paymentMethod: formData.paymentMethod,
          items,
        };
        await api.post('/orders/', body);
        Modal.close();
        Toast.success('Order created!');
        OrdersPage.render();
      },
    });

    this._itemCount = 1;
  },

  _itemCount: 1,

  addItemRow() {
    const list = document.getElementById('order-items-list');
    const i = this._itemCount++;
    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.marginBottom = 'var(--space-2)';
    row.innerHTML = `
      <input class="input" name="item_name_${i}" placeholder="Product name">
      <input class="input" name="item_qty_${i}" type="number" value="1" placeholder="Qty" style="max-width:80px;">
      <input class="input" name="item_price_${i}" type="number" step="0.01" placeholder="Price">
    `;
    list.appendChild(row);
  },
};

window.OrdersPage = OrdersPage;
