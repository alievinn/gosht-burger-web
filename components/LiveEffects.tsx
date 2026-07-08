import React, { useMemo } from 'react';
import { SiteSettings } from '../types';
import { motion } from 'motion/react';

interface LiveEffectsProps {
  settings: SiteSettings | null;
}

export const LiveEffects: React.FC<LiveEffectsProps> = ({ settings }) => {
  const marqueeText = (settings?.marqueeText || '').trim();
  const marqueeEnabled = !!settings?.marqueeEnabled && marqueeText.length > 0;
  const effectEnabled = !!settings?.effectEnabled;

  const emojis = useMemo(() => {
    const raw = (settings?.effectEmojis || '🍔 🍟 🔥').trim();
    const list = raw.split(/\s+/).filter(Boolean);
    return list.length > 0 ? list : ['🍔'];
  }, [settings?.effectEmojis]);

  const density = Math.min(30, Math.max(4, Number(settings?.effectDensity) || 10));

  const particles = useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 100,
      size: 16 + Math.random() * 22,
      duration: 14 + Math.random() * 14,
      delay: Math.random() * 14,
      sway: 20 + Math.random() * 40,
      opacity: 0.12 + Math.random() * 0.18
    }));
  }, [density, emojis]);

  if (!marqueeEnabled && !effectEnabled) return null;

  const repeated = Array.from({ length: 8 }, () => marqueeText);

  return (
    <>
      {effectEnabled && (
        <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: '110vh' }}
              animate={{ y: '-15vh', x: [0, p.sway, -p.sway, 0] }}
              transition={{
                y: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' },
                x: { duration: p.duration / 2, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="absolute"
              style={{ left: `${p.left}%`, fontSize: p.size, opacity: p.opacity }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </div>
      )}

      {marqueeEnabled && (
        <div className="fixed top-0 left-0 w-full z-[35] h-8 bg-red-900/95 backdrop-blur-md border-b border-white/10 overflow-hidden shadow-2xl">
          <motion.div
            className="flex items-center whitespace-nowrap h-8"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {[...repeated, ...repeated].map((t, i) => (
              <span
                key={i}
                className="mx-6 text-[11px] uppercase tracking-[0.3em] font-bold text-white flex items-center"
              >
                {t}
                <span className="ml-12 text-gold">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      )}
    </>
  );
};
