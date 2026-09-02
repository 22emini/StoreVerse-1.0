import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  Clock, 
  MapPin, 
  CreditCard, 
  X, 
  Send 
} from 'lucide-react';

interface OrdersPageProps {
  orders: any[];
  onUpdateStatus: (orderId: number, status: string) => void;
  onSendReceipt: (orderId: number) => void;
  onRefund: (orderId: number) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onUpdateStatus,
  onSendReceipt,
  onRefund,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'completed', label: 'Completed' },
    { id: 'refunded', label: 'Refunded' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = activeFilter === 'all' || o.status === activeFilter;
    const matchesSearch = o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, email..."
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel p-6 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Order Ref</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-300">
                    {order.orderNumber}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-100">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className="capitalize">{order.paymentMethod || 'Credit Card'}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-extrabold text-white">${order.total}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : order.status === 'shipped'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : order.status === 'refunded'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Inspect Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Order Invoice Detail</span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  {selectedOrder.orderNumber}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-normal">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <h5 className="font-bold text-slate-400 mb-1 uppercase text-[10px] tracking-wider">Customer Details</h5>
                <p className="font-bold text-white">{selectedOrder.customerName}</p>
                <p className="text-slate-400">{selectedOrder.customerEmail}</p>
                <p className="text-slate-400">{selectedOrder.customerPhone || '+1 (555) 000-0000'}</p>
              </div>
              <div>
                <h5 className="font-bold text-slate-400 mb-1 uppercase text-[10px] tracking-wider">Shipping Destination</h5>
                <p className="text-slate-200 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.shippingStreet}, {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostal}
                  </span>
                </p>
              </div>
            </div>

            {/* Line Items List */}
            <div>
              <h5 className="font-bold text-slate-300 text-xs mb-2">Order Line Items</h5>
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-3 space-y-2 text-xs">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                    <span className="font-semibold text-slate-200">{item.productName} × {item.quantity}</span>
                    <span className="font-bold text-white">${item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Totals */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${selectedOrder.subtotal || selectedOrder.total}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax & Shipping</span>
                <span>${selectedOrder.tax || '0.00'}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-indigo-400">${selectedOrder.total}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSendReceipt(selectedOrder.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send Receipt</span>
                </button>
                <button
                  onClick={() => {
                    onRefund(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-bold text-rose-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refund Order</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'completed' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, 'shipped');
                      setSelectedOrder(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Mark Shipped</span>
                  </button>
                )}
                {selectedOrder.status !== 'completed' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, 'completed');
                      setSelectedOrder(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
