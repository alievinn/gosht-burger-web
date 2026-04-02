import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { X, Building2, Wallet, CheckCircle2, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    budget: '2.000.000 ₺ - 3.000.000 ₺',
    message: ''
  });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await addDoc(collection(db, 'franchise'), {
      ...formData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'new'
    });
    setIsSubmitted(true);
  } catch (error) {
    console.error("Franchise başvuru hatası:", error);
    alert('Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-stone-900 w-full max-w-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-stone-900/50 backdrop-blur-md z-10">
            <div>
                <h3 className="text-3xl text-white font-serif tracking-tight">Franchise Başvurusu</h3>
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">İş Ortaklığı Formu</p>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors p-2">
              <X size={28} />
            </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                key="franchise-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10" 
                onSubmit={handleSubmit}
              >
                {/* Kişisel Bilgiler */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8 bg-red-900"></div>
                      <h4 className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Yatırımcı Bilgileri</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">
                              <User size={12} /> Ad Soyad
                            </label>
                            <input 
                                type="text" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-stone-950 border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-stone-800 text-sm" 
                                placeholder="John Doe" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">
                              <Phone size={12} /> Telefon
                            </label>
                            <input 
                                type="tel" 
                                required 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-stone-950 border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-stone-800 text-sm" 
                                placeholder="05xx xxx xx xx" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">
                          <Mail size={12} /> E-posta Adresi
                        </label>
                        <input 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-stone-800 text-sm" 
                            placeholder="email@example.com" 
                        />
                    </div>
                </div>

                {/* Yatırım Detayları */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8 bg-red-900"></div>
                      <h4 className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Lokasyon ve Bütçe</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">
                                 <Building2 size={12} /> Şehir / İlçe
                            </label>
                            <input 
                                type="text" 
                                required 
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                className="w-full bg-stone-950 border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-stone-800 text-sm" 
                                placeholder="Örn: Batman / Merkez" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">
                                <Wallet size={12} /> Yatırım Bütçesi
                            </label>
                            <select 
                                value={formData.budget}
                                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                                className="w-full bg-stone-950 border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option>2.000.000 ₺ - 3.000.000 ₺</option>
                                <option>3.000.000 ₺ - 5.000.000 ₺</option>
                                <option>5.000.000 ₺ ve üzeri</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">
                          <MessageSquare size={12} /> Ek Notlar
                        </label>
                        <textarea 
                            rows={4} 
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-stone-800 text-sm resize-none" 
                            placeholder="Ticari geçmişiniz veya lokasyon detayları hakkında kısa bilgi..."
                        ></textarea>
                    </div>
                </div>

                <div className="pt-6">
                     <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-white text-stone-950 py-5 uppercase tracking-[0.3em] text-xs font-bold hover:bg-gold transition-all duration-500 shadow-2xl shadow-gold/10 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                    </button>
                    <p className="text-center text-stone-600 text-[10px] uppercase tracking-widest mt-6 font-medium">Başvurunuz gizlilik politikamız çerçevesinde değerlendirilecektir.</p>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="franchise-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-24 h-24 bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl text-white font-serif mb-3 tracking-tight">Başvurunuz Alındı!</h4>
                  <p className="text-stone-500 font-light leading-relaxed max-w-sm mx-auto">
                    Gosht Burger ailesine gösterdiğiniz ilgi için teşekkürler. Franchise departmanımız en kısa sürede sizinle iletişime geçecektir.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-12 py-4 bg-white text-stone-950 text-xs uppercase tracking-[0.3em] font-bold hover:bg-gold transition-all duration-300"
                >
                  Kapat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
