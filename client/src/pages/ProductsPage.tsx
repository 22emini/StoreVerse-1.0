import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Upload, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Package, 
  X, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';

interface ProductsPageProps {
  products: any[];
  onAddProduct: (productData: any) => void;
  onUpdateProduct: (id: number, productData: any) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Clothing',
    price: '',
    stock: 10,
    sku: '',
    description: '',
    image: '',
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'General')))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      onAddProduct(formData);
    }
    setFormData({ name: '', category: 'Clothing', price: '', stock: 10, sku: '', description: '', image: '' });
    setShowAddModal(false);
  };

  const handleEditClick = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      category: p.category || 'Clothing',
      price: p.price || '',
      stock: p.stock || 0,
      sku: p.sku || '',
      description: p.description || '',
      image: p.image || '',
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter products by name or SKU..."
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / Table Toggle */}
          <div className="flex items-center p-1 bg-slate-800/80 border border-slate-700/60 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Bulk Import</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', category: 'Clothing', price: '', stock: 10, sku: '', description: '', image: '' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="glass-panel p-4 rounded-3xl glass-panel-hover flex flex-col justify-between group">
              <div>
                <div className="aspect-square w-full rounded-2xl bg-slate-900 overflow-hidden relative mb-4 border border-slate-800">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md border ${
                    p.stock > 10
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : p.stock > 0
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  }`}>
                    {p.stock > 10 ? 'In Stock' : p.stock > 0 ? `Low (${p.stock})` : 'Out of Stock'}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  {p.category || 'General'}
                </div>
                <h4 className="font-bold text-slate-100 text-sm line-clamp-1 mb-1">{p.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{p.description || 'No description provided.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Price</div>
                  <div className="text-base font-extrabold text-white">${p.price}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-panel p-6 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-600 m-auto" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.barcode || 'No barcode'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{p.category || 'General'}</td>
                    <td className="p-3.5 font-mono text-slate-400">{p.sku || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-white">${p.price}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                        p.stock > 10 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Minimalist Cashmere Hoodie"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Clothing"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="189.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="HOOD-CASH-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide product details, sizing, or specifications..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Bulk Upload Products</h3>
            <p className="text-xs text-slate-400 mb-6">Upload a CSV or Excel spreadsheet containing product catalog fields.</p>
            
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 cursor-pointer bg-slate-900/50 transition-colors mb-6">
              <Package className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">Drag & drop product file here</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports CSV, XLSX up to 10MB</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  onAddProduct({
                    name: 'Bulk Imported Denim Jacket',
                    category: 'Clothing',
                    price: '120.00',
                    stock: 25,
                    sku: 'DNM-JKT-99',
                    description: 'Imported via CSV file sample.'
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Process File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
