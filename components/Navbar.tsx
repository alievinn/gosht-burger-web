
import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Music, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { Logo } from './Logo';
import { SiteSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenLoyalty?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 0, onOpenCart, onOpenLoyalty }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const settingsRef = doc(db, 'settings', 'siteConfig');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
    }, (e) => console.error('Error fetching settings:', e));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Ana Sayfa', href: '#home' },
    { name: 'GOSHT MENÜ', href: '#menu' },
    { name: 'Hakkımızda', href: '#about' },
    { name: 'Franchise', href: '#franchise' },
    { name: 'İletişim', href: '#contact' },
  ];

  const socialLinks = [
    { Icon: Instagram, href: settings?.instagramUrl || "https://www.instagram.com/goshtburger", label: "Instagram", color: "text-[#E4405F]" },
    { Icon: Music, href: settings?.tiktokUrl || "https://www.tiktok.com/@goshtburger", label: "TikTok", color: "text-white" },
    { Icon: MessageCircle, href: settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : "https://wa.me/905078641672", label: "WhatsApp", color: "text-[#25D366]" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'py-4 bg-brand-red/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-8 bg-transparent'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Brand / Logo Area */}
        <a href="#home" className="flex items-center group cursor-pointer">
          <Logo size="md" className="group-hover:scale-105 transition-transform duration-500" />
        </a>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="text-stone-400 hover:text-brand-red transition-all uppercase text-[10px] tracking-[0.3em] font-bold relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-red transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          
          {/* Social Icons Desktop */}
          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                {socialLinks.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${link.color} transition-all duration-300 transform hover:scale-110`}
                    aria-label={link.label}
                  >
                    <link.Icon size={16} />
                  </a>
                ))}
          </div>
          
          {onOpenLoyalty && (
            <button 
              onClick={onOpenLoyalty}
              className="px-4 py-2 bg-red-900/20 border border-red-900/30 rounded-full text-white text-[9px] uppercase tracking-widest font-bold hover:bg-red-900/40 transition-all flex items-center gap-2"
            >
              <Star size={12} className="text-brand-red" />
              Puanlarım
            </button>
          )}

          {onOpenCart && (
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-stone-300 hover:text-white transition-all duration-300 group"
            >
              <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1.3, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 bg-red-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-stone-950"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>

        {/* Mobile Right Section (Socials + Menu Toggle) */}
        <div className="lg:hidden flex items-center gap-6">
          {onOpenCart && (
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-stone-200 hover:text-white transition-colors"
            >
              <ShoppingBag size={22} />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1.3, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 bg-red-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-stone-950"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          {/* Hamburger Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-stone-100 hover:text-gold transition-colors p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-stone-950 flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="flex flex-col items-center space-y-8">
               {navLinks.map((link, idx) => (
                 <motion.a 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-stone-400 hover:text-brand-red uppercase tracking-[0.4em] text-lg font-bold transition-all"
                 >
                   {link.name}
                 </motion.a>
               ))}

               {onOpenCart && (
                 <motion.button
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: navLinks.length * 0.1 }}
                   onClick={() => {
                     setIsMobileMenuOpen(false);
                     onOpenCart();
                   }}
                   className="text-white hover:text-brand-red uppercase tracking-[0.4em] text-lg font-bold transition-all flex items-center gap-4"
                 >
                   <ShoppingBag size={24} />
                   Sepetim {cartCount > 0 && `(${cartCount})`}
                 </motion.button>
               )}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-8 pt-10 border-t border-white/5 w-full max-w-xs"
            >
              {onOpenLoyalty && (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLoyalty();
                  }}
                  className="w-full py-4 bg-red-900/20 border border-red-900/30 rounded-xl text-white text-xs uppercase tracking-widest font-bold hover:bg-red-900/40 transition-all flex items-center justify-center gap-3"
                >
                  <Star size={18} className="text-brand-red" />
                  Puanlarımı Sorgula
                </button>
              )}
              <div className="flex items-center gap-10">
                {socialLinks.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-stone-500 hover:text-white transition-all transform hover:scale-125"
                    aria-label={link.label}
                  >
                    <link.Icon size={24} />
                  </a>
                ))}
              </div>
            </motion.div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 text-stone-500 hover:text-white p-2"
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
