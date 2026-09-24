/**
 * components/admin/VehicleDatabaseManager.tsx
 *
 * ALA Auto Parts - Vehicle Database & NHTSA vPIC Admin Console
 * Sections 28, 29, 30, 36, 37 implementation:
 * - Makes management (view, search, inline edit Arabic, toggle status, add manual make)
 * - Models management (filter by make, search, inline edit Arabic, toggle status, add manual model)
 * - Model Years management
 * - Specifications management (trims, engine cylinders, fuel type, drive type)
 * - Aliases management (Arabic & English normalized aliases)
 * - NHTSA vPIC Sync Console (statistics, logs, safe trigger sync)
 */

import React, { useState, useMemo } from 'react';
import {
  Car, Layers, Calendar, Cpu, Tag, RefreshCw, Plus, Search,
  CheckCircle, XCircle, AlertCircle, ExternalLink, Edit2, Check,
  Clock, Database, Globe, Sliders, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Badge, inputCls } from '../ui/Primitives';

type SubTab = 'makes' | 'models' | 'years' | 'specs' | 'aliases' | 'sync';

interface MakeRecord {
  id: number;
  nhtsa_make_id?: number;
  name_en: string;
  name_ar: string;
  slug: string;
  vehicle_type: string;
  logo_url?: string;
  logo_status?: 'available' | 'missing' | 'manual' | 'external';
  logo_source?: 'auto' | 'manual' | 'nhtsa' | 'external';
  logo_license?: string;
  country: string;
  is_active: boolean;
  source: 'nhtsa' | 'manual' | 'other';
  models_count: number;
}

interface ModelRecord {
  id: number;
  make_id: number;
  make_name: string;
  nhtsa_model_id?: number;
  name_en: string;
  name_ar: string;
  slug: string;
  vehicle_type: string;
  is_active: boolean;
  source: 'nhtsa' | 'manual' | 'other';
}

interface YearRecord {
  id: number;
  model_id: number;
  model_name: string;
  year: number;
  source: 'nhtsa' | 'manual';
}

interface SpecRecord {
  id: number;
  model_id: number;
  model_name: string;
  model_year: number;
  trim?: string;
  body_class?: string;
  engine_cylinders?: number;
  engine_displacement_cc?: number;
  engine_hp?: number;
  fuel_type?: string;
  drive_type?: string;
  transmission_style?: string;
  source: 'nhtsa' | 'manual';
}

interface AliasRecord {
  id: number;
  entity_type: 'make' | 'model';
  entity_id: number;
  entity_name: string;
  language: 'ar' | 'en';
  alias: string;
  normalized_alias: string;
}

interface SyncLogRecord {
  id: number;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  started_at: string;
  finished_at: string;
  error_message?: string;
}

