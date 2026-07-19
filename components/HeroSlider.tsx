import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Slide { id: string; url: string; order: number; }
const DEFAULTS = ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=85','https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=1200&q=85','https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&q=85'];

export const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<string[]>(DEFAULTS);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [touch, setTouch] = useState<number|null>(null);
  useEffect(() => {
    const q = query(collection(db,'heroSlides'),orderBy('order','asc'));
    return onSnapshot(q, snap => { const d=snap.docs.map(x=>({id:x.id,...x.data()})) as Slide[]; if(d.length>0) setSlides(d.map(s=>s.url)); });
  },[]);
  const go = useCallback((d:number) => { setDir(d); setIndex(i=>(i+d+slides.length)%slides.length); },[slides.length]);
  useEffect(() => { if(slides.length<=1)return; const t=setInterval(()=>go(1),5000); return ()=>clearInterval(t); },[slides.length,go]);
  const vars = { enter:(d:number)=>({x:d>0?'100%':'-100%',opacity:0}), center:{x:0,opacity:1}, exit:(d:number)=>({x:d>0?'-100%':'100%',opacity:0}) };
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.div key={index} custom={dir} variants={vars} initial="enter" animate="center" exit="exit"
          transition={{duration:0.65,ease:[0.32,0,0.67,0]}} className="absolute inset-0"
          onTouchStart={e=>setTouch(e.touches[0].clientX)}
          onTouchEnd={e=>{if(touch===null)return;const d=touch-e.changedTouches[0].clientX;if(Math.abs(d)>50)go(d>0?1:-1);setTouch(null);}}>
          <img src={slides[index]} alt="slide" className="w-full h-full object-cover opacity-60"/>
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/30 to-stone-950"/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"/>
        </motion.div>
      </AnimatePresence>
      {slides.length>1&&(<>
        <button onClick={()=>go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"><ChevronLeft size={20}/></button>
        <button onClick={()=>go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"><ChevronRight size={20}/></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_,i)=>(<button key={i} onClick={()=>{setDir(i>index?1:-1);setIndex(i);}} className={"h-1.5 rounded-full transition-all duration-300 "+(i===index?"w-6 bg-white":"w-1.5 bg-white/40")}/>))}
        </div>
      </>)}
    </div>
  );
};
