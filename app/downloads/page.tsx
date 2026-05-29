import { buildStationMap } from "@/lib/hygraph";
import { redis } from "@/lib/redis";
import DownloadsClient from "./DownloadsClient";

export const dynamic = 'force-dynamic';

export default async function DownloadsPage() {
  let orders = [];
  
  try {
    const redisOrders = await redis.lrange('order_queue', 0, -1);
    orders = redisOrders
      .map((item) => {
        try {
          return typeof item === 'string' ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (err) {
    console.error('[Downloads] Redis fetch error:', err);
  }

  // Fetch station mappings from Hygraph
  const stationMap = await buildStationMap();

  return <DownloadsClient orders={orders} stationMap={stationMap} />;
}
