import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return NextResponse.json({ error: 'Missing Upstash Redis credentials' }, { status: 500 });
  }
  try {
    const apiRes = await fetch(`${url}/lrange/order_queue/0/199`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(':' + token).toString('base64'),
      },
      cache: 'no-store',
    });
    const data = await apiRes.json();
    console.log('[API] Upstash Redis raw response:', data);
    if (!data.result) return NextResponse.json({ orders: [] });
    const orders = data.result.map((item: string) => {
      try { return JSON.parse(item); } catch { return null; }
    }).filter(Boolean);
    console.log('[API] Parsed orders:', orders);
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[API] Redis fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Redis', details: String(err) }, { status: 500 });
  }
}
