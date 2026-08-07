/**
 * Sidebar Navigation Component
 */
const Sidebar = {
  render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <div class="brand-logo">S</div>
        <span class="brand-name">StoreVerse</span>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Main</div>
          <a class="nav-item" data-route="overview" onclick="Router.navigate('overview')">
            <span class="nav-icon">📊</span> Overview
          </a>
          <a class="nav-item" data-route="stores" onclick="Router.navigate('stores')">
            <span class="nav-icon">🏪</span> Stores
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-label">Catalog</div>
          <a class="nav-item" data-route="products" onclick="Router.navigate('products')">
            <span class="nav-icon">📦</span> Products
          </a>
          <a class="nav-item" data-route="inventory" onclick="Router.navigate('inventory')">
            <span class="nav-icon">🏭</span> Inventory
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-label">Sales</div>
          <a class="nav-item" data-route="orders" onclick="Router.navigate('orders')">
            <span class="nav-icon">🛒</span> Orders
          </a>
          <a class="nav-item" data-route="shipments" onclick="Router.navigate('shipments')">
            <span class="nav-icon">🚚</span> Shipments
          </a>
          <a class="nav-item" data-route="customers" onclick="Router.navigate('customers')">
            <span class="nav-icon">👥</span> Customers
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-label">Engage</div>
          <a class="nav-item" data-route="marketing" onclick="Router.navigate('marketing')">
            <span class="nav-icon">📣</span> Marketing
          </a>
          <a class="nav-item" data-route="team" onclick="Router.navigate('team')">
            <span class="nav-icon">👤</span> Team
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-label">Config</div>
          <a class="nav-item" data-route="settings" onclick="Router.navigate('settings')">
            <span class="nav-icon">⚙️</span> Settings
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <a class="nav-item" onclick="AppStore.clear(); window.location.href='index.html';">
          <span class="nav-icon">🚪</span> Log out
        </a>
      </div>
    `;
  },

  toggle() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  },
};

window.Sidebar = Sidebar;
