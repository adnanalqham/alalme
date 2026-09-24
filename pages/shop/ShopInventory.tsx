import React, { useEffect, useState } from 'react';
import { Upload, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../context/AuthContext';
import { inventoryService, shopService, productService } from '../../api';
import { PageHeader, MobileTable, Badge, inputCls, labelCls } from '../../components/ui/Primitives';

const ShopInventory: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { canAdjustInventory, canImportInventory } = usePermissions();
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [tick, setTick] = useState(0);
  const [csv, setCsv] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    try {
      const shop = shopService.myShop();
      const sid = shop.id;
      setBranches(shopService.branchesOf(sid));
      setProducts(productService.listForShop(sid));
      setMovements(inventoryService.movements(sid, 50));
    } catch { /* */ }
  }, [tick]);

  const adjust = (p: any, delta: number) => {
    try { inventoryService.adjust(p.id, delta, 'Manual'); setTick(x => x + 1); toast(language === 'ar' ? 'تم تعديل المخزون' : 'Stock adjusted', { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const setMin = (p: any, val: string) => {
    try { inventoryService.setMinStock(p.id, Number(val) || 0); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const transfer = (p: any, branchId: string, qty: string) => {
    if (!branchId || !Number(qty)) return;
    try { inventoryService.transfer(p.id, branchId, Number(qty)); setTick(x => x + 1); toast(language === 'ar' ? 'تم النقل' : 'Transferred', { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const doImport = () => {
    try {
      const res = inventoryService.importCsv(csv);
      toast(`${language === 'ar' ? 'تم الاستيراد' : 'Imported'}: +${res.created} ${language === 'ar' ? 'جديد' : 'created'}, +${res.updated} ${language === 'ar' ? 'محدّث' : 'updated'}${res.errors.length ? `, ${res.errors.length} ${language === 'ar' ? 'أخطاء' : 'errors'}` : ''}`, { kind: res.errors.length ? 'warning' : 'success' });
      setShowImport(false); setCsv(''); setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const low = products.filter(p => p.quantity <= (p.minStock ?? 5));

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'المخزون' : 'Inventory'}
        subtitle={language === 'ar' ? `${low.length} قطعة تحت حد التنبيه` : `${low.length} parts below alert threshold`}
        action={
          canImportInventory ? (
            <button onClick={() => setShowImport(v => !v)} className="rounded-xl border border-primary/20 text-primary px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-surface">
              <Upload size={15} /> CSV
            </button>
          ) : undefined
        }
      />

      {showImport && canImportInventory && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-5">
          <h3 className="font-bold text-primary mb-2">{language === 'ar' ? 'استيراد CSV' : 'Import CSV'}</h3>
          <p className="text-xs text-gray-400 mb-3" dir="ltr">sku,name_en,name_ar,qty,price[,category,manufacturer,condition,oem,min_stock]</p>
          <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={4} className={inputCls} placeholder="SKU1,Brake pad,فرامل,20,15000" />
          <button onClick={doImport} className="mt-3 rounded-xl bg-primary text-white px-5 py-2 text-sm font-bold hover:bg-navy">{language === 'ar' ? 'استيراد' : 'Import'}</button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'القطعة' : 'Part', language === 'ar' ? 'المخزون' : 'Qty', language === 'ar' ? 'حد التنبيه' : 'Min', language === 'ar' ? 'نقل لفرع' : 'Transfer', '']}
          empty={language === 'ar' ? 'لا توجد قطع' : 'No parts'}
          rows={products.map(p => [
            <div key="n">
              <div className="font-semibold text-primary line-clamp-1">{language === 'ar' ? p.nameAr : p.nameEn}</div>
              <div className="text-xs text-gray-400" dir="ltr">{p.partNumber || p.id}</div>
            </div>,
            <span key="q">
              <span className={`font-extrabold text-sm ${p.quantity <= 0 ? 'text-red-500' : p.quantity <= (p.minStock ?? 5) ? 'text-amber-500' : 'text-primary'}`}>{p.quantity}</span>
              {' '}<Badge tone={p.quantity <= 0 ? 'danger' : p.quantity <= (p.minStock ?? 5) ? 'warning' : 'success'}>{p.quantity <= 0 ? 'Out' : p.quantity <= (p.minStock ?? 5) ? 'Low' : 'Ok'}</Badge>
            </span>,
            <input key="min" type="number" min={0} defaultValue={p.minStock ?? 5} disabled={!canAdjustInventory} onBlur={e => setMin(p, e.target.value)} className="w-16 rounded-lg border border-gray-100 px-2 py-1 text-xs outline-none disabled:opacity-50" />,
            <div key="tr" className="flex items-center gap-1">
              <input key="b" type="number" min={1} max={p.quantity} placeholder="qty" disabled={!canAdjustInventory} className="w-14 rounded-lg border border-gray-100 px-2 py-1 text-xs outline-none disabled:opacity-50" id={`tb-${p.id}`} />
              <select key="s" id={`bs-${p.id}`} disabled={!canAdjustInventory} className="rounded-lg border border-gray-100 px-1 py-1 text-xs outline-none disabled:opacity-50">
                <option value="">—</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.nameEn}</option>)}
              </select>
              {canAdjustInventory && (
                <button key="go" onClick={() => { const q = (document.getElementById(`tb-${p.id}`) as HTMLInputElement)?.value; const b = (document.getElementById(`bs-${p.id}`) as HTMLSelectElement)?.value; transfer(p, b, q); }} className="p-1.5 rounded-lg text-navy hover:bg-surface" title="Transfer"><ArrowRightLeft size={14} /></button>
              )}
            </div>,
            <div key="a" className="flex gap-1 justify-end">
              {canAdjustInventory ? (
                <>
                  <button onClick={() => adjust(p, -1)} className="w-7 h-7 rounded-lg border border-gray-100 text-primary text-sm font-bold hover:bg-surface">−</button>
                  <button onClick={() => adjust(p, 1)} className="w-7 h-7 rounded-lg border border-gray-100 text-primary text-sm font-bold hover:bg-surface">+</button>
                  <button onClick={() => adjust(p, -10)} className="px-2 h-7 rounded-lg border border-gray-100 text-xs text-primary hover:bg-surface">−10</button>
                  <button onClick={() => adjust(p, 10)} className="px-2 h-7 rounded-lg border border-gray-100 text-xs text-primary hover:bg-surface">+10</button>
                </>
              ) : (
                <span className="text-xs text-gray-400 py-1">{language === 'ar' ? 'للمشاهدة فقط' : 'View only'}</span>
              )}
            </div>,
          ])}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mt-6">
        <h3 className="font-bold text-primary mb-4">{language === 'ar' ? 'حركة المخزون' : 'Movement history'}</h3>
        <div className="divide-y divide-gray-50 max-h-80 overflow-auto">
          {movements.length === 0 && <p className="text-sm text-gray-400">{language === 'ar' ? 'لا حركات بعد' : 'No movements yet'}</p>}
          {movements.map(m => (
            <div key={m.id} className="flex items-center justify-between py-2">
              <div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.type === 'IN' || m.type === 'ADJUSTMENT' && (m.quantityChange ?? 0) > 0 ? 'bg-green-100 text-green-700' : m.type === 'TRANSFER' ? 'bg-navy/10 text-navy' : 'bg-red-100 text-red-600'}`}>{m.type}</span>
                <span className="text-sm text-primary ms-2" dir="ltr">{m.reason}</span>
              </div>
              <div className="text-end">
                <div className={`text-xs font-extrabold ${(m.quantityChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{m.quantityChange >= 0 ? '+' : ''}{m.quantityChange}</div>
                <div className="text-[10px] text-gray-400">{new Date(m.date).toLocaleString(language === 'ar' ? 'ar' : 'en')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopInventory;