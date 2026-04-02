import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { Branch } from '../types';

interface BranchesProps {
  branches: Branch[];
}

export const Branches: React.FC<BranchesProps> = ({ branches }) => {
  if (branches.length === 0) return null;

  return (
    <section id="branches" className="py-24 bg-stone-950 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-900/5 rounded-full blur-[120px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-brand-red tracking-[0.5em] text-xs uppercase font-bold">Bizi Ziyaret Edin</span>
          <h2 className="text-5xl text-white font-serif mt-4 mb-6 premium-gradient-text">Şubelerimiz</h2>
          <p className="text-stone-400 font-light max-w-xl mx-auto">Gosht Burger lezzetini yakınınızdaki şubemizden deneyimleyin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.filter(b => b.isActive).map((branch, idx) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-stone-900 border border-white/5 rounded-2xl p-8 hover:border-red-900/30 transition-all group"
            >
              <h3 className="text-white font-serif text-2xl mb-6 group-hover:text-red-500 transition-colors">{branch.name}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-red-600 mt-1 shrink-0" />
                  <p className="text-stone-400 text-sm font-light leading-relaxed">{branch.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-red-600 shrink-0" />
                  <a href={`tel:${branch.phone}`} className="text-stone-400 text-sm font-light hover:text-white transition-colors">{branch.phone}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-red-600 shrink-0" />
                  <p className="text-stone-400 text-sm font-light">{branch.hours}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};