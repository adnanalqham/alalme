
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, UserStatus, WebsiteSettings, Shop, User, CarBrand, Category } from '../../types';
import { Users, ShoppingBag, DollarSign, Store, Activity, Box, Settings, Plus, Trash, Key, AlertTriangle, Save, Globe, Smartphone, Mail, MapPin, AlertCircle, Upload, X, Search, CheckCircle, Tag, Eye, EyeOff } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY } from '../../constants';
import Inbox from '../Inbox'; // Reusing the unified inbox component

type Tab = 'overview' | 'users' | 'shops' | 'brands' | 'categories' | 'inventory' | 'settings' | 'inbox';

const AdminDashboard: React.FC = () => {
  const { users, shops, sales, parts, brands, categories, toggleUserStatus, resetUserPassword, addBrand, deleteBrand, addCategory, toggleCategoryStatus, deleteCategory, stockMovements, websiteSettings, updateSettings, addShop, deleteShop, inboxMessages } = useData();
  const { t, language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Calculate unread for admin
  const unreadCount = inboxMessages.filter(m => {
     const admin = users.find(u => u.role === UserRole.ADMIN);
     return admin && m.receiverId === admin.id && !m.isRead;
  }).length;
  
  // States for Filters
  const [userFilter, setUserFilter] = useState<'ALL' | 'SELLER' | 'CUSTOMER' | 'ADMIN'>('ALL');
  
  // State for Brand Management
  const [newBrand, setNewBrand] = useState({ nameEn: '', nameAr: '', logoUrl: '' });

  // State for Category Management
  const [newCategory, setNewCategory] = useState({ nameEn: '', nameAr: '' });
  
  // State for Shop Wizard
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [showShopPassword, setShowShopPassword] = useState(false); // Toggle for shop password
  const [shopForm, setShopForm] = useState({
    ownerName: '',
    ownerUsername: '',
    ownerPassword: '',
    ownerPhone: '',
    ownerEmail: '',
    shopName: '',
    city: '',
    address: '',
    latitude: 15.3694,
    longitude: 44.1910,
    whatsapp: '',
    workingHours: '',
    notes: '',
    logoUrl: '' // For Shop Logo
  });

  // State for Settings Form
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(websiteSettings);

  // Stats
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalProfit = sales.reduce((acc, curr) => {
    const part = parts.find(p => p.id === curr.partId);
    const cost = part?.costPrice || 0;
    return acc + (curr.totalPrice - (cost * curr.quantity));
  }, 0);

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'brand' | 'shop') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large. Max 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (target === 'brand') {
          setNewBrand({ ...newBrand, logoUrl: base64 });
        } else {
          setShopForm({ ...shopForm, logoUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.logoUrl) {
      alert("Please upload a logo");
      return;
    }
    addBrand({
      id: `b_${Date.now()}`,
      nameEn: newBrand.nameEn,
      nameAr: newBrand.nameAr,
      logoUrl: newBrand.logoUrl
    });
    setNewBrand({ nameEn: '', nameAr: '', logoUrl: '' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory({
      id: `c_${Date.now()}`,
      nameEn: newCategory.nameEn,
      nameAr: newCategory.nameAr,
      isActive: true
    });
    setNewCategory({ nameEn: '', nameAr: '' });
  };

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerId = `u_${Date.now()}`;
    const shopId = `s_${Date.now()}`;
    
    const owner: User = {
      id: ownerId,
      role: UserRole.SELLER,
      fullName: shopForm.ownerName,
      username: shopForm.ownerUsername,
      email: shopForm.ownerEmail,
      phone: shopForm.ownerPhone,
      city: shopForm.city,
      passwordHash: shopForm.ownerPassword,
      status: UserStatus.ACTIVE,
      shopId: shopId
    };

    const shop: Shop = {
      id: shopId,
      ownerId: ownerId,
      name: shopForm.shopName,
      phone: shopForm.ownerPhone, // Default to owner phone
      whatsappNumber: shopForm.whatsapp,
      email: shopForm.ownerEmail,
      city: shopForm.city,
      addressDetails: shopForm.address,
      latitude: Number(shopForm.latitude),
      longitude: Number(shopForm.longitude),
      workingHours: shopForm.workingHours,
      notes: shopForm.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      logoUrl: shopForm.logoUrl
    };

    addShop(shop, owner);
    setIsAddingShop(false);
    // Reset form
    setShopForm({
      ownerName: '', ownerUsername: '', ownerPassword: '', ownerPhone: '', ownerEmail: '',
      shopName: '', city: '', address: '', latitude: 15.3694, longitude: 44.1910,
      whatsapp: '', workingHours: '', notes: '', logoUrl: ''
    });
  };

  const handleResetPassword = (userId: string) => {
    const newPass = resetUserPassword(userId);
    alert(`Password reset. Temporary password: ${newPass}`);
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">{t('users')}</p>
            <h3 className="text-3xl font-bold">{users.length}</h3>
          </div>
          <Users className="text-blue-500 opacity-50" size={32} />
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {users.filter(u => u.role === UserRole.SELLER).length} Sellers, {users.filter(u => u.role === UserRole.CUSTOMER).length} Customers
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">{t('totalRevenue')}</p>
            <h3 className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</h3>
          </div>
          <DollarSign className="text-green-500 opacity-50" size={32} />
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Approx Profit: <span className="text-green-600 font-bold">${totalProfit.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">{t('shops')}</p>
            <h3 className="text-3xl font-bold">{shops.length}</h3>
          </div>
          <Store className="text-yellow-500 opacity-50" size={32} />
        </div>
        <div className="mt-2 text-xs text-gray-400">Active Marketplaces</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase">{t('sales')}</p>
            <h3 className="text-3xl font-bold">{sales.length}</h3>
          </div>
          <ShoppingBag className="text-purple-500 opacity-50" size={32} />
        </div>
        <div className="mt-2 text-xs text-gray-400">Total Transactions</div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => {
      if (userFilter === 'ALL') return true;
      return u.role === userFilter;
    });

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20}/> User Management</h2>
          <div className="flex gap-2">
            {(['ALL', 'SELLER', 'CUSTOMER', 'ADMIN'] as const).map(role => (
              <button 
                key={role}
                onClick={() => setUserFilter(role)}
                className={`px-3 py-1 rounded text-sm font-bold ${userFilter === role ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {role === 'ALL' ? t('allUsers') : role}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Username</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.fullName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'SELLER' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{user.username}</td>
                  <td className="p-3 text-sm">
                    <div className="flex flex-col">
                      <span>{user.phone}</span>
                      <span className="text-gray-400 text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1 ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle size={10} /> : <X size={10} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`p-1 rounded ${user.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title="Toggle Status"
                    >
                      <Activity size={16} />
                    </button>
                    <button 
                      onClick={() => handleResetPassword(user.id)}
                      className="p-1 rounded text-orange-500 hover:bg-orange-50"
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderShops = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><Store/> Shop Management</h2>
        <button 
          onClick={() => setIsAddingShop(true)}
          className="bg-secondary text-primary px-4 py-2 rounded flex items-center gap-2 font-bold hover:bg-yellow-200"
        >
          <Plus size={18} /> {t('addShop')}
        </button>
      </div>

      {isAddingShop && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
           <h3 className="text-lg font-bold mb-4 border-b pb-2 text-primary">New Shop Registration Wizard</h3>
           <form onSubmit={handleAddShop} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Owner Details */}
              <div className="space-y-4 bg-gray-50 p-4 rounded">
                 <h4 className="font-bold text-gray-700 flex items-center gap-2"><Users className="w-4 h-4"/> Owner Information</h4>
                 <input placeholder={t('ownerName')} required className="w-full p-2 border rounded" value={shopForm.ownerName} onChange={e => setShopForm({...shopForm, ownerName: e.target.value})} />
                 <div className="grid grid-cols-2 gap-2">
                    <input placeholder={t('phone')} required className="p-2 border rounded" value={shopForm.ownerPhone} onChange={e => setShopForm({...shopForm, ownerPhone: e.target.value})} />
                    <input placeholder={t('email')} className="p-2 border rounded" value={shopForm.ownerEmail} onChange={e => setShopForm({...shopForm, ownerEmail: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <input placeholder={t('username')} required className="p-2 border rounded" value={shopForm.ownerUsername} onChange={e => setShopForm({...shopForm, ownerUsername: e.target.value})} />
                    <div className="relative">
                      <input 
                        placeholder={t('password')} 
                        required 
                        type={showShopPassword ? "text" : "password"} 
                        className="w-full p-2 border rounded pr-10" 
                        value={shopForm.ownerPassword} 
                        onChange={e => setShopForm({...shopForm, ownerPassword: e.target.value})} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowShopPassword(!showShopPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
                      >
                        {showShopPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                 </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-4 bg-gray-50 p-4 rounded">
                 <h4 className="font-bold text-gray-700 flex items-center gap-2"><Store className="w-4 h-4"/> Shop Details</h4>
                 <input placeholder={t('shopNameField')} required className="w-full p-2 border rounded" value={shopForm.shopName} onChange={e => setShopForm({...shopForm, shopName: e.target.value})} />
                 <div className="grid grid-cols-2 gap-2">
                    <input placeholder={t('city')} required className="p-2 border rounded" value={shopForm.city} onChange={e => setShopForm({...shopForm, city: e.target.value})} />
                    <input placeholder={t('address')} required className="p-2 border rounded" value={shopForm.address} onChange={e => setShopForm({...shopForm, address: e.target.value})} />
                 </div>
                 <input placeholder="Working Hours" className="w-full p-2 border rounded" value={shopForm.workingHours} onChange={e => setShopForm({...shopForm, workingHours: e.target.value})} />
                 <input placeholder="WhatsApp Number" className="w-full p-2 border rounded" value={shopForm.whatsapp} onChange={e => setShopForm({...shopForm, whatsapp: e.target.value})} />
              </div>

              {/* Location & Extra */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4 bg-gray-50 p-4 rounded">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location (Google Maps)</h4>
                    <div className="grid grid-cols-2 gap-2">
                       <input type="number" step="any" placeholder={t('latitude')} className="p-2 border rounded" value={shopForm.latitude} onChange={e => setShopForm({...shopForm, latitude: Number(e.target.value)})} />
                       <input type="number" step="any" placeholder={t('longitude')} className="p-2 border rounded" value={shopForm.longitude} onChange={e => setShopForm({...shopForm, longitude: Number(e.target.value)})} />
                    </div>
                    <div className="h-32 bg-gray-200 rounded overflow-hidden">
                       <iframe width="100%" height="100%" frameBorder="0" src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${shopForm.latitude},${shopForm.longitude}&zoom=14`}></iframe>
                    </div>
                 </div>

                 <div className="space-y-4 bg-gray-50 p-4 rounded">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2"><Upload className="w-4 h-4"/> Branding</h4>
                    <textarea placeholder={t('notes')} className="w-full p-2 border rounded" rows={2} value={shopForm.notes} onChange={e => setShopForm({...shopForm, notes: e.target.value})} />
                    
                    <div className="border border-dashed p-4 rounded text-center bg-white">
                        {shopForm.logoUrl ? (
                          <div className="relative w-20 h-20 mx-auto">
                            <img src={shopForm.logoUrl} className="w-full h-full object-contain" />
                            <button type="button" onClick={() => setShopForm({...shopForm, logoUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="mx-auto text-gray-400 mb-2"/>
                            <span className="text-xs text-primary font-bold">{t('uploadLogo')}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'shop')}/>
                          </label>
                        )}
                    </div>
                 </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 border-t pt-4">
                 <button type="button" onClick={() => setIsAddingShop(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('cancel')}</button>
                 <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition">{t('saveChanges')}</button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shops.map(shop => (
          <div key={shop.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 relative group">
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
                     {shop.logoUrl ? <img src={shop.logoUrl} className="w-full h-full object-cover"/> : <Store className="text-gray-400"/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">{shop.name}</h3>
                    <p className="text-sm text-gray-500">{shop.city}</p>
                  </div>
               </div>
               <span className={`px-2 py-1 text-xs rounded font-bold ${shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                 {shop.isActive ? t('active') : t('inactive')}
               </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
               <p className="flex items-center gap-2"><Smartphone size={14}/> {shop.phone}</p>
               <p className="flex items-center gap-2"><MapPin size={14}/> {shop.addressDetails}</p>
               <p className="text-xs text-gray-400 mt-2">{shop.notes}</p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
               <button className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Settings size={18}/></button>
               <button onClick={() => deleteShop(shop.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBrands = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2"><CheckCircle size={20}/> Manage Car Brands</h3>
         <form onSubmit={handleAddBrand} className="flex gap-4 items-end">
            <div className="flex-1">
               <label className="block text-sm font-bold mb-1">Brand Name (EN)</label>
               <input 
                 className="w-full p-2 border rounded" 
                 value={newBrand.nameEn} 
                 onChange={e => setNewBrand({...newBrand, nameEn: e.target.value})}
                 required
               />
            </div>
            <div className="flex-1">
               <label className="block text-sm font-bold mb-1">Brand Name (AR)</label>
               <input 
                 className="w-full p-2 border rounded" 
                 value={newBrand.nameAr} 
                 onChange={e => setNewBrand({...newBrand, nameAr: e.target.value})}
                 required
               />
            </div>
             <div className="flex-1">
               <label className="block text-sm font-bold mb-1">Logo</label>
               <div className="relative border p-1 rounded flex items-center bg-gray-50">
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'brand')} className="absolute inset-0 opacity-0 cursor-pointer w-full"/>
                  <div className="flex items-center gap-2 px-2 overflow-hidden w-full">
                     <Upload size={16} className="text-gray-400 shrink-0"/>
                     <span className="text-xs text-gray-500 truncate">{newBrand.logoUrl ? "Image Selected" : "Upload..."}</span>
                  </div>
                  {newBrand.logoUrl && <img src={newBrand.logoUrl} className="h-8 w-8 object-contain ml-auto bg-white border rounded"/>}
               </div>
            </div>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded font-bold h-10 hover:bg-blue-800">Add</button>
         </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         {brands.map(brand => (
            <div key={brand.id} className="bg-white p-4 rounded shadow flex flex-col items-center text-center group relative">
               <img src={brand.logoUrl} alt={brand.nameEn} className="h-12 w-auto mb-2 object-contain" />
               <h4 className="font-bold text-sm">{language === 'ar' ? brand.nameAr : brand.nameEn}</h4>
               <button 
                  onClick={() => deleteBrand(brand.id)}
                  className="absolute top-1 right-1 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
               >
                  <X size={12} />
               </button>
            </div>
         ))}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2"><Tag size={20}/> {t('manageCategories')}</h3>
         <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
            <div className="flex-1">
               <label className="block text-sm font-bold mb-1">{t('categoryNameEn')}</label>
               <input 
                 className="w-full p-2 border rounded" 
                 value={newCategory.nameEn} 
                 onChange={e => setNewCategory({...newCategory, nameEn: e.target.value})}
                 required
               />
            </div>
            <div className="flex-1">
               <label className="block text-sm font-bold mb-1">{t('categoryNameAr')}</label>
               <input 
                 className="w-full p-2 border rounded" 
                 value={newCategory.nameAr} 
                 onChange={e => setNewCategory({...newCategory, nameAr: e.target.value})}
                 required
               />
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-bold h-10 hover:bg-blue-800">{t('addCategory')}</button>
         </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b font-bold text-gray-700">{t('activeCategories')}</div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
               <th className="p-3">Name (EN)</th>
               <th className="p-3">Name (AR)</th>
               <th className="p-3">Parts</th>
               <th className="p-3">Status</th>
               <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
             {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                   <td className="p-3 font-medium">{cat.nameEn}</td>
                   <td className="p-3 font-medium">{cat.nameAr}</td>
                   <td className="p-3 text-gray-500">{parts.filter(p => p.categoryId === cat.id).length}</td>
                   <td className="p-3">
                      <button 
                         onClick={() => toggleCategoryStatus(cat.id)}
                         className={`px-3 py-1 rounded-full text-xs font-bold ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                         {cat.isActive ? t('active') : t('inactive')}
                      </button>
                   </td>
                   <td className="p-3">
                      <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded">
                         <Trash size={16} />
                      </button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Low Stock Alert */}
         <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertTriangle size={18}/> {t('lowStock')}</h3>
            <ul className="space-y-2">
               {parts.filter(p => p.stockQuantity <= 3).map(p => (
                  <li key={p.id} className="flex justify-between text-sm bg-white p-2 rounded shadow-sm">
                     <span>{language === 'ar' ? p.nameAr : p.nameEn}</span>
                     <span className="font-bold text-red-600">{p.stockQuantity} left</span>
                  </li>
               ))}
               {parts.filter(p => p.stockQuantity <= 3).length === 0 && <p className="text-sm text-gray-500">No low stock items.</p>}
            </ul>
         </div>

         {/* Stats */}
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><Box size={18}/> {t('currentStock')}</h3>
             <div className="text-3xl font-bold text-blue-900 mb-1">{parts.reduce((a, b) => a + b.stockQuantity, 0)}</div>
             <p className="text-sm text-blue-700">Total items across all shops</p>
         </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="p-4 border-b font-bold flex items-center gap-2">
            <Activity size={18} /> {t('stockMovement')}
         </div>
         <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-600 sticky top-0">
                  <tr>
                     <th className="p-3">{t('date')}</th>
                     <th className="p-3">Part</th>
                     <th className="p-3">{t('changeType')}</th>
                     <th className="p-3">{t('quantity')}</th>
                     <th className="p-3">{t('reason')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {[...stockMovements].reverse().map(mv => {
                     const part = parts.find(p => p.id === mv.partId);
                     return (
                        <tr key={mv.id} className="hover:bg-gray-50">
                           <td className="p-3 text-gray-500">{new Date(mv.date).toLocaleDateString()}</td>
                           <td className="p-3 font-medium">{part ? (language === 'ar' ? part.nameAr : part.nameEn) : 'Unknown Part'}</td>
                           <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                 mv.type === 'SALE' ? 'bg-green-100 text-green-800' :
                                 mv.type === 'RESTOCK' ? 'bg-blue-100 text-blue-800' :
                                 'bg-yellow-100 text-yellow-800'
                              }`}>
                                 {mv.type}
                              </span>
                           </td>
                           <td className={`p-3 font-bold ${mv.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {mv.quantityChange > 0 ? '+' : ''}{mv.quantityChange}
                           </td>
                           <td className="p-3 text-gray-500">{mv.note || '-'}</td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="text-gray-600"/> {t('websiteSettings')}</h2>
         <button onClick={() => updateSettings(settingsForm)} className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-blue-800 flex items-center gap-2">
            <Save size={18}/> {t('saveChanges')}
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Header */}
          <section className="space-y-4">
             <h3 className="font-bold text-lg text-primary border-b pb-2">{t('headerSettings')}</h3>
             <div>
                <label className="block text-sm font-bold mb-1">App Name (EN)</label>
                <input className="w-full p-2 border rounded" value={settingsForm.appNameEn} onChange={e => setSettingsForm({...settingsForm, appNameEn: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-bold mb-1">App Name (AR)</label>
                <input className="w-full p-2 border rounded text-right" value={settingsForm.appNameAr} onChange={e => setSettingsForm({...settingsForm, appNameAr: e.target.value})} />
             </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
             <h3 className="font-bold text-lg text-primary border-b pb-2">{t('contactSettings')}</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold mb-1">Phone</label>
                   <input className="w-full p-2 border rounded" value={settingsForm.contactPhone} onChange={e => setSettingsForm({...settingsForm, contactPhone: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Email</label>
                   <input className="w-full p-2 border rounded" value={settingsForm.contactEmail} onChange={e => setSettingsForm({...settingsForm, contactEmail: e.target.value})} />
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold mb-1">Address (EN)</label>
                <input className="w-full p-2 border rounded" value={settingsForm.contactAddressEn} onChange={e => setSettingsForm({...settingsForm, contactAddressEn: e.target.value})} />
             </div>
          </section>

          {/* Social */}
          <section className="space-y-4">
             <h3 className="font-bold text-lg text-primary border-b pb-2">{t('socialSettings')}</h3>
             <div>
                <label className="block text-sm font-bold mb-1 flex items-center gap-2"><Smartphone size={14}/> WhatsApp Number</label>
                <input className="w-full p-2 border rounded" value={settingsForm.whatsappNumber} onChange={e => setSettingsForm({...settingsForm, whatsappNumber: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold mb-1">Facebook URL</label>
                  <input className="w-full p-2 border rounded" value={settingsForm.facebookUrl} onChange={e => setSettingsForm({...settingsForm, facebookUrl: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-1">Instagram URL</label>
                  <input className="w-full p-2 border rounded" value={settingsForm.instagramUrl} onChange={e => setSettingsForm({...settingsForm, instagramUrl: e.target.value})} />
               </div>
             </div>
          </section>

          {/* Footer */}
           <section className="space-y-4">
             <h3 className="font-bold text-lg text-primary border-b pb-2">{t('footerSettings')}</h3>
             <div>
                <label className="block text-sm font-bold mb-1">Footer Text (EN)</label>
                <textarea className="w-full p-2 border rounded" rows={2} value={settingsForm.footerTextEn} onChange={e => setSettingsForm({...settingsForm, footerTextEn: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-bold mb-1">Footer Text (AR)</label>
                <textarea className="w-full p-2 border rounded text-right" rows={2} value={settingsForm.footerTextAr} onChange={e => setSettingsForm({...settingsForm, footerTextAr: e.target.value})} />
             </div>
          </section>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>
        <div className="bg-white px-4 py-2 rounded shadow text-sm font-bold text-gray-600">
           Admin: {users.find(u => u.role === UserRole.ADMIN)?.username || 'System'}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <Activity size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <Users size={20} /> {t('users')}
          </button>
          <button 
            onClick={() => setActiveTab('shops')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'shops' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <Store size={20} /> {t('shops')}
          </button>
          <button 
            onClick={() => setActiveTab('brands')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'brands' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <CheckCircle size={20} /> {t('brands')}
          </button>
          <button 
            onClick={() => setActiveTab('categories')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'categories' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <Tag size={20} /> {t('categories')}
          </button>
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'inventory' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <Box size={20} /> {t('inventory')}
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
          >
            <Settings size={20} /> {t('websiteSettings')}
          </button>
           <button 
            onClick={() => setActiveTab('inbox')} 
            className={`p-3 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap transition ${activeTab === 'inbox' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50'} relative`}
          >
            <Mail size={20} /> {t('inbox')}
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></span>}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'shops' && renderShops()}
          {activeTab === 'brands' && renderBrands()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'inbox' && <Inbox />} 
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
