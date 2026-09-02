import React from 'react';
import { StatCard } from '../components/StatCard';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  Send,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  orders: any[];
  products: any[];
  customers: any[];
  campaigns: any[];
  onNavigate: (tab: string) => void;
  onOpenAddProduct: () => void;
  onOpenCreateCampaign: () => void;
}

const salesChartData = [
  { name: 'Mon', revenue: 2400, orders: 12 },
  { name: 'Tue', revenue: 1398, orders: 8 },
  { name: 'Wed', revenue: 9800, orders: 24 },
  { name: 'Thu', revenue: 3908, orders: 16 },
  { name: 'Fri', revenue: 4800, orders: 20 },
  { name: 'Sat', revenue: 13800, orders: 38 },
  { name: 'Sun', revenue: 9400, orders: 29 },
];

export const DashboardPage: React.FC<DashboardProps> = ({
  orders,
  products,
  customers,
  campaigns,
  onNavigate,
  onOpenAddProduct,
  onOpenCreateCampaign
}) => {
  const totalRevenue = orders.reduce((acc, curr) => acc + parseFloat(curr.total || '0'), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/60 border border-indigo-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Storeverse Analytics Active
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Eminioluwa 👋
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Your store generated <span className="text-indigo-400 font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> this week with a steady +18.4% growth in organic orders.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={onOpenCreateCampaign}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              <Send className="w-4 h-4 text-indigo-400" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Store Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend="+18.4%"
          trendType="up"
          subtitle="vs. previous 7 days"
          icon={DollarSign}
          iconBg="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        />
        <StatCard
          title="Total Orders"
          value={orders.length.toString()}
          trend="+12%"
          trendType="up"
          subtitle={`${orders.filter(o => o.status === 'pending').length} pending dispatch`}
          icon={ShoppingBag}
          iconBg="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
        />
        <StatCard
          title="Active Customers"
          value={customers.length.toString()}
          trend="+8 new"
          trendType="up"
          subtitle="Customer retention 94%"
          icon={Users}
          iconBg="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
        />
        <StatCard
          title="Low Stock Warning"
          value={lowStockCount.toString()}
          trend={lowStockCount > 0 ? "Action Needed" : "Healthy"}
          trendType={lowStockCount > 0 ? "down" : "neutral"}
          subtitle="Products below 5 units"
          icon={AlertTriangle}
          iconBg="bg-amber-500/20 text-amber-400 border-amber-500/30"
        />
      </div>

      {/* Main Analytics & Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Container (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Weekly Revenue Flow</h3>
              <p className="text-xs text-slate-400">Daily gross revenue across storefront channels</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
              <span className="text-xs font-semibold text-slate-300">Revenue ($)</span>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`$${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign & Active Inventory Quick Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Active Campaigns</h3>
              <button onClick={() => onNavigate('marketing')} className="text-xs font-semibold text-indigo-400 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.slice(0, 2).map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 truncate">{c.name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {c.channel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-700/40">
                    <div>
                      <div className="text-[10px] text-slate-400">Sent</div>
                      <div className="text-xs font-bold text-slate-200">{c.sent}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Opens</div>
                      <div className="text-xs font-bold text-emerald-400">{c.opens}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Conversions</div>
                      <div className="text-xs font-bold text-indigo-400">{c.conversions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Store Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onNavigate('products')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Package className="w-4 h-4 text-indigo-400" />
                <span>Inventory Matrix</span>
              </button>
              <button 
                onClick={() => onNavigate('settings')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Theme Editor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table Section */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest checkout transactions across all active channels</p>
          </div>
          <button 
            onClick={() => onNavigate('orders')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-300">{order.orderNumber}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                  </td>
                  <td className="p-3.5">{order.itemCount} item(s)</td>
                  <td className="p-3.5 capitalize">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[11px]">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-100">${order.total}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : order.status === 'shipped'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
