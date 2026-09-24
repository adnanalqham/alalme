import React, { createContext, useContext, useState, useMemo } from 'react';

export interface SavedVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  badge?: string;
  isDefault?: boolean;
  make_id?: number | string;
  model_id?: number | string;
  year_id?: number | string;
  vehicle_spec_id?: number | string | null;
  vin?: string | null;
  nickname?: string | null;
}

export interface ProductItem {
  id: string;
  nameEn: string;
  nameAr: string;
  partNumber: string;
  oemNumber: string;
  manufacturer: string;
  category: string;
  price: number;
  priceVisibility: 'SHOW_PRICE' | 'HIDE_PRICE';
  inStock: boolean;
  stockQty: number;
  condition: 'OEM' | 'NEW' | 'AFTERMARKET' | 'USED';
  shopId: string;
  shopName: string;
  rating: number;
  ratingCount: number;
  image: string;
  compatibleVehicles: { make: string; model: string; yearStart: number; yearEnd: number; engine?: string }[];
  descriptionEn: string;
  descriptionAr: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface OrderItemRecord {
  id: string;
  date: string;
  shopName: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  deliveryType: 'PICKUP' | 'SHOP_DELIVERY' | 'EXPRESS';
  paymentMethod: 'CASH' | 'TRANSFER' | 'WALLET';
}

const INITIAL_GARAGE: SavedVehicle[] = [
  { id: 'v1', make: 'Toyota', model: 'Camry', year: 2022, engine: '2.5L I4', isDefault: true },
  { id: 'v2', make: 'Hyundai', model: 'Sonata', year: 2020, engine: '2.0L I4', isDefault: false },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    nameEn: 'Ceramic Front Brake Pads',
    nameAr: 'فحمات فرامل سيراميك أمامية',
    partNumber: '04465-33471',
    oemNumber: '04465-33470',
    manufacturer: 'Toyota Genuine',
    category: 'brakeSystem',
    price: 45,
    priceVisibility: 'SHOW_PRICE',
    inStock: true,
    stockQty: 18,
    condition: 'OEM',
    shopId: 's1',
    shopName: 'Al-Barakah Auto Parts',
    rating: 4.9,
    ratingCount: 84,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    compatibleVehicles: [
      { make: 'Toyota', model: 'Camry', yearStart: 2018, yearEnd: 2024, engine: '2.5L I4' },
      { make: 'Toyota', model: 'Avalon', yearStart: 2019, yearEnd: 2023 },
    ],
    descriptionEn: 'High performance ceramic brake pads providing superior stopping power, zero brake dust, and whisper-quiet operation.',
    descriptionAr: 'فحمات فرامل سيراميك عالية الأداء توفر قوة توقف فائقة، بدون غبار فرامل، وأداء هادئ تماماً.',
  },
  {
    id: 'p2',
    nameEn: 'OEM Engine Oil Filter',
    nameAr: 'فلتر زيت محرك أصلي',
    partNumber: '90915-YZZD4',
    oemNumber: '90915-YZZD2',
    manufacturer: 'Denso Japan',
    category: 'filtersMaintenance',
    price: 12,
    priceVisibility: 'SHOW_PRICE',
    inStock: true,
    stockQty: 42,
    condition: 'OEM',
    shopId: 's1',
    shopName: 'Al-Barakah Auto Parts',
    rating: 4.8,
    ratingCount: 120,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    compatibleVehicles: [
      { make: 'Toyota', model: 'Land Cruiser', yearStart: 2015, yearEnd: 2024 },
      { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2024 },
    ],
    descriptionEn: 'Factory genuine spin-on oil filter with dual-stage filtration media for ultimate engine protection.',
    descriptionAr: 'فلتر زيت أصلي بمواصفات المصنع يوفر حماية قصوى للمحرك وترشيحاً مزدوجاً للشوائب.',
  },
  {
    id: 'p3',
    nameEn: 'Electronic Fuel Pump Assembly',
    nameAr: 'طرمبة بنزين كهربائية متكاملة',
    partNumber: '31110-C1100',
    oemNumber: '31110-C1000',
    manufacturer: 'Bosch Automotive',
    category: 'engineOilFluids',
    price: 135,
    priceVisibility: 'HIDE_PRICE', // Test "Contact Shop" functionality
    inStock: true,
    stockQty: 6,
    condition: 'NEW',
    shopId: 's2',
    shopName: 'Sanaa Parts Store',
    rating: 4.7,
    ratingCount: 38,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    compatibleVehicles: [
      { make: 'Hyundai', model: 'Sonata', yearStart: 2015, yearEnd: 2019, engine: '2.0L I4' },
      { make: 'Hyundai', model: 'Elantra', yearStart: 2016, yearEnd: 2020 },
    ],
    descriptionEn: 'Complete modular in-tank fuel pump assembly with sending unit and strainer for consistent fuel delivery.',
    descriptionAr: 'مجموعة طرمبة بنزين متكاملة داخل التانكي توفر ضخاً ثابتاً ومستقراً للوقود لجميع ظروف القيادة.',
  },
  {
    id: 'p4',
    nameEn: 'Laser Iridium Spark Plugs (Set of 4)',
    nameAr: 'طقم بواجي إيريديوم ليزر (4 قطع)',
    partNumber: 'ILKAR7L11',
    oemNumber: '90919-01210',
    manufacturer: 'NGK Spark Plugs',
    category: 'electrical',
    price: 42,
    priceVisibility: 'SHOW_PRICE',
    inStock: true,
    stockQty: 25,
    condition: 'OEM',
    shopId: 's1',
    shopName: 'Al-Barakah Auto Parts',
    rating: 5.0,
    ratingCount: 96,
    image: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=600&auto=format&fit=crop&q=80',
    compatibleVehicles: [
      { make: 'Toyota', model: 'Corolla', yearStart: 2014, yearEnd: 2024 },
      { make: 'Toyota', model: 'Camry', yearStart: 2018, yearEnd: 2024 },
    ],
    descriptionEn: 'High ignitability spark plugs delivering smooth acceleration, enhanced fuel economy, and 100,000 km lifespan.',
    descriptionAr: 'بواجي ليزر إيريديوم تمنح المحرك استجابة سريعة وتوفيراً في استهلاك البنزين مع عمر افتراضي يصل لـ 100 ألف كم.',
  },
  {
    id: 'p5',
    nameEn: 'Gas Shock Absorber (Front Right)',
    nameAr: 'مساعد غاز أمامي يمين أصلي',
    partNumber: '334399',
    oemNumber: '48510-33470',
    manufacturer: 'KYB Excel-G',
    category: 'suspension',
    price: 88,
    priceVisibility: 'SHOW_PRICE',
    inStock: false,
    stockQty: 0,
    condition: 'AFTERMARKET',
    shopId: 's2',
    shopName: 'Sanaa Parts Store',
    rating: 4.6,
    ratingCount: 45,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80',
    compatibleVehicles: [
      { make: 'Toyota', model: 'Camry', yearStart: 2018, yearEnd: 2023 },
    ],
    descriptionEn: 'Twin-tube gas strut restoring vehicle original stability, lane-change control, and stopping distance.',
    descriptionAr: 'مساعد هيدروليك غاز يعيد ثبات السيارة والتحكم التام في المنعطفات وامتصاص الصدمات.',
  },
];

