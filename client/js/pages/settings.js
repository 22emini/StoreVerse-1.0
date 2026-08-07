/**
 * Settings Page — store info, regions/tax, theme customization, staff
 */
const SettingsPage = {
  _activeTab: 'general',

  async render() {
    Topbar.setTitle('Settings');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Settings</h1>
          <p class="page-subtitle">${store.storeName}</p>
        </div>
      </div>

      <div class="settings-layout animate-fade-in">
        <div class="settings-nav">
          <button class="nav-item ${this._activeTab === 'general' ? 'active' : ''}" onclick="SettingsPage.switchTab('general')">⚙️ General</button>
          <button class="nav-item ${this._activeTab === 'regions' ? 'active' : ''}" onclick="SettingsPage.switchTab('regions')">🌍 Regions & Tax</button>
          <button class="nav-item ${this._activeTab === 'theme' ? 'active' : ''}" onclick="SettingsPage.switchTab('theme')">🎨 Theme</button>
          <button class="nav-item ${this._activeTab === 'staff' ? 'active' : ''}" onclick="SettingsPage.switchTab('staff')">👤 Staff</button>
        </div>
        <div id="settings-content"><div class="loading-spinner"></div></div>
      </div>
    `;

    this.switchTab(this._activeTab);
  },

  async switchTab(tab) {
    this._activeTab = tab;
    // Update nav active state
    document.querySelectorAll('.settings-nav .nav-item').forEach(el => {
      el.classList.toggle('active', el.textContent.toLowerCase().includes(tab === 'regions' ? 'regions' : tab));
    });

    const container = document.getElementById('settings-content');
    container.innerHTML = '<div class="loading-spinner"></div>';

    switch (tab) {
      case 'general': return this.renderGeneral(container);
      case 'regions': return this.renderRegions(container);
      case 'theme': return this.renderTheme(container);
      case 'staff': return this.renderStaff(container);
    }
  },

  async renderGeneral(container) {
    const store = AppStore.getStore();
    try {
      const data = await api.get(`/store/getstore/${store.id}`);
      const s = data.store;

      container.innerHTML = `
        <div class="settings-section">
          <h3>Store Information</h3>
          <p class="section-desc">Update your store's basic information.</p>

          <form id="settings-general-form">
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
                <label class="form-label">Currency</label>
                <input class="input" name="currency" value="${s.currency || ''}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Country</label>
                <input class="input" name="country" value="${s.country || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Time Zone</label>
                <input class="input" name="timeZone" value="${s.timeZone || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Business Address</label>
              <input class="input" name="businessAddress" value="${s.businessAddress || ''}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Contact Email</label>
                <input class="input" name="contactEmail" value="${s.contactEmail || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input class="input" name="phoneNumber" value="${s.phoneNumber || ''}">
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:var(--space-2);">Save Changes</button>
          </form>
        </div>
      `;

      document.getElementById('settings-general-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Saving...';
        try {
          const formData = {};
          e.target.querySelectorAll('input').forEach(input => {
            if (input.name) formData[input.name] = input.value;
          });
          await api.put(`/store/UpdateStore/${store.id}`, formData);
          Toast.success('Settings saved!');
          await AppStore.loadStores();
          Topbar.render();
        } catch (err) {
          Toast.error(err.message);
        }
        btn.disabled = false;
        btn.textContent = 'Save Changes';
      });
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  async renderRegions(container) {
    const store = AppStore.getStore();
    try {
      const data = await api.get(`/store/get-country/${store.id}`);
      const regions = data.regions || [];

      container.innerHTML = `
        <div class="settings-section" style="max-width:100%;">
          <h3>Regions & Tax</h3>
          <p class="section-desc">Manage shipping regions and tax rates for your store.</p>
          <button class="btn btn-primary btn-sm" onclick="SettingsPage.openAddRegionModal()" style="margin-bottom:var(--space-4);">+ Add Region</button>
          <div id="regions-table"></div>
        </div>
      `;

      Table.render('regions-table', {
        columns: [
          { key: 'country', label: 'Country' },
          { key: 'code', label: 'Code' },
          { key: 'taxRate', label: 'Tax Rate', render: (r) => r.taxRate ? `${r.taxRate}%` : '—' },
          { key: 'shippingZone', label: 'Shipping Zone' },
          { key: 'status', label: 'Status', render: (r) => {
            const cls = r.status === 'active' ? 'badge-success' : 'badge-neutral';
            return `<span class="badge ${cls}">${r.status || 'active'}</span>`;
          }},
        ],
        rows: regions,
        searchable: false,
        emptyText: 'No regions configured',
        emptyIcon: '🌍',
      });
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  openAddRegionModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Add Region',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Country *</label><input class="input" name="country" required></div>
          <div class="form-group"><label class="form-label">Code</label><input class="input" name="code" placeholder="US" maxlength="3"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tax Rate (%)</label><input class="input" name="taxRate" placeholder="10"></div>
          <div class="form-group"><label class="form-label">Shipping Zone</label><input class="input" name="shippingZone" placeholder="Zone A"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="select" name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      `,
      submitText: 'Add Region',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.country) { Toast.error('Country is required'); throw new Error('Validation'); }
        data.storeId = store.id;
        await api.post('/store/add-tax', data);
        Modal.close();
        Toast.success('Region added!');
        SettingsPage.switchTab('regions');
      },
    });
  },

  async renderTheme(container) {
    const store = AppStore.getStore();
    try {
      let theme = {};
      try {
        const data = await api.get(`/store/get-color/${store.id}`);
        theme = data.customize || data || {};
      } catch {}

      container.innerHTML = `
        <div class="settings-section">
          <h3>Theme Customization</h3>
          <p class="section-desc">Customize your store's appearance.</p>

          <form id="theme-form">
            <div class="form-group">
              <label class="form-label">Primary Color</label>
              <div class="color-picker-group">
                <input type="color" id="color-preview" class="color-preview" value="${theme.primaryColor || '#5c6ac4'}" name="primaryColor">
                <input class="input" name="primaryColorText" value="${theme.primaryColor || '#5c6ac4'}" style="max-width:120px;" oninput="document.getElementById('color-preview').value=this.value">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Font Family</label>
              <select class="select" name="fontFamily">
                <option value="Inter" ${theme.fontFamily === 'Inter' ? 'selected' : ''}>Inter</option>
                <option value="Roboto" ${theme.fontFamily === 'Roboto' ? 'selected' : ''}>Roboto</option>
                <option value="Outfit" ${theme.fontFamily === 'Outfit' ? 'selected' : ''}>Outfit</option>
                <option value="Poppins" ${theme.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins</option>
                <option value="Open Sans" ${theme.fontFamily === 'Open Sans' ? 'selected' : ''}>Open Sans</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Store Logo URL</label>
              <input class="input" name="storeLogoUrl" value="${theme.storeLogoUrl || ''}" placeholder="https://...">
            </div>
            <button type="submit" class="btn btn-primary">Save Theme</button>
          </form>
        </div>
      `;

      // Sync color picker ↔ text input
      document.getElementById('color-preview').addEventListener('input', (e) => {
        document.querySelector('[name="primaryColorText"]').value = e.target.value;
      });

      document.getElementById('theme-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Saving...';
        try {
          const formData = {};
          e.target.querySelectorAll('input, select').forEach(input => {
            if (input.name && input.name !== 'primaryColorText') formData[input.name] = input.value;
          });
          // Use color picker value
          formData.primaryColor = document.getElementById('color-preview').value;
          formData.storeId = store.id;
          await api.post('/store/customize', formData);
          Toast.success('Theme updated!');
        } catch (err) {
          Toast.error(err.message);
        }
        btn.disabled = false;
        btn.textContent = 'Save Theme';
      });
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  async renderStaff(container) {
    const store = AppStore.getStore();
    try {
      const data = await api.get(`/store/get-staff/${store.id}`);
      const staff = data.staff || [];

      container.innerHTML = `
        <div class="settings-section" style="max-width:100%;">
          <h3>Staff</h3>
          <p class="section-desc">Manage staff roles for your store.</p>
          <button class="btn btn-primary btn-sm" onclick="SettingsPage.openAddStaffModal()" style="margin-bottom:var(--space-4);">+ Add Staff</button>
          <div id="staff-table"></div>
        </div>
      `;

      Table.render('staff-table', {
        columns: [
          { key: 'name', label: 'Name', render: (r) => {
            const initial = (r.name || r.email || 'S').charAt(0).toUpperCase();
            return `<div style="display:flex;align-items:center;gap:8px;"><div class="avatar avatar-sm">${initial}</div>${r.name || '—'}</div>`;
          }},
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (r) => `<span class="badge badge-primary">${r.role || '—'}</span>` },
          { key: 'status', label: 'Status', render: (r) => {
            const cls = r.status === 'active' ? 'badge-success' : 'badge-neutral';
            return `<span class="badge ${cls}">${r.status || 'active'}</span>`;
          }},
          { key: 'actions', label: '', render: (r) => `
            <div class="table-actions">
              <button class="btn btn-sm" onclick="event.stopPropagation(); SettingsPage.openEditStaffModal(${r.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); SettingsPage.deleteStaff(${r.id})">Delete</button>
            </div>
          ` },
        ],
        rows: staff,
        searchable: false,
        emptyText: 'No staff members',
        emptyIcon: '👤',
      });
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  openAddStaffModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Add Staff',
      body: `
        <div class="form-group"><label class="form-label">Name</label><input class="input" name="name"></div>
        <div class="form-group"><label class="form-label">Email *</label><input class="input" name="email" type="email" required></div>
        <div class="form-group"><label class="form-label">Role</label>
          <select class="select" name="role">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      `,
      submitText: 'Add Staff',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.email) { Toast.error('Email is required'); throw new Error('Validation'); }
        data.storeId = store.id;
        await api.post('/store/add-role', data);
        Modal.close();
        Toast.success('Staff added!');
        SettingsPage.switchTab('staff');
      },
    });
  },

  async openEditStaffModal(staffId) {
    Modal.open({
      title: 'Edit Staff',
      body: `
        <div class="form-group"><label class="form-label">Name</label><input class="input" name="name"></div>
        <div class="form-group"><label class="form-label">Role</label>
          <select class="select" name="role">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="select" name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      `,
      submitText: 'Save',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        await api.put(`/store/update-staff/${staffId}`, data);
        Modal.close();
        Toast.success('Staff updated!');
        SettingsPage.switchTab('staff');
      },
    });
  },

  async deleteStaff(staffId) {
    if (!confirm('Remove this staff member?')) return;
    try {
      await api.del(`/store/delete-staff/${staffId}`);
      Toast.success('Staff removed');
      SettingsPage.switchTab('staff');
    } catch (err) {
      Toast.error(err.message);
    }
  },
};

window.SettingsPage = SettingsPage;
