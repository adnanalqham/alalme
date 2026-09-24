import React, { useMemo, useState } from 'react';
import { Plus, Car, Tag, Factory, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { catalogAdminService, vehicleService } from '../../api';
import { Badge, PageHeader, MobileTable, inputCls } from '../../components/ui/Primitives';
import { TaxonomyTreeManager } from '../../components/admin/TaxonomyTreeManager';
import { VehicleDatabaseManager } from '../../components/admin/VehicleDatabaseManager';

type Tab = 'taxonomy' | 'categories' | 'manufacturers' | 'vehicles';

const AdminCatalog: React.FC = () => {
  const { language } = useLanguage();
  const { categories: cats, manufacturers, makes, models, generations, engines } = useData();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('categories');
  const [tick, setTick] = useState(0);
  const [newCat, setNewCat] = useState({ nameEn: '', nameAr: '' });
  const [newMfr, setNewMfr] = useState({ nameEn: '', nameAr: '' });
  const [veh, setVeh] = useState({ makeId: '', modelId: '', generationId: '', engineId: '', nameEn: '', nameAr: '' });

  const activeMakes = useMemo(() => makes.filter((m: any) => m.isActive !== false), [makes, tick]);
  const vehModels = useMemo(() => models.filter((m: any) => m.makeId === veh.makeId), [models, veh.makeId]);
  const vehGens = useMemo(() => generations.filter((g: any) => g.modelId === veh.modelId), [generations, veh.modelId]);
  const vehEngs = useMemo(() => engines.filter((e: any) => e.generationId === veh.generationId), [engines, veh.generationId]);

  const addCat = () => {
    try { catalogAdminService.addCategory(newCat); toast(language === 'ar' ? 'تمت إضافة الفئة' : 'Category added', { kind: 'success' }); setNewCat({ nameEn: '', nameAr: '' }); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };
  const addMfr = () => {
    try { catalogAdminService.addManufacturer(newMfr); toast(language === 'ar' ? 'تمت إضافة الماركة' : 'Manufacturer added', { kind: 'success' }); setNewMfr({ nameEn: '', nameAr: '' }); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };
  const addMake = () => {
    if (!veh.nameEn || !veh.nameAr) return;
    try { vehicleService.addMake({ nameEn: veh.nameEn, nameAr: veh.nameAr }); toast('Make +', { kind: 'success' }); setVeh(v => ({ ...v, nameEn: '', nameAr: '' })); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };
  const addModel = () => {
    if (!veh.makeId || !veh.nameEn || !veh.nameAr) return;
    try { vehicleService.addModel(veh.makeId, { nameEn: veh.nameEn, nameAr: veh.nameAr }); toast('Model +', { kind: 'success' }); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };
  const addGeneration = () => {
    if (!veh.modelId || !veh.nameEn) return;
    try { vehicleService.addGeneration(veh.modelId, { nameEn: veh.nameEn, nameAr: veh.nameAr || veh.nameEn, yearStart: 2015, yearEnd: 2024 }); toast('Generation +', { kind: 'success' }); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };
  const addEngine = () => {
    if (!veh.generationId || !veh.nameEn) return;
    try { vehicleService.addEngine(veh.generationId, { nameEn: veh.nameEn, nameAr: veh.nameAr || veh.nameEn, badge: veh.nameEn }); toast('Engine +', { kind: 'success' }); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const toggle = (kind: 'category' | 'manufacturer', id: string) => {
    try { if (kind === 'category') catalogAdminService.toggleCategory(id); else catalogAdminService.toggleManufacturer(id); setTick(x => x + 1); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'taxonomy', label: language === 'ar' ? 'شجرة تصنيف القطع (Taxonomy)' : 'Parts Taxonomy Tree', icon: <Layers size={14} /> },
    { key: 'categories', label: language === 'ar' ? 'الفئات العامة' : 'General Categories', icon: <Tag size={14} /> },
    { key: 'manufacturers', label: language === 'ar' ? 'المصنعون' : 'Manufacturers', icon: <Factory size={14} /> },
    { key: 'vehicles', label: language === 'ar' ? 'المركبات' : 'Vehicles', icon: <Car size={14} /> },
  ];

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'إدارة الكتالوج والتصنيف' : 'Catalog & Taxonomy Admin'} subtitle={language === 'ar' ? 'التصنيف الشامل لقطع الغيار، الفئات، المصنعين وشجرة المركبات' : 'Parts taxonomy tree, categories, manufacturers and vehicle models'} />

      <div className="flex gap-2 mb-4 border-b border-gray-100 overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`px-4 py-2.5 text-sm font-bold rounded-t-xl -mb-px flex items-center gap-1.5 whitespace-nowrap ${tab === tb.key ? 'bg-white text-primary border border-gray-100 border-b-white shadow-xs' : 'text-gray-400 hover:text-primary'}`}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {tab === 'taxonomy' && (
        <TaxonomyTreeManager />
      )}

      {tab === 'categories' && (
        <div className="max-w-3xl space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex gap-2">
            <input value={newCat.nameEn} onChange={e => setNewCat(c => ({ ...c, nameEn: e.target.value }))} placeholder="EN name" className={inputCls} />
            <input value={newCat.nameAr} onChange={e => setNewCat(c => ({ ...c, nameAr: e.target.value }))} placeholder="الاسم (عربي)" className={inputCls} />
            <button onClick={addCat} className="rounded-xl bg-primary text-white px-4 text-sm font-bold hover:bg-navy shrink-0"><Plus size={15} /></button>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <MobileTable
              headers={[language === 'ar' ? 'الفئة' : 'Category', language === 'ar' ? 'الحالة' : 'Status', '']}
              empty="—"
              rows={cats.map(c => [
                <span key="n" className="font-semibold text-primary">{c.nameEn}{c.nameAr ? ` / ${c.nameAr}` : ''}</span>,
                <Badge key="s" tone={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'ON' : 'OFF'}</Badge>,
                <button key="t" onClick={() => toggle('category', c.id)} className="rounded-lg border border-gray-100 px-3 py-1 text-xs font-bold text-primary hover:bg-surface">{c.isActive ? 'OFF' : 'ON'}</button>,
              ])}
            />
          </div>
        </div>
      )}

      {tab === 'manufacturers' && (
        <div className="max-w-3xl space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex gap-2">
            <input value={newMfr.nameEn} onChange={e => setNewMfr(m => ({ ...m, nameEn: e.target.value }))} placeholder="EN name" className={inputCls} />
            <input value={newMfr.nameAr} onChange={e => setNewMfr(m => ({ ...m, nameAr: e.target.value }))} placeholder="الاسم (عربي)" className={inputCls} />
            <button onClick={addMfr} className="rounded-xl bg-primary text-white px-4 text-sm font-bold hover:bg-navy shrink-0"><Plus size={15} /></button>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <MobileTable
              headers={['', language === 'ar' ? 'الحالة' : 'Status', '']}
              empty="—"
              rows={manufacturers.map(m => [
                <span key="n" className="font-semibold text-primary">{m.nameEn}{m.nameAr ? ` / ${m.nameAr}` : ''}</span>,
                <Badge key="s" tone={m.isActive ? 'success' : 'danger'}>{m.isActive ? 'ON' : 'OFF'}</Badge>,
                <button key="t" onClick={() => toggle('manufacturer', m.id)} className="rounded-lg border border-gray-100 px-3 py-1 text-xs font-bold text-primary hover:bg-surface">{m.isActive ? 'OFF' : 'ON'}</button>,
              ])}
            />
          </div>
        </div>
      )}

      {tab === 'vehicles' && (
        <VehicleDatabaseManager />
      )}
    </div>
  );
};

export default AdminCatalog;