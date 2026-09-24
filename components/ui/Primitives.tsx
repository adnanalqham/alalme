import React from 'react';
import { Star, StarHalf, TrendingDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// ---------------------------------------------------------------------------
// Brand primitives — consistent with Alalami tokens (primary #010736, navy,
// cream #FCF1D0, surface #F3F5FA).
// ---------------------------------------------------------------------------

export const btn = {
  primary: 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-navy active:scale-[.98] transition disabled:opacity-50 disabled:pointer-events-none',
  cream: 'inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-primary px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-secondary/80 active:scale-[.98] transition disabled:opacity-50',
  outline: 'inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white text-primary px-4 py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-surface transition disabled:opacity-50',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition',
  ghost: 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition',
};

export const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-primary placeholder-gray-400 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition';
export const labelCls = 'block text-xs font-semibold text-primary/70 mb-1.5';
export const cardCls = 'rounded-2xl border border-gray-100 bg-white shadow-sm';
export const thCls = 'px-4 py-3 text-start text-xs font-semibold text-primary/60 uppercase tracking-wide';
export const tdCls = 'px-4 py-3 text-sm text-primary';

export interface BadgeProps {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'cream';
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  const map: Record<string, string> = {
    neutral: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-navy/10 text-navy',
    cream: 'bg-secondary text-primary',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone] ?? map.neutral} ${className}`}>{children}</span>;
}

export function Stat({ label, value, hint, icon }: { label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className={`${cardCls} p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between text-primary/60">
        <span className="text-xs font-semibold">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {hint && <div className="text-xs text-gray-400">{hint}</div>}
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`w-10 h-5.5 rounded-full p-0.5 transition ${checked ? 'bg-green-500' : 'bg-gray-200'}`}>
      <span className={`block w-4 h-4 rounded-full bg-white shadow transition ${checked ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
    </button>
  );
}

export function Rating({ value, size = 14, showValue = true }: { value: number; size?: number; showValue?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={size} fill={value >= i ? '#f59e0b' : value >= i - 0.5 ? '#fde68a' : 'none'} stroke="#f59e0b" strokeWidth={1.5} />
        ))}
      </span>
      {showValue && <span className="text-xs text-gray-500 font-medium">({value || 0})</span>}
    </span>
  );
}

export function EmptyState({ title, subtitle, icon, action }: { title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-primary/30 mb-4">
        {icon ?? <ChevronLeft size={28} />}
      </div>
      <h3 className="font-semibold text-primary">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Price({ value, currency, hide = false }: { value: number; currency: string; hide?: boolean }) {
  const { language } = useLanguage();
  if (hide) {
    return <span className="font-bold text-primary">{language === 'ar' ? 'للتواصل' : 'Contact'}</span>;
  }
  return (
    <span className="font-bold text-primary">
      {value.toLocaleString(language === 'ar' ? 'ar-EG' : undefined)} <span className="text-xs font-medium text-gray-500">{currency}</span>
    </span>
  );
}

export function MobileTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr>
            {headers.map((h, i) => <th key={i} className={thCls}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((cells, ri) => (
            <tr key={ri} className="hover:bg-surface/60">
              {cells.map((c, ci) => <td key={ci} className={tdCls}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState title={empty} />}
    </div>
  );
}

export function Fallback({ query }: { query: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-primary/60">
      {query} <Check size={14} />
    </div>
  );
}

export function LowStockFlag({ value, threshold }: { value: number; threshold?: number }) {
  if (value <= (threshold ?? 5) && value > 0) return <Badge tone="warning"><TrendingDown size={12} /> Low</Badge>;
  if (value <= 0) return <Badge tone="danger">Out</Badge>;
  return <Badge tone="success">In stock</Badge>;
}

export function Chevron({ dir }: { dir: 'next' | 'prev' }) {
  return dir === 'next' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;
}

export function BarcodeSvg({ value, className }: { value: string; className?: string }) {
  const groups = [...value].map(ch => (ch.charCodeAt(0) % 4) + 1);
  return (
    <svg viewBox="0 0 200 60" className={className} aria-label={value}>
      {groups.map((w, i) => (
        <rect key={i} x={8 + i} y={18} width={w * 1.2} height={24} fill="#010736" />
      ))}
    </svg>
  );
}

export { StarHalf };