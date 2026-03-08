
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, ShoppingBag, Trash2, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AiAssistantProps {
  onAddToCart?: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean;
  onPlaceOrder?: (customerInfo: any) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

const QUICK_ACTIONS = [
  { label: '🍔 Menüyü Göster', value: 'Menüyü gösterir misin?' },
  { label: '🔥 Popüler Burgerler', value: 'En popüler burgerler hangileri?' },
  { label: '🥗 Vejetaryen Seçenekler', value: 'Vejetaryen seçenekleriniz neler?' },
  { label: '🥤 İçecekler', value: 'Hangi içecekler var?' },
];

export const AiAssistant: React.FC<AiAssistantProps> = ({ onAddToCart, onPlaceOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Merhaba! Ben **Gosht Gurme Asistan**. Size özel burger önerileri sunabilir veya doğrudan siparişinizi alabilirim. \n\nBugün ne yemek istersiniz?' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, messageText, onAddToCart, onPlaceOrder);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      if (!isMuted) speak(responseText.replace(/[#*`]/g, ''));
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const clearChat = () => {
    if (window.confirm('Sohbet geçmişini temizlemek istediğinize emin misiniz?')) {
      setMessages([{ role: 'model', text: 'Merhaba! Sohbet temizlendi. Size nasıl yardımcı olabilirim?' }]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-red-800 text-white p-4 rounded-full shadow-[0_0_30px_rgba(185,28,28,0.5)] hover:bg-red-700 transition-all flex items-center gap-2 group overflow-hidden"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Sparkles size={24} />
            </motion.div>
            <span className="max-w-0 group-hover:max-w-xs transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap font-medium tracking-wide">
              Gurme Asistan
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[95vw] md:w-[420px] h-[600px] bg-stone-900/95 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-red-900/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950/50 to-stone-900/50 p-4 flex justify-between items-center border-b border-red-900/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-red-800 p-2 rounded-xl shadow-lg shadow-red-900/40">
                    <Sparkles className="text-white" size={18} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-stone-900 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-serif font-semibold tracking-wide text-lg">Gosht AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Çevrimiçi</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-all"
                  title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button 
                  onClick={clearChat} 
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-stone-800 rounded-lg transition-all"
                  title="Sohbeti Temizle"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-950/50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-stone-800' : 'bg-red-900/40 border border-red-900/30'
                    }`}>
                      {msg.role === 'user' ? <MessageSquare size={14} className="text-stone-400" /> : <Sparkles size={14} className="text-red-500" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-red-800 text-white rounded-tr-none' 
                        : 'bg-stone-900/80 text-stone-200 rounded-tl-none border border-stone-800'
                    }`}>
                      <div className="markdown-body prose prose-invert prose-sm max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-red-900/40 border border-red-900/30 flex items-center justify-center">
                      <Loader2 className="animate-spin text-red-600" size={14} />
                    </div>
                    <div className="bg-stone-900/80 p-4 rounded-2xl rounded-tl-none border border-stone-800">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {!isLoading && messages.length < 5 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-stone-950/50">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.value)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs hover:bg-stone-800 hover:border-red-900/50 transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-stone-900 border-t border-stone-800">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bir şeyler yazın veya sorun..."
                  className="w-full bg-stone-950 border border-stone-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800/20 placeholder:text-stone-600 transition-all"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bg-red-800 hover:bg-red-700 text-white p-2 rounded-lg transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-stone-600 mt-2 text-center uppercase tracking-widest">
                Gosht AI Gurme Deneyimi Sunar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #292524; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        .markdown-body p { margin-bottom: 0.5rem; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body strong { color: #ef4444; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.5rem; }
      `}} />
    </>
  );
};
