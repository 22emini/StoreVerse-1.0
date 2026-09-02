import React, { useState } from 'react';
import { UserCheck, UserPlus, Mail, Shield, Trash2, X, Send } from 'lucide-react';

interface TeamPageProps {
  team: any[];
  onInviteMember: (teamData: any) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  team,
  onInviteMember,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Store Manager'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    onInviteMember(formData);
    setFormData({ name: '', email: '', role: 'Store Manager' });
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <span>Store Staff & Collaborators</span>
          </h3>
          <p className="text-xs text-slate-400">Manage permissions, invite co-workers, and assign operational roles</p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {/* Staff Members Table */}
      <div className="glass-panel p-6 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Member</th>
                <th className="p-3.5">Email Contact</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Invite Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {member.name ? member.name[0] : member.email[0]}
                      </div>
                      <div className="font-bold text-slate-100">{member.name || 'Invited Staff'}</div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{member.email}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{member.role}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                      member.status === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="text-[11px] text-slate-500">Full Workspace Access</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Invite Staff Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. David Chen"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="david.c@store.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Permission</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Store Manager">Store Manager (Products, Orders, Customers)</option>
                  <option value="Fulfillment Specialist">Fulfillment Specialist (Orders & Warehouses)</option>
                  <option value="Support Specialist">Support Specialist (Read-only & Messaging)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
