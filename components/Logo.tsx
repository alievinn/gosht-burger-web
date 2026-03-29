import React from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface LogoProps { className?: string; size?: 'sm' | 'md' | 'lg'; }

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const [customLogo, setCustomLogo] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'logo'), (snapshot) => {
      if (snapshot.exists()) setCustomLogo((snapshot.data() as any).logo || null);
      else setCustomLogo(null);
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsub();
  }, []);

  const sizes = {
    sm: { container: 'h-16', text: 'text-3xl', burgerText: 'text-[9px]', img: 'h-14' },
    md: { container: 'h-28', text: 'text-6xl', burgerText: 'text-[14px]', img: 'h-24' },
    lg: { container: 'h-44', text: 'text-9xl', burgerText: 'text-[24px]', img: 'h-40' },
  };

  const currentSize = sizes[size];
  if (isLoading) return <div className={`${currentSize.container} ${className} w-32 animate-pulse bg-white/5 rounded-xl`}></div>;

  return <div className={`flex items-center ${className} ${currentSize.container} drop-shadow-2xl`}>{customLogo ? <img src={customLogo} alt="Gosht Logo" className={`${currentSize.img} w-auto object-contain`} /> : <div className="flex flex-col items-center justify-center leading-none"><span className={`${currentSize.text} font-black serif tracking-tighter text-white`}>GOSHT</span><span className={`${currentSize.burgerText} font-bold serif text-red-600 uppercase tracking-[0.3em] mt-1`}>BURGER</span></div>}</div>;
};
