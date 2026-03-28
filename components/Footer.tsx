import React, { useState, useEffect } from 'react';
import {
  Instagram,
  MapPin,
  Phone,
  MessageCircle,
  Music,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Logo } from './Logo';
import { SiteSettings } from '../types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
        console.error('Error fetching settings from Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'messages'), {
        ...formState,
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
        isRead: false,
      });

      setSubmitStatus('success');
      setFormState({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (e) {
      console.error('Error sending message to Firestore:', e);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { label: 'Ana Sayfa', href: '#home' },
    { label: 'GOSHT MENÜ', href: '#menu' },
    { label: 'Hakkımızda', href: '#about' },
    { label: 'Franchise', href: '#franchise' },
  ];

  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-white/5 bg-stone-950 py-24 text-stone-400"
    >
      <div className="absolute bottom-0 left-1/2 h-[500px] w-full -translate-x-1/2 rounded-full bg-red-900/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-10 lg:col-span-4">
            <Logo size="lg" />

            <p className="max-w-md text-base font-light leading-relaxed tracking-wide text-stone-500">
              {settings?.footerDescription ||
                "Batman'ın kalbinde, gerçek burger tutkusuyla doğduk. Her ısırıkta kaliteyi ve zanaatı hissettirmek için buradayız."}
            </p>

            <div className="flex space-x-6">
              <a
                href={settings?.instagramUrl || 'https://www.instagram.com/goshtburger'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#E4405F] text-white shadow-lg shadow-[#E4405F]/20 transition-all duration-500"
                aria-label="Instagram"
              >
                <Instagram size={20} className="transition-transform group-hover:scale-110" />
              </a>

              <a
                href={settings?.tiktokUrl || 'https://www.tiktok.com/@goshtburger'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-950 shadow-lg shadow-white/10 transition-all duration-500"
                aria-label="TikTok"
              >
                <Music size={20} className="transition-transform group-hover:scale-110" />
              </a>

              <a
                href={
                  settings?.whatsappNumber
                    ? `https://wa.me/${settings.whatsappNumber}`
                    : 'https://wa.me/905078641672'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 transition-all duration-500"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} className="transition-transform group-hover:scale-110" />
              </a>
            </div>

            <div className="space-y-6 pt-6">
              <div className="group flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-red-900/20">
                  <MapPin size={18} className="text-red-700" />
                </div>
                <span className="whitespace-pre-wrap pt-1 text-sm font-light leading-relaxed text-stone-400">
                  {settings?.contactAddress || 'Gap Mah. Cafeler Cd.\nMerkez, Batman'}
                </span>
              </div>

              <div className="group flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-red-900/20">
                  <Phone size={18} className="text-red-700" />
                </div>
                <a
                  href={`tel:${settings?.contactPhone || '+905078641672'}`}
                  className="text-sm font-light text-stone-400 transition-colors hover:text-white"
                >
                  {settings?.contactPhone || '0507 864 16 72'}
                </a>
              </div>

              <div className="group flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-red-900/20">
                  <Mail size={18} className="text-red-700" />
                </div>
                <a
                  href={`mailto:${settings?.contactEmail || 'info@goshtburger.com'}`}
                  className="text-sm font-light text-stone-400 transition-colors hover:text-white"
                >
                  {settings?.contactEmail || 'info@goshtburger.com'}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-5">
            <h4 className="font-serif text-xl tracking-tight text-white">Bize Yazın</h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Adınız"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none transition-all placeholder:text-stone-600 focus:border-brand-red"
                />

                <input
                  type="email"
                  placeholder="E-posta"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none transition-all placeholder:text-stone-600 focus:border-brand-red"
                />
              </div>

              <input
                type="text"
                placeholder="Konu"
                required
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none transition-all placeholder:text-stone-600 focus:border-brand-red"
              />

              <textarea
                placeholder="Mesajınız"
                required
                rows={4}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none transition-all placeholder:text-stone-600 focus:border-brand-red"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl transition-all duration-300 ${
                  submitStatus === 'success'
                    ? 'bg-emerald-600 text-white'
                    : submitStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-brand-red text-white hover:bg-brand-light'
                }`}
              >
                {isSubmitting
                  ? 'Gönderiliyor...'
                  : submitStatus === 'success'
                  ? 'Gönderildi!'
                  : submitStatus === 'error'
                  ? 'Hata Oluştu'
                  : 'Mesaj Gönder'}
                <ArrowUpRight size={14} />
              </button>
            </form>
          </div>

          <div className="space-y-8 lg:col-span-3">
            <h4 className="font-serif text-xl tracking-tight text-white">Hızlı Menü</h4>

            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-stone-500 transition-colors hover:text-brand-red"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="-translate-y-1 opacity-0 transition-all group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-10 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-600 md:flex-row">
          <p>{settings?.footerCopyright || '© 2024 GOSHT BURGER. CRAFTED WITH PASSION.'}</p>
        </div>
      </div>
    </footer>
  );
};