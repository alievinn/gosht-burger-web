console.log('DOGRU ADMINDASHBOARD CALISTI');
import { db } from '../services/firebase';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Lock,
  ShoppingBag,
  PieChart,
  Edit2,
  Upload,
  Filter,
  Clock,
  Calendar,
  ChevronDown,
  Mail,
  MessageSquare,
  LogOut,
  Building2,
  Phone,
  Star,
  TrendingUp,
  Ticket
} from 'lucide-react';
import {
  MenuItem,
  Category,
  Order,
  SiteSettings,
  ContactMessage,
  FranchiseApplication,
  LoyaltyAccount,
  Feedback,
  Coupon
} from '../types';
import { MENU_ITEMS } from '../constants';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems?: MenuItem[];
}

type AdminTab =
  | 'menu'
  | 'orders'
  | 'accounting'
  | 'settings'
  | 'messages'
  | 'franchise'
  | 'loyalty'
  | 'feedbacks'
  | 'campaigns';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth') === 'true';
    if (savedAuth) setIsAuthenticated(true);
  }, []);

  // Menu State
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: Category.BURGER,
    image: '',
    variants: []
  });

  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    isActive: true
  });
  const [newVariant, setNewVariant] = useState({ label: '', price: 0 });
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    aboutText: '',
    aboutLabel: 'Mirasımız',
    aboutTitle: "Batman'ın En İştah Açıcı Sokaklarından...",
    aboutQuote: '“Gerçek burgerin ateşini herkese hissettirmek.”',
    aboutFeatures: 'Daily Fresh Beef – Her gün taze çekilen dana döş\nÖzel GOSHT Sosları – Trüf, barbekü ve özel acı soslar\nPremium Sunum & Packaging\nHızlı, sıcak ve güvenilir servis\nHijyen ve kalite odaklı mutfak standartları',
    aboutImage1: null,
    aboutImage2: null,
    franchiseText: '',
    franchiseLabel: 'İş Ortaklığı',
    franchiseTitle: 'Franchise',
    franchiseQuote: '"Güçlü Bir Marka. Lezzet Odaklı Bir Yatırım."',
    franchiseWhyTitle: 'Neden Gosht Burger?',
    franchiseImage: null,
    contactPhone: '0507 864 16 72',
    contactEmail: 'goshtburger1@gmail.com',
    contactAddress: 'Gap Mah. Cafeler Cd.\nMerkez, Batman',
    whatsappNumber: '905078641672',
    instagramUrl: 'https://www.instagram.com/goshtburger',
    tiktokUrl: 'https://www.tiktok.com/@goshtburger',
    heroTitle: 'GERÇEK ET. GERÇEK LEZZET.',
    heroSubtitle: 'Batman\'ın kalbinde, %100 dana döş etinden hazırlanan gurme burger deneyimi.',
    heroCtaText: 'MENÜYÜ KEŞFET',
    footerDescription: 'Batman\'da doğan, premium, ateşle buluşan gerçek et deneyimi sunan bir markayız. Burgerlerimizde marul, domates gibi taze yeşillik bulunmadığını, bunun yerine imza "Közmix" (közlenmiş biber & patlıcan) kullandığımızı vurgularız.',
    footerCopyright: '© 2024 GOSHT BURGER. Tüm hakları saklıdır.',
    loyaltyEnabled: true,
    pointsPerTL: 1,
    minPointsToRedeem: 500,
    pointValueInTL: 0.1
  });

  const addVariant = () => {
    if (!newVariant.label || !newVariant.price) return;
    const variant = { id: Date.now().toString(), ...newVariant };
    setNewItem(prev => ({
      ...prev,
      variants: [...(prev.variants || []), variant]
    }));
    setNewVariant({ label: '', price: 0 });
  };

  const removeVariant = (id: string) => {
    setNewItem(prev => ({
      ...prev,
      variants: (prev.variants || []).filter(v => v.id !== id)
    }));
  };

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'last7' | 'last30'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [franchiseApps, setFranchiseApps] = useState<FranchiseApplication[]>([]);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);

  // Sound effect for new orders
  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play blocked by browser:", e));
  };

  // Load data on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async () => {
      try {
        const menuSnap = await getDocs(collection(db, 'products'));
        const menuData = menuSnap.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        })) as MenuItem[];

        if (menuData.length > 0) {
          setItems(menuData);
        } else {
          setItems(MENU_ITEMS);
        }

        try {
          const logoRes = await fetch('/api/logo');
          const logoData = await logoRes.json();
          setSiteLogo(logoData.logo);
        } catch (e) {
          console.error('Logo load error:', e);
        }

        try {
          const heroBgRes = await fetch('/api/hero-bg');
          const heroBgData = await heroBgRes.json();
          setHeroBg(heroBgData.heroBg);
        } catch (e) {
          console.error('Hero background load error:', e);
        }

        try {
          const settingsRes = await fetch('/api/settings');
          const settingsData = await settingsRes.json();
          if (settingsData) {
            setSiteSettings((prev) => ({
              ...prev,
              ...settingsData
            }));
          }
        } catch (e) {
          console.error('Settings load error:', e);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const ordersQuery = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    const franchiseQuery = query(collection(db, 'franchiseApplications'), orderBy('timestamp', 'desc'));
    const loyaltyQuery = query(collection(db, 'loyaltyAccounts'), orderBy('points', 'desc'));
    const feedbacksQuery = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
    const couponsQuery = query(collection(db, 'coupons'), orderBy('timestamp', 'desc'));

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      })) as Order[];

      if (lastOrderCount > 0 && data.length > lastOrderCount) {
        playNotificationSound();
      }

      setOrders(data);
      setLastOrderCount(data.length);
    });

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      })) as ContactMessage[]);
    });

    const unsubFranchise = onSnapshot(franchiseQuery, (snapshot) => {
      setFranchiseApps(snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      })) as FranchiseApplication[]);
    });

    const unsubLoyalty = onSnapshot(loyaltyQuery, (snapshot) => {
      setLoyaltyAccounts(snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        })) as unknown as LoyaltyAccount[]);
    });

    const unsubFeedbacks = onSnapshot(feedbacksQuery, (snapshot) => {
      setFeedbacks(snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      })) as Feedback[]);
    });

    const unsubCoupons = onSnapshot(couponsQuery, (snapshot) => {
      setCoupons(snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      })) as Coupon[]);
    });

    return () => {
      unsubOrders();
      unsubMessages();
      unsubFranchise();
      unsubLoyalty();
      unsubFeedbacks();
      unsubCoupons();
    };
  }, [isOpen, isAuthenticated, lastOrderCount]);

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const menuSnap = await getDocs(collection(db, 'products'));
        const menuData = menuSnap.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        })) as MenuItem[];
        setItems(menuData.length > 0 ? menuData : MENU_ITEMS);

        const logoRes = await fetch('/api/logo');
        const logoData = await logoRes.json();
        setSiteLogo(logoData.logo);

        const heroBgRes = await fetch('/api/hero-bg');
        const heroBgData = await heroBgRes.json();
        setHeroBg(heroBgData.heroBg);

        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData) {
          setSiteSettings((prev) => ({
            ...prev,
            ...settingsData
          }));
        }
      } catch (e) {
        console.error('Refresh error:', e);
      }
    };

    window.addEventListener('menu-updated', handleRefresh);
    window.addEventListener('logo-updated', handleRefresh);
    window.addEventListener('hero-bg-updated', handleRefresh);
    window.addEventListener('settings-updated', handleRefresh);

    return () => {
      window.removeEventListener('menu-updated', handleRefresh);
      window.removeEventListener('logo-updated', handleRefresh);
      window.removeEventListener('hero-bg-updated', handleRefresh);
      window.removeEventListener('settings-updated', handleRefresh);
    };
  }, []);
  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/hero-bg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heroBg: base64 })
          });
          if (res.ok) {
            setHeroBg(base64);
            window.dispatchEvent(new CustomEvent('hero-bg-updated'));
          }
        } catch (err) {
          console.error("Hero BG upload error:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingsImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'aboutImage1' | 'aboutImage2' | 'franchiseImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSiteSettings(prev => ({ ...prev, [field]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetHeroBg = async () => {
    try {
      const res = await fetch('/api/hero-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroBg: null })
      });
      if (res.ok) {
        setHeroBg(null);
        window.dispatchEvent(new CustomEvent('hero-bg-updated'));
      }
    } catch (e) {
      console.error("Error resetting hero bg:", e);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setSiteLogo(base64String); // Ekranda göster
        
        try {
          // Doğrudan Firebase'e yaz
          await setDoc(doc(db, 'settings', 'logo'), { logo: base64String });
          window.dispatchEvent(new Event('logo-updated'));
          console.log("Logo Firebase'e yüklendi!");
        } catch (err) {
          console.error("Logo yükleme hatası:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = async () => {
    if (window.confirm('Logoyu varsayılana döndürmek istediğinize emin misiniz?')) {
      try {
        await fetch('/api/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo: null })
        });
        setSiteLogo(null);
        window.dispatchEvent(new Event('logo-updated'));
      } catch (error) {
        alert('Logo sıfırlanırken hata oluştu.');
      }
    }
  };
  
const saveSettings = async () => {
  try {
    await setDoc(
      doc(db, 'settings', 'siteConfig'),
      {
        ...siteSettings,
      },
      { merge: true }
    );

    if (siteLogo) {
      await setDoc(doc(db, 'settings', 'logo'), { logo: siteLogo }, { merge: true });
    }

    if (heroBg) {
      await setDoc(doc(db, 'settings', 'heroBg'), { heroBg }, { merge: true });
    }

    window.dispatchEvent(new Event('settings-updated'));
    window.dispatchEvent(new Event('logo-updated'));
    window.dispatchEvent(new Event('hero-bg-updated'));

    alert('Ayarlar kaydedildi ✅');
  } catch (error) {
    console.error('Ayarlar kayıt hatası:', error);
    alert('Ayarlar kaydedilemedi ❌');
  }
};

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      username.trim().toLowerCase() === 'gosht' &&
      password.trim() === 'gosht2024'
    ) {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Hatalı kullanıcı adı veya şifre!');
    }
  };

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('admin_auth');
      setUsername('');
      setPassword('');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      try {
        await deleteDoc(doc(db, 'products', id)); // Buluttan siler
        await saveChanges(updated); // Listeyi günceller
      } catch (e) {
        console.error("Silme hatası:", e);
      }
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error('Error deleting message:', e);
    }
  };

  const deleteFranchiseApp = async (id: string) => {
    if (!confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'franchiseApplications', id));
      setFranchiseApps((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error('Error deleting franchise application:', e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewItem(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };
const saveChanges = async (updated: MenuItem[]) => {
  setItems(updated);
  try {
    for (const item of updated) {
      await setDoc(doc(db, 'products', item.id), item);
    }
  } catch (e) {
    console.error("Menü kayıt hatası:", e);
  }
};
  const handleAddOrUpdate = () => {
    if (!newItem.name || !newItem.price) return alert('Lütfen isim ve fiyat giriniz.');
    
    if (editingId) {
      const updated = items.map(item => 
        item.id === editingId 
          ? { ...item, ...newItem as MenuItem } 
          : item
      );
      saveChanges(updated);
      setEditingId(null);
      alert('Ürün güncellendi!');
    } else {
      const item: MenuItem = {
        id: Date.now().toString(),
        name: newItem.name!,
        description: newItem.description || '',
        price: Number(newItem.price),
        category: newItem.category as Category,
        image: newItem.image || '',
        isSignature: false,
        variants: newItem.variants || []
      };
      const updated = [item, ...items];
      saveChanges(updated);
      alert('Ürün eklendi!');
    }
    
    setNewItem({ name: '', description: '', price: 0, category: Category.BURGER, image: '', variants: [] });
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      variants: item.variants || []
    });
    // Scroll to top of form
    const formElement = document.getElementById('admin-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleOrderExpansion = (id: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrders(newExpanded);
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Sipariş durumu güncellenirken hata oluştu.');
    }
  };

  const filteredOrders = orders
    .filter(order => {
      // Time Filter
      if (timeFilter !== 'all') {
        const now = Date.now();
        const orderTime = order.timestamp;
        const oneDay = 24 * 60 * 60 * 1000;
        if (timeFilter === 'today' && now - orderTime >= oneDay) return false;
        if (timeFilter === 'last7' && now - orderTime >= oneDay * 7) return false;
        if (timeFilter === 'last30' && now - orderTime >= oneDay * 30) return false;
      }

      // Payment Filter
      if (paymentFilter !== 'all' && order.customer.paymentMethod !== paymentFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      if (sortOrder === 'oldest') return a.timestamp - b.timestamp;
      if (sortOrder === 'highest') return b.total - a.total;
      if (sortOrder === 'lowest') return a.total - b.total;
      return 0;
    });

  const isNewOrder = (timestamp: number) => {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - timestamp < fiveMinutes;
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-950 flex flex-col md:flex-row overflow-hidden"
    >
      {/* Desktop Sidebar */}
      {isAuthenticated && (
        <div className="hidden md:flex w-72 bg-stone-900 border-r border-white/5 flex-col shrink-0">
          <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <Lock className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-serif text-lg leading-tight">GOSHT</h2>
              <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Admin Paneli</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {[
              { id: 'menu', label: 'Menü Yönetimi', icon: ShoppingBag },
              { id: 'orders', label: 'Siparişler', icon: Clock },
              { id: 'accounting', label: 'Muhasebe', icon: PieChart },
              { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
              { id: 'franchise', label: 'Franchise', icon: Building2 },
              { id: 'loyalty', label: 'Sadakat Sistemi', icon: Star },
              { id: 'campaigns', label: 'Kampanyalar', icon: Ticket },
              { id: 'feedbacks', label: 'Geri Bildirimler', icon: MessageSquare },
              { id: 'settings', label: 'Site Ayarları', icon: Edit2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  activeTab === tab.id 
                    ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' 
                    : 'text-stone-500 hover:text-stone-200 hover:bg-white/5'
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-stone-600 group-hover:text-stone-400'} />
                <span className="text-sm font-medium tracking-wide">{tab.label}</span>
                {tab.id === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 space-y-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group"
            >
              <LogOut size={20} className="text-stone-600 group-hover:text-red-500" />
              <span className="text-sm font-medium tracking-wide">Çıkış Yap</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-500 hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <X size={20} className="text-stone-600 group-hover:text-white" />
              <span className="text-sm font-medium tracking-wide">Paneli Kapat</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header & Tabs */}
      <div className="md:hidden flex flex-col shrink-0 bg-stone-900 border-b border-white/5">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lock className="text-red-600" size={20} />
            <h2 className="text-white font-serif text-lg">Admin Paneli</h2>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white p-2">
            <X size={24} />
          </button>
        </div>
        {isAuthenticated && (
          <div className="flex overflow-x-auto custom-scrollbar border-t border-white/5">
            {[
              { id: 'menu', label: 'Menü' },
              { id: 'orders', label: 'Siparişler' },
              { id: 'accounting', label: 'Muhasebe' },
              { id: 'messages', label: 'Mesajlar' },
              { id: 'franchise', label: 'Franchise' },
              { id: 'loyalty', label: 'Sadakat' },
              { id: 'campaigns', label: 'Kampanya' },
              { id: 'feedbacks', label: 'Geri Bildirim' },
              { id: 'settings', label: 'Ayarlar' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex-none px-6 py-4 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all ${
                  activeTab === tab.id ? 'border-red-600 text-white' : 'border-transparent text-stone-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-950">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center min-h-full p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10 w-full max-w-md text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent"></div>
              
              <div className="mb-8">
                <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center border border-red-500/20 mx-auto mb-4">
                  <Lock className="text-red-500" size={28} />
                </div>
                <h3 className="text-3xl text-white font-serif tracking-tight">Yönetim Paneli</h3>
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Güvenli Giriş</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Kullanıcı Adı</label>
                  <input 
                    type="text" 
                    placeholder="Gosht" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    className="w-full bg-stone-950 border border-white/5 p-4 text-white rounded-xl focus:border-gold outline-none transition-all placeholder:text-stone-800"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Şifre</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    className="w-full bg-stone-950 border border-white/5 p-4 text-white rounded-xl focus:border-gold outline-none transition-all placeholder:text-stone-800"
                  />
                </div>
                <button type="submit" className="w-full bg-white text-stone-950 py-4 rounded-xl hover:bg-gold uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 shadow-xl shadow-black/50 mt-4">
                  Giriş Yap
                </button>
                <div className="pt-6 text-stone-600 text-[9px] uppercase tracking-[0.2em] font-medium border-t border-white/5">
                  Kullanıcı: <span className="text-stone-400">Gosht</span> | Şifre: <span className="text-stone-400">gosht2024</span>
                </div>
              </form>
            </motion.div>
          </div>
        ) : (
          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl text-white font-serif tracking-tight premium-gradient-text">
                  {activeTab === 'menu' && 'Menü Yönetimi'}
                  {activeTab === 'orders' && 'Sipariş Takibi'}
                  {activeTab === 'accounting' && 'Finansal Özet'}
                  {activeTab === 'messages' && 'Müşteri Mesajları'}
                  {activeTab === 'franchise' && 'Franchise Başvuruları'}
                  {activeTab === 'loyalty' && 'Sadakat Sistemi'}
                  {activeTab === 'settings' && 'Site Ayarları'}
                </h2>
                <p className="text-stone-500 text-sm mt-2 font-light tracking-wide">
                  {activeTab === 'menu' && 'Ürünlerinizi ekleyin, düzenleyin veya silin.'}
                  {activeTab === 'orders' && 'Gelen siparişleri yönetin ve durumlarını güncelleyin.'}
                  {activeTab === 'accounting' && 'Satış performansınızı ve gelirlerinizi analiz edin.'}
                  {activeTab === 'messages' && 'İletişim formundan gelen mesajları görüntüleyin.'}
                  {activeTab === 'franchise' && 'Yeni iş ortaklığı başvurularını değerlendirin.'}
                  {activeTab === 'loyalty' && 'Müşteri puanlarını ve sadakat programını yönetin.'}
                  {activeTab === 'settings' && 'Sitenin genel görünümünü ve bilgilerini güncelleyin.'}
                </p>
              </div>
              
              {activeTab === 'orders' && (
                <div className="flex items-center gap-4 bg-stone-900 p-2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 rounded-xl border border-red-900/30">
                    <Clock size={16} className="text-red-500" />
                    <span className="text-white text-xs font-bold">{orders.filter(o => o.status === 'pending').length} Bekleyen</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 rounded-xl border border-emerald-900/30">
                    <ShoppingBag size={16} className="text-emerald-500" />
                    <span className="text-white text-xs font-bold">{orders.filter(o => o.status === 'completed').length} Tamamlanan</span>
                  </div>
                </div>
              )}
            </div>
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* MENU MANAGEMENT TAB */}
              {activeTab === 'menu' && (
                <div className="space-y-10">
                  {/* Add/Edit Form */}
                  <div id="admin-form" className="bg-stone-900 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent"></div>
                    <h3 className="text-white text-2xl mb-8 flex items-center gap-3 serif">
                      {editingId ? <Edit2 size={24} className="text-blue-500" /> : <Plus size={24} className="text-red-500" />}
                      {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Ürün Adı</label>
                        <input 
                          placeholder="Örn: Gosht Special" 
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="w-full bg-stone-950 border border-white/5 p-4 text-white rounded-2xl focus:border-red-800 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Fiyat (TL)</label>
                        <input 
                          placeholder="0" 
                          type="number"
                          value={newItem.price || ''}
                          onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                          className="w-full bg-stone-950 border border-white/5 p-4 text-white rounded-2xl focus:border-red-800 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Kategori</label>
                        <select 
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value as Category})}
                          className="w-full bg-stone-950 border border-white/5 p-4 text-white rounded-2xl focus:border-red-800 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {Object.values(Category).map(cat => (
                            <option key={cat} value={cat} className="bg-stone-950">{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3 md:col-span-3">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Açıklama</label>
                        <textarea 
                          placeholder="Ürün içeriği ve detayları..." 
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          className="w-full bg-stone-950 border border-white/5 p-4 text-white rounded-2xl focus:border-red-800 outline-none h-32 resize-none transition-all"
                        />
                      </div>
                      <div className="space-y-3 md:col-span-3">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Ürün Görseli</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="relative group w-full md:w-64 h-40 bg-stone-950 border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center transition-all hover:border-red-900/30">
                            {newItem.image ? (
                              <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="text-stone-800" size={32} />
                                <span className="text-[10px] text-stone-700 uppercase font-bold tracking-widest">Görsel Seç</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 space-y-3 w-full">
                            <p className="text-xs text-stone-500 font-light">Görsel seçmek için kutuya tıklayın veya bir URL yapıştırın.</p>
                            <input 
                              placeholder="Görsel URL'si yapıştırın" 
                              value={newItem.image}
                              onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                              className="w-full bg-stone-950 border border-white/5 p-3 text-xs text-stone-400 rounded-xl outline-none focus:border-red-800 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Variants Section */}
                      <div className="space-y-6 md:col-span-3 pt-8 border-t border-white/5">
                        <label className="text-[10px] uppercase tracking-widest text-red-600 font-bold ml-1">Ürün Varyantları (Opsiyonel)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input 
                            placeholder="Varyant Adı (Örn: L (150 GR))" 
                            value={newVariant.label}
                            onChange={(e) => setNewVariant({...newVariant, label: e.target.value})}
                            className="bg-stone-950 border border-white/5 p-4 text-white rounded-2xl text-sm outline-none focus:border-red-800 transition-all"
                          />
                          <input 
                            placeholder="Varyant Fiyatı" 
                            type="number"
                            value={newVariant.price || ''}
                            onChange={(e) => setNewVariant({...newVariant, price: Number(e.target.value)})}
                            className="bg-stone-950 border border-white/5 p-4 text-white rounded-2xl text-sm outline-none focus:border-red-800 transition-all"
                          />
                          <button 
                            onClick={addVariant}
                            className="bg-stone-800 text-white p-4 rounded-2xl hover:bg-stone-700 transition-all flex items-center justify-center gap-3 text-[10px] uppercase font-bold tracking-widest"
                          >
                            <Plus size={18} /> Varyant Ekle
                          </button>
                        </div>
                        
                        {newItem.variants && newItem.variants.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {newItem.variants.map((v) => (
                              <div key={v.id} className="flex justify-between items-center bg-stone-950 p-4 border border-white/5 rounded-2xl group">
                                <span className="text-white text-sm font-medium">{v.label} — <span className="text-red-500 font-bold">{v.price} TL</span></span>
                                <button onClick={() => removeVariant(v.id)} className="text-stone-700 hover:text-red-600 transition-colors">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleAddOrUpdate} 
                        className={`flex-1 px-12 py-5 rounded-2xl uppercase text-xs tracking-[0.2em] font-bold transition-all shadow-xl ${editingId ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-red-900 hover:bg-red-800 text-white'}`}
                      >
                        {editingId ? 'Değişiklikleri Kaydet' : 'Ürünü Menüye Ekle'}
                      </button>
                      {editingId && (
                        <button 
                          onClick={() => {
                            setEditingId(null);
                            setNewItem({ name: '', description: '', price: 0, category: Category.BURGER, image: '', variants: [] });
                          }}
                          className="px-8 py-5 bg-stone-800 text-stone-400 hover:text-white rounded-2xl uppercase text-xs tracking-[0.2em] font-bold transition-all"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List Items */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5"></div>
                      <h3 className="text-stone-500 text-[10px] uppercase tracking-[0.4em] font-bold">Mevcut Ürünler ({items.length})</h3>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {items.map((item) => (
                        <div key={item.id} className="bg-stone-900 p-5 flex justify-between items-center rounded-3xl border border-white/5 hover:border-red-900/20 transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-stone-950 border border-white/5 rounded-2xl overflow-hidden shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-800 font-bold uppercase tracking-widest">Görsel Yok</div>
                              )}
                            </div>
                            <div>
                              <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{item.category}</span>
                              <h4 className="text-white font-serif text-xl tracking-tight">{item.name}</h4>
                              <p className="text-red-500 font-bold text-lg">{item.price} TL</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => startEdit(item)} 
                              className="p-3 text-stone-600 hover:text-blue-500 bg-stone-950 rounded-xl border border-white/5 hover:border-blue-900/30 transition-all"
                              title="Düzenle"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-3 text-stone-600 hover:text-red-600 bg-stone-950 rounded-xl border border-white/5 hover:border-red-900/30 transition-all"
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* Time Filter */}
                    <div className="flex items-center gap-1 bg-stone-900 p-1.5 rounded-2xl border border-white/5">
                      <Clock size={14} className="ml-2 text-stone-500" />
                      <button onClick={() => setTimeFilter('all')} className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-xl transition-all ${timeFilter === 'all' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Hepsi</button>
                      <button onClick={() => setTimeFilter('today')} className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-xl transition-all ${timeFilter === 'today' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Bugün</button>
                      <button onClick={() => setTimeFilter('last7')} className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-xl transition-all ${timeFilter === 'last7' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>7 Gün</button>
                    </div>

                    {/* Payment Filter */}
                    <div className="flex items-center gap-1 bg-stone-900 p-1.5 rounded-2xl border border-white/5">
                      <Filter size={14} className="ml-2 text-stone-500" />
                      <button onClick={() => setPaymentFilter('all')} className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-xl transition-all ${paymentFilter === 'all' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Tümü</button>
                      <button onClick={() => setPaymentFilter('cash')} className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-xl transition-all ${paymentFilter === 'cash' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Nakit</button>
                      <button onClick={() => setPaymentFilter('card')} className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-xl transition-all ${paymentFilter === 'card' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Kart</button>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center gap-3 bg-stone-900 p-2 rounded-2xl border border-white/5">
                      <label className="text-[10px] uppercase font-bold text-stone-500 ml-2 tracking-widest">Sırala:</label>
                      <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-transparent text-white text-[10px] uppercase font-bold outline-none cursor-pointer pr-2"
                      >
                        <option value="newest" className="bg-stone-900">En Yeni</option>
                        <option value="oldest" className="bg-stone-900">En Eski</option>
                        <option value="highest" className="bg-stone-900">En Yüksek</option>
                        <option value="lowest" className="bg-stone-900">En Düşük</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="bg-stone-900 p-24 text-center border border-dashed border-white/10 rounded-3xl">
                    <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6">
                      <ShoppingBag size={32} className="text-stone-800" />
                    </div>
                    <p className="text-stone-500 font-light tracking-wide">Henüz sipariş bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="bg-stone-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl transition-all hover:border-red-900/20">
                        <div 
                          className="p-6 flex flex-wrap justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          <div className="flex items-center gap-5">
                            <div className="bg-red-900/20 p-3 rounded-2xl border border-red-900/30">
                              <ShoppingBag size={24} className="text-red-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-white font-serif text-xl tracking-tight">{order.customer.firstName} {order.customer.lastName}</span>
                                <span className="text-[10px] bg-stone-950 text-stone-500 px-3 py-1 rounded-full uppercase font-bold tracking-widest border border-white/5">{order.id}</span>
                                {isNewOrder(order.timestamp) && (
                                  <span className="text-[9px] bg-red-600 text-white px-3 py-1 rounded-full font-bold animate-pulse tracking-widest">YENİ</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-stone-500 mt-2 font-light">
                                <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(order.timestamp).toLocaleTimeString('tr-TR')}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.timestamp).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-white font-bold text-xl">{order.total} TL</p>
                              <div className="flex items-center justify-end gap-3 mt-1">
                                <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${
                                  order.status === 'completed' ? 'bg-emerald-900/40 text-emerald-500 border border-emerald-900/30' :
                                  order.status === 'cancelled' ? 'bg-red-900/40 text-red-500 border border-red-900/30' :
                                  'bg-blue-900/40 text-blue-500 border border-blue-900/30'
                                }`}>
                                  {order.status === 'completed' ? 'Teslim Edildi' : 
                                   order.status === 'cancelled' ? 'İptal Edildi' : 'Bekliyor'}
                                </span>
                                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">{order.customer.paymentMethod === 'cash' ? 'Nakit' : 'Kart'}</p>
                              </div>
                            </div>
                            <div className={`p-2 rounded-full bg-stone-950 border border-white/5 transition-transform duration-300 ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`}>
                              <ChevronDown size={20} className="text-stone-600" />
                            </div>
                          </div>
                        </div>
                        
                        {expandedOrders.has(order.id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-8 bg-stone-950 border-t border-white/5"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div>
                                <h5 className="text-[10px] uppercase tracking-[0.3em] text-red-600 font-bold mb-6 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                  Sipariş İçeriği
                                </h5>
                                <div className="space-y-4">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm group">
                                      <div className="flex gap-4">
                                        <span className="text-red-600 font-bold bg-red-900/10 w-8 h-8 rounded-lg flex items-center justify-center border border-red-900/20">{item.quantity}</span>
                                        <div>
                                          <p className="text-stone-200 font-medium">
                                            {item.name}
                                            {item.selectedVariant && (
                                              <span className="text-red-500 ml-2 text-[10px] uppercase font-bold tracking-widest">
                                                [{item.selectedVariant.label}]
                                              </span>
                                            )}
                                          </p>
                                          {item.customizations && <p className="text-[10px] text-stone-500 italic mt-1 bg-stone-900 p-2 rounded-lg border border-white/5">Not: {item.customizations}</p>}
                                        </div>
                                      </div>
                                      <span className="text-stone-400 font-medium">{item.price * item.quantity} TL</span>
                                    </div>
                                  ))}
                                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-stone-500 text-xs uppercase tracking-widest font-bold">Toplam Tutar</span>
                                    <span className="text-white font-bold text-2xl serif">{order.total} TL</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-8">
                                <div>
                                  <h5 className="text-[10px] uppercase tracking-[0.3em] text-red-600 font-bold mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                    Teslimat Bilgileri
                                  </h5>
                                  <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center p-4 bg-stone-900 rounded-2xl border border-white/5">
                                      <span className="text-stone-500 text-xs font-medium">Müşteri Telefonu</span>
                                      <a href={`tel:${order.customer.phone}`} className="text-stone-200 hover:text-red-500 font-bold transition-colors">{order.customer.phone}</a>
                                    </div>
                                    <div className="space-y-2">
                                      <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">Teslimat Adresi</span>
                                      <p className="text-stone-200 leading-relaxed bg-stone-900 p-5 rounded-2xl border border-white/5 font-light">{order.customer.address}</p>
                                    </div>
                                    {order.customer.orderNote && (
                                      <div className="space-y-2">
                                        <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold ml-1">Sipariş Notu</span>
                                        <p className="text-red-500/80 italic bg-red-900/5 p-5 rounded-2xl border border-red-900/10 text-xs leading-relaxed">{order.customer.orderNote}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="pt-4 flex gap-4">
                                  {order.status === 'pending' && (
                                    <>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateOrderStatus(order.id, 'completed');
                                        }}
                                        className="flex-1 bg-emerald-900 text-white py-4 rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:bg-emerald-800 shadow-lg shadow-emerald-900/20"
                                      >
                                        Siparişi Tamamla
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateOrderStatus(order.id, 'cancelled');
                                        }}
                                        className="flex-1 bg-red-950 text-red-500 py-4 rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:bg-red-900 hover:text-white border border-red-900/20"
                                      >
                                        İptal Et
                                      </button>
                                    </>
                                  )}
                                  {order.status !== 'pending' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(order.id, 'pending');
                                      }}
                                      className="flex-1 bg-stone-900 text-stone-500 py-4 rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:bg-stone-800 hover:text-stone-300 border border-white/5"
                                    >
                                      Bekliyor Olarak İşaretle
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACCOUNTING TAB */}
            {activeTab === 'accounting' && (
              <div className="space-y-12 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-stone-900 p-1.5 rounded-2xl border border-white/5">
                    <button onClick={() => setTimeFilter('all')} className={`px-5 py-2 text-[10px] uppercase font-bold rounded-xl transition-all ${timeFilter === 'all' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Hepsi</button>
                    <button onClick={() => setTimeFilter('today')} className={`px-5 py-2 text-[10px] uppercase font-bold rounded-xl transition-all ${timeFilter === 'today' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>Bugün</button>
                    <button onClick={() => setTimeFilter('last7')} className={`px-5 py-2 text-[10px] uppercase font-bold rounded-xl transition-all ${timeFilter === 'last7' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-stone-500 hover:text-white'}`}>7 Gün</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-stone-900 p-8 border border-white/5 rounded-3xl shadow-2xl group hover:border-red-900/20 transition-all">
                    <div className="w-12 h-12 bg-emerald-900/20 rounded-2xl flex items-center justify-center border border-emerald-900/30 mb-6 group-hover:scale-110 transition-transform">
                      <TrendingUp size={24} className="text-emerald-500" />
                    </div>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Toplam Ciro</p>
                    <h4 className="text-4xl text-white font-bold serif tracking-tight">{totalRevenue.toLocaleString('tr-TR')} <span className="text-lg text-red-600 ml-1">TL</span></h4>
                  </div>
                  <div className="bg-stone-900 p-8 border border-white/5 rounded-3xl shadow-2xl group hover:border-red-900/20 transition-all">
                    <div className="w-12 h-12 bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-900/30 mb-6 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={24} className="text-blue-500" />
                    </div>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Toplam Sipariş</p>
                    <h4 className="text-4xl text-white font-bold serif tracking-tight">{totalOrders} <span className="text-lg text-red-600 ml-1">Adet</span></h4>
                  </div>
                  <div className="bg-stone-900 p-8 border border-white/5 rounded-3xl shadow-2xl group hover:border-red-900/20 transition-all">
                    <div className="w-12 h-12 bg-amber-900/20 rounded-2xl flex items-center justify-center border border-amber-900/30 mb-6 group-hover:scale-110 transition-transform">
                      <PieChart size={24} className="text-amber-500" />
                    </div>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Ortalama Sepet</p>
                    <h4 className="text-4xl text-white font-bold serif tracking-tight">{Math.round(averageOrderValue).toLocaleString('tr-TR')} <span className="text-lg text-red-600 ml-1">TL</span></h4>
                  </div>
                </div>

                <div className="bg-stone-900 border border-white/5 rounded-3xl p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <PieChart size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Ödeme Tipi Dağılımı</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-stone-950 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-900/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-emerald-600 rounded-full"></div>
                        <div>
                          <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Nakit Ödemeler</p>
                          <p className="text-white text-xl font-bold">{filteredOrders.filter(o => o.customer.paymentMethod === 'cash').length} Sipariş</p>
                        </div>
                      </div>
                      <span className="text-white font-bold text-2xl serif">{filteredOrders.filter(o => o.customer.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0).toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="p-8 bg-stone-950 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-900/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Kredi Kartı</p>
                          <p className="text-white text-xl font-bold">{filteredOrders.filter(o => o.customer.paymentMethod === 'card').length} Sipariş</p>
                        </div>
                      </div>
                      <span className="text-white font-bold text-2xl serif">{filteredOrders.filter(o => o.customer.paymentMethod === 'card').reduce((s, o) => s + o.total, 0).toLocaleString('tr-TR')} TL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 gap-6">
                  {messages.length === 0 ? (
                    <div className="bg-stone-900 p-24 rounded-3xl border border-dashed border-white/10 text-center">
                      <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6">
                        <Mail className="text-stone-800" size={32} />
                      </div>
                      <p className="text-stone-500 font-light tracking-wide">Henüz mesaj bulunmuyor.</p>
                    </div>
                  ) : (
                    [...messages].sort((a, b) => b.timestamp - a.timestamp).map((msg) => (
                      <div key={msg.id} className="bg-stone-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl group hover:border-red-900/20 transition-all">
                        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-stone-950/50">
                          <div className="space-y-2">
                            <h4 className="text-white font-serif text-2xl tracking-tight">{msg.subject}</h4>
                            <div className="flex flex-wrap items-center gap-6 text-xs text-stone-500 font-light">
                              <span className="flex items-center gap-2"><Mail size={14} className="text-red-600" /> {msg.email}</span>
                              <span className="flex items-center gap-2"><MessageSquare size={14} className="text-red-600" /> {msg.name}</span>
                              <span className="flex items-center gap-2"><Clock size={14} className="text-red-600" /> {new Date(msg.timestamp).toLocaleString('tr-TR')}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteMessage(msg.id)}
                            className="p-3 text-stone-600 hover:text-red-500 bg-stone-950 rounded-xl border border-white/5 hover:border-red-900/30 transition-all"
                            title="Sil"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="p-8">
                          <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap font-light">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* FRANCHISE TAB */}
            {activeTab === 'franchise' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 gap-8">
                  {franchiseApps.length === 0 ? (
                    <div className="bg-stone-900 p-24 rounded-3xl border border-dashed border-white/10 text-center">
                      <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6">
                        <Building2 className="text-stone-800" size={32} />
                      </div>
                      <p className="text-stone-500 font-light tracking-wide">Henüz başvuru bulunmuyor.</p>
                    </div>
                  ) : (
                    franchiseApps.sort((a, b) => b.timestamp - a.timestamp).map((app) => (
                      <div key={app.id} className="bg-stone-900 border border-white/5 rounded-3xl p-10 shadow-2xl hover:border-red-900/20 transition-all group">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <h4 className="text-white text-3xl font-serif tracking-tight">{app.name}</h4>
                              <span className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold bg-stone-950 px-4 py-1.5 rounded-full border border-white/5">
                                {new Date(app.timestamp).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-8 text-stone-400 text-xs font-light">
                              <span className="flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-xl border border-white/5"><Mail size={16} className="text-red-600" /> {app.email}</span>
                              <span className="flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-xl border border-white/5"><Phone size={16} className="text-red-600" /> {app.phone}</span>
                              <span className="flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-xl border border-white/5"><Building2 size={16} className="text-red-600" /> {app.city}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteFranchiseApp(app.id)}
                            className="p-4 text-stone-600 hover:text-red-500 bg-stone-950 rounded-2xl border border-white/5 hover:border-red-900/30 transition-all"
                            title="Sil"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                        
                        <div className="bg-stone-950 border border-white/5 p-8 rounded-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                          <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 flex items-center gap-2">
                            <MessageSquare size={14} className="text-red-600" /> Başvuru Notu
                          </p>
                          <p className="text-stone-300 text-base leading-relaxed whitespace-pre-wrap italic font-light">
                            "{app.message || 'Not bırakılmadı.'}"
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* LOYALTY TAB */}
            {activeTab === 'loyalty' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 gap-8">
                  {loyaltyAccounts.length === 0 ? (
                    <div className="bg-stone-900 p-24 rounded-3xl border border-dashed border-white/10 text-center">
                      <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6">
                        <Star className="text-stone-800" size={32} />
                      </div>
                      <p className="text-stone-500 font-light tracking-wide">Henüz puan kazanan müşteri bulunmuyor.</p>
                    </div>
                  ) : (
                    [...loyaltyAccounts].sort((a, b) => b.points - a.points).map((account) => (
                      <div key={account.phone} className="bg-stone-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:border-red-900/20 transition-all">
                        <div className="p-8 flex justify-between items-center bg-stone-950/50">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-900/30">
                              <Phone size={28} />
                            </div>
                            <div>
                              <h4 className="text-white font-serif text-2xl tracking-tight">{account.phone}</h4>
                              <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">{account.history.length} İşlem</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-5xl text-red-600 font-bold serif tracking-tight">{account.points}</p>
                            <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mt-1">Mevcut Puan</p>
                          </div>
                        </div>
                        
                        <div className="p-8 border-t border-white/5">
                          <h5 className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                            İşlem Geçmişi
                          </h5>
                          <div className="space-y-3">
                            {account.history.slice(-5).reverse().map((entry, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm p-4 bg-stone-950/50 rounded-2xl border border-white/5 group hover:border-red-900/20 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${entry.type === 'earn' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                                  <span className="text-stone-300 font-light">{entry.description}</span>
                                </div>
                                <div className="flex items-center gap-8">
                                  <span className="text-stone-500 text-xs font-light">{new Date(entry.timestamp).toLocaleDateString('tr-TR')}</span>
                                  <span className={`font-bold text-lg serif ${entry.type === 'earn' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {entry.type === 'earn' ? '+' : '-'}{entry.amount}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* FEEDBACKS TAB */}
            {activeTab === 'feedbacks' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-3xl text-white font-serif tracking-tight">Müşteri Geri Bildirimleri</h3>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Deneyim ve Puanlamalar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {feedbacks.length === 0 ? (
                    <div className="bg-stone-900 p-24 rounded-3xl border border-dashed border-white/10 text-center">
                      <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6">
                        <MessageSquare className="text-stone-800" size={32} />
                      </div>
                      <p className="text-stone-500 font-light tracking-wide">Henüz geri bildirim alınmadı.</p>
                    </div>
                  ) : (
                    [...feedbacks].reverse().map((feedback) => (
                      <div key={feedback.id} className="bg-stone-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:border-red-900/20 transition-all group">
                        <div className="p-8 flex justify-between items-start">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-900/30">
                              <Star size={28} className="fill-red-600" />
                            </div>
                            <div>
                              <h4 className="text-white font-serif text-2xl tracking-tight">{feedback.name}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold">{feedback.email || 'E-posta belirtilmedi'}</p>
                                <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
                                <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold">{new Date(feedback.timestamp).toLocaleString('tr-TR')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={16} 
                                  className={`${star <= feedback.rating ? 'fill-red-600 text-red-600' : 'text-stone-800'}`} 
                                />
                              ))}
                            </div>
                            <button 
                              onClick={async () => {
                                if (window.confirm('Bu geri bildirimi silmek istediğinize emin misiniz?')) {
                                  await deleteDoc(doc(db, 'feedbacks', feedback.id));
                                  setFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id));
                                }
                              }}
                              className="w-12 h-12 bg-stone-950 text-stone-600 hover:text-red-500 rounded-2xl flex items-center justify-center border border-white/5 transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-8 bg-stone-950/50 border-t border-white/5">
                          <p className="text-stone-300 text-lg leading-relaxed font-light italic">
                            "{feedback.comment}"
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="space-y-12 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl text-white font-serif tracking-tight">Kampanya & Kupon Yönetimi</h3>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">İndirim Kodları ve Promosyonlar</p>
                  </div>
                </div>

                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <h4 className="text-white serif text-xl mb-8 flex items-center gap-3">
                    <Plus size={20} className="text-red-600" /> Yeni Kupon Oluştur
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Kupon Kodu</label>
                      <input 
                        type="text" 
                        placeholder="Örn: GOSHT20"
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all placeholder:text-stone-800 text-sm uppercase"
                        value={newCoupon.code}
                        onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">İndirim Tipi</label>
                      <select 
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all text-sm appearance-none"
                        value={newCoupon.discountType}
                        onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as 'percentage' | 'fixed'})}
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed">Sabit Tutar (TL)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">İndirim Değeri</label>
                      <input 
                        type="number" 
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all text-sm"
                        value={newCoupon.discountValue}
                        onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Min. Sepet Tutarı</label>
                      <input 
                        type="number" 
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all text-sm"
                        value={newCoupon.minOrderAmount}
                        onChange={e => setNewCoupon({...newCoupon, minOrderAmount: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Başlangıç Tarihi</label>
                      <input 
                        type="date" 
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all text-sm"
                        value={newCoupon.startDate}
                        onChange={e => setNewCoupon({...newCoupon, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Bitiş Tarihi</label>
                      <input 
                        type="date" 
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all text-sm"
                        value={newCoupon.endDate}
                        onChange={e => setNewCoupon({...newCoupon, endDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-1">Kullanım Limiti</label>
                      <input 
                        type="number" 
                        placeholder="Limitsiz için 0"
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all text-sm"
                        value={newCoupon.usageLimit}
                        onChange={e => setNewCoupon({...newCoupon, usageLimit: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!newCoupon.code || !newCoupon.discountValue) return;
                      const coupon: Coupon = {
                        id: Date.now().toString(),
                        code: newCoupon.code!,
                        discountType: newCoupon.discountType as any,
                        discountValue: newCoupon.discountValue!,
                        minOrderAmount: newCoupon.minOrderAmount,
                        startDate: newCoupon.startDate,
                        endDate: newCoupon.endDate,
                        usageLimit: newCoupon.usageLimit || undefined,
                        usageCount: 0,
                        isActive: true,
                        timestamp: Date.now()
                      };
                      await addDoc(collection(db, 'coupons'), coupon);
                      setCoupons((prev) => [...prev, coupon]);
                      setNewCoupon({
                        code: '',
                        discountType: 'percentage',
                        discountValue: 0,
                        minOrderAmount: 0,
                        startDate: '',
                        endDate: '',
                        usageLimit: 0,
                        isActive: true
                      });
                    }}
                    className="mt-8 bg-red-900 text-white px-10 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-red-800 transition-all shadow-xl shadow-red-950/30"
                  >
                    Kuponu Kaydet
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {coupons.length === 0 ? (
                    <div className="col-span-full bg-stone-900 p-24 rounded-3xl border border-dashed border-white/10 text-center">
                      <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6">
                        <Ticket className="text-stone-800" size={32} />
                      </div>
                      <p className="text-stone-500 font-light tracking-wide">Henüz aktif bir kupon bulunmuyor.</p>
                    </div>
                  ) : (
                    coupons.map((coupon) => (
                      <div key={coupon.id} className="bg-stone-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                        <div className="p-8 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="bg-red-900/20 text-red-500 px-4 py-2 rounded-lg border border-red-900/30 font-bold tracking-widest text-lg">
                              {coupon.code}
                            </div>
                            <button 
                              onClick={async () => {
                                if (window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
                                  await deleteDoc(doc(db, 'coupons', coupon.id));
                                  setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
                                }
                              }}
                              className="text-stone-700 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-stone-500">İndirim</span>
                              <span className="text-white font-bold">
                                {coupon.discountType === 'percentage' ? `%${coupon.discountValue}` : `${coupon.discountValue} TL`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-stone-500">Min. Tutar</span>
                              <span className="text-white font-bold">{coupon.minOrderAmount || 0} TL</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-stone-500">Kullanım</span>
                              <span className="text-white font-bold">{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                            </div>
                            {(coupon.startDate || coupon.endDate) && (
                              <div className="pt-4 border-t border-white/5 space-y-2">
                                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Geçerlilik Aralığı</p>
                                <div className="flex items-center gap-2 text-[10px] text-stone-300">
                                  <Calendar size={12} className="text-red-600" />
                                  <span>{coupon.startDate ? new Date(coupon.startDate).toLocaleDateString('tr-TR') : '...'} - {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('tr-TR') : '...'}</span>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-stone-500">Durum</span>
                              <span className={`flex items-center gap-2 font-bold ${coupon.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                {coupon.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-stone-950/50 p-4 border-t border-white/5 text-[10px] text-stone-600 uppercase tracking-widest text-center font-bold">
                          Oluşturulma: {new Date(coupon.timestamp).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-12 animate-fade-in">
                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Upload size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Logo Yönetimi</h4>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-56 h-56 bg-stone-950 border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-inner group">
                      {siteLogo ? (
                        <img src={siteLogo} alt="Site Logo" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="text-center">
                          <p className="text-[10px] text-stone-700 uppercase tracking-[0.2em] font-bold mb-4">Varsayılan Logo</p>
                          <div className="w-16 h-16 bg-stone-900 rounded-2xl mx-auto flex items-center justify-center border border-white/5">
                            <ShoppingBag className="text-stone-800" size={32} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      <p className="text-stone-400 text-sm font-light leading-relaxed">Sitenin sol üst köşesinde ve diğer alanlarda görünecek logoyu buradan değiştirebilirsiniz. Şeffaf arka planlı PNG formatı önerilir.</p>
                      
                      <div className="relative inline-block">
                        <button className="bg-red-900 text-white px-8 py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-900/20">
                          Yeni Logo Yükle
                        </button>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Social Media Settings */}
                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-12 h-12 bg-red-900/20 rounded-2xl flex items-center justify-center border border-red-900/30 shadow-lg shadow-red-900/10">
                      <Phone size={24} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-white serif text-3xl tracking-tight">Temel İletişim & Sosyal Medya</h4>
                      <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Müşterilerin size ulaşacağı bilgiler</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-8 p-8 bg-stone-950/50 rounded-3xl border border-white/5 shadow-inner">
                      <h5 className="text-[10px] text-red-600 uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                        Temel İletişim Bilgileri
                      </h5>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[11px] text-stone-300 uppercase tracking-[0.2em] font-bold block mb-3 ml-1 flex items-center gap-2">
                            <Phone size={12} className="text-red-600" /> Telefon Numarası
                          </label>
                          <input 
                            type="text"
                            value={siteSettings.contactPhone}
                            onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                            className="w-full bg-stone-900 border border-white/10 text-white p-5 rounded-2xl focus:border-red-900 outline-none transition-all font-medium text-lg shadow-xl"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-300 uppercase tracking-[0.2em] font-bold block mb-3 ml-1 flex items-center gap-2">
                            <Mail size={12} className="text-red-600" /> E-posta Adresi
                          </label>
                          <input 
                            type="email"
                            value={siteSettings.contactEmail}
                            onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                            className="w-full bg-stone-900 border border-white/10 text-white p-5 rounded-2xl focus:border-red-900 outline-none transition-all font-medium shadow-xl"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-300 uppercase tracking-[0.2em] font-bold block mb-3 ml-1 flex items-center gap-2">
                            <Building2 size={12} className="text-red-600" /> Fiziksel Adres
                          </label>
                          <textarea 
                            value={siteSettings.contactAddress}
                            onChange={(e) => setSiteSettings({...siteSettings, contactAddress: e.target.value})}
                            className="w-full bg-stone-900 border border-white/10 text-white p-5 rounded-2xl focus:border-red-900 outline-none h-32 resize-none transition-all font-light leading-relaxed shadow-xl"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-8 p-8 bg-stone-950/20 rounded-3xl border border-white/5">
                      <h5 className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
                        Sosyal Medya & WhatsApp
                      </h5>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[11px] text-stone-400 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">WhatsApp Numarası</label>
                          <input 
                            type="text"
                            value={siteSettings.whatsappNumber}
                            onChange={(e) => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                            placeholder="Örn: 905078641672"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-400 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Instagram URL</label>
                          <input 
                            type="text"
                            value={siteSettings.instagramUrl}
                            onChange={(e) => setSiteSettings({...siteSettings, instagramUrl: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-400 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">TikTok URL</label>
                          <input 
                            type="text"
                            value={siteSettings.tiktokUrl}
                            onChange={(e) => setSiteSettings({...siteSettings, tiktokUrl: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Upload size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Ana Sayfa Arka Planı</h4>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-full md:w-72 h-40 bg-stone-950 border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner group">
                      {heroBg ? (
                        <img src={heroBg} alt="Hero Background" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <div className="text-center">
                          <p className="text-[10px] text-stone-700 uppercase tracking-[0.2em] font-bold mb-4">Varsayılan Görsel</p>
                          <div className="w-16 h-16 bg-stone-900 rounded-2xl mx-auto flex items-center justify-center border border-white/5">
                            <Upload className="text-stone-800" size={32} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      <p className="text-stone-400 text-sm font-light leading-relaxed">Ana sayfadaki (Hero section) arka plan görselini buradan değiştirebilirsiniz. Yüksek çözünürlüklü görseller tercih ediniz.</p>
                      
                      <div className="relative inline-block">
                        <button className="bg-red-900 text-white px-8 py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-900/20">
                          Yeni Görsel Yükle
                        </button>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleHeroBgUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Mail size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">E-posta Bildirim Testi</h4>
                  </div>
                  <p className="text-stone-400 text-sm font-light leading-relaxed mb-8 max-w-2xl">
                    Sipariş bildirimlerinin doğru çalışıp çalışmadığını kontrol etmek için kendinize bir test e-postası gönderebilirsiniz. 
                    <span className="text-red-500/80 text-xs font-bold block mt-4 bg-red-900/5 p-4 rounded-xl border border-red-900/10">
                      ÖNEMLİ: Gmail kullanıyorsanız, normal şifrenizi DEĞİL, Google hesabınızdan oluşturacağınız 16 haneli "Uygulama Şifresi"ni (App Password) kullanmalısınız.
                    </span>
                  </p>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/test-email', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          alert("Başarılı: " + data.message);
                        } else {
                          alert("Hata: " + data.error + "\nDetay: " + data.details + (data.hint ? "\n\nİpucu: " + data.hint : ""));
                        }
                      } catch (e) {
                        alert("Sunucuya bağlanılamadı.");
                      }
                    }}
                    className="bg-stone-800 text-white px-8 py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-stone-700 transition-all flex items-center gap-3 border border-white/5"
                  >
                    <Mail size={18} /> Test E-postası Gönder
                  </button>
                </div>

                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Edit2 size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Giriş (Hero) Bölümü Ayarları</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Ana Başlık</label>
                      <input 
                        type="text"
                        value={siteSettings.heroTitle}
                        onChange={(e) => setSiteSettings({...siteSettings, heroTitle: e.target.value})}
                        className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Alt Başlık</label>
                      <textarea 
                        value={siteSettings.heroSubtitle}
                        onChange={(e) => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})}
                        className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none h-24 resize-none transition-all font-light"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Buton Metni</label>
                      <input 
                        type="text"
                        value={siteSettings.heroCtaText}
                        onChange={(e) => setSiteSettings({...siteSettings, heroCtaText: e.target.value})}
                        className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Edit2 size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Alt Bilgi (Footer) Ayarları</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Kısa Açıklama</label>
                      <textarea 
                        value={siteSettings.footerDescription}
                        onChange={(e) => setSiteSettings({...siteSettings, footerDescription: e.target.value})}
                        className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none h-24 resize-none transition-all font-light"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Telif Hakkı Metni</label>
                      <input 
                        type="text"
                        value={siteSettings.footerCopyright}
                        onChange={(e) => setSiteSettings({...siteSettings, footerCopyright: e.target.value})}
                        className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Save size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Veritabanı Yönetimi</h4>
                  </div>
                  <p className="text-stone-400 text-sm font-light leading-relaxed mb-8 max-w-2xl">
                    Tüm verilerinizi (menü, siparişler, mesajlar vb.) yedekleyebilir veya sistemi varsayılan ayarlara döndürebilirsiniz.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/backup');
                          const data = await res.json();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `gosht_burger_yedek_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (e) {
                          alert("Yedek alınırken hata oluştu.");
                        }
                      }}
                      className="bg-emerald-900/20 text-emerald-500 px-8 py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-emerald-900/40 transition-all flex items-center gap-3 border border-emerald-900/30"
                    >
                      <Save size={18} /> Verileri Yedekle (JSON)
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('DİKKAT: Tüm veriler (siparişler, mesajlar, menü değişiklikleri) silinecek ve varsayılan ayarlara dönülecek. Bu işlem geri alınamaz! Emin misiniz?')) {
                          try {
                            const res = await fetch('/api/reset-data', { method: 'POST' });
                            if (res.ok) {
                              alert("Tüm veriler sıfırlandı. Sayfa yenileniyor...");
                              window.location.reload();
                            }
                          } catch (e) {
                            alert("Sıfırlama sırasında hata oluştu.");
                          }
                        }
                      }}
                      className="bg-red-900/20 text-red-500 px-8 py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-red-900/40 transition-all flex items-center gap-3 border border-red-900/30"
                    >
                      <Trash2 size={18} /> Tüm Verileri Sıfırla
                    </button>
                  </div>
                </div>
                 
                {/* About & Franchise Settings */}
                <div className="space-y-12">
                  <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                        <Star size={20} className="text-red-600" />
                      </div>
                      <h4 className="text-white serif text-2xl tracking-tight">Hakkımızda Bölümü</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Küçük Etiket</label>
                          <input 
                            type="text"
                            value={siteSettings.aboutLabel}
                            onChange={(e) => setSiteSettings({...siteSettings, aboutLabel: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                            placeholder="Mirasımız vb."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Ana Başlık</label>
                          <input 
                            type="text"
                            value={siteSettings.aboutTitle}
                            onChange={(e) => setSiteSettings({...siteSettings, aboutTitle: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Açıklama Metni</label>
                          <textarea 
                            value={siteSettings.aboutText}
                            onChange={(e) => setSiteSettings({...siteSettings, aboutText: e.target.value})}
                            className="w-full h-48 bg-stone-950 border border-white/5 text-white p-5 rounded-2xl focus:border-red-900/50 outline-none transition-all resize-none font-light leading-relaxed"
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Özellikler (Her satıra bir tane)</label>
                          <textarea 
                            value={siteSettings.aboutFeatures}
                            onChange={(e) => setSiteSettings({...siteSettings, aboutFeatures: e.target.value})}
                            className="w-full h-32 bg-stone-950 border border-white/5 text-white p-5 rounded-2xl focus:border-red-900/50 outline-none transition-all resize-none font-light"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Vizyon Cümlesi</label>
                          <input 
                            type="text"
                            value={siteSettings.aboutQuote}
                            onChange={(e) => setSiteSettings({...siteSettings, aboutQuote: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light italic"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Görsel 1</label>
                            <div className="relative h-32 bg-stone-950 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                              {siteSettings.aboutImage1 ? <img src={siteSettings.aboutImage1} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Upload size={20} className="text-stone-800" />}
                              <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'aboutImage1')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Görsel 2</label>
                            <div className="relative h-32 bg-stone-950 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                              {siteSettings.aboutImage2 ? <img src={siteSettings.aboutImage2} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Upload size={20} className="text-stone-800" />}
                              <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'aboutImage2')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                        <TrendingUp size={20} className="text-red-600" />
                      </div>
                      <h4 className="text-white serif text-2xl tracking-tight">Franchise Bölümü</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Küçük Etiket</label>
                          <input 
                            type="text"
                            value={siteSettings.franchiseLabel}
                            onChange={(e) => setSiteSettings({...siteSettings, franchiseLabel: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                            placeholder="İş Ortaklığı vb."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Ana Başlık</label>
                          <input 
                            type="text"
                            value={siteSettings.franchiseTitle}
                            onChange={(e) => setSiteSettings({...siteSettings, franchiseTitle: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Alıntı Cümlesi</label>
                          <input 
                            type="text"
                            value={siteSettings.franchiseQuote}
                            onChange={(e) => setSiteSettings({...siteSettings, franchiseQuote: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light italic"
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Açıklama Metni</label>
                          <textarea 
                            value={siteSettings.franchiseText}
                            onChange={(e) => setSiteSettings({...siteSettings, franchiseText: e.target.value})}
                            className="w-full h-32 bg-stone-950 border border-white/5 text-white p-5 rounded-2xl focus:border-red-900/50 outline-none transition-all resize-none font-light leading-relaxed"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">"Neden Biz" Başlığı</label>
                          <input 
                            type="text"
                            value={siteSettings.franchiseWhyTitle}
                            onChange={(e) => setSiteSettings({...siteSettings, franchiseWhyTitle: e.target.value})}
                            className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Franchise Görseli</label>
                          <div className="relative h-32 bg-stone-950 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                            {siteSettings.franchiseImage ? <img src={siteSettings.franchiseImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Upload size={20} className="text-stone-800" />}
                            <input type="file" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'franchiseImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loyalty Program Settings */}
                <div className="bg-stone-900 p-10 border border-white/5 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                      <Star size={20} className="text-red-600" />
                    </div>
                    <h4 className="text-white serif text-2xl tracking-tight">Sadakat Programı Ayarları</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between p-6 bg-stone-950 border border-white/5 rounded-2xl shadow-inner">
                        <div>
                          <p className="text-white font-bold text-sm tracking-tight">Programı Aktifleştir</p>
                          <p className="text-stone-500 text-xs font-light mt-1">Müşterilerin puan kazanmasını ve kullanmasını sağlar.</p>
                        </div>
                        <button 
                          onClick={() => setSiteSettings({...siteSettings, loyaltyEnabled: !siteSettings.loyaltyEnabled})}
                          className={`w-14 h-7 rounded-full transition-all relative shadow-lg ${siteSettings.loyaltyEnabled ? 'bg-red-900' : 'bg-stone-800'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${siteSettings.loyaltyEnabled ? 'left-8' : 'left-1'}`}></div>
                        </button>
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Puan Kazanım Oranı (1 TL = X Puan)</label>
                        <input 
                          type="number"
                          value={siteSettings.pointsPerTL}
                          onChange={(e) => setSiteSettings({...siteSettings, pointsPerTL: Number(e.target.value)})}
                          className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Minimum Kullanım Puanı</label>
                        <input 
                          type="number"
                          value={siteSettings.minPointsToRedeem}
                          onChange={(e) => setSiteSettings({...siteSettings, minPointsToRedeem: Number(e.target.value)})}
                          className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold block mb-3 ml-1">Puan Değeri (1 Puan = X TL)</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={siteSettings.pointValueInTL}
                          onChange={(e) => setSiteSettings({...siteSettings, pointValueInTL: Number(e.target.value)})}
                          className="w-full bg-stone-950 border border-white/5 text-white p-4 rounded-2xl focus:border-red-900/50 outline-none transition-all font-light"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <button 
                    onClick={saveSettings}
                    className="bg-red-900 text-white px-12 py-5 rounded-2xl uppercase text-xs tracking-[0.3em] font-bold hover:bg-red-800 transition-all shadow-xl shadow-red-900/30 flex items-center gap-3 group"
                  >
                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                    Tüm Ayarları Kaydet
                  </button>
                </div>
              </div>
            )}
            </motion.div>
            
            <div className="text-stone-600 text-[10px] text-center p-8 border-t border-stone-900 mt-12 uppercase tracking-[0.2em]">
              Gosht Burger Premium Yönetim Sistemi &copy; 2024
            </div>
         </div>
        )}
      </div>
    </motion.div>
  
  );


};


