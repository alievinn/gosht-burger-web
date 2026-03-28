
import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, CheckCircle2, ShoppingBag, CreditCard, Wallet, Star, Search, Ticket, AlertCircle } from 'lucide-react';
import { CartItem, Order, SiteSettings, LoyaltyAccount, Coupon } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
}

type ModalStep = 'cart' | 'checkout' | 'success';

export const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart
}) => {
  const [step, setStep] = useState<ModalStep>('cart');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [isCheckingLoyalty, setIsCheckingLoyalty] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    paymentMethod: 'Nakit',
    orderNote: ''
  });

  const total = cart.reduce((sum, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const finalTotal = Math.max(0, total - loyaltyDiscount - couponDiscount);

  React.useEffect(() => {
    const settingsRef = doc(db, 'settings', 'siteConfig');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
    }, (e) => console.error('Error fetching settings:', e));
    return () => unsubscribe();
  }, []);

  const checkLoyalty = async () => {
    if (!formData.phone) {
      alert("Lütfen önce telefon numaranızı girin.");
      return;
    }
    setIsCheckingLoyalty(true);
    try {
      const res = await fetch(`/api/loyalty/${formData.phone}`);
      const data = await res.json();
      setLoyaltyAccount(data);
    } catch (e) {
      console.error("Loyalty check error:", e);
    } finally {
      setIsCheckingLoyalty(false);
    }
  };

  const applyPoints = () => {
    if (!loyaltyAccount || !settings) return;
    
    if (loyaltyAccount.points < settings.minPointsToRedeem) {
      alert(`Minimum ${settings.minPointsToRedeem} puan gereklidir.`);
      return;
    }

    const discountAmount = Math.min(total, loyaltyAccount.points * settings.pointValueInTL);
    setLoyaltyDiscount(discountAmount);
    alert(`${discountAmount} TL indirim uygulandı!`);
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsCheckingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons');
      const coupons: Coupon[] = await res.json();
      const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      
      const now = new Date();
      const startDate = coupon?.startDate ? new Date(coupon.startDate) : null;
      const endDate = coupon?.endDate ? new Date(coupon.endDate) : null;

      if (!coupon) {
        setCouponError('Geçersiz kupon kodu.');
        setAppliedCoupon(null);
        setCouponDiscount(0);
      } else if (startDate && now < startDate) {
        setCouponError(`Bu kupon henüz aktif değil. Başlangıç: ${startDate.toLocaleDateString('tr-TR')}`);
        setAppliedCoupon(null);
        setCouponDiscount(0);
      } else if (endDate && now > endDate) {
        setCouponError('Bu kuponun süresi dolmuş.');
        setAppliedCoupon(null);
        setCouponDiscount(0);
      } else if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        setCouponError('Bu kuponun kullanım limiti dolmuş.');
        setAppliedCoupon(null);
        setCouponDiscount(0);
      } else if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
        setCouponError(`Bu kupon için minimum sepet tutarı ${coupon.minOrderAmount} TL olmalıdır.`);
        setAppliedCoupon(null);
        setCouponDiscount(0);
      } else {
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (total * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
        setCouponDiscount(discount);
        setAppliedCoupon(coupon);
        setCouponError('');
      }
    } catch (e) {
      setCouponError('Kupon kontrol edilirken bir hata oluştu.');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod === 'Nakit' ? 'cash' : 'card',
        orderNote: formData.orderNote
      },
      total: finalTotal,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Redeem points if discount was applied
    if (loyaltyDiscount > 0 && loyaltyAccount && settings) {
      const pointsToRedeem = Math.floor(loyaltyDiscount / settings.pointValueInTL);
      try {
        await fetch('/api/loyalty/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.phone,
            pointsToRedeem,
            description: `Sipariş #${order.id.slice(-6)} indirimi`
          })
        });
      } catch (e) {
        console.error("Error redeeming points during order:", e);
      }
    }

    // Redeem coupon if applied
    if (appliedCoupon) {
      try {
        await fetch('/api/coupons/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code })
        });
      } catch (e) {
        console.error("Error redeeming coupon during order:", e);
      }
    }

    // Save to server
    const saveOrder = async () => {
      try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([order, ...orders])
        });
        window.dispatchEvent(new Event('orders-updated'));
      } catch (error) {
        console.error("Error saving order:", error);
      }
    };
    
    saveOrder();
    onClearCart();
    setStep('success');
  };

  const resetModal = () => {
    setStep('cart');
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-end overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={resetModal}
      ></div>
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative bg-stone-900 w-full max-w-md h-full border-l border-white/10 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-stone-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {step === 'checkout' && (
              <button onClick={() => setStep('cart')} className="text-stone-400 hover:text-white transition-colors p-2 -ml-2">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
               <h3 className="text-2xl text-white font-serif tracking-tight">
                 {step === 'cart' ? 'Sepetim' : step === 'checkout' ? 'Ödeme' : 'Başarılı'}
               </h3>
               <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
                 {step === 'cart' ? `${cart.length} Ürün` : step === 'checkout' ? 'Bilgilerinizi Girin' : 'Sipariş Alındı'}
               </p>
            </div>
          </div>
          <button onClick={resetModal} className="text-stone-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {step === 'cart' && (
              <motion.div 
                key="cart-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag size={32} className="text-stone-700" />
                    </div>
                    <p className="text-stone-500 font-light tracking-wide">Sepetiniz şu an boş.</p>
                    <button onClick={onClose} className="mt-6 text-gold hover:text-white text-xs uppercase tracking-[0.2em] font-bold transition-colors">
                      Menüye Göz At
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <motion.div 
                        key={item.cartItemId} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-5 items-center glass-card p-5 border-white/5 group"
                      >
                        <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-2xl border border-white/5">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate tracking-wide">
                            {item.name} 
                          </h4>
                          {item.selectedVariant && (
                            <span className="text-gold text-[9px] uppercase font-bold tracking-widest block mt-1">
                              {item.selectedVariant.label}
                            </span>
                          )}
                          {item.customizations && (
                            <p className="text-stone-500 text-[10px] mt-1 italic truncate">
                              "{item.customizations}"
                            </p>
                          )}
                          <p className="text-white text-sm font-bold mt-2">
                            {(item.selectedVariant ? item.selectedVariant.price : item.price) * item.quantity} TL
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <button onClick={() => onRemoveItem(item.cartItemId)} className="text-stone-600 hover:text-red-500 transition-colors p-1">
                             <Trash2 size={16} />
                          </button>
                          <div className="flex items-center gap-3 bg-stone-950 rounded-lg px-2 py-1 border border-white/5">
                            <button onClick={() => onUpdateQuantity(item.cartItemId, -1)} className="text-stone-500 hover:text-white transition-colors p-1">
                              <Minus size={12} />
                            </button>
                            <span className="text-white text-xs w-4 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.cartItemId, 1)} className="text-stone-500 hover:text-white transition-colors p-1">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'checkout' && (
              <motion.form 
                key="checkout-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                id="checkout-form" 
                onSubmit={handleConfirmOrder} 
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">İsim</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-gold outline-none transition-all placeholder:text-stone-700 text-sm"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Soyisim</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-gold outline-none transition-all placeholder:text-stone-700 text-sm"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Telefon</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="tel" 
                      placeholder="05xx xxx xx xx"
                      className="flex-1 bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-gold outline-none transition-all placeholder:text-stone-700 text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    {settings?.loyaltyEnabled && (
                      <button 
                        type="button"
                        onClick={checkLoyalty}
                        disabled={isCheckingLoyalty}
                        className="bg-stone-800 text-white px-4 rounded-xl hover:bg-stone-700 transition-all flex items-center justify-center"
                        title="Puan Sorgula"
                      >
                        {isCheckingLoyalty ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Search size={18} />}
                      </button>
                    )}
                  </div>
                </div>

                {loyaltyAccount && settings?.loyaltyEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-900/10 border border-red-900/20 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-brand-red" />
                        <span className="text-xs text-white font-medium">{loyaltyAccount.points} Puanınız Var</span>
                      </div>
                      <button 
                        type="button"
                        onClick={applyPoints}
                        disabled={loyaltyDiscount > 0 || loyaltyAccount.points < settings.minPointsToRedeem}
                        className="text-[10px] uppercase tracking-widest font-bold text-brand-red hover:text-white transition-colors disabled:opacity-30"
                      >
                        {loyaltyDiscount > 0 ? 'Uygulandı' : 'Puan Kullan'}
                      </button>
                    </div>
                    {loyaltyAccount.points < settings.minPointsToRedeem && (
                      <p className="text-[9px] text-stone-500 italic">Minimum {settings.minPointsToRedeem} puan gereklidir.</p>
                    )}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Adres</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-gold outline-none transition-all placeholder:text-stone-700 text-sm resize-none"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'Nakit'})}
                      className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all text-xs font-bold uppercase tracking-widest ${formData.paymentMethod === 'Nakit' ? 'bg-gold text-stone-950 border-gold' : 'bg-stone-950 border-white/5 text-stone-500 hover:border-white/20'}`}
                    >
                      <Wallet size={16} />
                      Nakit
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'Kredi Kartı'})}
                      className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all text-xs font-bold uppercase tracking-widest ${formData.paymentMethod === 'Kredi Kartı' ? 'bg-gold text-stone-950 border-gold' : 'bg-stone-950 border-white/5 text-stone-500 hover:border-white/20'}`}
                    >
                      <CreditCard size={16} />
                      Kart
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div 
                key="success-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-24 h-24 bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl text-white font-serif mb-3 tracking-tight">Siparişiniz Alındı!</h4>
                  <p className="text-stone-500 font-light leading-relaxed max-w-xs mx-auto">
                    Lezzet yolculuğu başladı. En kısa sürede kapınızda olacağız.
                  </p>
                </div>
                <button 
                  onClick={resetModal}
                  className="px-12 py-4 bg-white text-stone-950 text-xs uppercase tracking-[0.3em] font-bold hover:bg-gold transition-all duration-300"
                >
                  Kapat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {cart.length > 0 && step !== 'success' && (
          <div className="p-8 bg-stone-900/50 backdrop-blur-xl border-t border-white/5">
            {step === 'cart' && (
              <div className="mb-6 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <input 
                      type="text" 
                      placeholder="Kupon Kodu"
                      className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-900 outline-none transition-all placeholder:text-stone-800 text-xs uppercase"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button 
                    onClick={applyCoupon}
                    disabled={isCheckingCoupon || !couponCode}
                    className="bg-stone-800 text-white px-6 rounded-xl hover:bg-stone-700 transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    {isCheckingCoupon ? '...' : 'Uygula'}
                  </button>
                </div>
                {couponError && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-medium ml-1">
                    <AlertCircle size={12} />
                    <span>{couponError}</span>
                  </div>
                )}
                {appliedCoupon && !couponError && (
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium ml-1">
                    <CheckCircle2 size={12} />
                    <span>Kupon Uygulandı: {appliedCoupon.code}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 mb-8">
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-500 text-xs font-medium">
                  <span>Puan İndirimi</span>
                  <span>-{loyaltyDiscount} TL</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-500 text-xs font-medium">
                  <span>Kupon İndirimi ({appliedCoupon?.code})</span>
                  <span>-{couponDiscount} TL</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-stone-500 uppercase tracking-[0.2em] text-[10px] font-bold">Toplam Tutar</span>
                <span className="text-3xl text-white font-serif font-bold tracking-tighter">{finalTotal} TL</span>
              </div>
            </div>
            {step === 'cart' ? (
              <button 
                onClick={() => setStep('checkout')}
                className="w-full bg-red-900 text-white py-5 uppercase tracking-[0.3em] text-xs font-bold hover:bg-red-800 transition-all duration-500 shadow-2xl shadow-red-950/50"
              >
                Ödemeye Geç
              </button>
            ) : (
              <button 
                form="checkout-form"
                type="submit"
                className="w-full bg-gold text-stone-950 py-5 uppercase tracking-[0.3em] text-xs font-bold hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20"
              >
                Siparişi Tamamla
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
