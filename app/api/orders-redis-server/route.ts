import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
    // TODO: If you need to transform or validate order objects before sending to the client, do it here.
  try {
    // TODO: Fetch all orders from Redis (0 to -1 means all elements)
    const data = await redis.lrange('order_queue', 0, -1);
    console.log('[orders-redis-server] RAW Redis data (first 3):', data.slice(0, 3));
    if (!data) return NextResponse.json({ orders: [] });
    // TODO: Orders are returned as-is from Redis. If you change the data structure in Redis, update this logic.
    const orders = data.filter(Boolean);
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[orders-redis-server] Redis fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Redis', details: String(err) }, { status: 500 });
  }
}
