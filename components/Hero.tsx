import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

export const Hero: React.FC = () => {
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchHeroBg = async () => {
      try {
        const res = await fetch('/api/hero-bg');
        const data = await res.json();
        if (data.heroBg) setHeroBg(data.heroBg);
      } catch (e) {
        console.error("Error fetching hero bg:", e);
      }
    };
    
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data) setSettings(data);
      } catch (e) {
        console.error("Error fetching settings:", e);
      }
    };

    fetchHeroBg();
    fetchSettings();
    window.addEventListener('hero-bg-updated', fetchHeroBg);
    window.addEventListener('settings-updated', fetchSettings);
    return () => {
      window.removeEventListener('hero-bg-updated', fetchHeroBg);
      window.removeEventListener('settings-updated', fetchSettings);
    };
  }, []);

  return (
    <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: [1.1, 1.05, 1.1] }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBg || "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?q=80&w=2071&auto=format&fit=crop"} 
          alt="Gosht Burger Batman Premium Gurme Burger ve Steak Deneyimi" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/40 to-stone-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="h-[1px] w-8 bg-brand-red/50"></div>
            <span className="text-brand-red tracking-[0.4em] text-xs md:text-sm uppercase font-semibold">
              {settings?.heroSubtitle || 'Premium Gastronomi Deneyimi'}
            </span>
            <div className="h-[1px] w-8 bg-brand-red/50"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl md:text-8xl lg:text-9xl text-white font-serif mb-8 leading-[0.9] tracking-tighter"
          >
            {settings?.heroTitle ? (
              <div className="whitespace-pre-wrap premium-gradient-text">{settings.heroTitle}</div>
            ) : (
              <>
                <span className="block premium-gradient-text">Ateşin</span>
                <span className="block italic gold-gradient-text ml-4 md:ml-12">Sanata</span>
                <span className="block premium-gradient-text">Dönüşümü</span>
              </>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-stone-400 max-w-xl mx-auto mb-12 text-base md:text-lg font-light leading-relaxed tracking-wide"
          >
            {settings?.heroSubtitle || "En seçkin etler, ustalıkla hazırlanan reçeteler ve Gosht'un imza lezzetleri. Batman'ın kalbinde gerçek bir gurme serüveni."}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <a 
              href="#menu" 
              className="group relative px-12 py-4 bg-red-900 text-white overflow-hidden transition-all hover:bg-red-800"
            >
              <span className="relative z-10 uppercase tracking-[0.2em] text-sm font-medium">{settings?.heroCtaText || 'Menüyü Keşfet'}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            
            <a 
              href="#about" 
              className="group flex items-center gap-3 text-stone-300 hover:text-white transition-colors py-2"
            >
              <span className="uppercase tracking-[0.2em] text-sm font-medium border-b border-stone-700 group-hover:border-white transition-all">Hikayemiz</span>
              <Sparkles size={16} className="text-brand-red animate-pulse" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
