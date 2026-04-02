import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SYSTEM_INSTRUCTION } from '../constants';

interface AiAssistantProps {
  onAddToCart?: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean;
  onPlaceOrder?: (customerInfo: any) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

export const AiAssistant: React.FC<AiAssistantProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Merhaba! Ben Gosht Gurme Asistan. Size özel burger önerileri sunabilirim. Bugün ne yemek istersiniz?' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = 'AIzaSyBvEJshIeUnZgUZRMAcT0dykRcd0hpmziM';
      const contents = [
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: messageText }] }
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents,
            generationConfig: { temperature: 0.7 }
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Üzgünüm, yanıt veremiyorum.';
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-red-800 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all flex items-center gap-2 group overflow-hidden"
          >
            <Sparkles size={24} />
            <span className="max-w-0 group-hover:max-w-xs transition-all duration-500 overflow-hidden whitespace-nowrap font-medium">
              Gurme Asistan
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 w-[95vw] md:w-[400px] h-[550px] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 flex justify-between items-center border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="bg-red-800 p-2 rounded-xl">
                  <Sparkles className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Gosht AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-stone-400 text-xs">Çevrimiçi</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMessages([{ role: 'model', text: 'Merhaba! Size nasıl yardımcı olabilirim?' }])}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-800 p-3 rounded-2xl">
                    <Loader2 className="animate-spin text-red-500" size={18} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-stone-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Bir şeyler yazın..."
                  className="flex-1 bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-800"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-red-800 text-white p-3 rounded-xl hover:bg-red-700 disabled:opacity-30 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};