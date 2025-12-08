
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Shop, Part, Sale, CarBrand, StockMovement, UserStatus, WebsiteSettings, Category, ExternalSalesRequest, ContactMessage, InboxMessage, InboxType, UserRole } from '../types';
import { dataService } from '../services/mockData';

interface DataContextType {
  users: User[];
  shops: Shop[];
  parts: Part[];
  sales: Sale[];
  brands: CarBrand[];
  categories: Category[];
  stockMovements: StockMovement[];
  websiteSettings: WebsiteSettings;
  externalRequests: ExternalSalesRequest[];
  contactMessages: ContactMessage[];
  inboxMessages: InboxMessage[];
  
  refreshData: () => void;
  addPart: (part: Part) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  recordSale: (sale: Sale) => void;
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (id: string) => string;
  
  addBrand: (brand: CarBrand) => void;
  updateBrand: (brand: CarBrand) => void;
  deleteBrand: (id: string) => void;
  
  addCategory: (category: Category) => void;
  toggleCategoryStatus: (id: string) => void;
  deleteCategory: (id: string) => void;

  updateSettings: (settings: WebsiteSettings) => void;
  addShop: (shop: Shop, owner: User) => void;
  updateShop: (shop: Shop) => void;
  deleteShop: (shopId: string) => void;

  submitExternalRequest: (req: ExternalSalesRequest) => void;
  submitContactMessage: (msg: ContactMessage) => void;
  sendInboxMessage: (msg: InboxMessage) => void;
  markMessageAsRead: (msgId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(dataService.getSettings());
  const [externalRequests, setExternalRequests] = useState<ExternalSalesRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);

