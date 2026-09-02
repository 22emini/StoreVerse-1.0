import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Warehouse, 
  Users, 
  Megaphone, 
  UserCheck, 
  Palette, 
  Store,
  PlusCircle,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stores: any[];
  currentStore: any;
  onSelectStore: (store: any) => void;
  onOpenCreateStore: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stores,
  currentStore,
  onSelectStore,
  onOpenCreateStore
}) => {
  const [storeMenuOpen, setStoreMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag, badge: '4' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '3' },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'team', label: 'Team', icon: UserCheck },
    { id: 'settings', label: 'Store Settings', icon: Palette },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              StoreVerse
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400">Merchant Hub</p>
          </div>
        </div>
      </div>

      {/* Store Selector Dropdown */}
      <div className="p-3 px-4 border-b border-slate-800/60 relative">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
          Active Store
        </div>
        <button
          onClick={() => setStoreMenuOpen(!storeMenuOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all duration-150 group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div 
              className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0 overflow-hidden"
              style={{ borderColor: currentStore?.primaryColor ? `${currentStore.primaryColor}50` : undefined }}
            >
              {currentStore?.storeLogoUrl ? (
                <img src={currentStore.storeLogoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-100 truncate group-hover:text-white">
                {currentStore?.storeName || 'Select Store'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentStore?.subDomain ? `${currentStore.subDomain}.storeverse.shop` : 'No Store'}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${storeMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {storeMenuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 animate-fade-in">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Your Stores</div>
            {stores.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onSelectStore(st);
                  setStoreMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
                  st.id === currentStore?.id 
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{st.storeName}</span>
                {st.id === currentStore?.id && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
              </button>
            ))}
            <div className="h-px bg-slate-800 my-1"></div>
            <button
              onClick={() => {
                onOpenCreateStore();
                setStoreMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-950/40 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Store</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            EM
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-slate-200 truncate">Eminioluwa</h4>
            <p className="text-[10px] text-slate-400 truncate">owner@storeverse.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
