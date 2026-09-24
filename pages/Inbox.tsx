
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { InboxMessage, InboxType, UserRole } from '../types';
import { Mail, Clock, ChevronRight, MessageSquare, Image as ImageIcon, Send } from 'lucide-react';

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const { inboxMessages, externalRequests, brands, markMessageAsRead, sendInboxMessage } = useData();
  const { t, language } = useLanguage();
  
  const [selectedMsg, setSelectedMsg] = useState<InboxMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!user) return null;

  const myMessages = inboxMessages
    .filter(m => m.receiverId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenMessage = (msg: InboxMessage) => {
    setSelectedMsg(msg);
    if (!msg.isRead) {
      markMessageAsRead(msg.id);
    }
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg || !replyText.trim()) return;

    // Determine receiver (usually sender of original msg, unless system)
    let receiverId = selectedMsg.senderId;
    if (selectedMsg.senderId === 'system' || selectedMsg.senderId === 'guest') {
       // For this demo, reply to Admin if system
       // Ideally, you'd pick a specific admin or thread
       return alert("Cannot reply to system messages directly yet.");
    }

    sendInboxMessage({
      receiverId: receiverId,
      type: InboxType.REPLY,
      title: `Re: ${selectedMsg.title}`,
      body: replyText,
    });
    setReplyText('');
    alert("Reply Sent");
  };

  // Helper to render request details
  const renderRequestDetails = (requestId: string) => {
    const req = externalRequests.find(r => r.id === requestId);
    if (!req) return null;
    const brand = brands.find(b => b.id === req.carBrandId);

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
         <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">Request Details</h3>
         <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-semibold">{t('carBrand')}:</span> {language === 'ar' ? brand?.nameAr : brand?.nameEn}</div>
            <div><span className="font-semibold">{t('carModel')}:</span> {req.carModel}</div>
            <div><span className="font-semibold">{t('modelYear')}:</span> {req.modelYear}</div>
            <div><span className="font-semibold">Customer:</span> {req.customerName}</div>
            <div><span className="font-semibold">Phone:</span> {req.customerPhone}</div>
         </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
        <Mail /> {t('inbox')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] bg-white rounded-lg shadow-xl overflow-hidden border">
        
        {/* Message List */}
        <div className="md:col-span-1 border-r overflow-y-auto bg-gray-50">
          {myMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No messages</div>
          ) : (
            myMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 border-b cursor-pointer transition hover:bg-blue-50 ${selectedMsg?.id === msg.id ? 'bg-blue-100' : ''} ${!msg.isRead ? 'bg-white border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                   <h4 className={`text-sm ${!msg.isRead ? 'font-bold text-black' : 'font-medium text-gray-700'}`}>{msg.title}</h4>
                   <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{msg.body}</p>
              </div>
            ))
          )}
        </div>

        {/* Message View */}
        <div className="md:col-span-2 flex flex-col h-full">
          {selectedMsg ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b bg-white">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <h2 className="text-xl font-bold text-gray-800">{selectedMsg.title}</h2>
                       <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock size={14}/> {new Date(selectedMsg.createdAt).toLocaleString()}
                       </p>
                    </div>
                    {selectedMsg.type === InboxType.EXTERNAL_REQUEST && (
                       <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">External Request</span>
                    )}
                 </div>

                 {/* External Request Details */}
                 {selectedMsg.requestId && selectedMsg.type === InboxType.EXTERNAL_REQUEST && renderRequestDetails(selectedMsg.requestId)}

                 <div className="prose max-w-none text-gray-700 mb-6">
                    {selectedMsg.body}
                 </div>

                 {selectedMsg.attachmentUrl && (
                    <div className="mt-4">
                       <p className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1"><ImageIcon size={14}/> Attachment</p>
                       <img src={selectedMsg.attachmentUrl} className="max-h-64 rounded border shadow-sm" alt="Attachment" />
                    </div>
                 )}
              </div>
              
              {/* Reply Area - Only if sender is a real user */}
              {selectedMsg.senderId !== 'system' && selectedMsg.senderId !== 'guest' ? (
                 <div className="mt-auto p-4 bg-gray-50 border-t">
                    <form onSubmit={handleReply} className="flex gap-2">
                       <input 
                         className="flex-1 p-3 border rounded-lg"
                         placeholder="Type a reply..." 
                         value={replyText}
                         onChange={e => setReplyText(e.target.value)}
                       />
                       <button type="submit" className="bg-primary text-white p-3 rounded-lg hover:bg-blue-800">
                          <Send size={20} />
                       </button>
                    </form>
                 </div>
              ) : (
                 <div className="mt-auto p-4 bg-gray-50 border-t text-center text-sm text-gray-500 italic">
                    Use the provided contact details to reply to this request externally.
                 </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <MessageSquare size={48} className="mb-4 opacity-20"/>
               <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
