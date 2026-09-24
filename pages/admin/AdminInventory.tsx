import React, { useState, useEffect } from 'react';
import {
  Warehouse, Search, Filter, AlertTriangle, CheckCircle2,
  Store, Building2, Package, RefreshCw, ArrowUpDown
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminInventory: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInventory({
        search,
        low_stock: filterLowStock,
        out_of_stock: filterOutOfStock,
      });
      setItems(res.inventory || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, filterLowStock, filterOutOfStock]);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <Warehouse size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'المخزون المركزي والرقابة على الكميات (Inventory Oversight)' : 'Global Inventory Oversight'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'متابعة أرصدة المخزون، تنبيهات انخفاض الكميات، وحركات التوريد لكافة المتاجر والفروع'
                : 'Monitor real-time inventory balances, stock-outs, low threshold warnings across all merchant branches'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchInventory}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث برقم القطعة، الاسم، أو المتجر...' : 'Search part number, product or shop...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736] ${
              isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setFilterLowStock(!filterLowStock);
              setFilterOutOfStock(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filterLowStock
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle size={13} />
            <span>{isRtl ? 'مخزون منخفض' : 'Low Stock'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterOutOfStock(!filterOutOfStock);
              setFilterLowStock(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filterOutOfStock
                ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle size={13} />
            <span>{isRtl ? 'نفذت الكمية' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري فحص أرصدة المخزون...' : 'Scanning inventory balances...'}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 text-center rounded-2xl text-slate-500 shadow-xs">
          <Warehouse size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold">{isRtl ? 'لا توجد عناصر مخزون مطابقة' : 'No inventory items match filter.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 text-start">{isRtl ? 'المنتج / القطعة' : 'Product / Part'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'المتجر' : 'Shop'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الفرع' : 'Branch'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الكمية المتوفرة' : 'Stock Quantity'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'حد التنبيه' : 'Low Threshold'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'آخر تحديث' : 'Updated'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const qty = item.quantity ?? 0;
                  const threshold = item.low_stock_threshold ?? 5;
                  const isOut = qty <= 0;
                  const isLow = qty > 0 && qty <= threshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#010736]">{item.product?.name_ar || item.product?.name_en || '—'}</div>
                        <div className="font-mono text-[10px] text-amber-700 font-semibold mt-0.5">
                          PN: {item.product?.part_number || item.product?.sku || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Store size={12} className="text-amber-600 shrink-0" />
                          <span>{item.shop?.name_ar || item.shop?.name_en || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span>{item.branch?.name_ar || item.branch?.name_en || (isRtl ? 'الفرع الرئيسي' : 'Main')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-bold text-slate-900">{qty}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {threshold}
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                            {isRtl ? 'نفذت الكمية' : 'OUT OF STOCK'}
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                            {isRtl ? 'مخزون منخفض' : 'LOW STOCK'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            {isRtl ? 'متوفر' : 'IN STOCK'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
