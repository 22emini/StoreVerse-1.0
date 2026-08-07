/**
 * Inventory Page — warehouses, inventory table, stock adjustment
 */
const InventoryPage = {
  async render() {
    Topbar.setTitle('Inventory');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><div class="empty-text">Select a store first.</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const [summaryRes, inventoryRes, warehouseRes] = await Promise.allSettled([
        api.get(`/inventory/summary/${store.id}`),
        api.get(`/inventory/store-inventory/${store.id}`),
        api.get(`/inventory/warehouses/${store.id}`),
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : {};
      const inventory = inventoryRes.status === 'fulfilled' ? (inventoryRes.value.inventory || []) : [];
      const warehouses = warehouseRes.status === 'fulfilled' ? (warehouseRes.value.warehouses || []) : [];

      const totalItems = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
      const lowStock = inventory.filter(i => i.quantity < 10).length;

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Inventory</h1>
            <p class="page-subtitle">Manage stock across ${warehouses.length} warehouse${warehouses.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="page-actions">
            <button class="btn" onclick="InventoryPage.openWarehouseModal()">🏭 Add Warehouse</button>
            <button class="btn btn-primary" onclick="InventoryPage.openAddInventoryModal()">+ Add Inventory</button>
          </div>
        </div>

        <div class="stat-cards animate-fade-in">
          <div class="stat-card">
            <div class="stat-icon blue">📊</div>
            <div class="stat-label">Total Items</div>
            <div class="stat-value">${totalItems.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">⚠️</div>
            <div class="stat-label">Low Stock</div>
            <div class="stat-value">${lowStock}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon teal">🏭</div>
            <div class="stat-label">Warehouses</div>
            <div class="stat-value">${warehouses.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">📦</div>
            <div class="stat-label">SKUs Tracked</div>
            <div class="stat-value">${inventory.length}</div>
          </div>
        </div>

        <div style="margin-top:var(--space-6);">
          <div class="tabs">
            <button class="tab active" onclick="InventoryPage.showTab('inventory', this)">Inventory</button>
            <button class="tab" onclick="InventoryPage.showTab('warehouses', this)">Warehouses</button>
          </div>
          <div id="inventory-tab-content"></div>
        </div>
      `;

      // Store data for tab switching
      this._inventory = inventory;
      this._warehouses = warehouses;
      this.showInventoryTable();

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Failed to load inventory</div><div class="empty-text">${err.message}</div></div>`;
    }
  },

  showTab(tab, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (tab === 'inventory') this.showInventoryTable();
    else this.showWarehousesTable();
  },

  showInventoryTable() {
    Table.render('inventory-tab-content', {
      columns: [
        { key: 'product', label: 'Product', render: (r) => r.product?.name || `Product #${r.productId}` },
        { key: 'warehouse', label: 'Warehouse', render: (r) => r.warehouse?.name || `WH #${r.warehouseId}` },
        { key: 'quantity', label: 'Quantity', render: (r) => {
          const q = r.quantity || 0;
          if (q === 0) return '<span class="badge badge-error">0</span>';
          if (q < 10) return `<span class="badge badge-warning">${q}</span>`;
          return `<span class="badge badge-success">${q}</span>`;
        }},
        { key: 'updatedAt', label: 'Last Updated', render: (r) => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—' },
        { key: 'actions', label: '', render: (r) => `<button class="btn btn-sm" onclick="event.stopPropagation(); InventoryPage.openAdjustModal(${r.id}, ${r.quantity})">Adjust</button>` },
      ],
      rows: this._inventory,
      emptyText: 'No inventory items',
      emptyIcon: '📦',
    });
  },

  showWarehousesTable() {
    Table.render('inventory-tab-content', {
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Warehouse Name' },
        { key: 'createdAt', label: 'Created', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      ],
      rows: this._warehouses,
      emptyText: 'No warehouses',
      emptyIcon: '🏭',
    });
  },

  openWarehouseModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Add Warehouse',
      body: `
        <div class="form-group">
          <label class="form-label">Warehouse Name *</label>
          <input class="input" name="name" placeholder="Main Warehouse" required>
        </div>
      `,
      submitText: 'Create',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.name) { Toast.error('Name is required'); throw new Error('Validation'); }
        data.storeId = store.id;
        await api.post('/inventory/add-warehouse', data);
        Modal.close();
        Toast.success('Warehouse created!');
        InventoryPage.render();
      },
    });
  },

  openAddInventoryModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Add Inventory Item',
      body: `
        <div class="form-group">
          <label class="form-label">Product ID *</label>
          <input class="input" name="productId" type="number" placeholder="Product ID" required>
        </div>
        <div class="form-group">
          <label class="form-label">Warehouse ID *</label>
          <input class="input" name="warehouseId" type="number" placeholder="Warehouse ID" required>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input class="input" name="quantity" type="number" value="0">
        </div>
      `,
      submitText: 'Add',
      onSubmit: async () => {
        const data = Modal.getFormData();
        data.storeId = store.id;
        data.productId = parseInt(data.productId);
        data.warehouseId = parseInt(data.warehouseId);
        data.quantity = parseInt(data.quantity) || 0;
        await api.post('/inventory/add-inventory', data);
        Modal.close();
        Toast.success('Inventory item added!');
        InventoryPage.render();
      },
    });
  },

  openAdjustModal(inventoryId, currentQty) {
    Modal.open({
      title: 'Adjust Stock',
      body: `
        <p style="margin-bottom:var(--space-4);color:var(--color-text-secondary);font-size:var(--font-size-sm);">Current quantity: <strong>${currentQty}</strong></p>
        <div class="form-group">
          <label class="form-label">New Quantity</label>
          <input class="input" name="quantity" type="number" value="${currentQty}">
        </div>
      `,
      submitText: 'Update',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        await api.put(`/inventory/adjust-stock/${inventoryId}`, { quantity: parseInt(data.quantity) });
        Modal.close();
        Toast.success('Stock adjusted!');
        InventoryPage.render();
      },
    });
  },
};

window.InventoryPage = InventoryPage;
