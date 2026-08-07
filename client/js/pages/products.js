/**
 * Products Page — list, add, edit, bulk upload
 */
const ProductsPage = {
  async render() {
    Topbar.setTitle('Products');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><div class="empty-text">Select a store first.</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/product/store-products/${store.id}`);
      const products = data.products || [];

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Products</h1>
            <p class="page-subtitle">${products.length} product${products.length !== 1 ? 's' : ''} in ${store.storeName}</p>
          </div>
          <div class="page-actions">
            <button class="btn" onclick="ProductsPage.openBulkUploadModal()">⬆ Bulk Upload</button>
            <button class="btn btn-primary" onclick="ProductsPage.openAddModal()">+ Add Product</button>
          </div>
        </div>
        <div id="products-table" class="animate-fade-in"></div>
      `;

      Table.render('products-table', {
        columns: [
          { key: 'name', label: 'Product', render: (r) => `<strong>${r.name || '—'}</strong>` },
          { key: 'category', label: 'Category' },
          { key: 'price', label: 'Price', render: (r) => r.price ? `${store.currency || '$'}${r.price}` : '—' },
          { key: 'stock', label: 'Stock', render: (r) => {
            const stock = r.stock ?? 0;
            if (stock === 0) return '<span class="badge badge-error">Out of stock</span>';
            if (stock < 10) return `<span class="badge badge-warning">${stock}</span>`;
            return `<span class="badge badge-success">${stock}</span>`;
          }},
          { key: 'status', label: 'Status', render: (r) => {
            const cls = r.status === 'active' ? 'badge-success' : r.status === 'draft' ? 'badge-neutral' : 'badge-warning';
            return `<span class="badge ${cls}">${r.status || 'active'}</span>`;
          }},
          { key: 'sku', label: 'SKU' },
        ],
        rows: products,
        onRowClick: (row) => ProductsPage.openEditModal(row.id),
        emptyText: 'No products yet',
        emptyIcon: '📦',
        actions: '<button class="btn btn-sm btn-primary" onclick="ProductsPage.openAddModal()">+ Add</button>',
      });

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Failed to load products</div><div class="empty-text">${err.message}</div></div>`;
    }
  },

  openAddModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Add Product',
      body: `
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input class="input" name="name" placeholder="Product name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="textarea" name="description" placeholder="Product description"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <input class="input" name="category" placeholder="e.g. Electronics">
          </div>
          <div class="form-group">
            <label class="form-label">Price *</label>
            <input class="input" name="price" type="number" step="0.01" placeholder="0.00" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Stock</label>
            <input class="input" name="stock" type="number" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">SKU</label>
            <input class="input" name="sku" placeholder="SKU-001">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Barcode</label>
            <input class="input" name="barcode" placeholder="Barcode">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="select" name="status">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input class="input" name="image" placeholder="https://...">
        </div>
      `,
      submitText: 'Add Product',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.name) { Toast.error('Product name is required'); throw new Error('Validation'); }
        data.storeId = store.id;
        if (data.stock) data.stock = parseInt(data.stock);
        await api.post('/product/add-product', data);
        Modal.close();
        Toast.success('Product added!');
        ProductsPage.render();
      },
    });
  },

  async openEditModal(productId) {
    try {
      const data = await api.get(`/product/get-product/${productId}`);
      const p = data.product || data;

      Modal.open({
        title: 'Edit Product',
        body: `
          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input class="input" name="name" value="${p.name || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="textarea" name="description">${p.description || ''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <input class="input" name="category" value="${p.category || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Price</label>
              <input class="input" name="price" type="number" step="0.01" value="${p.price || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Stock</label>
              <input class="input" name="stock" type="number" value="${p.stock || 0}">
            </div>
            <div class="form-group">
              <label class="form-label">SKU</label>
              <input class="input" name="sku" value="${p.sku || ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="select" name="status">
              <option value="active" ${p.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="archived" ${p.status === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
        `,
        submitText: 'Save Changes',
        onSubmit: async () => {
          const formData = Modal.getFormData();
          if (formData.stock) formData.stock = parseInt(formData.stock);
          await api.put(`/product/update-product/${productId}`, formData);
          Modal.close();
          Toast.success('Product updated!');
          ProductsPage.render();
        },
      });
    } catch (err) {
      Toast.error(err.message);
    }
  },

  openBulkUploadModal() {
    Modal.open({
      title: 'Bulk Upload Products',
      body: `
        <p style="margin-bottom:var(--space-4);color:var(--color-text-secondary);font-size:var(--font-size-sm);">
          Upload a CSV or Excel file with columns: name, description, category, price, stock, sku, barcode, status.
        </p>
        <div class="form-group">
          <label class="form-label">File</label>
          <input class="input" type="file" id="bulk-file" accept=".csv,.xlsx,.xls">
        </div>
      `,
      submitText: 'Upload',
      onSubmit: async () => {
        const fileInput = document.getElementById('bulk-file');
        if (!fileInput.files[0]) { Toast.error('Please select a file'); throw new Error('No file'); }
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('storeId', AppStore.getStore().id);
        // Use raw fetch for FormData
        const res = await fetch('http://localhost:5000/api/product/bulk-upload', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Upload failed');
        Modal.close();
        Toast.success(result.message || 'Products uploaded!');
        ProductsPage.render();
      },
    });
  },
};

window.ProductsPage = ProductsPage;
