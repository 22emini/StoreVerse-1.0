/**
 * Top Bar Component
 * Shows store selector, user info, and mobile hamburger.
 */
const Topbar = {
  render() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const user = AppStore.getUser();
    const store = AppStore.getStore();
    const stores = AppStore.getStores();
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U');

    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="hamburger" onclick="Sidebar.toggle()">☰</button>
        <h1 class="topbar-title" id="topbar-page-title">Dashboard</h1>
      </div>
      <div class="topbar-right">
        <div class="dropdown" id="store-dropdown">
          <button class="store-selector" onclick="Topbar.toggleStoreDropdown()">
            🏪 <span>${store?.storeName || 'Select Store'}</span> ▾
          </button>
          <div class="dropdown-menu" id="store-dropdown-menu">
            ${stores.map(s => `
              <button class="dropdown-item ${s.id === store?.id ? 'active' : ''}" 
                      onclick="Topbar.selectStore(${s.id})">
                ${s.storeName || 'Unnamed Store'}
              </button>
            `).join('')}
            ${stores.length === 0 ? '<div class="dropdown-item" style="color:var(--color-text-disabled)">No stores yet</div>' : ''}
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="Router.navigate('stores')">
              + Create new store
            </button>
          </div>
        </div>

        <div class="dropdown" id="user-dropdown">
          <div class="user-menu" onclick="Topbar.toggleUserDropdown()">
            <div class="user-info">
              <div class="user-name">${user?.name || 'User'}</div>
              <div class="user-email">${user?.email || ''}</div>
            </div>
            <div class="avatar">${initial}</div>
          </div>
          <div class="dropdown-menu" id="user-dropdown-menu">
            <button class="dropdown-item" onclick="Router.navigate('settings')">
              ⚙️ Settings
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" onclick="AppStore.clear(); window.location.href='index.html';">
              🚪 Log out
            </button>
          </div>
        </div>
      </div>
    `;

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#store-dropdown')) {
        document.getElementById('store-dropdown')?.classList.remove('open');
      }
      if (!e.target.closest('#user-dropdown')) {
        document.getElementById('user-dropdown')?.classList.remove('open');
      }
    });
  },

  toggleStoreDropdown() {
    document.getElementById('store-dropdown').classList.toggle('open');
    document.getElementById('user-dropdown').classList.remove('open');
  },

  toggleUserDropdown() {
    document.getElementById('user-dropdown').classList.toggle('open');
    document.getElementById('store-dropdown').classList.remove('open');
  },

  selectStore(storeId) {
    const stores = AppStore.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      AppStore.setStore(store);
      this.render();
      // Re-render current page to reflect new store
      const route = Router.current();
      const handler = Router.routes[route];
      if (handler) handler();
    }
  },

  setTitle(title) {
    const el = document.getElementById('topbar-page-title');
    if (el) el.textContent = title;
  },
};

window.Topbar = Topbar;
