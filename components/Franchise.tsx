import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Users, BookOpen, ArrowRight, Star } from 'lucide-react';
import { SiteSettings } from '../types';
import { motion } from 'motion/react';

interface FranchiseProps {
  onOpenFranchise: () => void;
}

export const Franchise: React.FC<FranchiseProps> = ({ onOpenFranchise }) => {
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

  const steps = [
    { id: 1, title: "Başvuru Formu", desc: "Web sitemiz üzerinden ön başvuru." },
    { id: 2, title: "Ön Değerlendirme", desc: "Marka kriterlerine uygunluk görüşmesi." },
    { id: 3, title: "Lokasyon & Sözleşme", desc: "Yer analizi ve resmi süreçlerin tamamlanması." },
    { id: 4, title: "Eğitim & Açılış", desc: "Personel eğitimi ve büyük açılış." }
  ];

  return (
    <section id="franchise" className="py-32 bg-stone-950 relative scroll-mt-28 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-red tracking-[0.5em] text-xs uppercase font-bold mb-4 block">
              {settings?.franchiseLabel || 'İş Ortaklığı'}
            </span>
            <h2 className="text-5xl md:text-6xl text-white font-serif mb-8 gold-gradient-text">
              {settings?.franchiseTitle || 'Franchise'}
            </h2>
            <p className="text-xl text-stone-300 font-serif italic max-w-3xl mx-auto mb-8">
              {settings?.franchiseQuote || '"Güçlü Bir Marka. Lezzet Odaklı Bir Yatırım."'}
            </p>
            <div className="text-stone-500 max-w-2xl mx-auto text-base font-light leading-relaxed tracking-wide">
              {settings?.franchiseText ? (
                <div className="whitespace-pre-wrap">{settings.franchiseText}</div>
              ) : (
                <p>
                  Gosht Burger; dinamik kimliği, yüksek müşteri memnuniyeti ve istikrarlı büyüme potansiyeliyle 
                  yatırımcılara sürdürülebilir bir iş modeli sunar.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Why Us */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 lg:p-16 border-white/5"
          >
            <div className="flex items-center gap-4 mb-12">
              <Star size={16} className="text-brand-red fill-brand-red" />
              <h3 className="text-3xl text-white font-serif tracking-tight">
                {settings?.franchiseWhyTitle || 'Neden Gosht Burger?'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-950/30 rounded-xl flex items-center justify-center border border-red-900/20">
                  <ShieldCheck className="text-red-500" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2 tracking-wide">Tanınabilir Marka</h4>
                  <p className="text-stone-500 text-sm font-light leading-relaxed">Güçlü ve karakter sahibi bir marka kimliği.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-950/30 rounded-xl flex items-center justify-center border border-red-900/20">
                  <TrendingUp className="text-red-500" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2 tracking-wide">Standart Süreçler</h4>
                  <p className="text-stone-500 text-sm font-light leading-relaxed">Üretimden servise optimize edilmiş işleyiş.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-950/30 rounded-xl flex items-center justify-center border border-red-900/20">
                  <BookOpen className="text-red-500" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2 tracking-wide">Tam Destek</h4>
                  <p className="text-stone-500 text-sm font-light leading-relaxed">Eğitim, tedarik zinciri ve pazarlama desteği.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-950/30 rounded-xl flex items-center justify-center border border-red-900/20">
                  <Users className="text-red-500" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2 tracking-wide">Sadık Müşteri</h4>
                  <p className="text-stone-500 text-sm font-light leading-relaxed">Genç ve sürekli genişleyen bir müşteri tabanı.</p>
                </div>
              </div>
            </div>
            
            {settings?.franchiseImage && (
              <div className="mt-12 rounded-3xl overflow-hidden border border-white/5">
                <img src={settings.franchiseImage} alt="Franchise" className="w-full h-48 object-cover" />
              </div>
            )}
          </motion.div>

          {/* Process */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
             <h3 className="text-3xl text-white font-serif mb-12 tracking-tight">Başvuru Süreci</h3>
             <div className="space-y-8">
               {steps.map((step, index) => (
                 <div key={step.id} className="relative flex items-start gap-8 group">
                   <span className="text-6xl font-serif text-stone-900 font-bold leading-none group-hover:text-red-900/30 transition-colors duration-500">
                     0{step.id}
                   </span>
                   <div className="pt-2">
                     <h4 className="text-white text-lg font-medium mb-2 tracking-wide group-hover:text-brand-red transition-colors">{step.title}</h4>
                     <p className="text-stone-500 text-sm font-light leading-relaxed tracking-wide">{step.desc}</p>
                   </div>
                   {index !== steps.length - 1 && (
                     <div className="absolute left-8 top-16 w-[1px] h-12 bg-stone-900"></div>
                   )}
                 </div>
               ))}
             </div>

             <div className="mt-16">
               <button 
                 onClick={onOpenFranchise}
                 className="group relative px-12 py-5 bg-white text-stone-950 overflow-hidden transition-all hover:bg-red-900 hover:text-white flex items-center justify-center gap-4 w-full md:w-auto"
               >
                 <span className="relative z-10 uppercase tracking-[0.2em] text-xs font-bold">Başvuru Yapın</span>
                 <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                 <div className="absolute inset-0 bg-red-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
               </button>
               <p className="mt-6 text-stone-600 text-[10px] uppercase tracking-[0.3em] font-medium">Lezzet odaklı bir yatırım için bizimle iletişime geçin</p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
