import React, { useState, useEffect, useRef } from 'react';
import { HeroSlider } from './HeroSlider';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { SiteSettings } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ShoppingBag, ChevronDown } from 'lucide-react';

const FACTS = [
  { num: '%100', label: 'Dana Döş' },
  { num: 'Günlük', label: 'Taze Hazırlık' },
  { num: 'Özel', label: 'İmza Soslar' },
];

export const Hero: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'siteConfig'), snap => {
      if (snap.exists()) setSettings(snap.data() as SiteSettings);
    });
  }, []);

  const anim = shouldReduceMotion
    ? { initial: {}, animate: {}, transition: {} }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } };

  return (
    <>
      <section ref={ref} id="home" className="relative h-screen w-full flex items-end pb-24 md:items-center md:pb-0 justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <HeroSlider />
        </motion.div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent md:bg-gradient-to-r md:from-stone-950/90 md:via-stone-950/40 md:to-transparent" />
        <motion.div style={{ opacity }} className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <motion.div {...anim} transition={{ ...anim.transition, delay: 0.1 }} className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-red-600" />
              <span className="text-red-500 text-[11px] uppercase tracking-[0.35em] font-bold">
                {settings?.heroSubtitle || 'Batman • Türkiye'}
              </span>
            </motion.div>
            <motion.h1
              {...anim}
              transition={{ ...anim.transition, delay: 0.25 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[0.9] tracking-tighter mb-6"
            >
              {settings?.heroTitle ? (
                <span className="block text-white whitespace-pre-wrap">{settings.heroTitle}</span>
              ) : (
                <>
                  <span className="block text-white">Gerçek</span>
                  <span className="block italic text-red-500">Burgerin</span>
                  <span className="block text-white">Adı: GOSHT</span>
                </>
              )}
            </motion.h1>
            <motion.p
              {...anim}
              transition={{ ...anim.transition, delay: 0.4 }}
              className="text-stone-400 text-base md:text-lg font-light leading-relaxed mb-10 max-w-lg"
            >
              {settings?.heroDescription || "%100 dana döş, günlük taze hazırlık, özel imza soslar. Batman'da lezzeti yeniden tanımlıyoruz."}
            </motion.p>
            <motion.div {...anim} transition={{ ...anim.transition, delay: 0.55 }} className="flex flex-wrap gap-3 mb-10">
              {FACTS.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <span className="text-red-400 font-bold text-sm">{f.num}</span>
                  <span className="text-stone-300 text-xs">{f.label}</span>
                </div>
              ))}
            </motion.div>
            <motion.div {...anim} transition={{ ...anim.transition, delay: 0.7 }} className="flex flex-col sm:flex-row gap-4">
              <a href="#menu" className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-red-900 text-white overflow-hidden transition-all hover:bg-red-800 active:scale-95">
                <ShoppingBag size={16} />
                <span className="uppercase tracking-[0.2em] text-sm font-bold">{settings?.heroCtaText || 'Menüyü Keşfet'}</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <a href="#about" className="inline-flex items-center justify-center px-10 py-4 border border-white/20 text-stone-300 hover:border-white/50 hover:text-white transition-all text-sm uppercase tracking-[0.2em] font-medium">
                Hikayemiz
              </a>
            </motion.div>
          </div>
        </motion.div>
        {!shouldReduceMotion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown size={20} className="text-stone-500" />
            </motion.div>
          </motion.div>
        )}
      </section>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-white text-sm font-bold">Sipariş Ver</p>
          <p className="text-stone-500 text-[10px]">Hızlı teslimat · Batman</p>
        </div>
        <a href="#menu" className="bg-red-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-800 transition-colors active:scale-95 rounded-sm">
          Menüye Git
        </a>
      </div>
    </>
  );
};
