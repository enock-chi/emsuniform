import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import type { SubmitOrderInput } from '@/app/actions'
import { processOrder } from '@/lib/process-order'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const QUEUE_KEY = 'order_queue'
// Vercel Hobby: 4.5 MB payload limit — guard at ~4 MB to be safe
const MAX_BODY_BYTES = 4 * 1024 * 1024

export async function POST(request: NextRequest) {
  // Guard oversized payloads
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: SubmitOrderInput
  try {
    body = (await request.json()) as SubmitOrderInput
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Basic structural validation
  if (
    typeof body.firstname !== 'string' || !body.firstname.trim() ||
    typeof body.lastname !== 'string' || !body.lastname.trim() ||
    typeof body.ismale !== 'boolean' ||
    typeof body.stationId !== 'string' || !body.stationId.trim() ||
    !Array.isArray(body.uniforms) || body.uniforms.length === 0
  ) {
    return Response.json({ error: 'Missing or invalid fields' }, { status: 422 })
  }

  // Circuit breaker: try Hygraph directly first (fast path, low traffic).
  // If Hygraph rejects the request (rate limit or any other error), fall back
  // to the Redis queue so no submission is ever lost.
  try {
    await processOrder(body)
    return Response.json({ method: 'direct' }, { status: 200 })
  } catch {
    // Hygraph unavailable or rate-limited — buffer in Redis.
    // Push the object directly; the Upstash SDK serializes it to JSON.
    await redis.lpush(QUEUE_KEY, body)
    return Response.json({ method: 'queued' }, { status: 202 })
  }
}
