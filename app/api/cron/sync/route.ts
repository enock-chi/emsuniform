import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import { hygraphQuery } from '@/lib/hygraph'
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

async function processOrder(input: SubmitOrderInput): Promise<void> {
  // 1. Create Order with nested Uniforms
  const { createOrder } = await hygraphQuery<{
    createOrder: { id: string; uniforms: { id: string }[] }
  }>(
    `
    mutation CreateOrder(
      $firstname: String!
      $lastname: String!
      $ismale: Boolean!
      $uniforms: UniformCreateManyInlineInput
    ) {
      createOrder(data: {
        firstname: $firstname
        lastname: $lastname
        ismale: $ismale
        uniforms: $uniforms
      }) {
        id
        uniforms {
          ... on Uniform { id }
        }
      }
    }
    `,
    {
      firstname: input.firstname,
      lastname: input.lastname,
      ismale: input.ismale,
      uniforms: { create: input.uniforms },
    },
    { cache: 'no-store' },
  )

  const uniformIds = createOrder.uniforms.map((u) => u.id)

  // 2. Connect Order to its Station
  await hygraphQuery(
    `
    mutation ConnectOrderToStation($stationId: ID!, $orderId: ID!) {
      updateStattion(
        where: { id: $stationId }
        data: { orders: { connect: { where: { id: $orderId } } } }
      ) {
        id
      }
    }
    `,
    { stationId: input.stationId, orderId: createOrder.id },
    { cache: 'no-store' },
  )

  // 3. Publish Order
  await hygraphQuery(
    `
    mutation PublishOrder($orderId: ID!) {
      publishOrder(where: { id: $orderId }, to: PUBLISHED) { id }
    }
    `,
    { orderId: createOrder.id },
    { cache: 'no-store' },
  )

  // 4. Publish all Uniforms in one bulk mutation
  if (uniformIds.length > 0) {
    await hygraphQuery(
      `
      mutation PublishUniforms($ids: [ID!]!) {
        publishManyUniformsConnection(
          where: { id_in: $ids }
          to: PUBLISHED
        ) {
          aggregate { count }
        }
      }
      `,
      { ids: uniformIds },
      { cache: 'no-store' },
    )
  }
}

export async function GET(request: NextRequest) {
  // Protect against unauthorised triggers.
  // Vercel automatically forwards Authorization: Bearer <CRON_SECRET>
  // when CRON_SECRET is set in the project environment variables.
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pop up to BATCH_SIZE items from the right end of the list (FIFO)
  const raw = await redis.lpop<string>(QUEUE_KEY, BATCH_SIZE)

  // Upstash returns null when the list is empty, or a string when count=1 is implied.
  const items: string[] = raw == null ? [] : Array.isArray(raw) ? raw : [raw]

  if (items.length === 0) {
    return Response.json({ processed: 0, message: 'Queue empty' })
  }

  const results: { index: number; success: boolean; error?: string }[] = []

  for (let i = 0; i < items.length; i++) {
    let order: SubmitOrderInput
    try {
      order = JSON.parse(items[i]) as SubmitOrderInput
    } catch {
      results.push({ index: i, success: false, error: 'JSON parse error' })
      continue
    }

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
