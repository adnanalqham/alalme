/**
 * components/admin/TaxonomyTreeManager.tsx
 *
 * Professional 3-level tree taxonomy manager for ALA Auto Parts Admin:
 * Main System -> Subcategory -> Part Type -> Aliases & Search Keywords.
 * Allows adding, editing, toggling, alias creation, and fast smart search filtering.
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, Plus, Search, Tag, Edit3, Trash2,
  CheckCircle, XCircle, Layers, Folder, Shield, Disc, Cpu, Zap,
  Wrench, Activity, AlertCircle, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import taxonomyMaster from '../../docs/data/automotive-parts-taxonomy.json' with { type: 'json' };
import { normalizeArabic, normalizeEnglish } from '../../services/taxonomySearch.ts';

interface PartTypeNode {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  aliases_ar: string[];
  aliases_en: string[];
  search_keywords: string[];
  is_active?: boolean;
}

interface SubcategoryNode {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  part_types: PartTypeNode[];
  is_active?: boolean;
}

interface CategoryNode {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string;
  description_ar?: string;
  description_en?: string;
  subcategories: SubcategoryNode[];
  is_active?: boolean;
}

export const TaxonomyTreeManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { toast } = useToast();

  // Local state initialized from canonical taxonomy data
  const [data, setData] = useState<CategoryNode[]>(() => {
    return (taxonomyMaster as any).hierarchy.map((cat: any) => ({
      ...cat,
      is_active: cat.is_active !== false,
      subcategories: (cat.subcategories || []).map((sub: any) => ({
        ...sub,
        is_active: sub.is_active !== false,
        part_types: (sub.part_types || []).map((pt: any) => ({
          ...pt,
          is_active: pt.is_active !== false,
        }))
      }))
    }));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'cat-brakes': true,
    'cat-filters': true,
  });
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingNode, setEditingNode] = useState<{
    type: 'cat' | 'sub' | 'pt';
    parentId?: string;
    subId?: string;
    id: string;
    name_ar: string;
    name_en: string;
    newAliasAr?: string;
    newAliasEn?: string;
  } | null>(null);

  // New Node Modal/Form
  const [creatingUnder, setCreatingUnder] = useState<{
    level: 'cat' | 'sub' | 'pt';
    parentId?: string;
    subId?: string;
    name_ar: string;
    name_en: string;
  } | null>(null);

  const toggleCat = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSub = (id: string) => {
    setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Metrics summary
  const metrics = useMemo(() => {
    let subs = 0;
    let pts = 0;
    let aliasesAr = 0;
    let aliasesEn = 0;
    for (const c of data) {
      subs += c.subcategories.length;
      for (const s of c.subcategories) {
        pts += s.part_types.length;
        for (const pt of s.part_types) {
          aliasesAr += (pt.aliases_ar || []).length;
          aliasesEn += (pt.aliases_en || []).length;
        }
      }
    }
    return { cats: data.length, subs, pts, aliasesAr, aliasesEn };
  }, [data]);

  // Filtered tree based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const qNormAr = normalizeArabic(searchQuery);
    const qNormEn = normalizeEnglish(searchQuery);

    return data.map(cat => {
      const matchCat = normalizeArabic(cat.name_ar).includes(qNormAr) ||
                       normalizeEnglish(cat.name_en).includes(qNormEn);

      const matchingSubs = cat.subcategories.map(sub => {
        const matchSub = normalizeArabic(sub.name_ar).includes(qNormAr) ||
                         normalizeEnglish(sub.name_en).includes(qNormEn);

        const matchingPts = sub.part_types.filter(pt => {
          const matchName = normalizeArabic(pt.name_ar).includes(qNormAr) ||
                            normalizeEnglish(pt.name_en).includes(qNormEn);
          const matchAliasAr = pt.aliases_ar.some(a => normalizeArabic(a).includes(qNormAr));
          const matchAliasEn = pt.aliases_en.some(a => normalizeEnglish(a).includes(qNormEn));
          const matchKw = pt.search_keywords?.some(k => normalizeArabic(k).includes(qNormAr) || normalizeEnglish(k).includes(qNormEn));
          return matchName || matchAliasAr || matchAliasEn || matchKw;
        });

        if (matchCat || matchSub || matchingPts.length > 0) {
          return {
            ...sub,
            part_types: matchSub || matchCat ? sub.part_types : matchingPts
          };
        }
        return null;
      }).filter(Boolean) as SubcategoryNode[];

      if (matchCat || matchingSubs.length > 0) {
        return {
          ...cat,
          subcategories: matchingSubs
        };
      }
      return null;
    }).filter(Boolean) as CategoryNode[];
  }, [data, searchQuery]);

  // Toggle active status of node
  const toggleActive = (level: 'cat' | 'sub' | 'pt', catId: string, subId?: string, ptId?: string) => {
    setData(prev => prev.map(c => {
      if (level === 'cat' && c.id === catId) {
        return { ...c, is_active: !c.is_active };
      }
      if (c.id === catId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (level === 'sub' && s.id === subId) {
              return { ...s, is_active: !s.is_active };
            }
            if (s.id === subId) {
              return {
                ...s,
                part_types: s.part_types.map(pt => {
                  if (level === 'pt' && pt.id === ptId) {
                    return { ...pt, is_active: !pt.is_active };
                  }
                  return pt;
                })
              };
            }
            return s;
          })
        };
      }
      return c;
    }));
    toast(isAr ? 'تم تحديث حالة التفعيل' : 'Status updated', { kind: 'success' });
  };

  // Delete node
  const deleteNode = (level: 'cat' | 'sub' | 'pt', catId: string, subId?: string, ptId?: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this element?')) return;

    setData(prev => {
      if (level === 'cat') {
        return prev.filter(c => c.id !== catId);
      }
      return prev.map(c => {
        if (c.id === catId) {
          if (level === 'sub') {
            return { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) };
          }
          return {
            ...c,
            subcategories: c.subcategories.map(s => {
              if (s.id === subId) {
                return { ...s, part_types: s.part_types.filter(p => p.id !== ptId) };
              }
              return s;
            })
          };
        }
        return c;
      });
    });
    toast(isAr ? 'تم الحذف بنجاح' : 'Deleted successfully', { kind: 'success' });
  };

  // Add Alias
  const addAliasToPartType = (catId: string, subId: string, ptId: string, alias: string, lang: 'ar' | 'en') => {
    if (!alias.trim()) return;
    setData(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        subcategories: c.subcategories.map(s => {
          if (s.id !== subId) return s;
          return {
            ...s,
            part_types: s.part_types.map(pt => {
              if (pt.id !== ptId) return pt;
              if (lang === 'ar') {
                return { ...pt, aliases_ar: Array.from(new Set([...pt.aliases_ar, alias.trim()])) };
              } else {
                return { ...pt, aliases_en: Array.from(new Set([...pt.aliases_en, alias.trim()])) };
              }
            })
          };
        })
      };
    }));
    toast(isAr ? 'تمت إضافة المرادف' : 'Alias added', { kind: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">{isAr ? 'الأنظمة الرئيسية' : 'Major Systems'}</div>
          <div className="text-2xl font-black text-primary mt-1">{metrics.cats}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">{isAr ? 'الفئات الفرعية' : 'Subcategories'}</div>
          <div className="text-2xl font-black text-navy mt-1">{metrics.subs}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">{isAr ? 'أنواع القطع' : 'Part Types'}</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.pts}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">{isAr ? 'مرادفات عربية' : 'Arabic Aliases'}</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.aliasesAr}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">{isAr ? 'مرادفات إنجليزية' : 'English Aliases'}</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{metrics.aliasesEn}</div>
        </div>
      </div>

      {/* 2. Search & Toolbar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في التصنيف (فحمات، تيل، مساعدات، سلف، بوجي)...' : 'Search taxonomy (brakes, pads, shock, alternator)...'}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute top-1/2 -translate-y-1/2 end-3 text-xs text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              const allExpanded: Record<string, boolean> = {};
              data.forEach(c => { allExpanded[c.id] = true; });
              setExpandedCats(allExpanded);
            }}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {isAr ? 'توسيع الكل' : 'Expand All'}
          </button>
          <button
            onClick={() => {
              setExpandedCats({});
              setExpandedSubs({});
            }}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {isAr ? 'طي الكل' : 'Collapse All'}
          </button>
          <button
            onClick={() => setCreatingUnder({ level: 'cat', name_ar: '', name_en: '' })}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-navy flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> {isAr ? 'إضافة نظام رئيسي' : 'Add Major System'}
          </button>
        </div>
      </div>

      {/* 3. Taxonomy Hierarchy Tree */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <AlertCircle size={32} className="mx-auto mb-2 text-gray-300" />
            {isAr ? 'لم يتم العثور على نتائج مطابقة للبحث' : 'No matching taxonomy entries found'}
          </div>
        ) : (
          filteredData.map(cat => {
            const isCatOpen = !!expandedCats[cat.id];

            return (
              <div key={cat.id} className="transition-colors">
                {/* Top Level Category Row */}
                <div className={`p-4 flex items-center justify-between hover:bg-surface/50 ${!cat.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
                  <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => toggleCat(cat.id)}>
                    <button className="p-1 text-gray-400 hover:text-primary rounded-lg">
                      {isCatOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} className={isAr ? 'rotate-180' : ''} />}
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <Layers size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-primary text-base">{cat.name_ar}</span>
                        <span className="text-xs text-gray-400 font-medium font-sans">({cat.name_en})</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                          {cat.subcategories.length} {isAr ? 'فئات' : 'subs'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-2xl line-clamp-1">{cat.description_ar}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCreatingUnder({ level: 'sub', parentId: cat.id, name_ar: '', name_en: '' })}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-primary/20 text-primary hover:bg-primary/5 flex items-center gap-1"
                      title={isAr ? 'إضافة فئة فرعية' : 'Add Subcategory'}
                    >
                      <Plus size={12} /> {isAr ? 'فرعية' : 'Sub'}
                    </button>
                    <button
                      onClick={() => toggleActive('cat', cat.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg ${cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
                    >
                      {cat.is_active ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => deleteNode('cat', cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subcategories Container */}
                {isCatOpen && (
                  <div className="bg-surface/30 ps-8 pe-4 py-2 border-t border-gray-50 space-y-2">
                    {cat.subcategories.length === 0 ? (
                      <div className="py-3 text-xs text-gray-400 italic">
                        {isAr ? 'لا توجد فئات فرعية تحت هذا النظام حالياً' : 'No subcategories yet under this system'}
                      </div>
                    ) : (
                      cat.subcategories.map(sub => {
                        const isSubOpen = !!expandedSubs[sub.id];

                        return (
                          <div key={sub.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-xs">
                            {/* Subcategory Row */}
                            <div className="p-3 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-2.5 cursor-pointer select-none flex-1" onClick={() => toggleSub(sub.id)}>
                                <button className="p-0.5 text-gray-400">
                                  {isSubOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} className={isAr ? 'rotate-180' : ''} />}
                                </button>
                                <div className="w-7 h-7 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
                                  <Folder size={14} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800 text-sm">{sub.name_ar}</span>
                                    <span className="text-xs text-gray-400 font-sans">({sub.name_en})</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                                      {sub.part_types.length} {isAr ? 'قطع' : 'parts'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setCreatingUnder({ level: 'pt', parentId: cat.id, subId: sub.id, name_ar: '', name_en: '' })}
                                  className="px-2 py-0.5 text-[11px] font-bold rounded border border-navy/20 text-navy hover:bg-navy/5 flex items-center gap-1"
                                >
                                  <Plus size={11} /> {isAr ? 'نوع قطعة' : 'Part Type'}
                                </button>
                                <button
                                  onClick={() => toggleActive('sub', cat.id, sub.id)}
                                  className={`px-2 py-0.5 text-[11px] font-bold rounded ${sub.is_active ? 'text-emerald-600' : 'text-red-500'}`}
                                >
                                  {sub.is_active ? 'ON' : 'OFF'}
                                </button>
                                <button
                                  onClick={() => deleteNode('sub', cat.id, sub.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Part Types Table */}
                            {isSubOpen && (
                              <div className="border-t border-gray-100 bg-gray-50/50 p-3 divide-y divide-gray-100">
                                {sub.part_types.length === 0 ? (
                                  <div className="text-xs text-gray-400 py-1 italic">
                                    {isAr ? 'لا توجد أنواع قطع مضافة' : 'No part types under this subcategory'}
                                  </div>
                                ) : (
                                  sub.part_types.map(pt => (
                                    <div key={pt.id} className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                      <div className="space-y-1 max-w-xl">
                                        <div className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                          <span className="font-bold text-gray-900 text-sm">{pt.name_ar}</span>
                                          <span className="text-xs text-gray-500 font-sans font-medium">({pt.name_en})</span>
                                        </div>

                                        {/* Aliases Tags */}
                                        <div className="flex flex-wrap gap-1 items-center pt-0.5 ps-3">
                                          <span className="text-[10px] text-gray-400 font-semibold">{isAr ? 'المرادفات:' : 'Aliases:'}</span>
                                          {pt.aliases_ar.map((a, i) => (
                                            <span key={i} className="text-[10px] bg-white border border-gray-200 text-primary px-1.5 py-0.2 rounded font-medium">
                                              {a}
                                            </span>
                                          ))}
                                          {pt.aliases_en.map((a, i) => (
                                            <span key={`en-${i}`} className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono">
                                              {a}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Part Type Controls */}
                                      <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                                        <button
                                          onClick={() => {
                                            const newAlias = prompt(isAr ? 'أدخل المرادف الشائع (عربي):' : 'Enter Arabic colloquial alias:');
                                            if (newAlias) addAliasToPartType(cat.id, sub.id, pt.id, newAlias, 'ar');
                                          }}
                                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                                        >
                                          + {isAr ? 'مرادف عربي' : 'AR Alias'}
                                        </button>
                                        <button
                                          onClick={() => {
                                            const newAlias = prompt(isAr ? 'أدخل المرادف الإنجليزي:' : 'Enter English alias:');
                                            if (newAlias) addAliasToPartType(cat.id, sub.id, pt.id, newAlias, 'en');
                                          }}
                                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                                        >
                                          + {isAr ? 'مرادف EN' : 'EN Alias'}
                                        </button>
                                        <button
                                          onClick={() => toggleActive('pt', cat.id, sub.id, pt.id)}
                                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${pt.is_active ? 'text-emerald-600' : 'text-red-500'}`}
                                        >
                                          {pt.is_active ? 'ON' : 'OFF'}
                                        </button>
                                        <button
                                          onClick={() => deleteNode('pt', cat.id, sub.id, pt.id)}
                                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Quick Add Modal / Inline Form */}
      {creatingUnder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-primary">
              {creatingUnder.level === 'cat' && (isAr ? 'إضافة نظام رئيسي جديد' : 'Add New Major System')}
              {creatingUnder.level === 'sub' && (isAr ? 'إضافة فئة فرعية جديدة' : 'Add New Subcategory')}
              {creatingUnder.level === 'pt' && (isAr ? 'إضافة نوع قطعة جديد' : 'Add New Part Type')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isAr ? 'الاسم (بالعربي) *' : 'Name (Arabic) *'}</label>
                <input
                  type="text"
                  value={creatingUnder.name_ar}
                  onChange={e => setCreatingUnder({ ...creatingUnder, name_ar: e.target.value })}
                  placeholder={isAr ? 'مثال: نظام التبريد' : 'e.g. Brake System'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isAr ? 'الاسم (بالإنجليزية) *' : 'Name (English) *'}</label>
                <input
                  type="text"
                  value={creatingUnder.name_en}
                  onChange={e => setCreatingUnder({ ...creatingUnder, name_en: e.target.value })}
                  placeholder="e.g. Brake System"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setCreatingUnder(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (!creatingUnder.name_ar || !creatingUnder.name_en) {
                    toast(isAr ? 'يرجى إدخال الاسمين' : 'Both names required', { kind: 'error' });
                    return;
                  }

                  const slug = creatingUnder.name_en.toLowerCase().replace(/[^\w]/g, '-');
                  const newId = `custom-${Date.now()}`;

                  if (creatingUnder.level === 'cat') {
                    setData(prev => [
                      ...prev,
                      {
                        id: newId,
                        slug,
                        name_ar: creatingUnder.name_ar,
                        name_en: creatingUnder.name_en,
                        icon: 'Package',
                        subcategories: [],
                        is_active: true
                      }
                    ]);
                  } else if (creatingUnder.level === 'sub') {
                    setData(prev => prev.map(c => {
                      if (c.id !== creatingUnder.parentId) return c;
                      return {
                        ...c,
                        subcategories: [
                          ...c.subcategories,
                          {
                            id: newId,
                            slug,
                            name_ar: creatingUnder.name_ar,
                            name_en: creatingUnder.name_en,
                            part_types: [],
                            is_active: true
                          }
                        ]
                      };
                    }));
                  } else if (creatingUnder.level === 'pt') {
                    setData(prev => prev.map(c => {
                      if (c.id !== creatingUnder.parentId) return c;
                      return {
                        ...c,
                        subcategories: c.subcategories.map(s => {
                          if (s.id !== creatingUnder.subId) return s;
                          return {
                            ...s,
                            part_types: [
                              ...s.part_types,
                              {
                                id: newId,
                                slug,
                                name_ar: creatingUnder.name_ar,
                                name_en: creatingUnder.name_en,
                                aliases_ar: [],
                                aliases_en: [],
                                search_keywords: [creatingUnder.name_ar, creatingUnder.name_en],
                                is_active: true
                              }
                            ]
                          };
                        })
                      };
                    }));
                  }

                  toast(isAr ? 'تمت الإضافة بنجاح' : 'Added successfully', { kind: 'success' });
                  setCreatingUnder(null);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-navy"
              >
                {isAr ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
