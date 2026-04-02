
import { SYSTEM_INSTRUCTION } from '../constants';

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  onAddToCart?: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean,
  onPlaceOrder?: (customerInfo: any) => Promise<{ success: boolean; orderId?: string; error?: string }>
): Promise<string> => {
  try {
    const apiKey = 'AIzaSyAZ3UeBA0eNSBVjaPfE8FznoA0tczJX-Q0';
    if (!apiKey) {
      return "Sistem yapılandırması tamamlanmadı (API Anahtarı eksik). Lütfen yönetici ile iletişime geçin.";
    }

    const validHistory = history.filter(msg => msg.text && msg.text.trim() !== '');
    const contents = [
      ...validHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    const tools = [{
      function_declarations: [
        {
          name: 'addToCart',
          description: 'Müşterinin sepetine ürün ekle.',
          parameters: {
            type: 'OBJECT',
            properties: {
              itemName: { type: 'STRING', description: 'Menüdeki ürünün adı.' },
              quantity: { type: 'NUMBER', description: 'Ürün adedi (varsayılan 1).' },
              variant: { type: 'STRING', description: 'Ürün varyantı.' },
              customizations: { type: 'STRING', description: 'Özel notlar.' }
            },
            required: ['itemName']
          }
        },
        {
          name: 'placeOrder',
          description: 'Sepetteki ürünler için siparişi tamamla.',
          parameters: {
            type: 'OBJECT',
            properties: {
              firstName: { type: 'STRING' },
              lastName: { type: 'STRING' },
              phone: { type: 'STRING' },
              address: { type: 'STRING' },
              paymentMethod: { type: 'STRING', enum: ['cash', 'card'] },
              orderNote: { type: 'STRING' }
            },
            required: ['firstName', 'lastName', 'phone', 'address', 'paymentMethod']
          }
        }
      ]
    }];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          tools,
          generationConfig: { temperature: 0.7 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return "Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.";
    }

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Function call kontrolü
    const functionCallPart = parts.find((p: any) => p.functionCall);
    if (functionCallPart) {
      const call = functionCallPart.functionCall;
      const args = call.args || {};
      let responseMsg = '';

      if (call.name === 'addToCart' && onAddToCart) {
        const qty = args.quantity || 1;
        const customizations = args.customizations || '';
        const variantLabel = args.variant || '';
        const success = onAddToCart(args.itemName, qty, customizations, variantLabel);
        responseMsg = success
          ? `${qty} adet ${args.itemName} sepete eklendi!`
          : `${args.itemName} menüde bulunamadı.`;
      } else if (call.name === 'placeOrder' && onPlaceOrder) {
        const result = await onPlaceOrder(args);
        responseMsg = result.success
          ? `Siparişiniz alındı! Sipariş No: ${result.orderId}`
          : `Sipariş hatası: ${result.error}`;
      }

      // Sonucu tekrar Gemini'ye gönder
      const finalResponse = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [
              ...contents,
              { role: 'model', parts },
              { role: 'user', parts: [{ functionResponse: { name: call.name, response: { result: responseMsg } } }] }
            ],
            tools,
            generationConfig: { temperature: 0.7 }
          })
        }
      );

      const finalData = await finalResponse.json();
      return finalData.candidates?.[0]?.content?.parts?.[0]?.text || responseMsg;
    }

    const text = parts.find((p: any) => p.text)?.text;
    return text || "Üzgünüm, şu an yanıt veremiyorum.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.";
  }
};