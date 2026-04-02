
import { GoogleGenAI, FunctionDeclaration, Type, Tool, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const addToCartTool: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Müşterinin sepetine ürün ekle.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: {
        type: Type.STRING,
        description: 'Menüdeki ürünün adı.',
      },
      quantity: {
        type: Type.NUMBER,
        description: 'Ürün adedi (varsayılan 1).',
      },
      variant: {
        type: Type.STRING,
        description: 'Ürün varyantı (örn: "L (150 GR)", "XL (200 GR)").',
      },
      customizations: {
        type: Type.STRING,
        description: 'Ekstra malzemeler, çıkarılacak malzemeler veya özel notlar (örn: "Soğansız", "Ekstra Peynir", "Acı soslu").',
      }
    },
    required: ['itemName'],
  },
};

const placeOrderTool: FunctionDeclaration = {
  name: 'placeOrder',
  description: 'Sepetteki ürünler için siparişi tamamla ve onaya gönder.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      firstName: { type: Type.STRING, description: 'Müşterinin adı.' },
      lastName: { type: Type.STRING, description: 'Müşterinin soyadı.' },
      phone: { type: Type.STRING, description: 'Müşterinin telefon numarası.' },
      address: { type: Type.STRING, description: 'Teslimat adresi.' },
      paymentMethod: { 
        type: Type.STRING, 
        description: 'Ödeme yöntemi ("cash" veya "card").',
        enum: ['cash', 'card']
      },
      orderNote: { type: Type.STRING, description: 'Sipariş notu (isteğe bağlı).' }
    },
    required: ['firstName', 'lastName', 'phone', 'address', 'paymentMethod'],
  },
};

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  onAddToCart?: (itemName: string, quantity: number, customizations?: string, variantId?: string) => boolean,
  onPlaceOrder?: (customerInfo: any) => Promise<{ success: boolean; orderId?: string; error?: string }>
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error("Gemini API Key is missing");
      return "Sistem yapılandırması tamamlanmadı (API Anahtarı eksik). Lütfen yönetici ile iletişime geçin.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-1.5-flash-latest';

    // Construct content history
    // Gemini requires alternating user/model roles and must start with 'user'
    let contents: Content[] = [];
    
    // Filter and format history
    const validHistory = history.filter(msg => msg.text && msg.text.trim() !== '');
    
    for (const msg of validHistory) {
      const role = msg.role === 'user' ? 'user' : 'model';
      // Ensure we don't have consecutive same roles
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        // Append text to previous message if same role
        contents[contents.length - 1].parts[0].text += `\n${msg.text}`;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      }
    }

    // Must start with user
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    
    // Add current message
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${newMessage}`;
    } else {
      contents.push({ role: 'user', parts: [{ text: newMessage }] });
    }

    const tools: Tool[] = [{ functionDeclarations: [addToCartTool, placeOrderTool] }];

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        tools: tools,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    // Check for function calls using the getter
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];
      
      for (const call of functionCalls) {
        if (!call) continue;
        const args = call.args as any;
        
        let responseMsg = "";

        if (call.name === 'addToCart' && onAddToCart) {
          const qty = args.quantity || 1;
          const customizations = args.customizations || '';
          const variantLabel = args.variant || '';
          const success = onAddToCart(args.itemName, qty, customizations, variantLabel);
          
          if (success) {
            let details = [];
            if (variantLabel) details.push(variantLabel);
            if (customizations) details.push(customizations);
            const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
            responseMsg = `${qty} adet ${args.itemName}${detailsStr} sepete eklendi. Siparişiniz şu an 'Beklemede' durumundadır.`;
          } else {
            responseMsg = `${args.itemName} menüde bulunamadı veya eklenemedi.`;
          }
        } else if (call.name === 'placeOrder' && onPlaceOrder) {
          const result = await onPlaceOrder(args);
          if (result.success) {
            responseMsg = `Siparişiniz başarıyla alındı! Sipariş Numaranız: ${result.orderId}. Durum: Onay Bekliyor (Hazırlanıyor). En kısa sürede kapınızda olacağız.`;
          } else {
            responseMsg = `Sipariş oluşturulurken bir hata oluştu: ${result.error || 'Bilinmeyen hata'}. Lütfen sepetinizi kontrol edin.`;
          }
        }
        
        functionResponses.push({
          functionResponse: {
            name: call.name,
            id: call.id,
            response: { 
              result: responseMsg
            }
          }
        });
      }

      // Continue conversation with function result
      const nextContents = [
        ...contents,
        response.candidates?.[0]?.content,
        { role: 'user', parts: functionResponses }
      ].filter(Boolean) as Content[];

      const finalResponse = await ai.models.generateContent({
        model: modelId,
        contents: nextContents,
        config: {
          tools: tools,
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      return finalResponse.text || "İşlem tamamlandı.";
    }

    return response.text || "Üzgünüm, şu an yanıt veremiyorum.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.";
  }
};
