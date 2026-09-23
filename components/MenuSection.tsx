import React, { useState } from 'react';
import { MenuItem, Category } from '../types';
import { ShoppingBag, Star, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface MenuSectionProps {
  onAddToCart: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean;
  items: MenuItem[];
}

const CATEGORIES = ['Tümü', ...Object.values(Category)] as const;

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart, items }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const shouldReduceMotion = useReducedMotion();

  const visibleItems = items.filter(item => {
    if ((item as any).hidden) return false;
    if (activeCategory === 'Tümü') return true;
    return item.category === activeCategory;
  });

  const handleAdd = (item: MenuItem) => {
    const variantId = selectedVariants[item.id];
    const success = onAddToCart(item.name, 1, undefined, variantId);
    if (success) {
      setAddedItems(p => ({ ...p, [item.id]: true }));
      setTimeout(() => setAddedItems(p => ({ ...p, [item.id]: false })), 1800);
    }
  };

  return (
    <section id="menu" className="py-24 md:py-32 bg-stone-950 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-red-600" />
            <span className="text-red-500 text-[11px] uppercase tracking-[0.35em] font-bold">Menü</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight mb-4">İmza Lezzetler</h2>
          <p className="text-stone-500 text-sm md:text-base font-light max-w-md">Her ürün günlük taze hazırlanır. %100 dana döş, özel soslar, GOSHT kalitesi.</p>
        </div>
        <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2.5 text-[11px] uppercase font-bold tracking-[0.2em] rounded-full border transition-all duration-300 ${
                activeCategory === cat ? 'bg-red-900 border-red-900 text-white shadow-lg shadow-red-900/30' : 'border-white/10 text-stone-400 hover:border-white/30 hover:text-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {visibleItems.map(item => {
              const isSoldOut = (item as any).soldOut;
              const added = addedItems[item.id];
              return (
                <motion.div key={item.id} layout
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  className="group relative bg-stone-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-white/15 hover:shadow-2xl hover:shadow-black/40 transition-all duration-500">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-800">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-60' : ''}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-700"><ShoppingBag size={32} /></div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {item.isSignature && (
                        <span className="flex items-center gap-1 bg-amber-500 text-stone-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                          <Star size={9} fill="currentColor" /> İmza
                        </span>
                      )}
                      {isSoldOut && (
                        <span className="flex items-center gap-1 bg-stone-800/90 backdrop-blur text-stone-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                          <AlertCircle size={9} /> Tükendi
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <span className="text-[9px] text-red-500 uppercase tracking-widest font-bold mb-1">{item.category}</span>
                    <h3 className="text-white font-serif text-xl leading-tight mb-2">{item.name}</h3>
                    <p className="text-stone-500 text-sm font-light leading-relaxed mb-4 flex-1 line-clamp-2">{item.description}</p>
                    {item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.variants.map(v => (
                          <button key={v.id} onClick={() => setSelectedVariants(p => ({ ...p, [item.id]: v.id }))}
                            className={`text-[10px] px-3 py-1 rounded-full border font-medium transition-all ${selectedVariants[item.id] === v.id ? 'bg-red-900 border-red-900 text-white' : 'border-white/10 text-stone-400 hover:border-white/20'}`}>
                            {v.label} · {v.price} TL
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <div>
                        <span className="text-white font-bold text-xl">
                          {item.variants?.length ? (item.variants.find(v => v.id === selectedVariants[item.id])?.price ?? item.price) : item.price}
                        </span>
                        <span className="text-stone-500 text-sm ml-1">TL</span>
                      </div>
                      <button onClick={() => !isSoldOut && handleAdd(item)} disabled={isSoldOut}
                        className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-full transition-all duration-300 ${
                          isSoldOut ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : added ? 'bg-green-700 text-white scale-95' : 'bg-red-900 text-white hover:bg-red-800 active:scale-95'
                        }`}>
                        <ShoppingBag size={13} />
                        {isSoldOut ? 'Tükendi' : added ? 'Eklendi ✓' : 'Sepete Ekle'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {visibleItems.length === 0 && (
          <div className="text-center py-20 text-stone-600">
            <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
            <p>Bu kategoride ürün bulunmuyor.</p>
          </div>
        )}
      </div>
    </section>
  );
};
