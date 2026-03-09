import React from 'react';
import logoImg from '../logo.png';
interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  const [customLogo, setCustomLogo] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/api/logo');
        const data = await response.json();
        setCustomLogo(data.logo);
      } catch (error) {
        console.error("Error loading logo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogo();
    
    window.addEventListener('logo-updated', loadLogo);
    return () => window.removeEventListener('logo-updated', loadLogo);
  }, []);

  const sizes = {
    sm: { container: 'h-16', text: 'text-3xl', burgerText: 'text-[9px]', bun: 'w-18', gap: 'my-0', img: 'h-14' },
    md: { container: 'h-28', text: 'text-6xl', burgerText: 'text-[14px]', bun: 'w-32', gap: 'my-0', img: 'h-24' },
    lg: { container: 'h-44', text: 'text-9xl', burgerText: 'text-[24px]', bun: 'w-60', gap: 'my-0', img: 'h-40' },
  };

  const currentSize = sizes[size];

  if (isLoading) {
    return <div className={`${currentSize.container} ${className} w-32 animate-pulse bg-white/5 rounded-xl`}></div>;
  }

  if (customLogo) {
    return (
      <div className={`flex items-center ${className} ${currentSize.container} drop-shadow-2xl`}>
        <img src={customLogo} alt="Gosht Logo" className={`${currentSize.img} w-auto object-contain`} />
      </div>
    );
  }

  return (
  <div className={`flex items-center ${className} drop-shadow-2xl`}>
    <img src={logoImg} alt="Gosht Logo" className={`${currentSize.img} w-auto object-contain`} />
  </div>
);
