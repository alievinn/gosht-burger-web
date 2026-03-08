
import React, { useState } from 'react';
import { X, Star, Phone, History, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoyaltyAccount } from '../types';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/loyalty/${phone}`);
      const data = await res.json();
      setAccount(data);
    } catch (err) {
      setError('Puan bilgisi alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-stone-900 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-stone-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
              <Star className="text-brand-red" size={20} />
            </div>
            <div>
              <h3 className="text-xl text-white font-serif tracking-tight">Sadakat Programı</h3>
              <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Puanlarını Sorgula</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {!account ? (
            <form onSubmit={checkPoints} className="space-y-6">
              <p className="text-stone-400 text-sm font-light leading-relaxed">
                Telefon numaranızı girerek biriken puanlarınızı görebilir ve siparişlerinizde indirim olarak kullanabilirsiniz.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Telefon Numarası</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                  <input 
                    required
                    type="tel" 
                    placeholder="05xx xxx xx xx"
                    className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 pl-12 text-white focus:border-brand-red outline-none transition-all placeholder:text-stone-700 text-sm"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-red text-white py-4 rounded-xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sorgulanıyor...' : 'Puanlarımı Gör'}
                {!isLoading && <ArrowRight size={16} />}
              </button>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </form>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-stone-950/50 border border-white/5 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Mevcut Puanınız</p>
                <h4 className="text-6xl text-white font-serif font-bold premium-gradient-text">{account.points}</h4>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-emerald-500 text-xs font-medium">Puanlarınız aktif ve kullanılabilir.</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-stone-400 mb-2">
                  <History size={16} className="text-brand-red" />
                  <h5 className="text-[10px] uppercase tracking-widest font-bold">Son İşlemler</h5>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {account.history.length === 0 ? (
                    <p className="text-stone-600 text-xs italic py-4">Henüz işlem geçmişi bulunmuyor.</p>
                  ) : (
                    [...account.history].reverse().map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-stone-950/30 rounded-xl border border-white/5">
                        <div>
                          <p className="text-white text-xs font-medium">{entry.description}</p>
                          <p className="text-stone-500 text-[10px]">{new Date(entry.timestamp).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <span className={`text-xs font-bold ${entry.type === 'earn' ? 'text-emerald-500' : 'text-brand-red'}`}>
                          {entry.type === 'earn' ? '+' : '-'}{entry.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={() => setAccount(null)}
                className="w-full bg-stone-800 text-white py-4 rounded-xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-all"
              >
                Başka Numara Sorgula
              </button>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-stone-950/50 border-t border-white/5 text-center">
          <p className="text-stone-500 text-[10px] uppercase tracking-widest leading-relaxed">
            Her 1 TL harcamanıza 1 puan kazanın. <br />
            Biriken puanlarınızı ödeme adımında indirim olarak kullanın.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
