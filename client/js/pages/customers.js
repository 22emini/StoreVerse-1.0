/**
 * Customers Page — list, add, detail view with notes/tags/segments
 */
const CustomersPage = {
  async render() {
    Topbar.setTitle('Customers');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();
    const params = Router.getParams();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    // If detail view requested
    if (params.id) {
      return this.renderDetail(params.id);
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/customer/get-customers/${store.id}`);
      const customers = data.customers || [];

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Customers</h1>
            <p class="page-subtitle">${customers.length} customer${customers.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="page-actions">
            <button class="btn" onclick="Router.navigate('customers?tab=segments')">🏷️ Segments</button>
            <button class="btn btn-primary" onclick="CustomersPage.openAddModal()">+ Add Customer</button>
          </div>
        </div>

        ${params.tab === 'segments' ? '<div id="segments-section"></div>' : ''}
        <div id="customers-table" class="animate-fade-in"></div>
      `;

      if (params.tab === 'segments') {
        await this.renderSegments();
      }

      Table.render('customers-table', {
        columns: [
          { key: 'name', label: 'Customer', render: (r) => {
            const name = [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Unnamed';
            const initial = name.charAt(0).toUpperCase();
            return `<div style="display:flex;align-items:center;gap:8px;"><div class="avatar avatar-sm">${initial}</div><strong>${name}</strong></div>`;
          }},
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'orderCount', label: 'Orders', render: (r) => r.orderCount || 0 },
          { key: 'totalSpent', label: 'Total Spent', render: (r) => r.totalSpent ? `${store.currency || '$'}${r.totalSpent}` : '—' },
          { key: 'status', label: 'Status', render: (r) => {
            const cls = r.status === 'active' ? 'badge-success' : 'badge-neutral';
            return `<span class="badge ${cls}">${r.status || 'active'}</span>`;
          }},
        ],
        rows: customers,
        onRowClick: (row) => Router.navigate(`customers?id=${row.customerId}`),
        emptyText: 'No customers yet',
        emptyIcon: '👥',
      });

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  async renderDetail(customerId) {
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();
    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/customer/get-customer/${customerId}`);
      const c = data.customer || data;
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed';
      const initial = name.charAt(0).toUpperCase();

      // Load notes and tags
      let notes = [], tags = [];
      try { notes = (await api.get(`/customer/get-notes/${customerId}`)).notes || []; } catch {}
      try { tags = (await api.get(`/customer/get-tags/${customerId}`)).tags || []; } catch {}

      content.innerHTML = `
        <div class="page-header">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <button class="btn btn-ghost" onclick="Router.navigate('customers')">← Back</button>
            <h1>${name}</h1>
          </div>
          <div class="page-actions">
            <button class="btn" onclick="CustomersPage.openSendMessageModal(${customerId})">✉️ Send Message</button>
            <button class="btn btn-primary" onclick="CustomersPage.openEditModal(${customerId})">Edit</button>
          </div>
        </div>

        <div class="customer-detail-layout animate-fade-in">
          <div class="customer-sidebar-info">
            <div class="card customer-profile">
              <div class="avatar avatar-xl">${initial}</div>
              <h3>${name}</h3>
              <p style="font-size:var(--font-size-sm);">${c.email || ''}</p>
              <p style="font-size:var(--font-size-sm);">${c.phone || ''}</p>
              <div style="margin-top:var(--space-3);">
                <span class="badge ${c.status === 'active' ? 'badge-success' : 'badge-neutral'}">${c.status || 'active'}</span>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h4>Details</h4>
              </div>
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Address</span><span class="info-value">${c.address || '—'}</span></div>
                <div class="info-item"><span class="info-label">Language</span><span class="info-value">${c.preferedLanguage || '—'}</span></div>
                <div class="info-item"><span class="info-label">Currency</span><span class="info-value">${c.preferedCurrency || '—'}</span></div>
                <div class="info-item"><span class="info-label">Orders</span><span class="info-value">${c.orderCount || 0}</span></div>
                <div class="info-item"><span class="info-label">Total Spent</span><span class="info-value">${c.totalSpent ? (store.currency || '$') + c.totalSpent : '—'}</span></div>
                <div class="info-item"><span class="info-label">Email Marketing</span><span class="info-value">${c.emailMarketing ? '✓ Yes' : '✕ No'}</span></div>
              </div>
            </div>
          </div>

          <div>
            <!-- Tags -->
            <div class="card" style="margin-bottom:var(--space-4);">
              <div class="card-header">
                <h4>Tags</h4>
                <button class="btn btn-sm" onclick="CustomersPage.openAddTagModal(${customerId})">+ Add Tag</button>
              </div>
              <div class="tags-list" id="customer-tags">
                ${(typeof tags === 'string' ? tags.split(',') : (Array.isArray(tags) ? tags : [])).filter(Boolean).map(t => {
                  const tag = typeof t === 'string' ? t.trim() : t;
                  return `<span class="tag">${tag} <span class="tag-remove" onclick="CustomersPage.removeTag(${customerId}, '${tag}')">✕</span></span>`;
                }).join('') || '<span class="text-secondary text-sm">No tags</span>'}
              </div>
            </div>

            <!-- Notes -->
            <div class="card">
              <div class="card-header">
                <h4>Notes</h4>
                <button class="btn btn-sm" onclick="CustomersPage.openAddNoteModal(${customerId})">+ Add Note</button>
              </div>
              <div class="notes-list" id="customer-notes">
                ${Array.isArray(notes) && notes.length > 0 ? notes.map(n => `
                  <div class="note-item">
                    <div>${n.content || n.notes || n}</div>
                    <div class="note-date">${n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                  </div>
                `).join('') : '<span class="text-secondary text-sm">No notes yet</span>'}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div><button class="btn" onclick="Router.navigate('customers')">← Back</button></div>`;
    }
  },

  openAddModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Add Customer',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">First Name *</label><input class="input" name="firstName" required></div>
          <div class="form-group"><label class="form-label">Last Name</label><input class="input" name="lastName"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Email</label><input class="input" name="email" type="email"></div>
          <div class="form-group"><label class="form-label">Phone</label><input class="input" name="phone"></div>
        </div>
        <div class="form-group"><label class="form-label">Address</label><input class="input" name="address"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Preferred Language</label><input class="input" name="preferedLanguage" placeholder="en"></div>
          <div class="form-group"><label class="form-label">Preferred Currency</label><input class="input" name="preferedCurrency" placeholder="USD"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label"><input type="checkbox" name="emailMarketing" style="margin-right:6px;">Email Marketing</label></div>
          <div class="form-group"><label class="form-label"><input type="checkbox" name="smsMarketing" style="margin-right:6px;">SMS Marketing</label></div>
        </div>
      `,
      submitText: 'Add Customer',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.firstName) { Toast.error('First name is required'); throw new Error('Validation'); }
        data.storeId = store.id;
        await api.post('/customer/add-customer', data);
        Modal.close();
        Toast.success('Customer added!');
        CustomersPage.render();
      },
    });
  },

  async openEditModal(customerId) {
    try {
      const data = await api.get(`/customer/get-customer/${customerId}`);
      const c = data.customer || data;
      Modal.open({
        title: 'Edit Customer',
        body: `
          <div class="form-row">
            <div class="form-group"><label class="form-label">First Name</label><input class="input" name="firstName" value="${c.firstName || ''}"></div>
            <div class="form-group"><label class="form-label">Last Name</label><input class="input" name="lastName" value="${c.lastName || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Email</label><input class="input" name="email" value="${c.email || ''}"></div>
            <div class="form-group"><label class="form-label">Phone</label><input class="input" name="phone" value="${c.phone || ''}"></div>
          </div>
          <div class="form-group"><label class="form-label">Address</label><input class="input" name="address" value="${c.address || ''}"></div>
        `,
        submitText: 'Save',
        onSubmit: async () => {
          const formData = Modal.getFormData();
          await api.put(`/customer/update-customer/${customerId}`, formData);
          Modal.close();
          Toast.success('Customer updated!');
          Router.navigate(`customers?id=${customerId}`);
        },
      });
    } catch (err) { Toast.error(err.message); }
  },

  openAddNoteModal(customerId) {
    Modal.open({
      title: 'Add Note',
      body: `<div class="form-group"><label class="form-label">Note</label><textarea class="textarea" name="notes" placeholder="Write a note..."></textarea></div>`,
      submitText: 'Add Note',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        await api.post(`/customer/add-note/${customerId}`, data);
        Modal.close();
        Toast.success('Note added!');
        Router.navigate(`customers?id=${customerId}`);
      },
    });
  },

  openAddTagModal(customerId) {
    Modal.open({
      title: 'Add Tag',
      body: `<div class="form-group"><label class="form-label">Tag</label><input class="input" name="tags" placeholder="VIP, Premium, etc."></div>`,
      submitText: 'Add Tag',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        await api.post(`/customer/add-tag/${customerId}`, data);
        Modal.close();
        Toast.success('Tag added!');
        Router.navigate(`customers?id=${customerId}`);
      },
    });
  },

  async removeTag(customerId, tag) {
    try {
      await api.del(`/customer/delete-tag/${customerId}?tag=${encodeURIComponent(tag)}`);
      Toast.success('Tag removed');
      Router.navigate(`customers?id=${customerId}`);
    } catch (err) { Toast.error(err.message); }
  },

  openSendMessageModal(customerId) {
    Modal.open({
      title: 'Send Message',
      body: `
        <div class="form-group"><label class="form-label">Subject</label><input class="input" name="subject" placeholder="Subject"></div>
        <div class="form-group"><label class="form-label">Message</label><textarea class="textarea" name="message" placeholder="Your message..."></textarea></div>
      `,
      submitText: 'Send',
      onSubmit: async () => {
        const data = Modal.getFormData();
        await api.post(`/customer/send-message/${customerId}`, data);
        Modal.close();
        Toast.success('Message sent!');
      },
    });
  },

  async renderSegments() {
    const store = AppStore.getStore();
    try {
      const data = await api.get(`/customer/get-segments/${store.id}`);
      const segments = data.segments || [];
      const el = document.getElementById('segments-section');
      if (!el) return;

      el.innerHTML = `
        <div class="card" style="margin-bottom:var(--space-4);">
          <div class="card-header">
            <h4>Customer Segments</h4>
            <button class="btn btn-sm btn-primary" onclick="CustomersPage.openCreateSegmentModal()">+ Create Segment</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);">
            ${segments.map(s => `
              <div class="tag" style="padding:8px 12px;font-size:var(--font-size-sm);">
                <strong>${s.name}</strong> — ${s.description || 'No description'}
                <span class="badge badge-neutral" style="margin-left:4px;">${s.type}</span>
              </div>
            `).join('') || '<span class="text-secondary text-sm">No segments created</span>'}
          </div>
        </div>
      `;
    } catch {}
  },

  openCreateSegmentModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Create Segment',
      body: `
        <div class="form-group"><label class="form-label">Name *</label><input class="input" name="name" required></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="textarea" name="description"></textarea></div>
        <div class="form-group"><label class="form-label">Conditions (JSON)</label><input class="input" name="conditions" placeholder='{"minOrders": 5}'></div>
      `,
      submitText: 'Create',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.name) { Toast.error('Name is required'); throw new Error('Validation'); }
        await api.post(`/customer/create-segment/${store.id}`, data);
        Modal.close();
        Toast.success('Segment created!');
        CustomersPage.render();
      },
    });
  },
};

window.CustomersPage = CustomersPage;
