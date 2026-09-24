import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, PriceVisibility, SaleMode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Badge, Price, Rating } from './ui/Primitives';
import { ShoppingCart, Heart, ShieldCheck, Eye, Check } from 'lucide-react';

const ProductCard: React.FC<{ product: Product; shopName?: string; city?: string }> = ({ product, shopName, city }) => {
  const { t, language } = useLanguage();
  const { add } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const hidePrice = product.priceVisibility === PriceVisibility.HIDE_PRICE;
  const externalOnly = product.saleMode === SaleMode.EXTERNAL;
  const inStock = product.quantity > 0;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      add(product.id, 1, product.branchId);
      toast(language === 'ar' ? 'أُضيفت القطعة إلى السلة' : 'Added to cart', { kind: 'success' });
    } catch (err: any) {
      toast(err?.message ?? 'Error', { kind: 'error' });
    }
  };

  return (
    <div
      onClick={() => navigate(`/part/${product.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition cursor-pointer flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-surface overflow-hidden">
        <img
          src={product.imageUrl}
          alt={language === 'ar' ? product.nameAr : product.nameEn}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute top-2 start-2 flex flex-col gap-1">
          <Badge tone={product.condition === 'NEW' || product.condition === 'OEM' ? 'success' : 'neutral'}>
            {product.condition === 'NEW' ? t('new') : product.condition === 'USED' ? t('used') : product.condition }
          </Badge>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
          className={`absolute top-2 end-2 p-2 rounded-full bg-white/90 shadow-sm hover:scale-105 transition ${liked ? 'text-red-500' : 'text-gray-400'}`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
        {externalOnly && (
          <div className="absolute bottom-2 end-2">
            <Badge tone="cream">{t('contactPrice')}</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-primary line-clamp-2 mb-1 leading-snug">
            {language === 'ar' ? product.nameAr : product.nameEn}
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            {product.carBrand} {product.carModel} {product.yearRange ? `(${product.yearRange})` : ''}
          </p>
          {product.partNumber && <p className="text-[11px] text-gray-300 mb-2" dir="ltr">{product.partNumber}</p>}
          <div className="flex items-center justify-between mb-3">
            <Rating value={product.rating ?? 0} />
            {!externalOnly && (inStock
              ? <Badge tone="success"><Check size={11} /> {t('inStock')}</Badge>
              : <Badge tone="danger">{t('outOfStock')}</Badge>)}
          </div>
          {(shopName || city) && (
            <p className="text-[11px] text-gray-400 mb-2 truncate">
              <ShieldCheck size={11} className="inline me-1 text-green-600" />
              {shopName}{city ? ` · ${city}` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-50 pt-3 mt-2">
          <Price value={product.price} currency={product.currency} hide={hidePrice} />
          {!externalOnly && inStock && (
            <button
              onClick={addToCart}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white text-xs font-semibold px-3 py-2 hover:bg-navy active:scale-95 transition"
            >
              <ShoppingCart size={14} /> {t('addToCart')}
            </button>
          )}
          {externalOnly && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/part/${product.id}`); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary text-primary text-xs font-bold px-3 py-2 hover:brightness-95 active:scale-95 transition"
            >
              <Eye size={14} /> {t('viewDetails')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;