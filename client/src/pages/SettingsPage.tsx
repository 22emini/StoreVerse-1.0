import React, { useState } from 'react';
import { Palette, Globe, DollarSign, ShieldCheck, MapPin, CheckCircle, Save, Store, Sparkles } from 'lucide-react';

interface SettingsPageProps {
  currentStore: any;
  onUpdateStore: (storeData: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentStore,
  onUpdateStore,
}) => {
  const [formData, setFormData] = useState({
    storeName: currentStore?.storeName || 'Aura Luxury Apparel',
    category: currentStore?.category || 'Fashion & Lifestyle',
    subDomain: currentStore?.subDomain || 'aura-luxury',
    businessAddress: currentStore?.businessAddress || '742 Evergreen Terrace, San Francisco, CA',
    currency: currentStore?.currency || 'USD ($)',
    timeZone: currentStore?.timeZone || 'UTC-7 (Pacific Time)',
    primaryColor: currentStore?.primaryColor || '#6366f1',
    fontFamily: currentStore?.fontFamily || 'Plus Jakarta Sans',
    storeLogoUrl: currentStore?.storeLogoUrl || '',
    sslEnabled: currentStore?.sslEnabled ?? true,
  });

  const presetColors = [
    { name: 'Indigo Accent', hex: '#6366f1' },
    { name: 'Cyan Glow', hex: '#06b6d4' },
    { name: 'Emerald Velvet', hex: '#10b981' },
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Rose Sunset', hex: '#f43f5e' },
    { name: 'Violet Silk', hex: '#8b5cf6' },
  ];

  const fontOptions = ['Plus Jakarta Sans', 'Inter', 'Roboto', 'Outfit', 'Playfair Display'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore(formData);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding & Theme Customization Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Store Customization & Branding</h3>
              <p className="text-xs text-slate-400">Configure visual themes, brand primary color accent, and typography</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Primary Color Palette */}
            <div>
              <label className="block text-slate-300 font-bold mb-2">Primary Brand Color</label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {presetColors.map((clr) => (
                  <button
                    key={clr.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryColor: clr.hex })}
                    className="w-7 h-7 rounded-full border-2 border-slate-700 hover:scale-110 transition-transform relative"
                    style={{ backgroundColor: clr.hex }}
                    title={clr.name}
                  >
                    {formData.primaryColor === clr.hex && (
                      <span className="w-2 h-2 rounded-full bg-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Selector */}
            <div>
              <label className="block text-slate-300 font-bold mb-2">Brand Font Family</label>
              <select
                value={formData.fontFamily}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-medium"
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <div className="mt-4">
                <label className="block text-slate-300 font-bold mb-1">Store Logo Image URL</label>
                <input
                  type="url"
                  value={formData.storeLogoUrl}
                  onChange={(e) => setFormData({ ...formData, storeLogoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-white shadow-lg"
                style={{ backgroundColor: formData.primaryColor, borderColor: `${formData.primaryColor}80` }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-white text-sm" style={{ fontFamily: formData.fontFamily }}>
                  {formData.storeName}
                </h5>
                <p className="text-xs text-slate-400">Live Branding Theme Preview</p>
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Checkout Button
            </button>
          </div>
        </div>

        {/* General Store Details */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">General Store Profile</h3>
              <p className="text-xs text-slate-400">Business name, custom subdomain, address, and localized currency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Store Subdomain</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.subDomain}
                  onChange={(e) => setFormData({ ...formData, subDomain: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-l-xl px-3 py-2 text-slate-100"
                />
                <span className="bg-slate-900 border border-l-0 border-slate-700 rounded-r-xl px-3 py-2 text-slate-400 font-mono text-[11px]">
                  .storeverse.shop
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Business Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Base Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="USD ($)">USD - US Dollar ($)</option>
                <option value="EUR (€)">EUR - Euro (€)</option>
                <option value="GBP (£)">GBP - British Pound (£)</option>
                <option value="NGN (₦)">NGN - Nigerian Naira (₦)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Business Physical Address</label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
