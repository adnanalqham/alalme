
// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

// User Entity
export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  passwordHash?: string; 
  status: UserStatus;
  shopId?: string; // If seller
  mustChangePassword?: boolean;
  
  // Customer specific
  ownedCarBrands?: string[]; // IDs of brands
  preferredCategories?: string[]; // IDs of categories
}

// Shop Entity
export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  city: string;
  addressDetails: string;
  latitude: number;
  longitude: number;
  workingHours: string;
  notes?: string;
  isActive: boolean;
  logoUrl?: string;
  createdAt: string;
}

// Car Brand Entity
export interface CarBrand {
  id: string;
  nameEn: string;
  nameAr: string;
  logoUrl: string;
}

// Category Entity
export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  imageUrl?: string;
  isActive: boolean;
}

// Part Entity
export interface Part {
  id: string;
  shopId: string;
  brandId: string; // Link to CarBrand
  categoryId: string; // Link to Category
  nameEn: string;
  nameAr: string;
  carBrand: string; // Keep for display convenience
  carModel: string;
  yearRange: string;
  condition: 'New' | 'Used';
  rating: number; 
  price: number;
  costPrice?: number; // For profit calculation
  currency: 'YER' | 'USD' | 'SAR';
  stockQuantity: number;
  imageUrl: string; // Main thumbnail
  images?: string[]; // Gallery
  soldCount: number;
}

// Sales Entity
export interface Sale {
  id: string;
  partId: string;
  sellerId: string;
  buyerId: string; 
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

// Inventory History
export type StockMovementType = 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN';

export interface StockMovement {
  id: string;
  partId: string;
  shopId: string;
  type: StockMovementType;
  quantityChange: number;
  date: string;
  note?: string;
}

// External Sales Request (Customer Request)
export interface ExternalSalesRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  carBrandId: string;
  carModel: string;
  modelYear: string;
  description: string;
  notes?: string;
  imageUrl: string;
  createdAt: string;
}

// Contact Us Message
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  imageUrl?: string;
  createdAt: string;
}

// Inbox Message (Internal System)
export enum InboxType {
  EXTERNAL_REQUEST = 'EXTERNAL_REQUEST',
  CONTACT_MSG = 'CONTACT_MSG',
  SYSTEM = 'SYSTEM',
  REPLY = 'REPLY'
}

export interface InboxMessage {
  id: string;
  senderId: string; // 'system', 'guest', or userId
  receiverId: string;
  type: InboxType;
  title: string;
  body: string;
  attachmentUrl?: string; // Image
  requestId?: string; // Link to ExternalSalesRequest ID or ContactMessage ID
  isRead: boolean;
  createdAt: string;
}

// Website Global Settings
export interface WebsiteSettings {
  appNameEn: string;
  appNameAr: string;
  logoUrl: string;
  defaultLanguage: 'en' | 'ar';
  
  // Contact Info
  contactPhone: string;
  contactEmail: string;
  contactAddressEn: string;
  contactAddressAr: string;
  workingHoursEn: string;
  workingHoursAr: string;
  
  // Social Media
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
  tiktokUrl: string;
  youtubeUrl: string;
  
  // Footer
  footerTextEn: string;
  footerTextAr: string;
}

// UI Translation
export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ar: string;
  };
}