interface AppContextType {
  garage: SavedVehicle[];
  activeVehicle: SavedVehicle | null;
  setActiveVehicle: (v: SavedVehicle | null) => void;
  addVehicleToGarage: (v: Omit<SavedVehicle, 'id'>) => void;
  removeVehicleFromGarage: (id: string) => void;
  products: ProductItem[];
  cart: CartItem[];
  addToCart: (p: ProductItem, qty?: number) => void;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: OrderItemRecord[];
  addOrder: (order: Omit<OrderItemRecord, 'id' | 'date'>) => void;
  updateOrderStatus: (orderId: string, status: OrderItemRecord['status']) => void;
  addProduct: (product: Omit<ProductItem, 'id' | 'rating' | 'ratingCount'>) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  isVehicleCompatible: (product: ProductItem, vehicle: SavedVehicle | null) => boolean;
}

const AppContext = createContext<AppContextType>({} as any);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [garage, setGarage] = useState<SavedVehicle[]>(INITIAL_GARAGE);
  const [activeVehicle, setActiveVehicle] = useState<SavedVehicle | null>(INITIAL_GARAGE[0]);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
  ]);
  const [orders, setOrders] = useState<OrderItemRecord[]>([
    {
      id: 'ORD-7021',
      date: '2026-09-19',
      shopName: 'Al-Barakah Auto Parts',
      items: [{ name: 'Ceramic Front Brake Pads', qty: 1, price: 45 }],
      subtotal: 45,
      deliveryFee: 5,
      total: 50,
      status: 'CONFIRMED',
      deliveryType: 'SHOP_DELIVERY',
      paymentMethod: 'CASH',
    },
    {
      id: 'ORD-6984',
      date: '2026-09-14',
      shopName: 'Al-Barakah Auto Parts',
      items: [{ name: 'OEM Engine Oil Filter', qty: 2, price: 12 }],
      subtotal: 24,
      deliveryFee: 0,
      total: 24,
      status: 'DELIVERED',
      deliveryType: 'PICKUP',
      paymentMethod: 'WALLET',
    },
  ]);

  const addVehicleToGarage = (v: Omit<SavedVehicle, 'id'>) => {
    const newV: SavedVehicle = {
      ...v,
      id: `v_${Date.now()}`,
    };
    setGarage(prev => [...prev, newV]);
    setActiveVehicle(newV);
  };

  const removeVehicleFromGarage = (id: string) => {
    setGarage(prev => prev.filter(v => v.id !== id));
    if (activeVehicle?.id === id) {
      setActiveVehicle(garage.find(v => v.id !== id) ?? null);
    }
  };

  const addToCart = (product: ProductItem, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addOrder = (orderData: Omit<OrderItemRecord, 'id' | 'date'>) => {
    const newOrd: OrderItemRecord = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
    };
    setOrders(prev => [newOrd, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: OrderItemRecord['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const addProduct = (prodData: Omit<ProductItem, 'id' | 'rating' | 'ratingCount'>) => {
    const newProd: ProductItem = {
      ...prodData,
      id: `p_${Date.now()}`,
      rating: 5.0,
      ratingCount: 1,
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const stockQty = Math.max(0, newStock);
          return { ...p, stockQty, inStock: stockQty > 0 };
        }
        return p;
      })
    );
  };

  const isVehicleCompatible = (product: ProductItem, vehicle: SavedVehicle | null): boolean => {
    if (!vehicle) return true; // No filter active
    return product.compatibleVehicles.some(c => {
      const makeMatch = c.make.toLowerCase() === vehicle.make.toLowerCase();
      const modelMatch = c.model.toLowerCase() === vehicle.model.toLowerCase();
      const yearMatch = vehicle.year >= c.yearStart && vehicle.year <= c.yearEnd;
      return makeMatch && modelMatch && yearMatch;
    });
  };

  const value = useMemo(() => ({
    garage,
    activeVehicle,
    setActiveVehicle,
    addVehicleToGarage,
    removeVehicleFromGarage,
    products,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    orders,
    addOrder,
    updateOrderStatus,
    addProduct,
    updateProductStock,
    isVehicleCompatible,
  }), [garage, activeVehicle, products, cart, orders]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
