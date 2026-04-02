import { SYSTEM_INSTRUCTION } from '../constants';

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  onAddToCart?: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean,
  onPlaceOrder?: (customerInfo: any) => Promise<{ success: boolean; orderId?: string; error?: string }>
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      return "Sistem yapılandırması tamamlanmadı (API Anahtarı eksik). Lütfen yönetici ile iletişime geçin.";
    }

    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return "Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.";
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Üzgünüm, şu an yanıt veremiyorum.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.";
  }
};