import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
    ? settings.aboutFeatures.split('\n').filter((f) => f.trim() !== '')
    : [
        'Daily Fresh Beef – Her gün taze çekilen dana döş',
        'Özel GOSHT Sosları – Trüf, barbekü ve özel acı soslar',
        'Premium Sunum & Packaging',
        'Hızlı, sıcak ve güvenilir servis',
        'Hijyen ve kalite odaklı mutfak standartları',
      ];

  return (
    <section
      id="about"
      className="relative overflow-hidden scroll-mt-28 bg-stone-900 py-32"
    >
      <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-red-900/5 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/2 rounded-full bg-gold/5 blur-[100px]"></div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col items-center gap-20 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 w-full lg:order-1 lg:w-1/2"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-brand-red text-xs font-bold uppercase tracking-[0.5em]">
                {settings?.aboutLabel || 'Mirasımız'}
              </span>
              <div className="h-[1px] w-8 bg-brand-red/30"></div>
            </div>

            <h2 className="premium-gradient-text mb-8 text-5xl leading-tight text-white md:text-6xl font-serif">
              {settings?.aboutTitle || "Batman'ın En İştah Açıcı Sokaklarından..."}
            </h2>

            <div className="space-y-8 text-base font-light leading-relaxed tracking-wide text-stone-400 md:text-lg">
              {settings?.aboutText ? (
                <div className="whitespace-pre-wrap">{settings.aboutText}</div>
              ) : (
                <>
                  <p>
                    Batman’ın en iştah açıcı sokaklarında doğan{' '}
                    <strong className="font-medium text-white">GOSHT BURGER</strong>,
                    gerçek etin, gerçek ateşle buluştuğu bir premium burger markasıdır.
                  </p>
                  <p>
                    Her gün taze çekilen %100 dana döş etimiz, özel formülü bize ait olan
                    GOSHT soslarımız, brioche ekmeklerimiz ve alevde mühürlenen pişirme
                    tekniğimizle misafirlerimize yalnızca bir burger değil; alev alev bir
                    lezzet deneyimi sunuyoruz.
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
                  className="group flex items-start gap-4"
                >
                  <div className="mt-1 rounded-full border border-red-900/30 bg-red-900/20 p-1 transition-colors group-hover:bg-red-900/40">
                    <CheckCircle2 className="shrink-0 text-red-500" size={14} />
                  </div>
                  <span className="font-light tracking-wide text-stone-300 transition-colors group-hover:text-white">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 rounded-r-xl border-l-2 border-gold/30 bg-gold/5 p-6">
              <p className="font-serif text-lg italic leading-relaxed text-gold">
                {settings?.aboutQuote || '“Gerçek burgerin ateşini herkese hissettirmek.”'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 w-full lg:order-2 lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-4 rotate-3 rounded-sm border border-gold/20"></div>
              <div className="absolute -inset-4 -rotate-3 rounded-sm border border-red-900/20"></div>

              <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-sm bg-stone-800">
                {settings?.aboutImage1 ? (
                  <img
                    src={settings.aboutImage1}
                    alt="Gosht Burger premium mutfak ve steak deneyimi"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop')] bg-cover bg-center"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
              </div>

              <div className="absolute -bottom-10 -left-10 z-20 hidden h-48 w-48 rounded-sm bg-stone-950 p-3 shadow-2xl md:block">
                <div className="h-full w-full rounded-sm border border-red-900/20 p-2">
                  {settings?.aboutImage2 ? (
                    <img
                      src={settings.aboutImage2}
                      alt="Gosht Burger detay"
                      className="h-full w-full rounded-sm object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-sm bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};