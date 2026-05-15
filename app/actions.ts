'use server'

import { hygraphQuery } from '@/lib/hygraph'

interface UniformInput {
  name: string
  size: string
  quantity: string
}

export interface SubmitOrderInput {
  firstname: string
  lastname: string
  recipientname: string
  recipientlastaname: string
  recipientpercalid: string
  ismale: boolean
  stationId: string
  uniforms: UniformInput[]
}

export async function submitOrder(input: SubmitOrderInput): Promise<void> {
  // Create the Order with all Uniforms nested, and return their IDs
  const { createOrder } = await hygraphQuery<{ createOrder: { id: string; uniforms: { id: string }[] } }>(
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

  const uniformIds = createOrder.uniforms.map(u => u.id)

  // Connect the new Order to its Station
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

  // Publish the Order
  await hygraphQuery(
    `
    mutation PublishOrder($orderId: ID!) {
      publishOrder(where: { id: $orderId }, to: PUBLISHED) { id }
    }
    `,
    { orderId: createOrder.id },
    { cache: 'no-store' },
  )

  // Publish each Uniform belonging to this order
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
