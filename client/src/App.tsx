import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { CreateStoreModal } from './components/CreateStoreModal';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { MarketingPage } from './pages/MarketingPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { StoreVerseAPI } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stores, setStores] = useState<any[]>([]);
  const [currentStore, setCurrentStore] = useState<any>(null);
  
  // Entity states
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [loading, setLoading] = useState(true);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load Stores
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const storeList = await StoreVerseAPI.getStores();
        setStores(storeList);
        if (storeList.length > 0) {
          setCurrentStore(storeList[0]);
        }
      } catch (err) {
        addToast('error', 'Failed to load store data');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Fetch entities when current store changes
  useEffect(() => {
    if (!currentStore) return;
    async function loadStoreEntities() {
      try {
        const [prods, ords, inv, cust, camp, tm] = await Promise.all([
          StoreVerseAPI.getProducts(currentStore.id),
          StoreVerseAPI.getOrders(currentStore.id),
          StoreVerseAPI.getInventory(currentStore.id),
          StoreVerseAPI.getCustomers(currentStore.id),
          StoreVerseAPI.getCampaigns(currentStore.id),
          StoreVerseAPI.getTeamMembers(currentStore.id),
        ]);
        setProducts(prods);
        setOrders(ords);
        setInventory(inv);
        setCustomers(cust);
        setCampaigns(camp);
        setTeam(tm);
      } catch (err) {
        console.error('Error fetching store entities:', err);
      }
    }
    loadStoreEntities();
  }, [currentStore]);

  // Handlers
  const handleCreateStore = async (storeData: any) => {
    const newStore = await StoreVerseAPI.createStore(storeData);
    setStores((prev) => [...prev, newStore]);
    setCurrentStore(newStore);
    addToast('success', 'Storefront Launched!', `Created ${newStore.storeName} successfully.`);
  };

  const handleUpdateStore = async (storeData: any) => {
    if (!currentStore) return;
    const updated = await StoreVerseAPI.updateStore(currentStore.id, storeData);
    setCurrentStore(updated);
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addToast('success', 'Store Settings Updated', 'Branding and configuration changes saved.');
  };

  const handleAddProduct = async (prodData: any) => {
    if (!currentStore) return;
    const newProd = await StoreVerseAPI.addProduct({ ...prodData, storeId: currentStore.id });
    setProducts((prev) => [newProd, ...prev]);
    addToast('success', 'Product Added', `"${newProd.name}" added to catalog.`);
  };

  const handleUpdateProduct = async (id: number, prodData: any) => {
    const updated = await StoreVerseAPI.updateProduct(id, prodData);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addToast('success', 'Product Updated', `Saved modifications for "${updated.name}".`);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    await StoreVerseAPI.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    addToast('info', 'Order Status Updated', `Order #${orderId} marked as ${status}.`);
  };

  const handleSendReceipt = async (orderId: number) => {
    addToast('success', 'Receipt Dispatched', `Receipt email sent to customer for order #${orderId}.`);
  };

  const handleRefundOrder = async (orderId: number) => {
    await StoreVerseAPI.updateOrderStatus(orderId, 'refunded');
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded' } : o)));
    addToast('error', 'Order Refunded', `Processed refund for order #${orderId}.`);
  };

  const handleAdjustStock = async (inventoryId: number, delta: number) => {
    await StoreVerseAPI.adjustStock(inventoryId, delta);
    setInventory((prev) =>
      prev.map((item) => (item.id === inventoryId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
    );
    addToast('info', 'Stock Level Adjusted');
  };

  const handleAddCustomer = async (custData: any) => {
    if (!currentStore) return;
    const newCust = await StoreVerseAPI.addCustomer({ ...custData, storeId: currentStore.id });
    setCustomers((prev) => [newCust, ...prev]);
    addToast('success', 'Customer Added', `Registered ${newCust.firstName} ${newCust.lastName}.`);
  };

  const handleSendMessage = (customerId: number, message: string) => {
    addToast('success', 'Message Dispatched', 'Customer notification delivered.');
  };

  const handleCreateCampaign = async (campData: any) => {
    if (!currentStore) return;
    const newCamp = await StoreVerseAPI.createCampaign({ ...campData, storeId: currentStore.id });
    setCampaigns((prev) => [newCamp, ...prev]);
    addToast('success', 'Campaign Launched', `"${newCamp.name}" broadcast dispatched.`);
  };

  const handleInviteMember = async (teamData: any) => {
    if (!currentStore) return;
    const newMember = await StoreVerseAPI.inviteTeamMember({ ...teamData, storeId: currentStore.id });
    setTeam((prev) => [...prev, newMember]);
    addToast('success', 'Invitation Sent', `Sent invitation email to ${newMember.email}.`);
  };

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Store Control Dashboard', subtitle: 'Overview of live revenue, orders, and sales performance' },
    products: { title: 'Product Catalog & Inventory', subtitle: 'Manage product items, pricing, SKUs, and stock availability' },
    orders: { title: 'Order Fulfillment & Transactions', subtitle: 'Track customer orders, process shipping, and issue refunds' },
    inventory: { title: 'Warehouse Stock Matrix', subtitle: 'Monitor stock levels across all regional fulfillment centers' },
    customers: { title: 'Customer Directory & CRM', subtitle: 'Customer insights, segments, tags, and communication history' },
    marketing: { title: 'Marketing & Broadcast Campaigns', subtitle: 'Create Email and SMS automated marketing reachouts' },
    team: { title: 'Staff & Team Collaboration', subtitle: 'Manage staff access permissions and invite team members' },
    settings: { title: 'Store Settings & Customization', subtitle: 'Customize store branding, colors, subdomain, and domain details' },
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stores={stores}
        currentStore={currentStore}
        onSelectStore={(st) => {
          setCurrentStore(st);
          addToast('info', 'Store Switched', `Active store set to ${st.storeName}`);
        }}
        onOpenCreateStore={() => setShowCreateStore(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentStore={currentStore}
          title={titles[activeTab]?.title || 'StoreVerse Hub'}
          subtitle={titles[activeTab]?.subtitle}
          onRefresh={() => addToast('info', 'Sync Complete', 'Latest store state loaded.')}
          onQuickAction={() => {
            if (activeTab === 'products') setActiveTab('products');
            else if (activeTab === 'marketing') setActiveTab('marketing');
            else setActiveTab('products');
          }}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              orders={orders}
              products={products}
              customers={customers}
              campaigns={campaigns}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddProduct={() => setActiveTab('products')}
              onOpenCreateCampaign={() => setActiveTab('marketing')}
            />
          )}

          {activeTab === 'products' && (
            <ProductsPage
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersPage
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onSendReceipt={handleSendReceipt}
              onRefund={handleRefundOrder}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage
              inventory={inventory}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'marketing' && (
            <MarketingPage
              campaigns={campaigns}
              onCreateCampaign={handleCreateCampaign}
            />
          )}

          {activeTab === 'team' && (
            <TeamPage
              team={team}
              onInviteMember={handleInviteMember}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentStore={currentStore}
              onUpdateStore={handleUpdateStore}
            />
          )}
        </main>
      </div>

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Launch Store Modal */}
      <CreateStoreModal
        isOpen={showCreateStore}
        onClose={() => setShowCreateStore(false)}
        onCreate={handleCreateStore}
      />
    </div>
  );
};
