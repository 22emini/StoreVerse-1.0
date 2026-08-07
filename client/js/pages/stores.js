/**
 * Stores Page — list, create, edit, and select stores
 */
const StoresPage = {
  async render() {
    Topbar.setTitle('Stores');
    const content = document.getElementById('page-content');
    const user = AppStore.getUser();

    if (!user) return;

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/store/user-stores/${user.id}`);
      const stores = data.stores || [];
      AppStore.setStores(stores);

      const currentStore = AppStore.getStore();

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Your Stores</h1>
            <p class="page-subtitle">${stores.length} store${stores.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="StoresPage.openCreateModal()">+ Create Store</button>
          </div>
        </div>
        <div class="store-cards-grid animate-fade-in" id="stores-grid"></div>
      `;

      const grid = document.getElementById('stores-grid');

      if (stores.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;">
            <div class="empty-icon">🏪</div>
            <div class="empty-title">No stores yet</div>
            <div class="empty-text">Create your first store to start selling.</div>
            <button class="btn btn-primary" onclick="StoresPage.openCreateModal()">Create Store</button>
          </div>`;
        return;
      }

      grid.innerHTML = stores.map(s => `
        <div class="store-card ${currentStore?.id === s.id ? 'selected' : ''}" onclick="StoresPage.selectStore(${s.id})">
          <div class="store-header">
            <div class="store-icon">🏪</div>
            <div>
              <div class="store-name">${s.storeName || 'Unnamed Store'}</div>
              <div class="store-category">${s.category || 'No category'}</div>
            </div>
            <div style="margin-left:auto;">
              ${s.isActive ? '<span class="badge badge-success"><span class="dot"></span>Active</span>' : '<span class="badge badge-neutral">Inactive</span>'}
            </div>
          </div>
          <div class="store-meta">
            <div class="store-meta-item">📍 <strong>${s.country || '—'}</strong></div>
            <div class="store-meta-item">💰 <strong>${s.currency || '—'}</strong></div>
            <div class="store-meta-item">🌐 <strong>${s.subDomain || '—'}</strong></div>
          </div>
          <div style="margin-top:var(--space-3); display:flex; gap:var(--space-2);">
            <button class="btn btn-sm" onclick="event.stopPropagation(); StoresPage.openEditModal(${s.id})">Edit</button>
            ${currentStore?.id === s.id 
              ? '<span class="badge badge-primary">Selected</span>' 
              : `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); StoresPage.selectStore(${s.id})">Select</button>`}
          </div>
        </div>
      `).join('');

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Failed to load stores</div><div class="empty-text">${err.message}</div></div>`;
    }
  },

  selectStore(storeId) {
    const stores = AppStore.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      AppStore.setStore(store);
      Topbar.render();
      Toast.success(`Switched to ${store.storeName}`);
      this.render();
    }
  },

  openCreateModal() {
    const user = AppStore.getUser();
    Modal.open({
      title: 'Create Store',
      body: `
        <div class="form-group">
          <label class="form-label">Store Name *</label>
          <input class="input" name="storeName" placeholder="My Awesome Store" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="select" name="category">
              <option value="">Select category</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Food & Beverage</option>
              <option>Home & Garden</option>
              <option>Health & Beauty</option>
              <option>Sports</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Country</label>
            <input class="input" name="country" placeholder="United States">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Currency</label>
            <input class="input" name="currency" placeholder="USD" maxlength="3">
          </div>
          <div class="form-group">
            <label class="form-label">Subdomain *</label>
            <input class="input" name="subDomain" placeholder="my-store">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Business Address</label>
          <input class="input" name="businessAddress" placeholder="123 Main St, City">
        </div>
      `,
      submitText: 'Create Store',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.storeName || !data.subDomain) {
          Toast.error('Store name and subdomain are required');
          throw new Error('Validation failed');
        }
        data.userId = user.id;
        await api.post('/store/add-store', data);
        Modal.close();
        Toast.success('Store created successfully!');
        await AppStore.loadStores();
        Topbar.render();
        StoresPage.render();
      },
    });
  },

  async openEditModal(storeId) {
    try {
      const data = await api.get(`/store/getstore/${storeId}`);
      const s = data.store;

      Modal.open({
        title: 'Edit Store',
        body: `
          <div class="form-group">
            <label class="form-label">Store Name</label>
            <input class="input" name="storeName" value="${s.storeName || ''}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <input class="input" name="category" value="${s.category || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input class="input" name="country" value="${s.country || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Currency</label>
              <input class="input" name="currency" value="${s.currency || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input class="input" name="contactEmail" value="${s.contactEmail || ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input class="input" name="phoneNumber" value="${s.phoneNumber || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Business Address</label>
            <input class="input" name="businessAddress" value="${s.businessAddress || ''}">
          </div>
        `,
        submitText: 'Save Changes',
        onSubmit: async () => {
          const formData = Modal.getFormData();
          await api.put(`/store/UpdateStore/${storeId}`, formData);
          Modal.close();
          Toast.success('Store updated!');
          await AppStore.loadStores();
          Topbar.render();
          StoresPage.render();
        },
      });
    } catch (err) {
      Toast.error(err.message);
    }
  },
};

window.StoresPage = StoresPage;
