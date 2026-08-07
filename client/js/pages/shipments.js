/**
 * Shipments Page — list, summary, tracking detail
 */
const ShipmentsPage = {
  async render() {
    Topbar.setTitle('Shipments');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();
    const params = Router.getParams();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    // Tracking detail
    if (params.track) {
      return this.renderTracking(params.track);
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const [summaryRes, shipmentsRes] = await Promise.allSettled([
        api.get(`/orders/shipments/summary/${store.id}`),
        api.get(`/orders/shipments/${store.id}`),
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : {};
      const shipments = shipmentsRes.status === 'fulfilled' ? (shipmentsRes.value.shipments || []) : [];

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Shipments</h1>
            <p class="page-subtitle">${summary.totalShipments || 0} total shipments</p>
          </div>
          <div class="page-actions">
            <button class="btn" onclick="ShipmentsPage.openTrackByIdModal()">🔍 Track by ID</button>
          </div>
        </div>

        <div class="stat-cards animate-fade-in">
          <div class="stat-card">
            <div class="stat-icon blue">📦</div>
            <div class="stat-label">Total</div>
            <div class="stat-value">${summary.totalShipments || 0}</div>
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

        ${summary.alert ? `<div class="auth-message error" style="margin-top:var(--space-4);">⚠️ ${summary.alert.message}</div>` : ''}

        <div id="shipments-table" style="margin-top:var(--space-6);"></div>
      `;

      Table.render('shipments-table', {
        columns: [
          { key: 'orderId', label: 'Order', render: (r) => `<strong>${r.orderId}</strong>` },
          { key: 'customerName', label: 'Customer' },
          { key: 'courier', label: 'Courier' },
          { key: 'trackingId', label: 'Tracking ID' },
          { key: 'destination', label: 'Destination', render: (r) => `<span class="truncate" style="max-width:200px;display:inline-block;">${r.destination || '—'}</span>` },
          { key: 'status', label: 'Status', render: (r) => {
            const map = { pending: 'badge-warning', in_transit: 'badge-info', delivered: 'badge-success', delayed: 'badge-error' };
            const label = r.status === 'in_transit' ? 'In Transit' : r.status;
            return `<span class="badge ${map[r.status] || 'badge-neutral'}"><span class="dot"></span>${label}</span>`;
          }},
          { key: 'estimatedDeliveryDate', label: 'ETA', render: (r) => r.estimatedDeliveryDate ? new Date(r.estimatedDeliveryDate).toLocaleDateString() : '—' },
        ],
        rows: shipments,
        onRowClick: (row) => Router.navigate(`shipments?track=${row.id}`),
        emptyText: 'No shipments yet',
        emptyIcon: '🚚',
        filterOptions: [
          { value: 'pending', label: 'Pending' },
          { value: 'in_transit', label: 'In Transit' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'delayed', label: 'Delayed' },
        ],
        onFilter: async (status) => {
          const store = AppStore.getStore();
          const url = status ? `/orders/shipments/${store.id}?status=${status}` : `/orders/shipments/${store.id}`;
          try {
            const data = await api.get(url);
            ShipmentsPage.renderFilteredTable(data.shipments || []);
          } catch (err) { Toast.error(err.message); }
        },
      });

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  renderFilteredTable(shipments) {
    const store = AppStore.getStore();
    // Re-render just the table section
    Table.render('shipments-table', {
      columns: [
        { key: 'orderId', label: 'Order', render: (r) => `<strong>${r.orderId}</strong>` },
        { key: 'customerName', label: 'Customer' },
        { key: 'courier', label: 'Courier' },
        { key: 'trackingId', label: 'Tracking ID' },
        { key: 'status', label: 'Status', render: (r) => {
          const map = { pending: 'badge-warning', in_transit: 'badge-info', delivered: 'badge-success', delayed: 'badge-error' };
          return `<span class="badge ${map[r.status] || 'badge-neutral'}">${r.status === 'in_transit' ? 'In Transit' : r.status}</span>`;
        }},
      ],
      rows: shipments,
      onRowClick: (row) => Router.navigate(`shipments?track=${row.id}`),
      emptyText: 'No shipments match',
      emptyIcon: '🚚',
    });
  },

  async renderTracking(shipmentId) {
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/orders/shipment/track/${shipmentId}`);

      content.innerHTML = `
        <div class="page-header">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <button class="btn btn-ghost" onclick="Router.navigate('shipments')">← Back</button>
            <div>
              <h1>Shipment Tracking</h1>
              <p class="page-subtitle">Order ${data.orderId || '—'} • ${data.courier || 'Unknown courier'}</p>
            </div>
          </div>
        </div>

        <div class="order-detail-grid animate-fade-in">
          <div class="order-info-section">
            <div class="card">
              <div class="card-header"><h4>Shipment Info</h4><span class="badge ${data.isOnTrack ? 'badge-success' : 'badge-error'}">${data.isOnTrack ? 'On Track' : 'Delayed'}</span></div>
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-info">${data.currentStatus}</span></span></div>
                <div class="info-item"><span class="info-label">Tracking ID</span><span class="info-value">${data.trackingId || '—'}</span></div>
                <div class="info-item"><span class="info-label">Courier</span><span class="info-value">${data.courier || '—'}</span></div>
                <div class="info-item"><span class="info-label">Destination</span><span class="info-value">${data.destination || '—'}</span></div>
                <div class="info-item"><span class="info-label">Est. Delivery</span><span class="info-value">${data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString() : '—'}</span></div>
              </div>
              <p style="margin-top:var(--space-4);padding:var(--space-3);background:var(--color-bg);border-radius:var(--radius-md);font-size:var(--font-size-sm);">
                ${data.statusMessage}
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h4>Tracking History</h4></div>
            <div class="timeline">
              ${(data.history || []).map(h => `
                <div class="timeline-item ${h.status === 'Completed' ? 'completed' : ''}">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4>${h.title}</h4>
                    <p>${h.description || ''}</p>
                    <p>${h.location || ''} ${h.timestamp ? '• ' + new Date(h.timestamp).toLocaleString() : ''}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div><button class="btn" onclick="Router.navigate('shipments')">← Back</button></div>`;
    }
  },

  openTrackByIdModal() {
    Modal.open({
      title: 'Track Shipment',
      body: `<div class="form-group"><label class="form-label">Tracking ID</label><input class="input" name="trackingId" placeholder="Enter tracking ID"></div>`,
      submitText: 'Track',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.trackingId) { Toast.error('Enter a tracking ID'); throw new Error('Validation'); }
        try {
          const result = await api.get(`/orders/track/${data.trackingId}`);
          Modal.close();
          // Show tracking info as a toast and navigate
          Toast.info(`Status: ${result.currentStatus}`);
        } catch (err) {
          Toast.error(err.message);
          throw err;
        }
      },
    });
  },
};

window.ShipmentsPage = ShipmentsPage;