  const refreshData = () => {
    setUsers(dataService.getUsers());
    setShops(dataService.getShops());
    setParts(dataService.getParts());
    setSales(dataService.getSales());
    setBrands(dataService.getBrands());
    setCategories(dataService.getCategories());
    setStockMovements(dataService.getStockMovements());
    setWebsiteSettings(dataService.getSettings());
    setExternalRequests(dataService.getExternalRequests());
    setContactMessages(dataService.getContactMessages());
    setInboxMessages(dataService.getInboxMessages());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addPart = (part: Part) => {
    const newParts = [...parts, part];
    dataService.setParts(newParts);
    setParts(newParts);
    
    // Log initial stock movement
    if (part.stockQuantity > 0) {
      const movement: StockMovement = {
        id: `mv_${Date.now()}`,
        partId: part.id,
        shopId: part.shopId,
        type: 'RESTOCK',
        quantityChange: part.stockQuantity,
        date: new Date().toISOString(),
        note: 'Initial Stock'
      };
      const newMovements = [...stockMovements, movement];
      dataService.setStockMovements(newMovements);
      setStockMovements(newMovements);
    }
  };

  const updatePart = (updatedPart: Part) => {
    const oldPart = parts.find(p => p.id === updatedPart.id);
    if (oldPart && oldPart.stockQuantity !== updatedPart.stockQuantity) {
       const diff = updatedPart.stockQuantity - oldPart.stockQuantity;
       const movement: StockMovement = {
         id: `mv_${Date.now()}`,
         partId: updatedPart.id,
         shopId: updatedPart.shopId,
         type: 'ADJUSTMENT',
         quantityChange: diff,
         date: new Date().toISOString(),
         note: 'Manual Adjustment'
       };
       const newMovements = [...stockMovements, movement];
       dataService.setStockMovements(newMovements);
       setStockMovements(newMovements);
    }

    const newParts = parts.map(p => p.id === updatedPart.id ? updatedPart : p);
    dataService.setParts(newParts);
    setParts(newParts);
  };

  const deletePart = (id: string) => {
    const newParts = parts.filter(p => p.id !== id);
    dataService.setParts(newParts);
    setParts(newParts);
  };

  const recordSale = (sale: Sale) => {
    const newSales = [...sales, sale];
    dataService.setSales(newSales);
    setSales(newSales);
    
    // Update inventory
    const part = parts.find(p => p.id === sale.partId);
    if (part) {
      updatePart({
        ...part,
        stockQuantity: Math.max(0, part.stockQuantity - sale.quantity),
        soldCount: part.soldCount + sale.quantity
      });

      const movement: StockMovement = {
        id: `mv_${Date.now()}`,
        partId: sale.partId,
        shopId: sale.sellerId,
        type: 'SALE',
        quantityChange: -sale.quantity,
        date: sale.date,
        note: `Sale to user ${sale.buyerId}`
      };
      const newMovements = [...stockMovements, movement];
      dataService.setStockMovements(newMovements);
      setStockMovements(newMovements);
    }
  };

  const toggleUserStatus = (id: string) => {
    const newUsers = users.map(u => {
      if (u.id === id) {
        let newStatus = UserStatus.ACTIVE;
        if (u.status === UserStatus.ACTIVE) newStatus = UserStatus.SUSPENDED;
        else if (u.status === UserStatus.SUSPENDED) newStatus = UserStatus.ACTIVE;
        return { ...u, status: newStatus };
      }
      return u;
    });
    dataService.setUsers(newUsers);
    setUsers(newUsers);
  };

  const resetUserPassword = (id: string) => {
    const tempPassword = Math.random().toString(36).slice(-8); 
    const newUsers = users.map(u => {
      if (u.id === id) {
        return { 
          ...u, 
          passwordHash: tempPassword,
          mustChangePassword: true 
        };
      }
      return u;
    });
    dataService.setUsers(newUsers);
    setUsers(newUsers);
    return tempPassword;
  };

  const addBrand = (brand: CarBrand) => {
    const newBrands = [...brands, brand];
    dataService.setBrands(newBrands);
    setBrands(newBrands);
  };

  const updateBrand = (updatedBrand: CarBrand) => {
    const newBrands = brands.map(b => b.id === updatedBrand.id ? updatedBrand : b);
    dataService.setBrands(newBrands);
    setBrands(newBrands);
  };

  const deleteBrand = (id: string) => {
    const newBrands = brands.filter(b => b.id !== id);
    dataService.setBrands(newBrands);
    setBrands(newBrands);
  };

  const addCategory = (category: Category) => {
    const newCategories = [...categories, category];
    dataService.setCategories(newCategories);
    setCategories(newCategories);
  };

  const toggleCategoryStatus = (id: string) => {
    const newCategories = categories.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    dataService.setCategories(newCategories);
    setCategories(newCategories);
  };

  const deleteCategory = (id: string) => {
    const newCategories = categories.filter(c => c.id !== id);
    dataService.setCategories(newCategories);
    setCategories(newCategories);
  };

  const updateSettings = (settings: WebsiteSettings) => {
    dataService.setSettings(settings);
    setWebsiteSettings(settings);
  };

  const addShop = (shop: Shop, owner: User) => {
    const newUsers = [...users, owner];
    dataService.setUsers(newUsers);
    setUsers(newUsers);

    const newShops = [...shops, shop];
    dataService.setShops(newShops);
    setShops(newShops);
  };

  const updateShop = (updatedShop: Shop) => {
    const newShops = shops.map(s => s.id === updatedShop.id ? updatedShop : s);
    dataService.setShops(newShops);
    setShops(newShops);
  };

  const deleteShop = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      const newShops = shops.filter(s => s.id !== shopId);
      dataService.setShops(newShops);
      setShops(newShops);

      const newUsers = users.map(u => u.id === shop.ownerId ? { ...u, status: UserStatus.DEACTIVATED } : u);
      dataService.setUsers(newUsers);
      setUsers(newUsers);
    }
  };

  // --- New Feature Implementation ---

  const submitExternalRequest = (req: ExternalSalesRequest) => {
    const newRequests = [...externalRequests, req];
    dataService.setExternalRequests(newRequests);
    setExternalRequests(newRequests);

    // Broadcast to Admins and Sellers
    const recipients = users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SELLER);
    const newMessages: InboxMessage[] = recipients.map(u => ({
      id: `msg_${Date.now()}_${u.id}`,
      senderId: 'system',
      receiverId: u.id,
      type: InboxType.EXTERNAL_REQUEST,
      title: 'New External Sales Request',
      body: req.description,
      attachmentUrl: req.imageUrl,
      requestId: req.id,
      isRead: false,
      createdAt: new Date().toISOString()
    }));
    
    const updatedInbox = [...inboxMessages, ...newMessages];
    dataService.setInboxMessages(updatedInbox);
    setInboxMessages(updatedInbox);
  };

  const submitContactMessage = (msg: ContactMessage) => {
    const newMsgs = [...contactMessages, msg];
    dataService.setContactMessages(newMsgs);
    setContactMessages(newMsgs);

    // Send to Admins
    const admins = users.filter(u => u.role === UserRole.ADMIN);
    const newInboxMsgs: InboxMessage[] = admins.map(u => ({
       id: `msg_${Date.now()}_${u.id}`,
       senderId: 'guest',
       receiverId: u.id,
       type: InboxType.CONTACT_MSG,
       title: `Contact Us: ${msg.name}`,
       body: msg.message,
       attachmentUrl: msg.imageUrl,
       requestId: msg.id,
       isRead: false,
       createdAt: new Date().toISOString()
    }));

    const updatedInbox = [...inboxMessages, ...newInboxMsgs];
    dataService.setInboxMessages(updatedInbox);
    setInboxMessages(updatedInbox);
  };

  const sendInboxMessage = (msg: InboxMessage) => {
    const newInbox = [...inboxMessages, msg];
    dataService.setInboxMessages(newInbox);
    setInboxMessages(newInbox);
  };

  const markMessageAsRead = (msgId: string) => {
    const newInbox = inboxMessages.map(m => m.id === msgId ? { ...m, isRead: true } : m);
    dataService.setInboxMessages(newInbox);
    setInboxMessages(newInbox);
  };

  return (
    <DataContext.Provider value={{ 
      users, shops, parts, sales, brands, categories, stockMovements, websiteSettings,
      externalRequests, contactMessages, inboxMessages,
      refreshData, addPart, updatePart, deletePart, recordSale, toggleUserStatus, resetUserPassword,
      addBrand, updateBrand, deleteBrand,
      addCategory, toggleCategoryStatus, deleteCategory,
      updateSettings, addShop, updateShop, deleteShop,
      submitExternalRequest, submitContactMessage, sendInboxMessage, markMessageAsRead
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
