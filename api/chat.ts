import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYS = "Sen Gosht Burger'in yapay zeka asistanisin. Batman sehrinin en iyi premium burger ve steak restorani. Turkce yanitla, kisaca yardimci ol. Menu: Gosht Burger, Smash Burger, BBQ Burger, Crispy Chicken, Vejetaryen Burger, Steak, Parmak Patates, Milkshake. Calisma saatleri 11:00-23:00.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'Missing messages' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 400, system: SYS, messages })
    });
    const d = await r.json();
    res.json({ reply: d.content?.[0]?.text || 'Su an yanit veremiyorum.' });
  } catch { res.status(500).json({ error: 'API error' }); }
}
