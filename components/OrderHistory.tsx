import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Search, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Order } from '../types';

interface OrderHistoryProps { isOpen: boolean; onClose: () => void; }

const STATUS: Record<string,{label:string;color:string}> = {
  pending:   {label:'Bekliyor',     color:'text-amber-400'},
  preparing: {label:'Hazırlanıyor', color:'text-amber-400'},
  ready:     {label:'Hazır',        color:'text-blue-400'},
  completed: {label:'Tamamlandı',   color:'text-green-400'},
  cancelled: {label:'İptal',        color:'text-red-400'},
};

export const OrderHistory: React.FC<OrderHistoryProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);

  const search = async () => {
    if (!phone.trim() || phone.trim().length < 7) return;
    setLoading(true); setSearched(false);
    try {
      const snap = await getDocs(query(collection(db,'orders'), where('customer.phone','==',phone.trim())));
      let found = snap.docs.map(d=>({id:d.id,...d.data()} as Order));
      if (found.length === 0) {
        const snap2 = await getDocs(query(collection(db,'orders'), where('customer.phone','==','0'+phone.trim().replace(/^0/,''))));
        found = snap2.docs.map(d=>({id:d.id,...d.data()} as Order));
      }
      found.sort((a,b)=>b.timestamp-a.timestamp);
      setOrders(found);
    } catch { setOrders([]); }
    finally { setLoading(false); setSearched(true); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={e=>e.target===e.currentTarget&&onClose()}>
          <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            transition={{type:'spring',damping:28,stiffness:300}}
            className="w-full md:max-w-lg bg-stone-950 border border-white/10 rounded-t-3xl md:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-white font-serif text-xl">Siparişlerim</h2>
                <p className="text-stone-500 text-xs mt-0.5">Telefon numaranızla siparişlerinizi görün</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-900 text-stone-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 border-b border-white/5 shrink-0">
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 bg-stone-900 border border-white/5 rounded-xl px-4 py-3 focus-within:border-red-900/50 transition-colors">
                  <Phone size={16} className="text-stone-500 shrink-0" />
                  <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
                    placeholder="05XX XXX XX XX"
                    className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-stone-600" />
                </div>
                <button onClick={search} disabled={loading}
                  className="bg-red-900 text-white px-5 rounded-xl hover:bg-red-800 transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Search size={18}/>}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!searched && !loading && (
                <div className="text-center py-12 text-stone-600">
                  <ShoppingBag size={36} className="mx-auto mb-3 opacity-30"/>
                  <p className="text-sm">Siparişlerinizi görmek için telefon numaranızı girin</p>
                </div>
              )}
              {searched && orders.length === 0 && (
                <div className="text-center py-12 text-stone-600">
                  <ShoppingBag size={36} className="mx-auto mb-3 opacity-30"/>
                  <p className="text-sm">Bu numara ile sipariş bulunamadı</p>
                </div>
              )}
              {orders.map(order => {
                const st = STATUS[order.status] || STATUS.pending;
                const exp = expandedId === order.id;
                const date = new Date(order.timestamp).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});
                const time = new Date(order.timestamp).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
                return (
                  <div key={order.id} className="bg-stone-900 border border-white/5 rounded-2xl overflow-hidden">
                    <button onClick={()=>setExpandedId(exp?null:order.id)}
                      className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shrink-0">
                          <ShoppingBag size={18} className="text-stone-400"/>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{order.items?.length||0} ürün</p>
                          <p className="text-stone-500 text-xs">{date} · {time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                        <span className="text-white font-bold text-sm">{order.total||(order as any).finalTotal||0} TL</span>
                        {exp ? <ChevronUp size={16} className="text-stone-500"/> : <ChevronDown size={16} className="text-stone-500"/>}
                      </div>
                    </button>
                    <AnimatePresence>
                      {exp && (
                        <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                            {order.items?.map((item,i)=>(
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-stone-400">{item.quantity}x {item.name}</span>
                                <span className="text-stone-400">{item.price*item.quantity} TL</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                              <span className="text-white font-bold">Toplam</span>
                              <span className="text-white font-bold">{order.total||(order as any).finalTotal||0} TL</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