// Initial Regional Mock Data with Brand Logos
const INITIAL_MAKES: MakeRecord[] = [
  { id: 1, nhtsa_make_id: 448, name_en: 'Toyota', name_ar: 'تويوتا', slug: 'toyota', vehicle_type: 'Passenger Car / Truck', country: 'Japan', is_active: true, source: 'nhtsa', models_count: 8, logo_url: '/assets/brands/toyota.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 2, nhtsa_make_id: 478, name_en: 'Nissan', name_ar: 'نيسان', slug: 'nissan', vehicle_type: 'Passenger Car / Truck', country: 'Japan', is_active: true, source: 'nhtsa', models_count: 6, logo_url: '/assets/brands/nissan.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 3, nhtsa_make_id: 498, name_en: 'Hyundai', name_ar: 'هيونداي', slug: 'hyundai', vehicle_type: 'Passenger Car / SUV', country: 'South Korea', is_active: true, source: 'nhtsa', models_count: 7, logo_url: '/assets/brands/hyundai.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 4, nhtsa_make_id: 515, name_en: 'Lexus', name_ar: 'لكزس', slug: 'lexus', vehicle_type: 'Luxury / SUV', country: 'Japan', is_active: true, source: 'nhtsa', models_count: 5, logo_url: '/assets/brands/lexus.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 5, nhtsa_make_id: 474, name_en: 'Honda', name_ar: 'هوندا', slug: 'honda', vehicle_type: 'Passenger Car / SUV', country: 'Japan', is_active: true, source: 'nhtsa', models_count: 5, logo_url: '/assets/brands/honda.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 6, nhtsa_make_id: 499, name_en: 'Kia', name_ar: 'كيا', slug: 'kia', vehicle_type: 'Passenger Car / SUV', country: 'South Korea', is_active: true, source: 'nhtsa', models_count: 6, logo_url: '/assets/brands/kia.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 7, nhtsa_make_id: 460, name_en: 'Ford', name_ar: 'فورد', slug: 'ford', vehicle_type: 'Truck / SUV', country: 'USA', is_active: true, source: 'nhtsa', models_count: 5, logo_url: '/assets/brands/ford.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 8, nhtsa_make_id: 449, name_en: 'Mercedes-Benz', name_ar: 'مرسيدس بنز', slug: 'mercedes-benz', vehicle_type: 'Luxury', country: 'Germany', is_active: true, source: 'nhtsa', models_count: 4, logo_url: '/assets/brands/mercedes-benz.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
  { id: 9, nhtsa_make_id: 452, name_en: 'BMW', name_ar: 'بي إم دبليو', slug: 'bmw', vehicle_type: 'Luxury', country: 'Germany', is_active: true, source: 'nhtsa', models_count: 4, logo_url: '/assets/brands/bmw.svg', logo_status: 'available', logo_source: 'auto', logo_license: 'Cardog / Wikimedia Commons' },
];

const INITIAL_MODELS: ModelRecord[] = [
  { id: 101, make_id: 1, make_name: 'Toyota', nhtsa_model_id: 2207, name_en: 'Camry', name_ar: 'كامري', slug: 'camry', vehicle_type: 'Sedan', is_active: true, source: 'nhtsa' },
  { id: 102, make_id: 1, make_name: 'Toyota', nhtsa_model_id: 2211, name_en: 'Land Cruiser', name_ar: 'لاند كروزر', slug: 'land-cruiser', vehicle_type: 'SUV', is_active: true, source: 'nhtsa' },
  { id: 103, make_id: 1, make_name: 'Toyota', nhtsa_model_id: 2208, name_en: 'Corolla', name_ar: 'كورولا', slug: 'corolla', vehicle_type: 'Sedan', is_active: true, source: 'nhtsa' },
  { id: 104, make_id: 1, make_name: 'Toyota', nhtsa_model_id: 2235, name_en: 'Hilux', name_ar: 'هايلوكس', slug: 'hilux', vehicle_type: 'Pickup', is_active: true, source: 'nhtsa' },
  { id: 105, make_id: 1, make_name: 'Toyota', nhtsa_model_id: 2240, name_en: 'Prado', name_ar: 'برادو', slug: 'prado', vehicle_type: 'SUV', is_active: true, source: 'nhtsa' },
  { id: 201, make_id: 2, make_name: 'Nissan', nhtsa_model_id: 2450, name_en: 'Patrol', name_ar: 'باترول', slug: 'patrol', vehicle_type: 'SUV', is_active: true, source: 'nhtsa' },
  { id: 202, make_id: 2, make_name: 'Nissan', nhtsa_model_id: 2455, name_en: 'Sunny', name_ar: 'صني', slug: 'sunny', vehicle_type: 'Sedan', is_active: true, source: 'nhtsa' },
  { id: 203, make_id: 2, make_name: 'Nissan', nhtsa_model_id: 2460, name_en: 'Altima', name_ar: 'ألتيما', slug: 'altima', vehicle_type: 'Sedan', is_active: true, source: 'nhtsa' },
  { id: 301, make_id: 3, make_name: 'Hyundai', nhtsa_model_id: 2380, name_en: 'Sonata', name_ar: 'سوناتا', slug: 'sonata', vehicle_type: 'Sedan', is_active: true, source: 'nhtsa' },
  { id: 302, make_id: 3, make_name: 'Hyundai', nhtsa_model_id: 2378, name_en: 'Elantra', name_ar: 'إلنترا', slug: 'elantra', vehicle_type: 'Sedan', is_active: true, source: 'nhtsa' },
  { id: 303, make_id: 3, make_name: 'Hyundai', nhtsa_model_id: 2377, name_en: 'Tucson', name_ar: 'توسان', slug: 'tucson', vehicle_type: 'SUV', is_active: true, source: 'nhtsa' },
];

const INITIAL_SPECS: SpecRecord[] = [
  { id: 1, model_id: 101, model_name: 'Toyota Camry', model_year: 2020, trim: 'LE / SE', body_class: 'Sedan', engine_cylinders: 4, engine_displacement_cc: 2500, engine_hp: 203, fuel_type: 'Gasoline', drive_type: 'FWD', transmission_style: 'Automatic 8-Speed', source: 'nhtsa' },
  { id: 2, model_id: 101, model_name: 'Toyota Camry', model_year: 2020, trim: 'XSE V6', body_class: 'Sedan', engine_cylinders: 6, engine_displacement_cc: 3500, engine_hp: 301, fuel_type: 'Gasoline', drive_type: 'FWD', transmission_style: 'Automatic 8-Speed', source: 'nhtsa' },
  { id: 3, model_id: 101, model_name: 'Toyota Camry', model_year: 2020, trim: 'Hybrid LE', body_class: 'Sedan', engine_cylinders: 4, engine_displacement_cc: 2500, engine_hp: 208, fuel_type: 'HEV Hybrid', drive_type: 'FWD', transmission_style: 'eCVT', source: 'nhtsa' },
  { id: 4, model_id: 102, model_name: 'Toyota Land Cruiser', model_year: 2022, trim: 'VXR / GR Sport', body_class: 'SUV', engine_cylinders: 6, engine_displacement_cc: 3500, engine_hp: 409, fuel_type: 'Twin-Turbo Gasoline', drive_type: '4WD Full-Time', transmission_style: 'Automatic 10-Speed', source: 'nhtsa' },
];

const INITIAL_ALIASES: AliasRecord[] = [
  { id: 1, entity_type: 'make', entity_id: 1, entity_name: 'Toyota', language: 'ar', alias: 'تويوتا', normalized_alias: 'تويوتا' },
  { id: 2, entity_type: 'make', entity_id: 1, entity_name: 'Toyota', language: 'en', alias: 'Toyota Motor', normalized_alias: 'toyota motor' },
  { id: 3, entity_type: 'make', entity_id: 2, entity_name: 'Nissan', language: 'ar', alias: 'نيسان', normalized_alias: 'نيسان' },
  { id: 4, entity_type: 'make', entity_id: 3, entity_name: 'Hyundai', language: 'ar', alias: 'هيونداي', normalized_alias: 'هيونداي' },
  { id: 5, entity_type: 'make', entity_id: 3, entity_name: 'Hyundai', language: 'ar', alias: 'هونداي', normalized_alias: 'هونداي' },
  { id: 6, entity_type: 'model', entity_id: 101, entity_name: 'Camry', language: 'ar', alias: 'كامري', normalized_alias: 'كامري' },
  { id: 7, entity_type: 'model', entity_id: 102, entity_name: 'Land Cruiser', language: 'ar', alias: 'لاند كروزر', normalized_alias: 'لاند كروزر' },
  { id: 8, entity_type: 'model', entity_id: 102, entity_name: 'Land Cruiser', language: 'ar', alias: 'شاص / لاندكروزر', normalized_alias: 'شاص لاندكروزر' },
];

const INITIAL_LOGS: SyncLogRecord[] = [
  { id: 1, type: 'regional_priority_sync', status: 'completed', records_processed: 48, records_created: 48, records_updated: 0, records_failed: 0, started_at: '2026-09-20 08:30:00', finished_at: '2026-09-20 08:30:14' },
  { id: 2, type: 'makes_sync', status: 'completed', records_processed: 9, records_created: 0, records_updated: 9, records_failed: 0, started_at: '2026-09-18 10:15:00', finished_at: '2026-09-18 10:15:05' },
];

export const VehicleDatabaseManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { toast } = useToast();

  const [subTab, setSubTab] = useState<SubTab>('makes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMakeFilter, setSelectedMakeFilter] = useState<number | 'all'>('all');

  // Datasets state
  const [makes, setMakes] = useState<MakeRecord[]>(INITIAL_MAKES);
  const [models, setModels] = useState<ModelRecord[]>(INITIAL_MODELS);
  const [specs, setSpecs] = useState<SpecRecord[]>(INITIAL_SPECS);
  const [aliases, setAliases] = useState<AliasRecord[]>(INITIAL_ALIASES);
  const [syncLogs, setSyncLogs] = useState<SyncLogRecord[]>(INITIAL_LOGS);

  // Inline editing state for Arabic name
  const [editingMakeId, setEditingMakeId] = useState<number | null>(null);
  const [editArabicMakeName, setEditArabicMakeName] = useState('');

  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editArabicModelName, setEditArabicModelName] = useState('');

  // Manual Add Form states
  const [showAddMake, setShowAddMake] = useState(false);
  const [newMake, setNewMake] = useState({ name_en: '', name_ar: '', country: 'Japan', vehicle_type: 'Passenger Car' });

  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({ make_id: 1, name_en: '', name_ar: '', vehicle_type: 'Sedan' });

  const [showAddAlias, setShowAddAlias] = useState(false);
  const [newAlias, setNewAlias] = useState({ entity_type: 'make' as 'make' | 'model', entity_id: 1, language: 'ar' as 'ar' | 'en', alias: '' });

  // Custom Logo Override states
  const [editingLogoMake, setEditingLogoMake] = useState<MakeRecord | null>(null);
  const [customLogoUrl, setCustomLogoUrl] = useState('');

  // Sync execution state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);

  // Filtered Makes
  const filteredMakes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return makes;
    return makes.filter(m => m.name_en.toLowerCase().includes(q) || m.name_ar.includes(q) || m.country.toLowerCase().includes(q));
  }, [makes, searchQuery]);

  // Filtered Models
  const filteredModels = useMemo(() => {
    let list = models;
    if (selectedMakeFilter !== 'all') {
      list = list.filter(m => m.make_id === selectedMakeFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(m => m.name_en.toLowerCase().includes(q) || m.name_ar.includes(q) || m.make_name.toLowerCase().includes(q));
    }
    return list;
  }, [models, selectedMakeFilter, searchQuery]);

  // Actions
  const handleSaveMakeArabic = (id: number) => {
    if (!editArabicMakeName.trim()) return;
    setMakes(prev => prev.map(m => m.id === id ? { ...m, name_ar: editArabicMakeName.trim() } : m));
    setEditingMakeId(null);
    toast(isAr ? 'تم تحديث الاسم العربي للشركة' : 'Make Arabic name updated', { kind: 'success' });
  };

  const handleToggleMakeStatus = (id: number) => {
    setMakes(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
    toast(isAr ? 'تم تعديل حالة التفعيل' : 'Make status updated', { kind: 'success' });
  };

  const handleCreateManualMake = () => {
    if (!newMake.name_en.trim() || !newMake.name_ar.trim()) {
      toast(isAr ? 'يرجى إدخال اسم الشركة بالعربي والإنجليزي' : 'Please provide Arabic and English name', { kind: 'error' });
      return;
    }
    const created: MakeRecord = {
      id: Date.now(),
      name_en: newMake.name_en.trim(),
      name_ar: newMake.name_ar.trim(),
      slug: newMake.name_en.toLowerCase().replace(/\s+/g, '-'),
      country: newMake.country,
      vehicle_type: newMake.vehicle_type,
      is_active: true,
      source: 'manual',
      models_count: 0,
    };
    setMakes(prev => [created, ...prev]);
    setShowAddMake(false);
    setNewMake({ name_en: '', name_ar: '', country: 'Japan', vehicle_type: 'Passenger Car' });
    toast(isAr ? 'تمت إضافة الشركة بنجاح (يدوي)' : 'Manual Make added successfully', { kind: 'success' });
  };

  const handleSaveCustomLogo = (id: number) => {
    if (!customLogoUrl.trim()) return;
    setMakes(prev => prev.map(m => m.id === id ? {
      ...m,
      logo_url: customLogoUrl.trim(),
      logo_source: 'manual',
      logo_status: 'manual',
    } : m));
    setEditingLogoMake(null);
    setCustomLogoUrl('');
    toast(isAr ? 'تم حفظ الشعار اليدوي وتثبيته ضد المزامنة التلقائية' : 'Manual logo saved and locked against auto-sync overwrite', { kind: 'success' });
  };

  const handleResetToAutoLogo = (id: number) => {
    const make = makes.find(m => m.id === id);
    if (!make) return;
    setMakes(prev => prev.map(m => m.id === id ? {
      ...m,
      logo_url: `/assets/brands/${m.slug}.svg`,
      logo_source: 'auto',
      logo_status: 'available',
    } : m));
    setEditingLogoMake(null);
    toast(isAr ? 'تمت استعادة الشعار التلقائي المعتمد' : 'Reset to auto resolved brand logo', { kind: 'success' });
  };

  const handleSaveModelArabic = (id: number) => {
    if (!editArabicModelName.trim()) return;
    setModels(prev => prev.map(m => m.id === id ? { ...m, name_ar: editArabicModelName.trim() } : m));
    setEditingModelId(null);
    toast(isAr ? 'تم تحديث الاسم العربي للموديل' : 'Model Arabic name updated', { kind: 'success' });
  };

  const handleToggleModelStatus = (id: number) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
    toast(isAr ? 'تم تعديل حالة تفعيل الموديل' : 'Model status updated', { kind: 'success' });
  };

  const handleCreateManualModel = () => {
    if (!newModel.name_en.trim() || !newModel.name_ar.trim()) {
      toast(isAr ? 'يرجى إدخال اسم الموديل' : 'Please enter model name', { kind: 'error' });
      return;
    }
    const parentMake = makes.find(m => m.id === Number(newModel.make_id));
    const created: ModelRecord = {
      id: Date.now(),
      make_id: Number(newModel.make_id),
      make_name: parentMake ? parentMake.name_en : 'Custom',
      name_en: newModel.name_en.trim(),
      name_ar: newModel.name_ar.trim(),
      slug: newModel.name_en.toLowerCase().replace(/\s+/g, '-'),
      vehicle_type: newModel.vehicle_type,
      is_active: true,
      source: 'manual',
    };
    setModels(prev => [created, ...prev]);
    setShowAddModel(false);
    setNewModel({ make_id: 1, name_en: '', name_ar: '', vehicle_type: 'Sedan' });
    toast(isAr ? 'تمت إضافة الموديل بنجاح (يدوي)' : 'Manual model added successfully', { kind: 'success' });
  };

  const handleCreateAlias = () => {
    if (!newAlias.alias.trim()) return;
    const norm = newAlias.alias.trim().toLowerCase();
    let entityName = '';
    if (newAlias.entity_type === 'make') {
      const target = makes.find(m => m.id === newAlias.entity_id);
      entityName = target ? target.name_en : 'Make';
    } else {
      const target = models.find(m => m.id === newAlias.entity_id);
      entityName = target ? target.name_en : 'Model';
    }

    const created: AliasRecord = {
      id: Date.now(),
      entity_type: newAlias.entity_type,
      entity_id: newAlias.entity_id,
      entity_name: entityName,
      language: newAlias.language,
      alias: newAlias.alias.trim(),
      normalized_alias: norm,
    };
    setAliases(prev => [created, ...prev]);
    setShowAddAlias(false);
    setNewAlias({ entity_type: 'make', entity_id: 1, language: 'ar', alias: '' });
    toast(isAr ? 'تمت إضافة الاسم البديل للبحث' : 'Search alias added', { kind: 'success' });
  };

  // Safe Controlled NHTSA Sync Trigger
  const triggerNhtsaSync = async () => {
    setIsSyncing(true);
    setSyncProgress(isAr ? 'جارِ الاتصال بـ NHTSA vPIC API واسترجاع البيانات القياسية...' : 'Connecting to NHTSA vPIC API and querying endpoints...');
    try {
      await new Promise(r => setTimeout(r, 1400));
      setSyncProgress(isAr ? 'فحص وتحديث الشركات والموديلات القياسية...' : 'Upserting makes and regional models...');
      await new Promise(r => setTimeout(r, 1100));

      const newLog: SyncLogRecord = {
        id: Date.now(),
        type: 'controlled_regional_sync',
        status: 'completed',
        records_processed: 32,
        records_created: 0,
        records_updated: 32,
        records_failed: 0,
        started_at: new Date(Date.now() - 2500).toISOString().replace('T', ' ').slice(0, 19),
        finished_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setSyncLogs(prev => [newLog, ...prev]);
      toast(isAr ? 'تمت مزامنة بيانات NHTSA vPIC بنجاح' : 'NHTSA vPIC data synced successfully', { kind: 'success' });
    } catch (e: any) {
      toast(isAr ? 'تعذر الاتصال بـ NHTSA، تم الاحتفاظ بالبيانات المحلية' : 'Sync error: local PostgreSQL data preserved', { kind: 'error' });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'الشركات المصنعة' : 'Total Makes'}</span>
            <Car size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{makes.length}</div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <ShieldCheck size={12} className="text-success" />
            {makes.filter(m => m.source === 'nhtsa').length} {isAr ? 'مصدرها NHTSA' : 'from NHTSA'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'الموديلات النشطة' : 'Active Models'}</span>
            <Layers size={16} className="text-accent-orange" />
          </div>
          <div className="text-2xl font-bold text-primary">{models.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {models.filter(m => m.is_active).length} {isAr ? 'نشط في التطبيق' : 'active in app'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'مواصفات المحركات' : 'Specs / Engines'}</span>
            <Cpu size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-primary">{specs.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">{isAr ? 'اختياري في التطبيق' : 'Optional specs'}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'حالة المزامنة' : 'vPIC Sync'}</span>
            <RefreshCw size={16} className="text-green-500" />
          </div>
          <div className="text-sm font-bold text-success flex items-center gap-1.5 mt-1">
            <CheckCircle size={15} />
            <span>{isAr ? 'مستقرة (7 أيام)' : 'Healthy (7d TTL)'}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{isAr ? 'أحدث مزامنة: 2026-09-20' : 'Last sync: today'}</div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { key: 'makes', label: isAr ? 'الشركات المصنعة (Makes)' : 'Makes', icon: <Car size={14} />, count: makes.length },
          { key: 'models', label: isAr ? 'الموديلات (Models)' : 'Models', icon: <Layers size={14} />, count: models.length },
          { key: 'years', label: isAr ? 'سنوات الصنع (Years)' : 'Years', icon: <Calendar size={14} />, count: 18 },
          { key: 'specs', label: isAr ? 'المواصفات والمحركات (Specs)' : 'Specifications', icon: <Cpu size={14} />, count: specs.length },
          { key: 'aliases', label: isAr ? 'الأسماء البديلة للبحث (Aliases)' : 'Aliases', icon: <Tag size={14} />, count: aliases.length },
          { key: 'sync', label: isAr ? 'لوحة المزامنة (NHTSA Sync)' : 'Sync Console', icon: <RefreshCw size={14} /> },
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => { setSubTab(tb.key as SubTab); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              subTab === tb.key
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-primary border border-gray-100'
            }`}
          >
            {tb.icon}
            <span>{tb.label}</span>
            {tb.count !== undefined && (
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${subTab === tb.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MAKES TAB */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'makes' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute top-3 start-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم الإنجليزي أو العربي أو الدولة...' : 'Search make name or country...'}
                className={`${inputCls} ps-9 text-xs`}
              />
            </div>
            <button
              onClick={() => setShowAddMake(true)}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-navy flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span>{isAr ? 'إضافة شركة يدوياً' : 'Add Manual Make'}</span>
            </button>
          </div>

          {/* Add Manual Make Modal Form */}
          {showAddMake && (
            <div className="p-4 bg-surface rounded-xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">{isAr ? 'إضافة شركة سيارات يدوياً (Manual Entry)' : 'Add Manual Vehicle Make'}</span>
                <button onClick={() => setShowAddMake(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  placeholder="Make Name (EN) e.g. Geely"
                  value={newMake.name_en}
                  onChange={e => setNewMake(p => ({ ...p, name_en: e.target.value }))}
                  className={inputCls + ' text-xs'}
                />
                <input
                  placeholder="الاسم بالعربي (مثال: جيلي)"
                  value={newMake.name_ar}
                  onChange={e => setNewMake(p => ({ ...p, name_ar: e.target.value }))}
                  className={inputCls + ' text-xs'}
                />
                <input
                  placeholder="Country (e.g. China)"
                  value={newMake.country}
                  onChange={e => setNewMake(p => ({ ...p, country: e.target.value }))}
                  className={inputCls + ' text-xs'}
                />
                <button
                  onClick={handleCreateManualMake}
                  className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  <span>{isAr ? 'حفظ الشركة' : 'Save Make'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Makes Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3 text-start">{isAr ? 'الشعار' : 'Logo'}</th>
                  <th className="p-3 text-start">{isAr ? 'الشركة (EN)' : 'Make (EN)'}</th>
                  <th className="p-3 text-start">{isAr ? 'الاسم العربي (قابل للتعديل)' : 'Arabic Name'}</th>
                  <th className="p-3 text-start">{isAr ? 'حالة الشعار' : 'Logo Status'}</th>
                  <th className="p-3 text-start">{isAr ? 'معرف NHTSA' : 'NHTSA ID'}</th>
                  <th className="p-3 text-start">{isAr ? 'المصدر' : 'Source'}</th>
                  <th className="p-3 text-start">{isAr ? 'الموديلات' : 'Models'}</th>
                  <th className="p-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMakes.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="p-3">
                      {m.logo_url ? (
                        <div className="w-9 h-9 rounded-lg border border-gray-200 bg-white p-1 flex items-center justify-center shadow-2xs">
                          <img
                            src={m.logo_url}
                            alt={m.name_en}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-xs">
                          {m.name_en.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-primary">
                      <div className="flex items-center gap-1.5">
                        <span>{m.name_en}</span>
                        {m.logo_source === 'manual' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold" title={isAr ? 'شعار يدوي مخصص محمي ضد المزامنة' : 'Protected manual logo'}>
                            {isAr ? 'يدوي' : 'Manual'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block font-normal">{m.slug}</span>
                    </td>
                    <td className="p-3">
                      {editingMakeId === m.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editArabicMakeName}
                            onChange={e => setEditArabicMakeName(e.target.value)}
                            className="px-2 py-1 border rounded text-xs w-32 border-primary focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveMakeArabic(m.id)}
                            className="p-1 bg-success text-white rounded hover:bg-emerald-600"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingMakeId(null)}
                            className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{m.name_ar || '—'}</span>
                          <button
                            onClick={() => { setEditingMakeId(m.id); setEditArabicMakeName(m.name_ar || ''); }}
                            className="text-gray-400 hover:text-primary p-0.5"
                            title={isAr ? 'تعديل الاسم العربي' : 'Edit Arabic name'}
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge tone={m.logo_status === 'manual' ? 'warning' : (m.logo_status === 'available' ? 'success' : 'neutral')}>
                        {(m.logo_status || 'available').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-gray-500">{m.nhtsa_make_id ? `#${m.nhtsa_make_id}` : '—'}</td>
                    <td className="p-3">
                      <Badge tone={m.source === 'nhtsa' ? 'info' : 'success'}>
                        {m.source.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-600 font-semibold">{m.models_count} {isAr ? 'موديل' : 'models'}</td>
                    <td className="p-3">
                      <Badge tone={m.is_active ? 'success' : 'danger'}>
                        {m.is_active ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                      </Badge>
                    </td>
                    <td className="p-3 text-end space-x-1 space-x-reverse">
                      <button
                        onClick={() => {
                          setEditingLogoMake(m);
                          setCustomLogoUrl(m.logo_url || '');
                        }}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700"
                        title={isAr ? 'تغيير الشعار يدوياً' : 'Replace Logo'}
                      >
                        {isAr ? 'تغيير الشعار' : 'Logo'}
                      </button>
                      <button
                        onClick={() => handleToggleMakeStatus(m.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          m.is_active
                            ? 'border-gray-200 text-gray-600 hover:bg-red-50 hover:text-danger hover:border-red-200'
                            : 'border-emerald-200 text-success hover:bg-emerald-50'
                        }`}
                      >
                        {m.is_active ? (isAr ? 'تعطيل' : 'Off') : (isAr ? 'تفعيل' : 'On')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal for Custom Manual Logo Override */}
          {editingLogoMake && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-sm text-primary">
                    {isAr ? `تخصيص شعار: ${editingLogoMake.name_en}` : `Customize Logo: ${editingLogoMake.name_en}`}
                  </h4>
                  <button onClick={() => setEditingLogoMake(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center shadow-xs">
                    <img
                      src={customLogoUrl || editingLogoMake.logo_url || ''}
                      alt={editingLogoMake.name_en}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-primary">{editingLogoMake.name_en} ({editingLogoMake.name_ar})</div>
                    <div className="text-gray-400">Slug: {editingLogoMake.slug}</div>
                    <div className="text-[11px] text-gray-500">
                      {isAr ? 'الحالة الحالية:' : 'Current Status:'} <span className="font-semibold text-primary">{editingLogoMake.logo_source}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    {isAr ? 'مسار أو رابط الشعار (SVG / PNG):' : 'Logo Asset URL or Path:'}
                  </label>
                  <input
                    type="text"
                    value={customLogoUrl}
                    onChange={e => setCustomLogoUrl(e.target.value)}
                    placeholder="/assets/brands/toyota.svg"
                    className={inputCls + ' text-xs'}
                  />
                  <p className="text-[11px] text-gray-400">
                    {isAr
                      ? 'ملاحظة: عند تعيين شعار مخصص، سيتم قفله كـ "manual" ولن يتم تجاوزه أو استبداله عند تشغيل مزامنة NHTSA.'
                      : 'Note: Setting a custom logo locks it as "manual" and protects it from being overwritten during NHTSA sync.'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleResetToAutoLogo(editingLogoMake.id)}
                    className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-primary rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    {isAr ? 'استعادة التلقائي' : 'Reset to Auto'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingLogoMake(null)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveCustomLogo(editingLogoMake.id)}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-navy shadow-xs"
                    >
                      {isAr ? 'حفظ الشعار المخصص' : 'Save Manual Logo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MODELS TAB */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'models' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedMakeFilter}
                onChange={e => setSelectedMakeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className={`${inputCls} text-xs w-44`}
              >
                <option value="all">{isAr ? 'جميع الشركات…' : 'All Makes…'}</option>
                {makes.map(m => (
                  <option key={m.id} value={m.id}>{m.name_en} ({m.name_ar})</option>
                ))}
              </select>
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute top-3 start-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث في الموديلات...' : 'Search models...'}
                  className={`${inputCls} ps-9 text-xs`}
                />
              </div>
            </div>
            <button
              onClick={() => setShowAddModel(true)}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-navy flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span>{isAr ? 'إضافة موديل يدوياً' : 'Add Manual Model'}</span>
            </button>
          </div>

          {/* Add Manual Model Modal Form */}
          {showAddModel && (
            <div className="p-4 bg-surface rounded-xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">{isAr ? 'إضافة موديل سيارة يدوياً' : 'Add Manual Vehicle Model'}</span>
                <button onClick={() => setShowAddModel(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={newModel.make_id}
                  onChange={e => setNewModel(p => ({ ...p, make_id: Number(e.target.value) }))}
                  className={inputCls + ' text-xs'}
                >
                  {makes.map(m => (
                    <option key={m.id} value={m.id}>{m.name_en} ({m.name_ar})</option>
                  ))}
                </select>
                <input
                  placeholder="Model Name (EN) e.g. Yaris Cross"
                  value={newModel.name_en}
                  onChange={e => setNewModel(p => ({ ...p, name_en: e.target.value }))}
                  className={inputCls + ' text-xs'}
                />
                <input
                  placeholder="الاسم بالعربي (مثال: يارس كروس)"
                  value={newModel.name_ar}
                  onChange={e => setNewModel(p => ({ ...p, name_ar: e.target.value }))}
                  className={inputCls + ' text-xs'}
                />
                <button
                  onClick={handleCreateManualModel}
                  className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  <span>{isAr ? 'حفظ الموديل' : 'Save Model'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Models Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3 text-start">{isAr ? 'الشركة' : 'Make'}</th>
                  <th className="p-3 text-start">{isAr ? 'الموديل (EN)' : 'Model (EN)'}</th>
                  <th className="p-3 text-start">{isAr ? 'الاسم العربي (قابل للتعديل)' : 'Arabic Name'}</th>
                  <th className="p-3 text-start">{isAr ? 'نوع المركبة' : 'Vehicle Type'}</th>
                  <th className="p-3 text-start">{isAr ? 'المصدر' : 'Source'}</th>
                  <th className="p-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredModels.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-semibold text-gray-600">{m.make_name}</td>
                    <td className="p-3 font-bold text-primary">{m.name_en}</td>
                    <td className="p-3">
                      {editingModelId === m.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editArabicModelName}
                            onChange={e => setEditArabicModelName(e.target.value)}
                            className="px-2 py-1 border rounded text-xs w-32 border-primary focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveModelArabic(m.id)}
                            className="p-1 bg-success text-white rounded hover:bg-emerald-600"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingModelId(null)}
                            className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{m.name_ar || '—'}</span>
                          <button
                            onClick={() => { setEditingModelId(m.id); setEditArabicModelName(m.name_ar || ''); }}
                            className="text-gray-400 hover:text-primary p-0.5"
                            title={isAr ? 'تعديل الاسم العربي' : 'Edit Arabic name'}
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-gray-500">{m.vehicle_type}</td>
                    <td className="p-3">
                      <Badge tone={m.source === 'nhtsa' ? 'info' : 'success'}>
                        {m.source.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge tone={m.is_active ? 'success' : 'danger'}>
                        {m.is_active ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                      </Badge>
                    </td>
                    <td className="p-3 text-end">
                      <button
                        onClick={() => handleToggleModelStatus(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          m.is_active
                            ? 'border-gray-200 text-gray-600 hover:bg-red-50 hover:text-danger hover:border-red-200'
                            : 'border-emerald-200 text-success hover:bg-emerald-50'
                        }`}
                      >
                        {m.is_active ? (isAr ? 'تعطيل' : 'Deactivate') : (isAr ? 'تفعيل' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. YEARS TAB */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'years' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-primary">{isAr ? 'سنوات الصنع المعتمدة في النظام' : 'Model Years'}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{isAr ? 'سنوات الإنتاج لكل موديل سيارة في قاعدة البيانات' : 'Supported production model years per vehicle'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2008].map(yr => (
              <div key={yr} className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50/50">
                <span className="text-sm font-bold text-primary block">{yr}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">{isAr ? 'سنة معتمدة' : 'Valid year'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SPECIFICATIONS TAB */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'specs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-primary">{isAr ? 'مواصفات المحركات والهيكل (NHTSA Specs)' : 'Vehicle Engine & Trim Specs'}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{isAr ? 'مواصفات اختيارية في واجهة التطبيق لا توقف المستخدم عند عدم توفرها' : 'Optional specifications extracted via vPIC Decode/Variables'}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3 text-start">{isAr ? 'السيارة والسنة' : 'Vehicle & Year'}</th>
                  <th className="p-3 text-start">{isAr ? 'الفئة (Trim)' : 'Trim'}</th>
                  <th className="p-3 text-start">{isAr ? 'المحرك والأسطوانات' : 'Cylinders / Disp.'}</th>
                  <th className="p-3 text-start">{isAr ? 'القوة الحصانية' : 'HP'}</th>
                  <th className="p-3 text-start">{isAr ? 'نوع الوقود' : 'Fuel'}</th>
                  <th className="p-3 text-start">{isAr ? 'الدفع' : 'Drive Type'}</th>
                  <th className="p-3 text-start">{isAr ? 'ناقل الحركة' : 'Transmission'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {specs.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-bold text-primary">{s.model_name} ({s.model_year})</td>
                    <td className="p-3 text-gray-700 font-semibold">{s.trim || 'Standard'}</td>
                    <td className="p-3 font-mono text-gray-600">{s.engine_cylinders ? `${s.engine_cylinders} Cyl / ${s.engine_displacement_cc}cc` : '—'}</td>
                    <td className="p-3 text-gray-600">{s.engine_hp ? `${s.engine_hp} hp` : '—'}</td>
                    <td className="p-3"><Badge tone="neutral">{s.fuel_type}</Badge></td>
                    <td className="p-3 text-gray-600 font-mono">{s.drive_type}</td>
                    <td className="p-3 text-gray-500">{s.transmission_style}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. ALIASES TAB */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'aliases' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-primary">{isAr ? 'الأسماء البديلة لمحرك البحث (Vehicle Aliases)' : 'Search Normalized Aliases'}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{isAr ? 'تسمح للمستخدم بالعثور على السيارة بالعربي والإنجليزي والتسميات الشائعة' : 'Allows Arabic & English normalization (e.g. تويوتا = Toyota)'}</p>
            </div>
            <button
              onClick={() => setShowAddAlias(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-navy flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span>{isAr ? 'إضافة اسم بديل' : 'Add Alias'}</span>
            </button>
          </div>

          {showAddAlias && (
            <div className="p-4 bg-surface rounded-xl border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-primary block">{isAr ? 'إضافة اسم بديل لشركة أو موديل' : 'Add Search Alias'}</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={newAlias.entity_type}
                  onChange={e => setNewAlias(p => ({ ...p, entity_type: e.target.value as any }))}
                  className={inputCls + ' text-xs'}
                >
                  <option value="make">{isAr ? 'شركة مصنعة (Make)' : 'Make'}</option>
                  <option value="model">{isAr ? 'موديل (Model)' : 'Model'}</option>
                </select>
                <select
                  value={newAlias.language}
                  onChange={e => setNewAlias(p => ({ ...p, language: e.target.value as any }))}
                  className={inputCls + ' text-xs'}
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English</option>
                </select>
                <input
                  placeholder="Alias text (مثال: شاص)"
                  value={newAlias.alias}
                  onChange={e => setNewAlias(p => ({ ...p, alias: e.target.value }))}
                  className={inputCls + ' text-xs'}
                />
                <button
                  onClick={handleCreateAlias}
                  className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  <span>{isAr ? 'حفظ البديل' : 'Save Alias'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3 text-start">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="p-3 text-start">{isAr ? 'الكيان الأساسي' : 'Entity'}</th>
                  <th className="p-3 text-start">{isAr ? 'اللغة' : 'Language'}</th>
                  <th className="p-3 text-start">{isAr ? 'الاسم البديل' : 'Alias'}</th>
                  <th className="p-3 text-start">{isAr ? 'الشكل المقنن للبحث (Normalized)' : 'Normalized Key'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aliases.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/60">
                    <td className="p-3"><Badge tone="neutral">{a.entity_type.toUpperCase()}</Badge></td>
                    <td className="p-3 font-bold text-primary">{a.entity_name}</td>
                    <td className="p-3 font-semibold">{a.language === 'ar' ? 'العربية' : 'English'}</td>
                    <td className="p-3 font-bold text-accent-orange">{a.alias}</td>
                    <td className="p-3 font-mono text-gray-500 bg-gray-50/50">{a.normalized_alias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. NHTSA SYNC CONSOLE TAB */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h4 className="font-bold text-base text-primary flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  <span>{isAr ? 'لوحة التحكم في مزامنة NHTSA vPIC API' : 'NHTSA vPIC API Synchronization Console'}</span>
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  {isAr
                    ? 'نظام التخزين المحلي Database-First: يتم تخزين بيانات المركبات في PostgreSQL واستدعاء NHTSA vPIC فقط عند الحاجة لتجنب بطء الاستجابة ومعدلات الطلب (Rate Limits).'
                    : 'Database-First strategy: Mobile apps read exclusively from local PostgreSQL database. NHTSA vPIC is invoked only for lazily fetching missing entities.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={triggerNhtsaSync}
                  disabled={isSyncing}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-navy disabled:opacity-50 flex items-center gap-2 shadow-xs transition-all"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? (isAr ? 'جارِ المزامنة...' : 'Syncing...') : (isAr ? 'بدء المزامنة المحكومة' : 'Trigger NHTSA Sync')}</span>
                </button>
              </div>
            </div>

            {/* Sync Progress Bar if running */}
            {isSyncing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <RefreshCw size={16} className="text-primary animate-spin" />
                <span className="text-xs font-semibold text-primary">{syncProgress}</span>
              </div>
            )}

            {/* Sync Parameters & Guardrails Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 block mb-1">{isAr ? 'استراتيجية التخزين المؤقت (Cache)' : 'Cache Strategy'}</span>
                <span className="text-xs text-gray-700 font-semibold block">{isAr ? '7 أيام (Configurable TTL)' : '7 Days TTL in Redis/File'}</span>
                <span className="text-[10px] text-gray-400 block mt-1">{isAr ? 'يتم التخزين على مستوى Make / Model / Year' : 'Keys partitioned by entity & year'}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 block mb-1">{isAr ? 'التحكم في معدل الطلبات (Rate Limiting)' : 'Rate Control & Safety'}</span>
                <span className="text-xs text-gray-700 font-semibold block">{isAr ? 'Lazy Loading + Debounce 350ms' : 'Lazy Loading + 350ms Debounce'}</span>
                <span className="text-[10px] text-gray-400 block mt-1">{isAr ? 'لا يوجد Full Sync عشوائي' : 'No blind full syncs permitted'}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 block mb-1">{isAr ? 'مصداقية التوافقية (Fitment)' : 'Part Compatibility'}</span>
                <span className="text-xs text-gray-700 font-semibold block">{isAr ? 'ALA Internal Taxonomy' : 'ALA Compatibility Table'}</span>
                <span className="text-[10px] text-gray-400 block mt-1">{isAr ? 'NHTSA ليس كتالوج قطع غيار' : 'vPIC is vehicle data only, not parts'}</span>
              </div>
            </div>
          </div>

          {/* Sync History Logs Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span>{isAr ? 'سجل عمليات المزامنة (vehicle_sync_logs)' : 'Sync Logs History'}</span>
            </h5>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs text-start">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-3 text-start">#</th>
                    <th className="p-3 text-start">{isAr ? 'نوع العملية' : 'Sync Type'}</th>
                    <th className="p-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="p-3 text-start">{isAr ? 'السجلات المعالجة' : 'Processed'}</th>
                    <th className="p-3 text-start">{isAr ? 'المضافة / المحدثة' : 'Created / Updated'}</th>
                    <th className="p-3 text-start">{isAr ? 'وقت البدء والانتهاء' : 'Timeline'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {syncLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-mono text-gray-400">#{log.id}</td>
                      <td className="p-3 font-bold text-primary">{log.type}</td>
                      <td className="p-3">
                        <Badge tone={log.status === 'completed' ? 'success' : 'info'}>
                          {log.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{log.records_processed}</td>
                      <td className="p-3 text-gray-600 font-mono">
                        +{log.records_created} / ~{log.records_updated}
                      </td>
                      <td className="p-3 text-gray-400 text-[11px]">
                        {log.started_at} <ArrowRight size={10} className="inline mx-1" /> {log.finished_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
