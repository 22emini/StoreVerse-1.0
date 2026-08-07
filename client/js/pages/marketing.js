/**
 * Marketing Page — campaigns list, create, delete
 */
const MarketingPage = {
  async render() {
    Topbar.setTitle('Marketing');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/campaign/store/${store.id}`);
      const campaigns = data.campaigns || [];

      // Aggregate stats
      const totalSent = campaigns.reduce((s, c) => s + (c.sent || 0), 0);
      const totalOpens = campaigns.reduce((s, c) => s + (c.opens || 0), 0);
      const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
      const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Marketing</h1>
            <p class="page-subtitle">${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="MarketingPage.openCreateModal()">+ Create Campaign</button>
          </div>
        </div>

        <div class="stat-cards animate-fade-in">
          <div class="stat-card">
            <div class="stat-icon blue">📣</div>
            <div class="stat-label">Campaigns</div>
            <div class="stat-value">${campaigns.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">📨</div>
            <div class="stat-label">Sent</div>
            <div class="stat-value">${totalSent.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon teal">👁️</div>
            <div class="stat-label">Opens</div>
            <div class="stat-value">${totalOpens.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">🎯</div>
            <div class="stat-label">Conversions</div>
            <div class="stat-value">${totalConversions.toLocaleString()}</div>
          </div>
        </div>

        <div id="campaigns-table" style="margin-top:var(--space-6);"></div>
      `;

      Table.render('campaigns-table', {
        columns: [
          { key: 'name', label: 'Campaign', render: (r) => `<strong>${r.name}</strong>` },
          { key: 'channel', label: 'Channel', render: (r) => `<span class="badge badge-primary">${r.channel}</span>` },
          { key: 'customerSegment', label: 'Segment' },
          { key: 'status', label: 'Status', render: (r) => {
            const cls = r.status === 'active' ? 'badge-success' : r.status === 'draft' ? 'badge-neutral' : 'badge-warning';
            return `<span class="badge ${cls}">${r.status}</span>`;
          }},
          { key: 'audience', label: 'Audience', render: (r) => (r.audience || 0).toLocaleString() },
          { key: 'sent', label: 'Sent' },
          { key: 'opens', label: 'Opens' },
          { key: 'clicks', label: 'Clicks' },
          { key: 'actions', label: '', render: (r) => `<button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); MarketingPage.deleteCampaign(${r.id})">Delete</button>` },
        ],
        rows: campaigns,
        emptyText: 'No campaigns yet',
        emptyIcon: '📣',
      });

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  openCreateModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Create Campaign',
      body: `
        <div class="form-group">
          <label class="form-label">Campaign Name *</label>
          <input class="input" name="name" placeholder="Summer Sale Blast" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Channel *</label>
            <select class="select" name="channel">
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push Notification</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Customer Segment *</label>
            <input class="input" name="customerSegment" placeholder="All Customers">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Message Content *</label>
          <textarea class="textarea" name="messageContent" placeholder="Write your campaign message..." rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Schedule</label>
            <select class="select" name="schedule">
              <option value="send_now">Send Now</option>
              <option value="scheduled">Schedule for Later</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Scheduled Date</label>
            <input class="input" name="scheduledAt" type="datetime-local">
          </div>
        </div>
      `,
      submitText: 'Create Campaign',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.name || !data.messageContent || !data.customerSegment) {
          Toast.error('Please fill in all required fields');
          throw new Error('Validation');
        }
        data.storeId = store.id;
        if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt).toISOString();
        await api.post('/campaign/add', data);
        Modal.close();
        Toast.success('Campaign created!');
        MarketingPage.render();
      },
    });
  },

  async deleteCampaign(id) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.del(`/campaign/delete/${id}`);
      Toast.success('Campaign deleted');
      MarketingPage.render();
    } catch (err) {
      Toast.error(err.message);
    }
  },
};

window.MarketingPage = MarketingPage;
