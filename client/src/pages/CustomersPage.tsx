import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Tag, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  UserPlus, 
  X, 
  Send,
  Sparkles
} from 'lucide-react';

interface CustomersPageProps {
  customers: any[];
  onAddCustomer: (data: any) => void;
  onSendMessage: (customerId: number, message: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  onAddCustomer,
  onSendMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [messagingCustomer, setMessagingCustomer] = useState<any | null>(null);
  const [messageContent, setMessageContent] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tags: 'VIP Customer',
    notes: ''
  });

  const allTags = ['All', 'VIP, Repeat Buyer', 'Watch Enthusiast', 'New Customer'];

  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || c.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    onAddCustomer(formData);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', tags: 'VIP Customer', notes: '' });
    setShowAddModal(false);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingCustomer || !messageContent) return;
    onSendMessage(messagingCustomer.customerId, messageContent);
    setMessageContent('');
    setMessagingCustomer(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer by name or email..."
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel p-6 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Customer Name</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Tags & Segment</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((c) => (
                <tr key={c.customerId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{c.firstName} {c.lastName}</div>
                        <div className="text-[11px] text-slate-400">{c.address || 'No address saved'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{c.email}</span>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    {c.tags ? (
                      <div className="flex flex-wrap gap-1">
                        {c.tags.split(',').map((tg: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                            {tg.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Standard</span>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-200">{c.orderCount || 0} orders</td>
                  <td className="p-3.5 font-extrabold text-emerald-400">${c.totalSpent || 0}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setMessagingCustomer(c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold text-xs ml-auto transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add Customer Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="VIP, Frequent Buyer, Newsletter"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messagingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Send Direct Message</h3>
                <p className="text-xs text-indigo-400">To: {messagingCustomer.firstName} {messagingCustomer.lastName}</p>
              </div>
              <button onClick={() => setMessagingCustomer(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message or special offer discount link..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setMessagingCustomer(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
