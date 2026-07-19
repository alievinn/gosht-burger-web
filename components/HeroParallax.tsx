import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const BURGER_IMGS = [
  { src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80', alt: 'burger' },
  { src: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&q=80', alt: 'burger' },
  { src: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&q=80', alt: 'burger' },
  { src: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&q=80', alt: 'burger' },
  { src: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=180&q=80', alt: 'steak' },
  { src: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=180&q=80', alt: 'fries' },
];

function gen() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    ...BURGER_IMGS[i % BURGER_IMGS.length],
    x: 5 + (i * 13) % 90,
    y: 5 + (i * 17) % 85,
    size: 80 + (i % 3) * 30,
    depth: 0.05 + (i % 4) * 0.07,
    rotate: -15 + (i % 5) * 8,
    duration: 8 + (i % 4) * 3,
  }));
}

export const HeroParallax: React.FC = () => {
  const items = useRef(gen()).current;
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      setMouse({ x: (e.clientX - cx) / cx, y: (e.clientY - cy) / cy });
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%`, width: item.size, height: item.size }}
          animate={{ y: [0, -18, 0, 10, 0], rotate: [item.rotate, item.rotate + 6, item.rotate - 4, item.rotate] }}
          transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{
            transform: `translate(${mouse.x * item.depth * 60}px, ${mouse.y * item.depth * 40}px) perspective(800px) rotateX(${mouse.y * item.depth * 12}deg) rotateY(${mouse.x * item.depth * 12}deg)`,
            transition: 'transform 0.3s ease-out',
          }}>
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
              style={{ opacity: 0.15 + item.id * 0.015, filter: 'saturate(1.3) brightness(0.8)' }}
              draggable={false}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
