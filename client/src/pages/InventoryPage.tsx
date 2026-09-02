import React, { useState } from 'react';
import { Warehouse, Package, Plus, Minus, AlertTriangle, RefreshCw, MapPin } from 'lucide-react';

interface InventoryPageProps {
  inventory: any[];
  onAdjustStock: (inventoryId: number, delta: number) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  inventory,
  onAdjustStock,
}) => {
  const [adjustingItem, setAdjustingItem] = useState<any | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(5);

  const warehouses = Array.from(new Set(inventory.map(i => i.warehouseName)));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Warehouse Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Fulfillment Hubs</div>
            <div className="text-xl font-extrabold text-white">{warehouses.length || 3} Active</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Units Stocked</div>
            <div className="text-xl font-extrabold text-white">
              {inventory.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} units
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Reorder Threshold Alerts</div>
            <div className="text-xl font-extrabold text-white">
              {inventory.filter(i => i.quantity <= 5).length} items
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Stock Matrix Table */}
      <div className="glass-panel p-6 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Warehouse Inventory Matrix</h3>
            <p className="text-xs text-slate-400">Live stock quantities across all regional fulfillment centers</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Product Item</th>
                <th className="p-3.5">Warehouse Location</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Stock Count</th>
                <th className="p-3.5">Stock Level Indicator</th>
                <th className="p-3.5 rounded-r-xl text-right">Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-100">{item.productName}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{item.warehouseName}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{item.sku || 'SKU-NONE'}</td>
                  <td className="p-3.5 font-extrabold text-white text-sm">{item.quantity} units</td>
                  <td className="p-3.5">
                    <div className="w-36 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.quantity > 20 ? 'bg-emerald-500' : item.quantity > 5 ? 'bg-indigo-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.quantity / 50) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                      <button
                        onClick={() => onAdjustStock(item.id, -1)}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Reduce 1 unit"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-mono font-bold text-indigo-300">{item.quantity}</span>
                      <button
                        onClick={() => onAdjustStock(item.id, 1)}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Add 1 unit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
