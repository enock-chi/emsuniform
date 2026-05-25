import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    // Fetch all orders from Redis
    const data = await redis.lrange('order_queue', 0, -1);
    console.log('[orders-redis-server] Fetched', data.length, 'items from Redis');
    
    if (!data || data.length === 0) {
      return NextResponse.json({ orders: [] });
    }
    
    // Parse orders from Redis strings
    const orders = data
      .map((item) => {
        try {
          return typeof item === 'string' ? JSON.parse(item) : item;
        } catch (e) {
          console.warn('[orders-redis-server] Failed to parse item:', e);
          return null;
        }
      })
      .filter(Boolean);
    
    console.log('[orders-redis-server] Parsed', orders.length, 'orders');
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[orders-redis-server] Redis fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Redis', details: String(err) }, { status: 500 });
  }
}
