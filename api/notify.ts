import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { order } = req.body;
  if (!order) return res.status(400).json({ error: 'Missing order' });

  const c = order.customer || {};
  const name = order.customer_name || [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Bilinmiyor';
  const phone = order.customer_phone || c.phone || 'Bilinmiyor';
  const address = order.customer_address || c.address || 'Bilinmiyor';
  const rawPay = order.payment_method || c.paymentMethod || '';
  const payment = rawPay === 'cash' ? 'Nakit' : rawPay === 'card' ? 'Kart' : rawPay || 'Bilinmiyor';
  const note = c.orderNote || order.orderNote || '';
  const noteText = note ? ('\n' + String.fromCodePoint(0x1F4DD) + ' Not: ' + note) : '';
  const items = (order.items || []).map(i => '  ' + String.fromCodePoint(0x2022) + ' ' + i.quantity + 'x ' + i.name + ' = ' + Math.round(i.quantity * i.price) + ' TL').join('\n');
  const total = order.total || order.finalTotal || 0;
  const msg = String.fromCodePoint(0x1F354) + ' *YENİ SİPARİŞ!*\n\n' +
    String.fromCodePoint(0x1F464) + ' *Müşteri:* ' + name + '\n' +
    String.fromCodePoint(0x1F4DE) + ' *Telefon:* ' + phone + '\n' +
    String.fromCodePoint(0x1F4CD) + ' *Adres:* ' + address + '\n' +
    String.fromCodePoint(0x1F4B3) + ' *Ödeme:* ' + payment + noteText + '\n\n' +
    String.fromCodePoint(0x1F6D2) + ' *Sipariş:*\n' + items + '\n\n' +
    String.fromCodePoint(0x1F4B0) + ' *Toplam: ' + total + ' TL*\n' +
    String.fromCodePoint(0x1F550) + ' ' + new Date().toLocaleString('tr-TR');

  if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
    await fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'Markdown' })
    });
  }
  res.json({ ok: true });
}
