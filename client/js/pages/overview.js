/**
 * Overview Page — Dashboard home
 */
const OverviewPage = {
  async render() {
    Topbar.setTitle('Overview');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();

    if (!store) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏪</div>
          <div class="empty-title">No store selected</div>
          <div class="empty-text">Create or select a store to see your dashboard overview.</div>
          <button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button>
        </div>`;
      return;
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      // Fetch data in parallel
      const [orderSummary, products, customers, orders] = await Promise.allSettled([
        api.get(`/orders/summary/${store.id}`),
        api.get(`/product/store-products/${store.id}`),
        api.get(`/customer/get-customers/${store.id}`),
        api.get(`/orders/${store.id}`),
      ]);

      const os = orderSummary.status === 'fulfilled' ? orderSummary.value : {};
      const prods = products.status === 'fulfilled' ? (products.value.products || []) : [];
      const custs = customers.status === 'fulfilled' ? (customers.value.customers || []) : [];
      const ords = orders.status === 'fulfilled' ? (orders.value.orders || []) : [];

      // Calculate revenue
      const revenue = ords.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p class="page-subtitle">${store.storeName} — Overview</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="Router.navigate('orders')">View Orders</button>
          </div>
        </div>

        <!-- Stat Cards -->
        <div class="stat-cards animate-fade-in">
          <div class="stat-card">
            <div class="stat-icon blue">🛒</div>
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">${os.totalOrders || 0}</div>
            <div class="stat-trend ${(os.growthPercent || 0) >= 0 ? 'up' : 'down'}">
              ${(os.growthPercent || 0) >= 0 ? '↑' : '↓'} ${Math.abs(os.growthPercent || 0)}% from last month
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">💰</div>
            <div class="stat-label">Revenue</div>
            <div class="stat-value">${store.currency || '$'}${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon teal">👥</div>
            <div class="stat-label">Customers</div>
            <div class="stat-value">${custs.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">📦</div>
            <div class="stat-label">Products</div>
            <div class="stat-value">${prods.length}</div>
          </div>
        </div>

        <!-- Charts + Recent Orders -->
        <div class="overview-grid" style="margin-top:var(--space-6);">
          <div class="card">
            <div class="card-header">
              <h4>Order Status</h4>
            </div>
            <div class="chart-container">
              <canvas id="order-status-chart"></canvas>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h4>Quick Actions</h4>
            </div>
            <div class="quick-actions" style="flex-direction:column;">
              <button class="btn" onclick="Router.navigate('products')" style="justify-content:flex-start;width:100%;">
                📦 Add a new product
              </button>
              <button class="btn" onclick="Router.navigate('orders')" style="justify-content:flex-start;width:100%;">
                🛒 Create an order
              </button>
              <button class="btn" onclick="Router.navigate('customers')" style="justify-content:flex-start;width:100%;">
                👥 Add a customer
              </button>
              <button class="btn" onclick="Router.navigate('marketing')" style="justify-content:flex-start;width:100%;">
                📣 Start a campaign
              </button>
              <button class="btn" onclick="Router.navigate('team')" style="justify-content:flex-start;width:100%;">
                👤 Invite team member
              </button>
            </div>
          </div>

          <div class="card full-width">
            <div class="card-header">
              <h4>Recent Orders</h4>
              <button class="btn btn-sm" onclick="Router.navigate('orders')">View all</button>
            </div>
            <div id="recent-orders-table"></div>
          </div>
        </div>
      `;

      // Render order status donut chart
      const pending = os.pending || 0;
      const inTransit = os.inTransit || 0;
      const delivered = os.delivered || 0;
      Charts.donut('order-status-chart', [
        { label: 'Pending', value: pending, color: '#f49342' },
        { label: 'Shipped', value: inTransit, color: '#47c1bf' },
        { label: 'Delivered', value: delivered, color: '#50b83c' },
      ]);

      // Recent orders table
      const recentOrders = ords.slice(0, 5);
      Table.render('recent-orders-table', {
        columns: [
          { key: 'orderNumber', label: 'Order' },
          { key: 'customerName', label: 'Customer' },
          { key: 'itemCount', label: 'Items' },
          { key: 'total', label: 'Total', render: (r) => `${store.currency || '$'}${r.total}` },
          { key: 'status', label: 'Status', render: (r) => OverviewPage.statusBadge(r.status) },
          { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
        ],
        rows: recentOrders,
        searchable: false,
        onRowClick: (row) => Router.navigate(`orders?id=${row.id}`),
        emptyText: 'No orders yet',
        emptyIcon: '🛒',
      });

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Failed to load overview</div><div class="empty-text">${err.message}</div></div>`;
    }
  },

  statusBadge(status) {
    const map = {
      pending: 'badge-warning',
      paid: 'badge-info',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      refunded: 'badge-error',
    };
    return `<span class="badge ${map[status] || 'badge-neutral'}"><span class="dot"></span>${status}</span>`;
  },
};

window.OverviewPage = OverviewPage;
