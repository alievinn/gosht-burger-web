import { db } from './services/firebase'; 
import { collection, query, onSnapshot, doc } from 'firebase/firestore'; 
import { MENU_ITEMS } from './constants'; // Bu satırı kontrol et, yolu doğru olmalı
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { About } from './components/About';
import { Franchise } from './components/Franchise';
import { Footer } from './components/Footer';
import { AiAssistant } from './components/AiAssistant';
import { FranchiseModal } from './components/FranchiseModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CartModal } from './components/CartModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartItem, MenuItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare } from 'lucide-react';


const App: React.FC = () => {
  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (location.pathname === '/admin') {
      navigate('/');
    }
  };
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // İlk başta menüyü boş bir dizi yapıyoruz, Firebase'den dolacak
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/admin') {
      setIsAdminOpen(true);
    }
  }, [location]);

// --- GERÇEK ZAMANLI VERİ ÇEKME (FİNAL) ---
  useEffect(() => {
    // 1. Menü Ürünlerini Dinle
    const q = query(collection(db, 'products'));
    const unsubscribeMenu = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(items);
      } else {
        // Firebase boşsa varsayılanları göster ki ekran siyah kalmasın
        setMenuItems(MENU_ITEMS);
      }
    }, (error) => {
      console.error("Menü çekme hatası:", error);
      setMenuItems(MENU_ITEMS);
    });

    // 2. Ayarları ve Logoyu Dinle
    const settingsRef = doc(db, 'settings', 'siteConfig');
    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // siteSettings state'ini güncelle
       const [siteSettings, setSiteSettings] = useState<any>({});
      }
    });

    return () => {
      unsubscribeMenu();
      unsubscribeSettings();
    };
  }, []);

  const handleAddToCart = (itemName: string, quantity: number, customizations?: string, variantInfo?: string): boolean => {
    const item = menuItems.find(i => 
      i.name.toLowerCase().includes(itemName.toLowerCase()) || 
      itemName.toLowerCase().includes(i.name.toLowerCase())
    );

    if (!item) return false;

    const selectedVariant = item.variants?.find(v => 
      v.id === variantInfo || 
      v.label.toLowerCase() === variantInfo?.toLowerCase()
    );

    setCart(prev => {
      const existing = prev.find(c => 
        c.id === item.id && 
        c.customizations === customizations && 
        c.selectedVariant?.id === selectedVariant?.id
      );
      
      if (existing) {
        return prev.map(c => (c.cartItemId === existing.cartItemId) 
          ? { ...c, quantity: c.quantity + quantity } 
          : c
        );
      }
      
      return [...prev, { 
        ...item, 
        quantity, 
        customizations,
        selectedVariant,
        cartItemId: `${item.id}-${selectedVariant?.id || 'base'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }];
    });
    
    setIsCartOpen(true);
    return true;
  };

  const handlePlaceOrder = async (customerInfo: any): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: "Sepetiniz boş. Lütfen önce ürün ekleyin." };
    }

    const total = cart.reduce((sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.price;
      return sum + (price * item.quantity);
    }, 0);

    const orderId = `ORD-${Date.now()}`;
    // Not: Siparişleri de Firebase'e kaydetmek istersen buraya addDoc(collection(db, 'orders'), ...) eklenebilir.
    
    setCart([]); 
    return { success: true, orderId };
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-red-800 selection:text-white">
      <Navbar 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />
      
      <main>
        <Hero />
        {/* MenuSection artık Firebase'den gelen menuItems'ı kullanacak */}
        <MenuSection items={menuItems} onAddToCart={handleAddToCart} />
        <About />
        <Franchise onOpenFranchise={() => setIsFranchiseOpen(true)} />
      </main>

      <div id="contact" className="scroll-mt-28">
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      </div>
      
      <AiAssistant 
        onAddToCart={handleAddToCart} 
        onPlaceOrder={handlePlaceOrder}
      />

      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-stone-900/80 backdrop-blur-md text-white px-6 py-4 rounded-full border border-white/10 shadow-2xl hover:bg-red-900 transition-all flex items-center gap-3 group"
      >
        <div className="bg-red-900 p-2 rounded-lg group-hover:bg-white group-hover:text-red-900 transition-colors">
          <MessageSquare size={18} />
        </div>
        <span className="text-xs uppercase tracking-[0.2em] font-bold">Geri Bildirim</span>
      </motion.button>
      
      <AnimatePresence>
        {isFranchiseOpen && (
          <FranchiseModal 
            isOpen={isFranchiseOpen} 
            onClose={() => setIsFranchiseOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdminOpen && (
          <AdminDashboard
            isOpen={isAdminOpen}
            onClose={handleCloseAdmin}
            menuItems={menuItems} // Admin panelinin de güncel veriyi görmesini sağladık
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <CartModal 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={() => setCart([])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoyaltyOpen && (
          <LoyaltyModal 
            isOpen={isLoyaltyOpen}
            onClose={() => setIsLoyaltyOpen(false)}
          />
        )}
      </AnimatePresence>

      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

export default App;