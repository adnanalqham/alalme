import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Car, ArrowUpDown, PackageSearch } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { searchService, vehicleService } from '../api';
import { PriceVisibility, SearchResult } from '../types';
import ProductCard from '../components/ProductCard';
import { Badge, EmptyState } from '../components/ui/Primitives';

const PER_PAGE = 12;

const SORTS = [
  { key: 'relevance', en: 'Best match', ar: 'الأكثر صلة' },
  { key: 'newest', en: 'Newest', ar: 'الأحدث' },
  { key: 'price_asc', en: 'Price: low to high', ar: 'السعر: من الأقل' },
  { key: 'price_desc', en: 'Price: high to low', ar: 'السعر: من الأعلى' },
  { key: 'rating', en: 'Top rated', ar: 'الأعلى تقييماً' },
];

const SearchPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { categories, countries, cities, products, shops } = useData();
  const [params, setParams] = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState('relevance');
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [countryId, setCountryId] = useState(params.get('country') ?? '');
  const [cityId, setCityId] = useState('');
  const [categoryId, setCategoryId] = useState(params.get('category') ?? '');
  const [manufacturerId, setManufacturerId] = useState('');
  const [condition, setCondition] = useState('');
  const [availability, setAvailability] = useState<'in_stock' | 'any'>('any');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState('');
  const [shopId, setShopId] = useState('');

  // Vehicle wizard
  const [vehicle, setVehicle] = useState<{ makeId: string; modelId: string; generationId?: string; engineId?: string } | null>(null);
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [generationId, setGenerationId] = useState('');
  const [engineId, setEngineId] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  const models = useMemo(() => (vehicle ? vehicleService.models(makeId) : []), [makeId, vehicle]);
  const generations = useMemo(() => (modelId ? vehicleService.generations(modelId) : []), [modelId]);
  const engines = useMemo(() => (generationId ? vehicleService.engines(generationId) : []), [generationId]);

  const query = params.get('q') ?? '';

  const results: SearchResult[] = useMemo(() => {
    if (!mounted) return [];
    return sortResults(
      searchService.search(query, {
        countryId: countryId || undefined,
        cityId: cityId || undefined,
        categoryId: categoryId || undefined,
        manufacturerId: manufacturerId || undefined,
        condition: condition || undefined,
        availability: availability === 'in_stock' ? 'in_stock' : undefined,
        minRating: minRating || undefined,
        priceRange: maxPrice ? [0, Number(maxPrice)] : undefined,
        shopId: shopId || undefined,
        vehicleId: vehicle ?? undefined,
        perPage: 1000,
      }).results,
      sort,
    );
  }, [query, mounted, countryId, cityId, categoryId, manufacturerId, condition, availability, minRating, maxPrice, shopId, vehicle, sort]);

  const [visible, setVisible] = useState(PER_PAGE);

  React.useEffect(() => {
    setVisible(PER_PAGE);
  }, [results.length]);

  const applyVehicle = () => {
    if (!makeId || !modelId) return;
    setVehicle({ makeId, modelId, generationId: generationId || undefined, engineId: engineId || undefined });
  };

  const clearAll = () => {
    setQ(''); setCountryId(''); setCityId(''); setCategoryId(''); setManufacturerId('');
    setCondition(''); setAvailability('any'); setMinRating(0); setMaxPrice(''); setShopId('');
    setVehicle(null); setMakeId(''); setModelId(''); setGenerationId(''); setEngineId('');
    setParams({});
    navigate('/search', { replace: true });
  };

  const cityOptions = countryId ? cities.filter(c => c.countryId === countryId) : cities;

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search header */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const p = new URLSearchParams();
              if (q.trim()) p.set('q', q.trim());
              if (countryId) p.set('country', countryId);
              navigate(`/search?${p.toString()}`);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 border border-gray-100 rounded-xl px-3 bg-surface">
              <Search size={18} className="text-gray-400" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={t('searchParts')}
                className="w-full py-3 outline-none text-sm bg-transparent"
              />
            </div>
            <button type="submit" className="rounded-xl bg-primary text-white px-8 py-3 text-sm font-bold hover:bg-navy transition">
              {t('search')}
            </button>
            <button type="button" onClick={() => setShowFilters(v => !v)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold border transition flex items-center gap-2 justify-center ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-primary'}`}>
              <SlidersHorizontal size={16} /> {t('filters')}
            </button>
          </form>

          {/* Active filters chips */}
          {(countryId || cityId || categoryId || manufacturerId || condition || availability === 'in_stock' || maxPrice || vehicle || minRating > 0) ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {countryId && <Chip onClear={() => setCountryId('')}>{countryName(countryId, countries, language)}{cityId ? ' → ' + cityName(cityId, cities, language) : ''}</Chip>}
              {!cityId && countryId && <Chip onClear={() => setCityId('')}>&nbsp;</Chip>}
              {categoryId && <Chip onClear={() => setCategoryId('')}>{catName(categoryId, categories, language)}</Chip>}
              {manufacturerId && <Chip onClear={() => setManufacturerId('')}>{mfrName(manufacturerId, products, shops)}</Chip>}
              {condition && <Chip onClear={() => setCondition('')}>{condition}</Chip>}
              {availability === 'in_stock' && <Chip onClear={() => setAvailability('any')}>{t('inStock')}</Chip>}
              {minRating > 0 && <Chip onClear={() => setMinRating(0)}>{'★ ≥ ' + minRating}</Chip>}
              {maxPrice && <Chip onClear={() => setMaxPrice('')}>{'≤ ' + Number(maxPrice).toLocaleString()}</Chip>}
              {shopId && <Chip onClear={() => setShopId('')}>{shopName(shopId, shops, language)}</Chip>}
              <button onClick={clearAll} className="text-xs text-red-500 font-semibold hover:underline ps-1">{t('clearAll')}</button>
            </div>
          ) : null}
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-72 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 space-y-5">
              <h3 className="font-bold text-primary text-sm">{t('filters')}</h3>

              {/* Location */}
              <Field label={t('country')}>
                <select className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none" value={countryId} onChange={e => { setCountryId(e.target.value); setCityId(''); }}>
                  <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                </select>
              </Field>
              {countryId && (
                <Field label={t('city')}>
                  <select className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none" value={cityId} onChange={e => setCityId(e.target.value)}>
                    <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                    {cityOptions.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                  </select>
                </Field>
              )}

              {/* Category */}
              <Field label={t('categories')}>
                <select className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                  {categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                </select>
              </Field>

              {/* Manufacturer */}
              <Field label={t('manufacturers')}>
                <select className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none" value={manufacturerId} onChange={e => setManufacturerId(e.target.value)}>
                  <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                  {vehicleService.makes().map(m => <option key={m.id} value={m.id}>{language === 'ar' ? m.nameAr : m.nameEn}</option>)}
                </select>
              </Field>

              {/* Condition */}
              <Field label={t('condition')}>
                <select className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none" value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                  {['NEW', 'USED', 'OEM', 'AFTERMARKET', 'REFURBISHED'].map(c => (
                    <option key={c} value={c}>{language === 'ar' ? condAr(c) : condEn(c)}</option>
                  ))}
                </select>
              </Field>

              {/* Availability */}
              <Field label={t('availability')}>
                <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                  <input type="checkbox" checked={availability === 'in_stock'} onChange={e => setAvailability(e.target.checked ? 'in_stock' : 'any')} className="accent-primary scale-110" />
                  {t('inStockOnly')}
                </label>
              </Field>

              {/* Price */}
              <Field label={t('maxPrice')}>
                <input type="number" min={0} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="0" className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none" />
              </Field>

              <button onClick={clearAll} className="btn-ghost w-full text-center text-xs text-red-500 font-semibold border border-red-100 rounded-xl py-2 hover:bg-red-50">
                {t('clearAll')}
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Vehicle compatibility wizard */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-primary mb-3">
                <Car size={16} /> {t('filterByVehicle')}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                <Select value={makeId} onChange={setMakeId} options={[{ value: '', label: t('selectMake') }, ...vehicleService.makes().map(m => ({ value: m.id, label: language === 'ar' ? m.nameAr : m.nameEn }))]} />
                <Select value={modelId} onChange={setModelId} disabled={!makeId} options={[{ value: '', label: t('selectModel') }, ...models.map(m => ({ value: m.id, label: language === 'ar' ? m.nameAr : m.nameEn }))]} />
                <Select value={generationId} onChange={setGenerationId} disabled={!modelId} options={[{ value: '', label: t('selectGeneration') }, ...generations.map(g => ({ value: g.id, label: `${language === 'ar' ? g.nameAr : g.nameEn} (${g.yearStart}${g.yearEnd ? '-' + g.yearEnd : '+'})` }))]} />
                <Select value={engineId} onChange={setEngineId} disabled={!generationId} options={[{ value: '', label: t('selectEngine') }, ...engines.map(e => ({ value: e.id, label: e.badge }))]} />
                <button onClick={applyVehicle} disabled={!makeId || !modelId} className="rounded-xl bg-primary text-white text-sm font-semibold py-2 hover:bg-navy transition disabled:opacity-40">
                  {t('apply')}
                </button>
              </div>
              {vehicle && (
                <div className="flex items-center gap-2 mt-3 text-xs text-navy">
                  <Badge tone="info">{vehicleLabel(vehicle, language)}</Badge>
                  <button onClick={() => { setVehicle(null); }} className="text-red-500 hover:underline">{t('clear')}</button>
                </div>
              )}
            </div>

            {/* Sort + count */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <p className="text-sm text-gray-500">{results.length} {t('results')}</p>
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpDown size={15} className="text-gray-400" />
                <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm text-primary outline-none cursor-pointer">
                  {SORTS.map(s => <option key={s.key} value={s.key}>{language === 'ar' ? s.ar : s.en}</option>)}
                </select>
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState
                title={language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching parts'}
                subtitle={language === 'ar' ? 'جرّب كلمات مختلفة أو أزل بعض المرشحات' : 'Try different keywords or remove some filters'}
                icon={<PackageSearch size={30} />}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.slice(0, visible).map(r => {
                    const shop = shops.find(s => s.id === r.product.shopId);
                    return <ProductCard key={r.product.id} product={r.product} shopName={language === 'ar' ? shop?.nameAr : shop?.nameEn} city={shop?.city} />;
                  })}
                </div>
                {visible < results.length && (
                  <div className="text-center mt-8">
                    <button onClick={() => setVisible(v => v + PER_PAGE)} className="rounded-xl border border-primary/20 bg-white text-primary px-8 py-3 text-sm font-bold hover:bg-surface transition">
                      {t('loadMore')} ({results.length - visible})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

function sortResults(results: SearchResult[], sort: string): SearchResult[] {
  const copy = [...results];
  switch (sort) {
    case 'newest': return copy.sort((a, b) => b.product.createdAt.localeCompare(a.product.createdAt));
    case 'price_asc': return copy.sort((a, b) => (a.product.priceVisibility === PriceVisibility.SHOW_PRICE ? a.product.price : Infinity) - (b.product.priceVisibility === PriceVisibility.SHOW_PRICE ? b.product.price : Infinity));
    case 'price_desc': return copy.sort((a, b) => (b.product.priceVisibility === PriceVisibility.SHOW_PRICE ? b.product.price : -Infinity) - (a.product.priceVisibility === PriceVisibility.SHOW_PRICE ? a.product.price : -Infinity));
    case 'rating': return copy.sort((a, b) => (b.product.rating ?? 0) - (a.product.rating ?? 0));
    default: return copy;
  }
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 text-navy px-3 py-1 text-xs font-semibold">
      {children}
      <button onClick={onClear} className="hover:text-red-500"><X size={12} /></button>
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-primary/60 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, disabled }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean }) {
  return (
    <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none disabled:opacity-50">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// name helpers
function countryName(id: string, countries: any[], language: string) { return language === 'ar' ? countries.find(c => c.id === id)?.nameAr : countries.find(c => c.id === id)?.nameEn; }
function cityName(id: string, cities: any[], language: string) { return language === 'ar' ? cities.find(c => c.id === id)?.nameAr : cities.find(c => c.id === id)?.nameEn; }
function catName(id: string, categories: any[], language: string) { return language === 'ar' ? categories.find(c => c.id === id)?.nameAr : categories.find(c => c.id === id)?.nameEn; }
function mfrName(id: string, products: any[], shops: any[]) {
  const p = products.find((x: any) => x.id === id) || shops.find((s: any) => s.id === id);
  return p?.nameEn ?? id;
}
function shopName(id: string, shops: any[], language: string) { const s = shops.find((x: any) => x.id === id); return s ? (language === 'ar' ? s.nameAr : s.nameEn) : id; }
function vehicleLabel(v: { makeId: string; modelId: string; generationId?: string; engineId?: string }, language: string) {
  const m = v.makeId; const md = v.modelId;
  return `${m} ${md}` + (v.engineId ? ` · ${v.engineId}` : '');
}
function condEn(c: string) { return { NEW: 'New', USED: 'Used', OEM: 'OEM', AFTERMARKET: 'Aftermarket', REFURBISHED: 'Refurbished' }[c] ?? c; }
function condAr(c: string) { return { NEW: 'جديد', USED: 'مستعمل', OEM: 'أصلي', AFTERMARKET: 'بديل', REFURBISHED: 'مجدّد' }[c] ?? c; }

export default SearchPage;