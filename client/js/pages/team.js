/**
 * Team Page — team members list, invite, remove
 */
const TeamPage = {
  async render() {
    Topbar.setTitle('Team');
    const content = document.getElementById('page-content');
    const store = AppStore.getStore();

    if (!store) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No store selected</div><button class="btn btn-primary" onclick="Router.navigate('stores')">Go to Stores</button></div>`;
      return;
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await api.get(`/team/${store.id}`);
      const members = data.data || data.members || data.team || [];

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Team</h1>
            <p class="page-subtitle">${members.length} member${members.length !== 1 ? 's' : ''} in ${store.storeName}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="TeamPage.openInviteModal()">+ Invite Member</button>
          </div>
        </div>

        <div id="team-table" class="animate-fade-in"></div>
      `;

      Table.render('team-table', {
        columns: [
          { key: 'name', label: 'Member', render: (r) => {
            const name = r.name || r.email;
            const initial = name.charAt(0).toUpperCase();
            return `<div style="display:flex;align-items:center;gap:8px;"><div class="avatar avatar-sm">${initial}</div><div><strong>${name}</strong><br><span class="text-secondary text-xs">${r.email}</span></div></div>`;
          }},
          { key: 'role', label: 'Role', render: (r) => `<span class="badge badge-primary">${r.role || 'Member'}</span>` },
          { key: 'status', label: 'Status', render: (r) => {
            const statusMap = {
              active: 'badge-success',
              invited: 'badge-warning',
              expired: 'badge-error',
            };
            return `<span class="badge ${statusMap[r.status] || 'badge-neutral'}"><span class="dot"></span>${r.status || 'invited'}</span>`;
          }},
          { key: 'createdAt', label: 'Joined', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
          { key: 'actions', label: '', render: (r) => `<button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); TeamPage.removeMember(${r.id})">Remove</button>` },
        ],
        rows: members,
        emptyText: 'No team members yet',
        emptyIcon: '👤',
      });

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">${err.message}</div></div>`;
    }
  },

  openInviteModal() {
    const store = AppStore.getStore();
    Modal.open({
      title: 'Invite Team Member',
      body: `
        <p style="margin-bottom:var(--space-4);font-size:var(--font-size-sm);color:var(--color-text-secondary);">
          An invite email with a secure link will be sent to the member.
        </p>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="input" name="email" type="email" placeholder="member@example.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="input" name="name" placeholder="Member name">
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="select" name="role">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      `,
      submitText: 'Send Invite',
      size: 'sm',
      onSubmit: async () => {
        const data = Modal.getFormData();
        if (!data.email) { Toast.error('Email is required'); throw new Error('Validation'); }
        data.storeId = store.id;
        await api.post('/team/invite', data);
        Modal.close();
        Toast.success('Invite sent!');
        TeamPage.render();
      },
    });
  },

  async removeMember(memberId) {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.del(`/team/${memberId}`);
      Toast.success('Team member removed');
      TeamPage.render();
    } catch (err) {
      Toast.error(err.message);
    }
  },
};

window.TeamPage = TeamPage;
