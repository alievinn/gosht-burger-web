import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare } from 'lucide-react';

import { db } from './services/firebase';
import { MENU_ITEMS } from './constants';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { About } from './components/About';
import { Franchise } from './components/Franchise';
import { Footer } from './components/Footer';
import { FranchiseModal } from './components/FranchiseModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CartModal } from './components/CartModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { CartItem, MenuItem, SiteSettings } from './types';

const App: React.FC = () => {
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (location.pathname === '/gosht-yonetim-2026') {
      navigate('/');
    }
  };

  useEffect(() => {
    if (location.pathname === '/gosht-yonetim-2026') {
      setIsAdminOpen(true);
    } else {
      setIsAdminOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'));

    const unsubscribeMenu = onSnapshot(
      productsQuery,
      (snapshot) => {
       const items = snapshot.docs.map((docItem) => ({
  id: docItem.id,
  ...docItem.data(),
})) as MenuItem[];
setMenuItems(items);
      },
      (error) => {
        console.error('Menü çekme hatası:', error);
        setMenuItems(MENU_ITEMS);
      }
    );

    const settingsRef = doc(db, 'settings', 'siteConfig');
    const unsubscribeSettings = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSiteSettings(snapshot.data() as SiteSettings);
        }
      },
      (error) => {
        console.error('Site ayarları çekme hatası:', error);
      }
    );

    return () => {
      unsubscribeMenu();
      unsubscribeSettings();
    };
  }, []);

  const handleAddToCart = (
    itemName: string,
    quantity: number,
    customizations?: string,
    variantInfo?: string
  ): boolean => {
    const item = menuItems.find(
      (menuItem) =>
        menuItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(menuItem.name.toLowerCase())
    );

    if (!item) return false;

    const selectedVariant = item.variants?.find(
      (variant) =>
        variant.id === variantInfo ||
        variant.label.toLowerCase() === variantInfo?.toLowerCase()
    );

    setCart((prev) => {
      const existing = prev.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.customizations === customizations &&
          cartItem.selectedVariant?.id === selectedVariant?.id
      );

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.cartItemId === existing.cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity,
          customizations,
          selectedVariant,
          cartItemId: `${item.id}-${selectedVariant?.id || 'base'}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 11)}`,
        },
      ];
    });

    setIsCartOpen(true);
    return true;
  };

  const handlePlaceOrder = async (
    customerInfo: any
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Sepetiniz boş. Lütfen önce ürün ekleyin.' };
    }

    const total = cart.reduce((sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.price;
      return sum + price * item.quantity;
    }, 0);

    const orderId = `ORD-${Date.now()}`;

    try {
      await addDoc(collection(db, 'orders'), {
        orderId,
        customer: customerInfo,
        items: cart,
        total,
        status: 'pending',
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
      });

      setCart([]);
      return { success: true, orderId };
    } catch (error) {
      console.error('Sipariş kaydetme hatası:', error);
      return { success: false, error: 'Sipariş kaydedilemedi.' };
    }
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 selection:bg-red-800 selection:text-white">
      <Navbar
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      <main>
        <Hero />
        <MenuSection items={menuItems} onAddToCart={handleAddToCart} />
        <About />
        <Franchise onOpenFranchise={() => setIsFranchiseOpen(true)} />
      </main>

      <div id="contact" className="scroll-mt-28">
        <Footer />
      </div>

    

      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setIsFeedbackOpen(true)}
        className="group fixed bottom-6 left-6 z-40 flex items-center gap-3 rounded-full border border-white/10 bg-stone-900/80 px-6 py-4 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-red-900"
      >
        <div className="rounded-lg bg-red-900 p-2 transition-colors group-hover:bg-white group-hover:text-red-900">
          <MessageSquare size={18} />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Geri Bildirim</span>
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
            menuItems={menuItems}
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