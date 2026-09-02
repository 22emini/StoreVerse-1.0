import React, { useState } from 'react';
import { Megaphone, Send, Mail, MessageSquare, BarChart2, Plus, Calendar, CheckCircle2, X } from 'lucide-react';

interface MarketingPageProps {
  campaigns: any[];
  onCreateCampaign: (campaignData: any) => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({
  campaigns,
  onCreateCampaign,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    channel: 'Email',
    customerSegment: 'VIP, Repeat Buyer',
    messageContent: '',
    schedule: 'send_now',
    audience: 1420
  });

  const totalSent = campaigns.reduce((a, b) => a + (b.sent || 0), 0);
  const totalConversions = campaigns.reduce((a, b) => a + (b.conversions || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.messageContent) return;
    onCreateCampaign(formData);
    setFormData({
      name: '',
      channel: 'Email',
      customerSegment: 'VIP, Repeat Buyer',
      messageContent: '',
      schedule: 'send_now',
      audience: 1420
    });
    setShowWizard(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Marketing Messages Sent</div>
            <div className="text-xl font-extrabold text-white">{totalSent.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Orders Converted</div>
            <div className="text-xl font-extrabold text-white">{totalConversions} Orders</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Avg. Campaign Click-Through</div>
            <div className="text-xl font-extrabold text-white">24.5%</div>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Marketing & Broadcast Campaigns</h3>
            <p className="text-xs text-slate-400">Manage Email & SMS automated customer reachouts</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign Wizard</span>
          </button>
        </div>

        <div className="space-y-4">
          {campaigns.map((c) => {
            const openRate = c.sent ? Math.round((c.opens / c.sent) * 100) : 0;
            const convRate = c.sent ? Math.round((c.conversions / c.sent) * 100) : 0;

            return (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      c.channel === 'Email' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {c.channel}
                    </span>
                    <h4 className="font-extrabold text-slate-100 text-sm">{c.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">"{c.messageContent}"</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                    <span>Target Segment: <strong className="text-slate-300">{c.customerSegment}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-400 capitalize">{c.status}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 min-w-[320px]">
                  <div>
                    <div className="text-[10px] text-slate-400">Audience</div>
                    <div className="text-xs font-bold text-slate-100">{c.sent || c.audience}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Opens</div>
                    <div className="text-xs font-bold text-emerald-400">{c.opens} ({openRate}%)</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Clicks</div>
                    <div className="text-xs font-bold text-indigo-400">{c.clicks}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Conversions</div>
                    <div className="text-xs font-bold text-cyan-400">{c.conversions} ({convRate}%)</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Campaign Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <span>Campaign Creator Wizard</span>
              </h3>
              <button onClick={() => setShowWizard(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Summer VIP Flash Sale Discount"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Email">Email Broadcast</option>
                    <option value="SMS">SMS Text Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Segment</label>
                  <select
                    value={formData.customerSegment}
                    onChange={(e) => setFormData({ ...formData, customerSegment: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="VIP, Repeat Buyer">VIP, Repeat Buyers</option>
                    <option value="Watch Enthusiast">Watch Enthusiasts</option>
                    <option value="All Customers">All Registered Customers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Template</label>
                <textarea
                  rows={4}
                  required
                  value={formData.messageContent}
                  onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
                  placeholder="Write message copy or promotional offer URL..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowWizard(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
                  <Send className="w-4 h-4" />
                  <span>Dispatch Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
