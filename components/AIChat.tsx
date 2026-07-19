import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, ChevronDown } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Message { role: 'user' | 'assistant'; content: string; }

const SYS = "Sen Gosht Burger'in yapay zeka asistanisin. Batman sehrinin en iyi premium burger ve steak restorani. Turkce yanitle, kisaca ve yardimci ol. Menu: Gosht Burger, Smash Burger, BBQ Burger, Crispy Chicken, Vejetaryen Burger, Steak, Parmak Patates, Milkshake. Calisma saatleri 11:00-23:00.";

export const AIChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', content: 'Merhaba! Gosht Burger yapay zeka asistani. Size nasil yardimci olabilirim?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const t = input.trim();
    if (!t || loading) return;
    setInput('');
    const next: Message[] = [...msgs, { role: 'user', content: t }];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, system: SYS, messages: next.map(m => ({ role: m.role, content: m.content })) })
      });
      const d = await res.json();
      const reply = d.content?.[0]?.text || 'Su an yanit veremiyorum.';
      setMsgs(p => [...p, { role: 'assistant', content: reply }]);
      addDoc(collection(db, 'ai_chats'), { messages: [...next, { role: 'assistant', content: reply }], createdAt: new Date().toISOString() }).catch(() => {});
    } catch { setMsgs(p => [...p, { role: 'assistant', content: 'Baglanti hatasi.' }]); }
    finally { setLoading(false); }
  };

  return (
    <>
      <motion.button onClick={() => setOpen(o => !o)}
        className="fixed bottom-8 right-6 z-50 w-14 h-14 bg-red-900 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-red-700"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <AnimatePresence mode="wait">
          {open ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.div>
               : <motion.div key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} /></motion.div>}
        </AnimatePresence>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 z-50 w-80 max-w-[calc(100vw-24px)] bg-stone-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
            <div className="flex items-center gap-3 px-4 py-3 bg-red-900/20 border-b border-white/10 shrink-0">
              <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">🍔</div>
              <div><p className="text-white text-sm font-bold">Gosht AI</p><p className="text-stone-500 text-[10px]">Aninda yanitliyorum</p></div>
              <button onClick={() => setOpen(false)} className="ml-auto text-stone-500 hover:text-white"><ChevronDown size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={"max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed " + (m.role === 'user' ? 'bg-red-900 text-white rounded-br-none' : 'bg-stone-800 text-stone-200 rounded-bl-none')}>{m.content}</div>
                </motion.div>
              ))}
              {loading && <div className="flex justify-start"><div className="bg-stone-800 px-4 py-3 rounded-xl rounded-bl-none flex gap-1">{[0,1,2].map(i => <motion.div key={i} className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0,-4,0] }} transition={{ duration: 0.6, delay: i*0.15, repeat: Infinity }} />)}</div></div>}
              <div ref={ref} />
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Bir sey sorun..."
                className="flex-1 bg-stone-800 border border-white/5 rounded-xl px-3 py-2 text-white text-sm placeholder:text-stone-600 outline-none focus:border-red-900/50" />
              <button onClick={send} disabled={!input.trim() || loading} className="w-9 h-9 bg-red-900 rounded-xl flex items-center justify-center text-white disabled:opacity-40 shrink-0"><Send size={15} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
