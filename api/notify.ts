import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { order } = req.body;
  if (!order) return res.status(400).json({ error: 'Missing order' });

  const items = (order.items || []).map(i => `  • ${i.quantity}x ${i.name} = ${i.quantity * i.price} TL`).join('\n');
  const total = order.finalTotal || order.total || 0;
  const note = order.orderNote ? `\n📝 Not: ${order.orderNote}` : '';

  const message = `🍔 *YENİ SİPARİŞ!*

👤 *Müşteri:* ${order.customer_name}
📞 *Telefon:* ${order.customer_phone}
📍 *Adres:* ${order.customer_address}
💳 *Ödeme:* ${order.payment_method}${note}

🛒 *Sipariş:*
${items}

💰 *Toplam: ${total} TL*
🕐 ${new Date().toLocaleString('tr-TR')}`;

  if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
    });
  }

  res.json({ ok: true });
}
