
import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Feedback } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedback: Feedback = {
      id: Date.now().toString(),
      name,
      email,
      rating,
      comment,
      timestamp: Date.now()
    };

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setName('');
          setEmail('');
          setComment('');
          setRating(5);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
          
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-stone-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            {isSuccess ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl text-white font-serif mb-2">Teşekkür Ederiz!</h3>
                  <p className="text-stone-400 font-light">Geri bildiriminiz bizim için çok değerli. Lezzet yolculuğumuzu sizinle geliştirmeye devam ediyoruz.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl text-white font-serif tracking-tight">Geri Bildirim Gönder</h3>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Deneyiminizi Paylaşın</p>
                  </div>
                  <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Deneyiminizi Puanlayın</label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="transition-all duration-300 transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={`${
                              (hoverRating || rating) >= star 
                                ? 'fill-red-600 text-red-600' 
                                : 'text-stone-700'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">İsim</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all placeholder:text-stone-700 text-sm"
                        placeholder="Adınız"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">E-posta (İsteğe Bağlı)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all placeholder:text-stone-700 text-sm"
                        placeholder="E-posta"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold ml-1">Yorumunuz</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-stone-950 border border-white/5 rounded-xl p-4 text-white focus:border-red-900 outline-none transition-all placeholder:text-stone-700 text-sm resize-none"
                      placeholder="Görüş ve önerilerinizi buraya yazabilirsiniz..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-900 text-white py-5 rounded-2xl uppercase tracking-[0.3em] text-xs font-bold hover:bg-red-800 transition-all shadow-xl shadow-red-950/50 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : (
                      <>
                        <Send size={16} />
                        Geri Bildirimi Gönder
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
