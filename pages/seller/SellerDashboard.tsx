
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Part } from '../../types';
import { Plus, Trash, Upload, X, Image as ImageIcon, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { parts, deletePart, addPart, sales, brands, categories, inboxMessages } = useData();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const myParts = parts.filter(p => p.shopId === user?.shopId);
  const mySales = sales.filter(s => s.sellerId === user?.id);
  const totalRevenue = mySales.reduce((sum, sale) => sum + sale.totalPrice, 0);

  // Calculate unread messages for this seller
  const unreadCount = user 
    ? inboxMessages.filter(m => m.receiverId === user.id && !m.isRead).length
    : 0;

  const [isAdding, setIsAdding] = useState(false);
  const [newPart, setNewPart] = useState<Partial<Part>>({
    condition: 'New',
    currency: 'YER',
    rating: 5,
    stockQuantity: 1,
    soldCount: 0,
    images: [],
    imageUrl: '',
    categoryId: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      if (files.length + (newPart.images?.length || 0) > 5) {
        alert("Maximum 5 images allowed");
        return;
      }

      files.forEach(file => {
        if (file.size > 2 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max 2MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setNewPart(prev => {
            const updatedImages = [...(prev.images || []), base64String];
            return {
              ...prev,
              images: updatedImages,
              imageUrl: updatedImages[0] // Set first image as main thumbnail
            };
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewPart(prev => {
      const updatedImages = prev.images?.filter((_, i) => i !== index) || [];
      return {
        ...prev,
        images: updatedImages,
        imageUrl: updatedImages.length > 0 ? updatedImages[0] : ''
      };
    });
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.shopId) {
      const brand = brands.find(b => b.id === newPart.brandId);
      
      if (!newPart.imageUrl) {
        alert("Please upload at least one image");
        return;
      }

      if (!newPart.categoryId) {
        alert("Please select a category");
        return;
      }

      addPart({
        id: Date.now().toString(),
        shopId: user.shopId,
        brandId: newPart.brandId || '',
        categoryId: newPart.categoryId || '',
        nameEn: newPart.nameEn || '',
        nameAr: newPart.nameAr || '',
        carBrand: brand?.nameEn || 'General', // Fallback for display
        carModel: newPart.carModel || '',
        yearRange: newPart.yearRange || '',
        condition: newPart.condition as 'New' | 'Used',
        rating: 5,
        price: Number(newPart.price) || 0,
        costPrice: Number(newPart.costPrice) || 0,
        currency: newPart.currency as 'YER' | 'USD' | 'SAR',
        stockQuantity: Number(newPart.stockQuantity),
        imageUrl: newPart.imageUrl || '',
        images: newPart.images || [],
        soldCount: 0
      });
      setIsAdding(false);
      setNewPart({
        condition: 'New',
        currency: 'YER',
        rating: 5,
        stockQuantity: 1,
        soldCount: 0,
        images: [],
        imageUrl: '',
        categoryId: ''
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section with Inbox Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">{t('sellerZone')}</h1>
        
        <div className="flex items-center gap-4">
            <button 
               onClick={() => navigate('/seller/inbox')}
               className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-bold flex items-center gap-3 hover:bg-gray-50 transition shadow-sm relative group"
            >
               <div className="relative">
                 <Mail size={22} className="text-primary"/>
                 {unreadCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                     {unreadCount}
                   </span>
                 )}
               </div>
               <span>{t('inbox')}</span>
            </button>

            <div className="bg-green-100 text-green-900 border border-green-200 px-5 py-2.5 rounded-lg font-bold shadow-sm">
               {t('totalRevenue')}: {totalRevenue.toLocaleString()}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('myParts')} <span className="text-gray-500 text-sm font-normal">({myParts.length} items)</span></h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-secondary text-primary px-4 py-2 rounded flex items-center gap-2 font-bold hover:bg-yellow-200 transition"
          >
            <Plus size={18} /> {t('addPart')}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddPart} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-1">
                <label className="block text-sm font-bold mb-1 text-gray-700">{t('carBrand')}</label>
                <select 
                  className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-primary"
                  value={newPart.brandId} 
                  onChange={e => setNewPart({...newPart, brandId: e.target.value})}
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{language === 'ar' ? b.nameAr : b.nameEn}</option>
                  ))}
                </select>
             </div>

             <div className="md:col-span-1">
                <label className="block text-sm font-bold mb-1 text-gray-700">{t('category')}</label>
                <select 
                  className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-primary"
                  value={newPart.categoryId} 
                  onChange={e => setNewPart({...newPart, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter(c => c.isActive).map(c => (
                    <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>
                  ))}
                </select>
             </div>

             <input placeholder="Name (EN)" className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, nameEn: e.target.value})} required />
             <input placeholder="Name (AR)" className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, nameAr: e.target.value})} required />
             
             <input placeholder="Model (e.g. Camry)" className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, carModel: e.target.value})} required />
             <input placeholder="Year Range (e.g. 2018-2022)" className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, yearRange: e.target.value})} />
             
             <div className="flex gap-2">
                <input placeholder="Selling Price" type="number" className="p-2 border rounded w-full outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, price: Number(e.target.value)})} required />
                <input placeholder="Cost Price (Hidden)" type="number" className="p-2 border rounded w-full bg-yellow-50 outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, costPrice: Number(e.target.value)})} required />
                <select className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, currency: e.target.value as any})}>
                  <option value="YER">YER</option>
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                </select>
             </div>
             
             <select className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, condition: e.target.value as any})}>
                <option value="New">New</option>
                <option value="Used">Used</option>
             </select>
             
             <input placeholder="Stock Quantity" type="number" className="p-2 border rounded outline-none focus:ring-2 focus:ring-primary" onChange={e => setNewPart({...newPart, stockQuantity: Number(e.target.value)})} required />
             
             {/* Image Upload Section */}
             <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">{t('uploadImage')} (Max 5)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition cursor-pointer relative group">
                   <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <Upload size={32} className="text-gray-400 mb-2 group-hover:text-primary transition"/>
                   <span className="text-sm text-primary font-bold">{t('browse')}</span>
                   <span className="text-xs text-gray-400 mt-1">{t('maxSize')}</span>
                </div>

                {/* Previews */}
                {(newPart.images?.length || 0) > 0 && (
                   <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                      {newPart.images?.map((img, index) => (
                         <div key={index} className="relative w-24 h-24 flex-shrink-0 border rounded overflow-hidden group shadow-sm">
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                               type="button"
                               onClick={() => removeImage(index)}
                               className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                            >
                               <X size={12} />
                            </button>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
               <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('cancel')}</button>
               <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition shadow-lg transform hover:-translate-y-0.5">Save Part</button>
             </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider border-b">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Part</th>
                <th className="p-4">Category</th>
                <th className="p-4">Car</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Sold</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myParts.map(part => (
                <tr key={part.id} className="hover:bg-blue-50 transition">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                       {part.imageUrl ? <img src={part.imageUrl} className="w-full h-full object-cover"/> : <ImageIcon className="p-2 text-gray-400 w-full h-full"/>}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{language === 'ar' ? part.nameAr : part.nameEn}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {categories.find(c => c.id === part.categoryId)?.nameEn || part.categoryId}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {brands.find(b => b.id === part.brandId)?.nameEn || part.carBrand} {part.carModel}
                  </td>
                  <td className="p-4 font-bold text-primary">{part.price.toLocaleString()} <span className="text-xs text-gray-500 font-normal">{part.currency}</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${part.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {part.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{part.soldCount}</td>
                  <td className="p-4">
                    <button onClick={() => deletePart(part.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
