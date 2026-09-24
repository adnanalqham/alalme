import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, X, Barcode, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../context/AuthContext';
import { productService, shopService, vehicleService } from '../../api';
import { PriceVisibility, Product, ProductCondition, SaleMode } from '../../types';
import { Badge, PageHeader, MobileTable, inputCls, labelCls } from '../../components/ui/Primitives';
import taxonomyMaster from '../../docs/data/automotive-parts-taxonomy.json' with { type: 'json' };

interface FormState {
  nameEn: string; nameAr: string; partNumber: string; oemNumber: string;
  categoryId: string; subcategoryId?: string; partTypeId?: string;
  condition: ProductCondition; price: string; quantity: string; minStock: string;
  priceVisibility: PriceVisibility; saleMode: SaleMode; imageUrl: string; branchId: string;
  descriptionEn: string;
}

const emptyForm: FormState = {
  nameEn: '', nameAr: '', partNumber: '', oemNumber: '', categoryId: '',
  subcategoryId: '', partTypeId: '',
  condition: ProductCondition.NEW, price: '', quantity: '', minStock: '5',
  priceVisibility: PriceVisibility.SHOW_PRICE, saleMode: SaleMode.BOTH, imageUrl: '', branchId: '', descriptionEn: '',
};

const ShopProducts: React.FC = () => {
  const { language } = useLanguage();
  const { categories, settings } = useData();
  const { toast } = useToast();
  const { canCreateProducts, canEditProducts, canDeleteProducts } = usePermissions();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);

  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fitmentDraft, setFitmentDraft] = useState({ makeId: '', modelId: '', generationId: '', engineId: '' });
  const [fitments, setFitments] = useState<any[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      const shop = shopService.myShop();
      setBranches(shopService.branchesOf(shop.id));
      setProducts(productService.listForShop(shop.id));
    } catch { /* */ }
  }, [tick]);

  useEffect(() => {
    if (!editing) { setForm(emptyForm); setFitments([]); return; }
    try {
      const p = productService.get(id!);
      setForm({
        nameEn: p.nameEn, nameAr: p.nameAr, partNumber: p.partNumber ?? '', oemNumber: p.oemNumber ?? '',
        categoryId: p.categoryId, condition: p.condition, price: String(p.price ?? 0), quantity: String(p.quantity),
        minStock: String(p.minStock ?? settings.lowStockThreshold ?? 5),
        priceVisibility: p.priceVisibility, saleMode: p.saleMode, imageUrl: p.imageUrl ?? '', branchId: p.branchId ?? '',
        descriptionEn: p.descriptionEn ?? '',
      });
      setFitments(p.fitments.map(f => ({ ...f })));
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  }, [editing, id]);

  const makes = useMemo(() => vehicleService.makes(), []);
  const models = useMemo(() => (fitmentDraft.makeId ? vehicleService.models(fitmentDraft.makeId) : []), [fitmentDraft.makeId]);
  const generations = useMemo(() => (fitmentDraft.modelId ? vehicleService.generations(fitmentDraft.modelId) : []), [fitmentDraft.modelId]);
  const engines = useMemo(() => (fitmentDraft.generationId ? vehicleService.engines(fitmentDraft.generationId) : []), [fitmentDraft.generationId]);

  const addFitment = () => {
    if (!fitmentDraft.makeId || !fitmentDraft.modelId) return;
    const make = makes.find(m => m.id === fitmentDraft.makeId)!;
    const model = models.find(m => m.id === fitmentDraft.modelId)!;
    const gen = generations.find(g => g.id === fitmentDraft.generationId);
    const eng = engines.find(e => e.id === fitmentDraft.engineId);
    setFitments(f => [...f, {
      makeId: make.id, modelId: model.id, generationId: gen?.id, engineId: eng?.id,
      makeNameEn: make.nameEn, makeNameAr: make.nameAr, modelNameEn: model.nameEn, modelNameAr: model.nameAr,
      yearLabel: gen ? `${gen.yearStart}${gen.yearEnd ? '-' + gen.yearEnd : '+'}` : undefined,
      engineBadge: eng?.badge,
    }]);
    setFitmentDraft({ makeId: '', modelId: '', generationId: '', engineId: '' });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      nameEn: form.nameEn, nameAr: form.nameAr, partNumber: form.partNumber, oemNumber: form.oemNumber,
      categoryId: form.categoryId, subcategoryId: form.subcategoryId, partTypeId: form.partTypeId,
      condition: form.condition, price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0, minStock: Number(form.minStock) || 0,
      priceVisibility: form.priceVisibility, saleMode: form.saleMode, imageUrl: form.imageUrl,
      branchId: form.branchId || undefined, descriptionEn: form.descriptionEn,
      fitments: fitments.map(({ id: _id, productId: _pid, ...rest }) => rest),
    };
    try {
      if (editing) { productService.update(id!, input); toast(language === 'ar' ? 'تم تحديث القطعة' : 'Part updated', { kind: 'success' }); }
      else { productService.create(input); toast(language === 'ar' ? 'تم إنشاء القطعة' : 'Part created', { kind: 'success' }); }
      navigate(editing ? '/shop/products' : '/shop/products', { replace: true });
      setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const del = (p: Product) => {
    try { productService.delete(p.id); setTick(x => x + 1); toast(language === 'ar' ? 'تم حذف القطعة' : 'Part deleted', { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const filtered = products.filter(p => !q || (p.nameEn + p.nameAr + (p.partNumber ?? '')).toLowerCase().includes(q.toLowerCase()));

  if (editing) {
    return <ProductForm form={form} setForm={setForm} branches={branches} categories={categories.filter(c => c.isActive)} fitments={fitments} setFitments={setFitments} makes={makes} models={models} generations={generations} engines={engines} fitmentDraft={fitmentDraft} setFitmentDraft={setFitmentDraft} addFitment={addFitment} save={save} language={language} />;
  }

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'المنتجات' : 'Products'}
        subtitle={language === 'ar' ? `إجمالي ${products.length} قطعة` : `${products.length} parts total`}
        action={
          canCreateProducts ? (
            <Link to="/shop/products/new" className="rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-bold hover:bg-navy flex items-center gap-2">
              <Plus size={15} /> {language === 'ar' ? 'قطعة جديدة' : 'New part'}
            </Link>
          ) : undefined
        }
      />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={language === 'ar' ? 'بحث بالاسم أو الرمز…' : 'Search by name or part number…'} className={inputCls + ' max-w-sm'} />
        </div>
        <MobileTable
          headers={[language === 'ar' ? 'الصورة' : 'Image', language === 'ar' ? 'القطعة' : 'Part', language === 'ar' ? 'السعر' : 'Price', language === 'ar' ? 'المخزون' : 'Stock', language === 'ar' ? 'النوع' : 'Type', '']}
          empty={language === 'ar' ? 'لا توجد قطع' : 'No parts'}
          rows={filtered.map(p => [
            <img key="i" src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" onError={e => { (e.target as HTMLElement).style.visibility = 'hidden'; }} />,
            <div key="n">
              <div className="font-semibold text-primary">{language === 'ar' ? p.nameAr : p.nameEn}</div>
              <div className="text-xs text-gray-400" dir="ltr">{p.partNumber}{p.barcode ? ' · ' + p.barcode : ''}</div>
            </div>,
            p.priceVisibility === PriceVisibility.HIDE_PRICE
              ? <span className="text-xs text-red-500 font-semibold">{language === 'ar' ? 'للتواصل' : 'Contact'}</span>
              : <span className="font-extrabold text-primary">{p.price.toLocaleString()} {p.currency}</span>,
            <Badge key="s" tone={p.quantity <= 0 ? 'danger' : p.quantity <= (p.minStock ?? 5) ? 'warning' : 'success'}>{p.quantity}</Badge>,
            <Badge key="t" tone={p.saleMode === SaleMode.EXTERNAL ? 'cream' : p.priceVisibility === PriceVisibility.HIDE_PRICE ? 'info' : 'neutral'}>{p.saleMode === SaleMode.EXTERNAL ? 'Ext' : p.priceVisibility === PriceVisibility.HIDE_PRICE ? 'Hid' : 'Online'}</Badge>,
            <div key="a" className="flex gap-1 justify-end">
              {canEditProducts && (
                <Link to={`/shop/products/${p.id}/edit`} className="p-2 text-gray-400 hover:text-navy hover:bg-surface rounded-lg" title="Edit">
                  <Pencil size={15} />
                </Link>
              )}
              {canDeleteProducts && (
                <button onClick={() => del(p)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={15} />
                </button>
              )}
            </div>,
          ])}
        />
      </div>
    </div>
  );
};

function ProductForm(props: {
  form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>;
  branches: any[]; categories: any[]; fitments: any[]; setFitments: any;
  makes: any[]; models: any[]; generations: any[]; engines: any[];
  fitmentDraft: { makeId: string; modelId: string; generationId: string; engineId: string }; setFitmentDraft: any;
  addFitment: () => void; save: (e: React.FormEvent) => void; language: string;
}) {
  const { form, setForm, branches, categories, fitments, setFitments, makes, models, generations, engines, fitmentDraft, setFitmentDraft, addFitment, save, language } = props;
  const [showFitWizard, setShowFitWizard] = useState(fitments.length === 0);
  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const L = language === 'ar';
  const Cond = [
    { v: ProductCondition.NEW, l: L ? 'جديد' : 'New' },
    { v: ProductCondition.USED, l: L ? 'مستعمل' : 'Used' },
    { v: ProductCondition.OEM, l: 'OEM' },
    { v: ProductCondition.AFTERMARKET, l: L ? 'بديل' : 'Aftermarket' },
    { v: ProductCondition.REFURBISHED, l: L ? 'مجدّد' : 'Refurbished' },
  ];
  const Vis = [
    { v: PriceVisibility.SHOW_PRICE, l: L ? 'إظهار السعر' : 'Show price' },
    { v: PriceVisibility.HIDE_PRICE, l: L ? 'إخفاء (تواصل)' : 'Hide (contact)' },
  ];
  const Mode = [
    { v: SaleMode.BOTH, l: L ? 'إلكتروني وخارجي' : 'Online + external' },
    { v: SaleMode.ONLINE, l: L ? 'إلكتروني فقط' : 'Online only' },
    { v: SaleMode.EXTERNAL, l: L ? 'خارجي فقط (واتساب)' : 'External only (WhatsApp)' },
  ];

  const taxonomyHierarchy = (taxonomyMaster as any).hierarchy;
  const [selectedSystemId, setSelectedSystemId] = useState<string>(() => {
    return form.categoryId?.startsWith('cat-') ? form.categoryId : '';
  });
  const [selectedSubId, setSelectedSubId] = useState<string>(form.subcategoryId || '');
  const [selectedPtId, setSelectedPtId] = useState<string>(form.partTypeId || '');

  const availableSubs = useMemo(() => {
    const sys = taxonomyHierarchy.find((s: any) => s.id === selectedSystemId);
    return sys?.subcategories || [];
  }, [selectedSystemId]);

  const availablePts = useMemo(() => {
    const sub = availableSubs.find((s: any) => s.id === selectedSubId);
    return sub?.part_types || [];
  }, [availableSubs, selectedSubId]);

  const selectedPartTypeObj = useMemo(() => {
    return availablePts.find((p: any) => p.id === selectedPtId);
  }, [availablePts, selectedPtId]);

  const handlePartTypeSelect = (ptId: string) => {
    setSelectedPtId(ptId);
    const pt = availablePts.find((p: any) => p.id === ptId);
    if (pt) {
      setForm(f => ({
        ...f,
        categoryId: selectedSystemId || f.categoryId || 'c1',
        subcategoryId: selectedSubId,
        partTypeId: ptId,
        nameAr: f.nameAr || pt.name_ar,
        nameEn: f.nameEn || pt.name_en,
      }));
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title={L ? (form.nameAr || 'قطعة جديدة') : (form.nameEn || 'New part')}
        subtitle={L ? 'بيانات القطعة والتصنيف الهرمي والسعر والمخزون والتوافق' : 'Standard parts taxonomy, details, pricing, stock and compatibility'}
        action={<>
          <button type="button" onClick={() => window.location.hash = '#/shop/products'} className="rounded-xl border border-gray-100 text-primary px-4 py-2.5 text-sm font-semibold">{L ? 'إلغاء' : 'Cancel'}</button>
          <button type="submit" className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:bg-navy">{L ? 'حفظ' : 'Save'}</button>
        </>}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Master Parts Taxonomy Cascading Selector */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-primary font-bold text-sm">
              <Layers size={16} />
              <span>{L ? 'التصنيف الهرمي المعتمد لقطع الغيار (Master Taxonomy)' : 'Master Automotive Parts Taxonomy'}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {L ? 'اختر النظام الرئيسي 🡒 الفئة الفرعية 🡒 نوع القطعة لضمان التوافق مع محرك البحث والتطبيق' : 'Select System 🡒 Subcategory 🡒 Part Type to standardize your listing'}
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>{L ? '1. النظام الرئيسي *' : '1. Major System *'}</label>
                <select
                  value={selectedSystemId}
                  onChange={e => {
                    const sysId = e.target.value;
                    setSelectedSystemId(sysId);
                    setSelectedSubId('');
                    setSelectedPtId('');
                    if (sysId) setForm(f => ({ ...f, categoryId: sysId }));
                  }}
                  className={inputCls + ' bg-white'}
                >
                  <option value="">{L ? '— اختر النظام —' : '— Select System —'}</option>
                  {taxonomyHierarchy.map((s: any) => (
                    <option key={s.id} value={s.id}>{L ? s.name_ar : s.name_en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>{L ? '2. الفئة الفرعية' : '2. Subcategory'}</label>
                <select
                  value={selectedSubId}
                  disabled={!selectedSystemId}
                  onChange={e => {
                    const subId = e.target.value;
                    setSelectedSubId(subId);
                    setSelectedPtId('');
                    setForm(f => ({ ...f, subcategoryId: subId }));
                  }}
                  className={inputCls + ' bg-white disabled:opacity-50'}
                >
                  <option value="">{L ? '— اختر الفئة الفرعية —' : '— Select Subcategory —'}</option>
                  {availableSubs.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{L ? sub.name_ar : sub.name_en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>{L ? '3. نوع القطعة المعتمد' : '3. Part Type'}</label>
                <select
                  value={selectedPtId}
                  disabled={!selectedSubId}
                  onChange={e => handlePartTypeSelect(e.target.value)}
                  className={inputCls + ' bg-white disabled:opacity-50 font-medium'}
                >
                  <option value="">{L ? '— اختر نوع القطعة —' : '— Select Part Type —'}</option>
                  {availablePts.map((pt: any) => (
                    <option key={pt.id} value={pt.id}>{L ? pt.name_ar : pt.name_en}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedPartTypeObj && selectedPartTypeObj.aliases_ar?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-primary/10 flex flex-wrap gap-1.5 items-center text-xs">
                <span className="text-gray-500 font-semibold">{L ? 'المسميات الشائعة في السوق واليمن:' : 'Colloquial Aliases:'}</span>
                {selectedPartTypeObj.aliases_ar.map((a: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[11px] font-medium shadow-xs">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <h3 className="font-bold text-primary mb-4">{L ? 'البيانات الأساسية' : 'Basic info'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>{L ? 'الاسم (إنجليزي) *' : 'Name (EN) *'}</label><input value={form.nameEn} onChange={e => set('nameEn')(e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>{L ? 'الاسم (عربي) *' : 'Name (AR) *'}</label><input value={form.nameAr} onChange={e => set('nameAr')(e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>{L ? 'رقم القطعة (SKU)' : 'Part number (SKU)'}</label><input value={form.partNumber} onChange={e => set('partNumber')(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>OEM №</label><input value={form.oemNumber} onChange={e => set('oemNumber')(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{L ? 'الفئة القديمة / البديلة' : 'Legacy Category'}</label>
                <select value={form.categoryId} onChange={e => set('categoryId')(e.target.value)} required className={inputCls}>
                  <option value="">—</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{Lang(c.nameEn, c.nameAr, language)}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>{L ? 'الحالة' : 'Condition'}</label>
                <select value={form.condition} onChange={e => set('condition')(e.target.value)} className={inputCls}>
                  {Cond.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className={labelCls}>{L ? 'وصف (إنجليزي)' : 'Description (EN)'}</label><textarea value={form.descriptionEn} onChange={e => set('descriptionEn')(e.target.value)} rows={2} className={inputCls} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>{L ? 'رابط الصورة' : 'Image URL'}</label><input value={form.imageUrl} onChange={e => set('imageUrl')(e.target.value)} placeholder="https://…" className={inputCls} /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary flex items-center gap-2"><Barcode size={15} /> {L ? 'السعر والعرض' : 'Pricing & visibility'}</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>{L ? 'السعر' : 'Price'}</label><input type="number" min={0} value={form.price} onChange={e => set('price')(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{L ? 'إظهار السعر' : 'Price visibility'}</label>
                <select value={form.priceVisibility} onChange={e => set('priceVisibility')(e.target.value)} className={inputCls}>
                  {Vis.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>{L ? 'طريقة البيع' : 'Sale mode'}</label>
                <select value={form.saleMode} onChange={e => set('saleMode')(e.target.value)} className={inputCls}>
                  {Mode.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>{L ? 'الكمية' : 'Quantity'}</label><input type="number" min={0} value={form.quantity} onChange={e => set('quantity')(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{L ? 'حد التنبيه (min)' : 'Min stock alert'}</label><input type="number" min={0} value={form.minStock} onChange={e => set('minStock')(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{L ? 'الفرع' : 'Branch'}</label>
                <select value={form.branchId} onChange={e => set('branchId')(e.target.value)} className={inputCls}>
                  <option value="">{L ? 'الرئيسي' : 'Main'}</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.nameEn}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setShowFitWizard(v => !v)} className="font-bold text-primary flex items-center gap-2">
                {L ? 'التوافق مع المركبات' : 'Vehicle compatibility'} <span className="text-xs text-gray-400">({fitments.length})</span>
              </button>
              <button type="button" onClick={() => setShowFitWizard(v => !v)} className="text-xs text-navy font-bold">{showFitWizard ? (L ? 'إخفاء' : 'Hide') : (L ? 'إضافة' : 'Add')}</button>
            </div>
            {fitments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {fitments.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-surface px-3 py-1.5 text-xs text-primary font-medium">
                    {Lang(f.makeNameEn, f.makeNameAr, language)} {Lang(f.modelNameEn, f.modelNameAr, language)}{f.yearLabel ? ` (${f.yearLabel})` : ''}{f.engineBadge ? ` · ${f.engineBadge}` : ''}
                    <button type="button" onClick={() => setFitments((list: any[]) => list.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
            {showFitWizard && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select value={fitmentDraft.makeId} onChange={e => setFitmentDraft((d: any) => ({ ...d, makeId: e.target.value, modelId: '', generationId: '', engineId: '' }))} className={inputCls}>
                  <option value="">{L ? 'الماركة' : 'Make'}</option>
                  {makes.map(m => <option key={m.id} value={m.id}>{Lang(m.nameEn, m.nameAr, language)}</option>)}
                </select>
                <select value={fitmentDraft.modelId} onChange={e => setFitmentDraft((d: any) => ({ ...d, modelId: e.target.value, generationId: '', engineId: '' }))} disabled={!fitmentDraft.makeId} className={inputCls + ' disabled:opacity-50'}>
                  <option value="">{L ? 'الموديل' : 'Model'}</option>
                  {models.map(m => <option key={m.id} value={m.id}>{Lang(m.nameEn, m.nameAr, language)}</option>)}
                </select>
                <select value={fitmentDraft.generationId} onChange={e => setFitmentDraft((d: any) => ({ ...d, generationId: e.target.value, engineId: '' }))} disabled={!fitmentDraft.modelId} className={inputCls + ' disabled:opacity-50'}>
                  <option value="">{L ? 'الجيل' : 'Generation'}</option>
                  {generations.map(g => <option key={g.id} value={g.id}>{Lang(g.nameEn, g.nameAr, language)} ({g.yearStart}{g.yearEnd ? '-' + g.yearEnd : '+'})</option>)}
                </select>
                <select value={fitmentDraft.engineId} onChange={e => setFitmentDraft((d: any) => ({ ...d, engineId: e.target.value }))} disabled={!fitmentDraft.generationId} className={inputCls + ' disabled:opacity-50'}>
                  <option value="">{L ? 'المحرك' : 'Engine'}</option>
                  {engines.map(e => <option key={e.id} value={e.id}>{e.badge}</option>)}
                </select>
                <button type="button" onClick={addFitment} disabled={!fitmentDraft.makeId || !fitmentDraft.modelId} className="col-span-2 md:col-span-4 rounded-lg bg-navy/10 text-navy text-sm font-bold py-2 hover:bg-navy/20 disabled:opacity-40">
                  + {L ? 'إضافة توافق' : 'Add fitment'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sticky top-20">
            <h3 className="font-bold text-primary mb-2">{L ? 'معاينة' : 'Preview'}</h3>
            <div className="aspect-square rounded-xl bg-surface overflow-hidden mb-3">
              {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" alt="" onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }} /> : <Package className="mx-auto mt-20 text-primary/20" size={60} />}
            </div>
            <div className="text-sm font-bold text-primary line-clamp-2">{form.nameEn || form.nameAr}</div>
            {form.partNumber && <div className="text-xs text-gray-400 mt-0.5" dir="ltr">{form.partNumber}</div>}
            <div className="mt-2">
              {form.priceVisibility === PriceVisibility.HIDE_PRICE
                ? <span className="text-sm font-bold text-red-500">{L ? 'السعر مخفي — تواصل' : 'Price hidden — contact'}</span>
                : <span className="text-lg font-extrabold text-primary">{Number(form.price || 0).toLocaleString()}</span>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function Lang(en: string, ar: string, language: string) { return language === 'ar' && ar ? ar : en; }

export default ShopProducts;