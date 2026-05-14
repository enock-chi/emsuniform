import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import { processOrder } from '@/lib/process-order'
import type { SubmitOrderInput } from '@/app/actions'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const QUEUE_KEY = 'order_queue'
// Process this many orders per cron tick.
// Each order runs ~4 Hygraph mutations sequentially, keeping us well under the
// 5 req/s free-tier limit even when mutations resolve quickly.
const BATCH_SIZE = 5

export async function GET(request: NextRequest) {
  // Protect against unauthorised triggers.
  // Vercel automatically forwards Authorization: Bearer <CRON_SECRET>
  // when CRON_SECRET is set in the project environment variables.
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pop up to BATCH_SIZE items. The Upstash SDK auto-deserializes JSON values,
  // so items come back as SubmitOrderInput objects — no JSON.parse needed.
  const raw = await redis.lpop<SubmitOrderInput>(QUEUE_KEY, BATCH_SIZE)

  const items: SubmitOrderInput[] = raw == null ? [] : Array.isArray(raw) ? raw : [raw]

  if (items.length === 0) {
    return Response.json({ processed: 0, message: 'Queue empty' })
  }

  const results: { index: number; success: boolean; error?: string }[] = []

  for (let i = 0; i < items.length; i++) {
    const order = items[i]

    try {
      await processOrder(order)
      results.push({ index: i, success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({ index: i, success: false, error: message })
      // Re-queue the failed item at the tail so it is retried next tick
      await redis.rpush(QUEUE_KEY, items[i])
    }
  }

  const processed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return Response.json({ processed, failed, results })
}
