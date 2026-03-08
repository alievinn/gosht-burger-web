
import React, { useEffect, useState } from 'react';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface MenuSectionProps {
  onAddToCart: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart }) => {
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const loadItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      if (data) {
        setItems(data);
      } else {
        setItems(MENU_ITEMS);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      setItems(MENU_ITEMS);
    }
  };

  useEffect(() => {
    loadItems();
    window.addEventListener('menu-updated', loadItems);
    return () => window.removeEventListener('menu-updated', loadItems);
  }, []);

  const handleAddClick = (item: MenuItem) => {
    const variantId = selectedVariants[item.id];
    const success = onAddToCart(item.name, 1, undefined, variantId);
    if (success) {
      setAddedItems(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [item.id]: false }));
      }, 2000);
    }
  };

  return (
    <section id="menu" className="py-32 bg-stone-950 relative scroll-mt-28 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <span className="text-brand-red tracking-[0.5em] text-xs uppercase font-bold mb-4 block">Gastronomi Seçkisi</span>
            <h2 className="text-5xl md:text-6xl text-white font-serif mb-6 premium-gradient-text">GOSHT MENÜ</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-stone-800"></div>
              <Star size={14} className="text-brand-red fill-brand-red" />
              <div className="h-[1px] w-12 bg-stone-800"></div>
            </div>
            <p className="text-stone-400 max-w-2xl mx-auto text-base font-light leading-relaxed tracking-wide">
              Alevde mühürlenen %100 dana döş etinin, imza "Közmix" ve tereyağlı brioche ekmekle buluştuğu eşsiz bir gurme serüveni.
            </p>
          </motion.div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col h-full glass-card p-4 hover:border-red-900/30 transition-all duration-500"
            >
              <div className="relative overflow-hidden rounded-3xl mb-8 aspect-[4/3] shrink-0">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-950 flex flex-col items-center justify-center">
                    <div className="text-2xl font-serif tracking-[0.2em] text-stone-800">GOSHT</div>
                  </div>
                )}
                
                {item.isSignature && (
                  <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-md text-gold text-[10px] px-4 py-1.5 uppercase tracking-[0.2em] font-bold border border-gold/20 z-10 rounded-full">
                    İmza Lezzet
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity"></div>
              </div>
              
              <div className="px-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl text-white font-serif tracking-tight group-hover:text-brand-red transition-colors duration-300">{item.name}</h3>
                </div>
                
                <p className="text-stone-500 text-sm leading-relaxed mb-8 font-light tracking-wide line-clamp-3 min-h-[4.5rem]">{item.description}</p>
                
                <div className="mt-auto pb-4 flex flex-col gap-6">
                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [item.id]: v.id }))}
                          className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all duration-300 rounded-full ${
                            selectedVariants[item.id] === v.id
                              ? 'bg-red-900 border-red-800 text-white shadow-lg shadow-red-900/20'
                              : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-2xl text-white font-serif font-medium">
                      {item.variants && item.variants.length > 0 
                        ? (item.variants.find(v => v.id === selectedVariants[item.id])?.price || item.price) 
                        : item.price} <span className="text-sm text-stone-500 ml-1">TL</span>
                    </span>
                    
                    <button 
                      onClick={() => handleAddClick(item)}
                      disabled={item.variants && item.variants.length > 0 && !selectedVariants[item.id]}
                      className={`relative group/btn flex items-center gap-3 px-6 py-3 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-500 overflow-hidden ${
                        addedItems[item.id] 
                          ? 'bg-emerald-900 text-white border-emerald-800' 
                          : item.variants && item.variants.length > 0 && !selectedVariants[item.id]
                            ? 'bg-stone-900 text-stone-700 border border-stone-800 cursor-not-allowed'
                            : 'bg-white text-stone-950 hover:bg-red-900 hover:text-white border border-white'
                      }`}
                    >
                      <ShoppingBag size={14} className={addedItems[item.id] ? 'animate-bounce' : ''} />
                      <span className="relative z-10">
                        {addedItems[item.id] 
                          ? 'Eklendi' 
                          : item.variants && item.variants.length > 0 && !selectedVariants[item.id]
                            ? 'Seçim Yapın'
                            : 'Sepete Ekle'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
