
import React, { useState, useEffect } from 'react';
import { Instagram, MapPin, Phone, MessageCircle, Music, Lock, Mail, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { SiteSettings } from '../types';
import { motion } from 'motion/react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          id: Date.now().toString(),
          timestamp: Date.now()
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormState({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (e) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="bg-stone-950 text-stone-400 py-24 border-t border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-900/5 blur-[120px] rounded-full"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <Logo size="lg" />
            <p className="leading-relaxed text-base text-stone-500 font-light max-w-md tracking-wide">
              {settings?.footerDescription || "Batman'ın kalbinde, gerçek burger tutkusuyla doğduk. Her ısırıkta kaliteyi ve zanaatı hissettirmek için buradayız."}
            </p>
            <div className="flex space-x-6">
              <a 
                href={settings?.instagramUrl || "https://www.instagram.com/goshtburger"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-[#E4405F] text-white rounded-full flex items-center justify-center transition-all duration-500 group shadow-lg shadow-[#E4405F]/20"
                aria-label="Instagram"
              >
                <Instagram size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href={settings?.tiktokUrl || "https://www.tiktok.com/@goshtburger"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-white text-stone-950 rounded-full flex items-center justify-center transition-all duration-500 group shadow-lg shadow-white/10"
                aria-label="TikTok"
              >
                <Music size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : "https://wa.me/905078641672"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center transition-all duration-500 group shadow-lg shadow-[#25D366]/20"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>

            <div className="space-y-6 pt-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-900/20 transition-colors">
                  <MapPin size={18} className="text-red-700" />
                </div>
                <span className="text-stone-400 text-sm font-light leading-relaxed whitespace-pre-wrap pt-1">
                  {settings?.contactAddress || "Gap Mah. Cafeler Cd.\nMerkez, Batman"}
                </span>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-900/20 transition-colors">
                  <Phone size={18} className="text-red-700" />
                </div>
                <a href={`tel:${settings?.contactPhone || "+905078641672"}`} className="text-stone-400 text-sm font-light hover:text-white transition-colors">
                  {settings?.contactPhone || "0507 864 16 72"}
                </a>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-900/20 transition-colors">
                  <Mail size={18} className="text-red-700" />
                </div>
                <a href={`mailto:${settings?.contactEmail || "info@goshtburger.com"}`} className="text-stone-400 text-sm font-light hover:text-white transition-colors">
                  {settings?.contactEmail || "info@goshtburger.com"}
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-white font-serif text-xl tracking-tight">Bize Yazın</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Adınız" 
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-brand-red outline-none transition-all placeholder:text-stone-600 text-sm"
                />
                <input 
                  type="email" 
                  placeholder="E-posta" 
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-brand-red outline-none transition-all placeholder:text-stone-600 text-sm"
                />
              </div>
              <input 
                type="text" 
                placeholder="Konu" 
                required
                value={formState.subject}
                onChange={(e) => setFormState({...formState, subject: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-brand-red outline-none transition-all placeholder:text-stone-600 text-sm"
              />
              <textarea 
                placeholder="Mesajınız" 
                required
                rows={4}
                value={formState.message}
                onChange={(e) => setFormState({...formState, message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-brand-red outline-none transition-all placeholder:text-stone-600 text-sm resize-none"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
                  submitStatus === 'success' 
                    ? 'bg-emerald-600 text-white' 
                    : submitStatus === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-brand-red text-white hover:bg-brand-light'
                }`}
              >
                {isSubmitting ? 'Gönderiliyor...' : submitStatus === 'success' ? 'Gönderildi!' : submitStatus === 'error' ? 'Hata Oluştu' : 'Mesaj Gönder'}
                <ArrowUpRight size={14} />
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-white font-serif text-xl tracking-tight">Hızlı Menü</h4>
            <ul className="space-y-4">
              {['Ana Sayfa', 'GOSHT MENÜ', 'Hakkımızda', 'Franchise'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase().replace(' ', '')}`} 
                    className="text-stone-500 hover:text-brand-red transition-colors text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2 group"
                  >
                    {item}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.3em] font-medium text-stone-600">
          <p>{settings?.footerCopyright || "© 2024 Gosht Burger. Crafted with Passion."}</p>
          <div className="flex items-center gap-8">
            <button onClick={onOpenAdmin} className="opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2 group">
              <Lock size={12} className="group-hover:text-gold" />
              <span>Yönetim</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
