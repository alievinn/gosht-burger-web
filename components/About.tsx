import React, { useState, useEffect } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { SiteSettings } from '../types';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'siteConfig');
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as SiteSettings);
        }
      },
      (error) => {
        console.error('Error fetching about settings from Firestore:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const features = settings?.aboutFeatures 
    ? settings.aboutFeatures.split('').filter(f => f.trim() !== '')
    : [
        "Daily Fresh Beef – Her gün taze çekilen dana döş",
        "Özel GOSHT Sosları – Trüf, barbekü ve özel acı soslar",
        "Premium Sunum & Packaging",
        "Hızlı, sıcak ve güvenilir servis",
        "Hijyen ve kalite odaklı mutfak standartları"
      ];

  return <section id="about" className="py-32 bg-stone-900 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-red tracking-[0.5em] text-xs uppercase font-bold">{settings?.aboutLabel || 'Mirasımız'}</span>
              <div className="h-[1px] w-8 bg-brand-red/30"></div>
            </div>
            <h2 className="text-5xl md:text-6xl text-white font-serif mb-8 leading-tight premium-gradient-text">{settings?.aboutTitle || "Batman'ın En İştah Açıcı Sokaklarından..."}</h2>
            <div className="space-y-8 text-stone-400 text-base md:text-lg leading-relaxed font-light tracking-wide">
              {settings?.aboutText ? <div className="whitespace-pre-wrap">{settings.aboutText}</div> : <><p>Batman’ın en iştah açıcı sokaklarında doğan <strong className="text-white font-medium">GOSHT BURGER</strong>, gerçek etin, gerçek ateşle buluştuğu bir premium burger markasıdır.</p><p>Her gün taze çekilen %100 dana döş etimiz, özel formülü bize ait olan GOSHT soslarımız, brioche ekmeklerimiz ve alevde mühürlenen pişirme tekniğimizle misafirlerimize yalnızca bir burger değil; alev alev bir lezzet deneyimi sunuyoruz.</p></>}
            </div>
            <div className="mt-12 grid grid-cols-1 gap-5">
              {features.map((feature, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 rounded-full bg-red-900/20 border border-red-900/30 group-hover:bg-red-900/40 transition-colors"><CheckCircle2 className="text-red-500 shrink-0" size={14} /></div>
                  <span className="text-stone-300 font-light tracking-wide group-hover:text-white transition-colors">{feature}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 p-6 border-l-2 border-gold/30 bg-gold/5 rounded-r-xl">
              <p className="text-gold italic text-lg font-serif leading-relaxed">{settings?.aboutQuote || '“Gerçek burgerin ateşini herkese hissettirmek.”'}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 border border-gold/20 rounded-sm transform rotate-3"></div>
              <div className="absolute -inset-4 border border-red-900/20 rounded-sm transform -rotate-3"></div>
              <div className="aspect-[4/5] relative z-10 overflow-hidden bg-stone-800 rounded-sm">
                {settings?.aboutImage1 ? <img src={settings.aboutImage1} alt="Gosht Burger premium mutfak ve steak deneyimi" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop')] bg-cover bg-center"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
              </div>
              <div className="absolute -bottom-10 -left-10 z-20 w-48 h-48 bg-stone-950 p-3 rounded-sm shadow-2xl hidden md:block">
                <div className="w-full h-full border border-red-900/20 p-2 rounded-sm">
                  {settings?.aboutImage2 ? <img src={settings.aboutImage2} alt="Gosht Burger detay" className="w-full h-full object-cover rounded-sm" /> : <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center rounded-sm"></div>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
