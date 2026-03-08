import React, { useState, useEffect } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { SiteSettings } from '../types';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data) setSettings(data);
      } catch (e) {
        console.error("Error fetching settings:", e);
      }
    };
    fetchSettings();
    window.addEventListener('settings-updated', fetchSettings);
    return () => window.removeEventListener('settings-updated', fetchSettings);
  }, []);

  const features = settings?.aboutFeatures 
    ? settings.aboutFeatures.split('\n').filter(f => f.trim() !== '')
    : [
        "Daily Fresh Beef – Her gün taze çekilen dana döş",
        "Özel GOSHT Sosları – Trüf, barbekü ve özel acı soslar",
        "Premium Sunum & Packaging",
        "Hızlı, sıcak ve güvenilir servis",
        "Hijyen ve kalite odaklı mutfak standartları"
      ];

  return (
    <section id="about" className="py-32 bg-stone-900 relative overflow-hidden scroll-mt-28">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-red tracking-[0.5em] text-xs uppercase font-bold">
                {settings?.aboutLabel || 'Mirasımız'}
              </span>
              <div className="h-[1px] w-8 bg-brand-red/30"></div>
            </div>
            
            <h2 className="text-5xl md:text-6xl text-white font-serif mb-8 leading-tight premium-gradient-text">
              {settings?.aboutTitle || "Batman'ın En İştah Açıcı Sokaklarından..."}
            </h2>
            
            <div className="space-y-8 text-stone-400 text-base md:text-lg leading-relaxed font-light tracking-wide">
              {settings?.aboutText ? (
                <div className="whitespace-pre-wrap">{settings.aboutText}</div>
              ) : (
                <>
                  <p>
                    Batman’ın en iştah açıcı sokaklarında doğan <strong className="text-white font-medium">GOSHT BURGER</strong>, 
                    gerçek etin, gerçek ateşle buluştuğu bir premium burger markasıdır.
                  </p>
                  <p>
                    Her gün taze çekilen %100 dana döş etimiz, özel formülü bize ait olan GOSHT soslarımız, 
                    brioche ekmeklerimiz ve alevde mühürlenen pişirme tekniğimizle misafirlerimize yalnızca 
                    bir burger değil; alev alev bir lezzet deneyimi sunuyoruz.
                  </p>
                </>
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="mt-1 p-1 rounded-full bg-red-900/20 border border-red-900/30 group-hover:bg-red-900/40 transition-colors">
                    <CheckCircle2 className="text-red-500 shrink-0" size={14} />
                  </div>
                  <span className="text-stone-300 font-light tracking-wide group-hover:text-white transition-colors">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-12 p-8 glass-card border-l-4 border-red-900"
            >
              <p className="text-white text-xl font-serif italic leading-relaxed">
                {settings?.aboutQuote || '“Gerçek burgerin ateşini herkese hissettirmek.”'}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Star size={12} className="text-brand-red fill-brand-red" />
                <p className="text-brand-red text-[10px] uppercase tracking-[0.3em] font-bold">GOSHT VİZYONU</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Image Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 grid grid-cols-2 gap-6 order-1 lg:order-2"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
              <img 
                src={settings?.aboutImage1 || "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=2071&auto=format&fit=crop"} 
                alt="Gosht Burger Premium Gurme Burger Sunumu" 
                className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent"></div>
            </div>
            <div className="space-y-6 translate-y-12">
              <div className="relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
                <img 
                  src={settings?.aboutImage2 || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop"} 
                  alt="Gosht Burger Batman Restoran Atmosferi" 
                  className="w-full h-[280px] object-cover hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent"></div>
              </div>
              <div className="glass-card p-8 text-center border-red-900/20 hover:border-red-900/40 transition-colors">
                <span className="text-4xl text-brand-red font-serif font-bold block mb-2 tracking-tighter">%100</span>
                <span className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold">Doğal Dana Eti</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
