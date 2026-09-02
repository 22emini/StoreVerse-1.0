import React from 'react';
import { Search, Bell, ExternalLink, RefreshCw, Plus, CheckCircle, Wifi } from 'lucide-react';

interface HeaderProps {
  currentStore: any;
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onQuickAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStore,
  title,
  subtitle,
  onRefresh,
  onQuickAction,
}) => {
  return (
    <header className="h-20 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Global Search input */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Live Store Link */}
        {currentStore?.subDomain && (
          <a
            href={`https://${currentStore.subDomain}.storeverse.shop`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-indigo-300 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </a>
        )}

        {/* Live API Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
          <Wifi className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:inline">API Online</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Quick Action Trigger */}
        {onQuickAction && (
          <button
            onClick={onQuickAction}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Create</span>
          </button>
        )}
      </div>
    </header>
  );
};
