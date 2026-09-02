import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendType = 'up',
  subtitle,
  icon: Icon,
  iconBg = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl glass-panel-hover flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl border ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mb-2">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
      </div>

      {/* Trend & Subtitle Footer */}
      {(trend || subtitle) && (
        <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800/60 mt-2">
          {trend && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
              trendType === 'up' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : trendType === 'down'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {trendType === 'up' && <TrendingUp className="w-3 h-3" />}
              {trendType === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
