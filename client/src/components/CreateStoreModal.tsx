import React, { useState } from 'react';
import { Store, Sparkles, X, Plus } from 'lucide-react';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (storeData: any) => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    storeName: '',
    category: 'Fashion & Lifestyle',
    subDomain: '',
    currency: 'USD ($)',
    businessAddress: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName) return;
    const sub = formData.subDomain || formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onCreate({ ...formData, subDomain: sub });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Storefront</h3>
              <p className="text-[11px] text-slate-400">Launch a brand new StoreVerse merchant hub</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Store Name</label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="e.g. Zenith Tech Boutique"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Store Subdomain</label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.subDomain}
                onChange={(e) => setFormData({ ...formData, subDomain: e.target.value })}
                placeholder="zenith-tech"
                className="w-full bg-slate-800 border border-slate-700 rounded-l-xl px-3 py-2 text-slate-100"
              />
              <span className="bg-slate-900 border border-l-0 border-slate-700 rounded-r-xl px-3 py-2 text-slate-400 font-mono text-[11px]">
                .storeverse.shop
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                <option value="Electronics">Electronics & Tech</option>
                <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                <option value="Home & Decor">Home & Decor</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="NGN (₦)">NGN (₦)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
              <Plus className="w-4 h-4" />
              <span>Launch Store</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
