
import { CarBrand, Category, Part, Sale, Shop, ShopStatus, StockMovement, StockMovementType, User, UserRole, UserStatus, WebsiteSettings, ExternalSalesRequest, ContactMessage, InboxMessage } from "../types";
import { DEFAULT_SETTINGS } from "../constants";

// Initial Mock Data (Preserving existing constants)
const INITIAL_BRANDS: CarBrand[] = [
  { id: 'b1', nameEn: 'Toyota', nameAr: 'تويوتا', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Toyota_EU.svg/2560px-Toyota_EU.svg.png' },
  { id: 'b2', nameEn: 'Hyundai', nameAr: 'هونداي', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png' },
  { id: 'b3', nameEn: 'Kia', nameAr: 'كيا', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_logo.svg/2560px-Kia_logo.svg.png' },
  { id: 'b4', nameEn: 'Honda', nameAr: 'هوندا', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/2560px-Honda.svg.png' },
  { id: 'b5', nameEn: 'Nissan', nameAr: 'نيسان', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/600px-Nissan_logo.png' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', nameEn: 'Engine', nameAr: 'المحرك', isActive: true },
  { id: 'c2', nameEn: 'Brakes', nameAr: 'الفرامل', isActive: true },
  { id: 'c3', nameEn: 'Suspension', nameAr: 'نظام التعليق', isActive: true },
  { id: 'c4', nameEn: 'Body', nameAr: 'الهيكل', isActive: true },
  { id: 'c5', nameEn: 'Electrical', nameAr: 'كهرباء', isActive: true },
  { id: 'c6', nameEn: 'Interior', nameAr: 'داخلي', isActive: true },
  { id: 'c7', nameEn: 'Lights', nameAr: 'أضواء', isActive: true },
  { id: 'c8', nameEn: 'Accessories', nameAr: 'إكسسوارات', isActive: true },
  { id: 'c9', nameEn: 'Tires', nameAr: 'إطارات', isActive: true },
  { id: 'c10', nameEn: 'Batteries', nameAr: 'بطاريات', isActive: true },
];

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    role: UserRole.ADMIN,
    fullName: 'System Admin',
    username: 'ad',
    email: 'admin@alalami.com',
    phone: '777000000',
    city: 'Sana\'a',
    passwordHash: '123', 
    status: UserStatus.ACTIVE,
  },
  {
    id: 'u2',
    role: UserRole.SELLER,
    fullName: 'Ahmed Ali',
    username: 'ahmed_parts',
    email: 'ahmed@shop.com',
    phone: '777111111',
    city: 'Aden',
    passwordHash: 'seller123',
    status: UserStatus.ACTIVE,
    shopId: 's1',
  },
  {
    id: 'u3',
    role: UserRole.CUSTOMER,
    fullName: 'Salem Omar',
    username: 'salem99',
    email: 'salem@gmail.com',
    phone: '777222222',
    city: 'Taiz',
    passwordHash: 'cust123',
    status: UserStatus.ACTIVE,
  }
];

const INITIAL_SHOPS: Shop[] = [
  {
    id: 's1',
    ownerId: 'u2',
    name: 'Al-Barakah Auto Parts',
    nameEn: 'Al-Barakah Auto Parts',
    nameAr: 'البركة لقطع غيار السيارات',
    countryId: 'c_ye',
    status: ShopStatus.APPROVED,
    phone: '777111111',
    city: 'Aden',
    addressDetails: 'Main Street, near Crater',
    latitude: 12.7855,
    longitude: 45.0187,
    workingHours: '08:00 AM - 09:00 PM',
    isActive: true,
    descriptionEn: 'Specialized in Toyota and Hyundai',
    createdAt: '2023-01-01T10:00:00Z',
    email: 'shop@barakah.com',
    whatsappNumber: '777111111'
  }
];

const INITIAL_PARTS: Part[] = [
  {
    id: 'p1',
    shopId: 's1',
    brandId: 'b1',
    categoryId: 'c2', // Brakes
    nameEn: 'Toyota Camry Brake Pads',
    nameAr: 'فحمات فرامل تويوتا كامري',
    carBrand: 'Toyota',
    carModel: 'Camry',
    yearRange: '2018-2022',
    condition: 'New',
    rating: 5,
    price: 35,
    costPrice: 20,
    currency: 'USD',
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80',
    soldCount: 5,
  },
  {
    id: 'p2',
    shopId: 's1',
    brandId: 'b2',
    categoryId: 'c7', // Lights
    nameEn: 'Hyundai Sonata Headlight',
    nameAr: 'شمعه أمامية هونداي سوناتا',
    carBrand: 'Hyundai',
    carModel: 'Sonata',
    yearRange: '2015-2017',
    condition: 'Used',
    rating: 4,
    price: 15000,
    costPrice: 8000,
    currency: 'YER',
    stockQuantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1504215680905-41940179c463?auto=format&fit=crop&q=80',
    soldCount: 1,
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale1',
    partId: 'p1',
    sellerId: 'u2',
    buyerId: 'u3',
    quantity: 2,
    unitPrice: 35,
    totalPrice: 70,
    date: '2023-10-15T10:00:00Z',
  }
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'm1',
    productId: 'p1',
    partId: 'p1',
    shopId: 's1',
    type: StockMovementType.RESTOCK,
    quantityChange: 25,
    quantityAfter: 25,
    userId: 'u2',
    date: '2023-10-01T09:00:00Z',
    note: 'Initial Stock'
  },
  {
    id: 'm2',
    productId: 'p1',
    partId: 'p1',
    shopId: 's1',
    type: StockMovementType.SALE,
    quantityChange: -2,
    quantityAfter: 23,
    userId: 'u2',
    date: '2023-10-15T10:00:00Z',
    note: 'Sold to u3'
  }
];

const load = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initial;
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dataService = {
  getUsers: () => load<User[]>('ala_users', INITIAL_USERS),
  setUsers: (users: User[]) => save('ala_users', users),
  
  getShops: () => load<Shop[]>('ala_shops', INITIAL_SHOPS),
  setShops: (shops: Shop[]) => save('ala_shops', shops),
  
  getParts: () => load<Part[]>('ala_parts', INITIAL_PARTS),
  setParts: (parts: Part[]) => save('ala_parts', parts),
  
  getSales: () => load<Sale[]>('ala_sales', INITIAL_SALES),
  setSales: (sales: Sale[]) => save('ala_sales', sales),

  getBrands: () => load<CarBrand[]>('ala_brands', INITIAL_BRANDS),
  setBrands: (brands: CarBrand[]) => save('ala_brands', brands),

  getCategories: () => load<Category[]>('ala_categories', INITIAL_CATEGORIES),
  setCategories: (categories: Category[]) => save('ala_categories', categories),

  getStockMovements: () => load<StockMovement[]>('ala_movements', INITIAL_MOVEMENTS),
  setStockMovements: (movements: StockMovement[]) => save('ala_movements', movements),

  getSettings: () => load<WebsiteSettings>('ala_settings', DEFAULT_SETTINGS),
  setSettings: (settings: WebsiteSettings) => save('ala_settings', settings),

  // New features
  getExternalRequests: () => load<ExternalSalesRequest[]>('ala_requests', []),
  setExternalRequests: (requests: ExternalSalesRequest[]) => save('ala_requests', requests),

  getContactMessages: () => load<ContactMessage[]>('ala_contact', []),
  setContactMessages: (msgs: ContactMessage[]) => save('ala_contact', msgs),

  getInboxMessages: () => load<InboxMessage[]>('ala_inbox', []),
  setInboxMessages: (msgs: InboxMessage[]) => save('ala_inbox', msgs),
};
