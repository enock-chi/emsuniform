import { hygraphQuery } from '@/lib/hygraph'
import type { SubmitOrderInput } from '@/app/actions'

export async function processOrder(input: SubmitOrderInput): Promise<void> {
  // Step 1: Create each Uniform record individually
  const uniformIds: string[] = []
  for (const u of input.uniforms) {
    const { createUniform } = await hygraphQuery<{ createUniform: { id: string } }>(
      `
      mutation CreateUniform($name: String!, $size: String!, $quantity: String!) {
        createUniform(data: { name: $name, size: $size, quantity: $quantity }) {
          id
        }
      }
      `,
      { name: u.name, size: u.size, quantity: u.quantity },
      { cache: 'no-store' },
    )
    uniformIds.push(createUniform.id)
  }

  // Step 2: Create the Order and connect to the uniforms by ID
  const { createOrder } = await hygraphQuery<{ createOrder: { id: string } }>(
    `
    mutation CreateOrder(
      $firstname: String!
      $lastname: String!
      $reciepontname: String!
      $reciepontlastaname: String!
      $percal: String!
      $rank: String!
      $ismale: Boolean!
      $uniformIds: [UniformWhereUniqueInput!]
    ) {
      createOrder(data: {
        firstname: $firstname
        lastname: $lastname
        recipientname: $reciepontname
        recipientlastaname: $reciepontlastaname
        percal: $percal
        rank: $rank
        ismale: $ismale
        uniforms: { connect: $uniformIds }
      }) {
        id
      }
    }
    `,
    {
      firstname: input.firstname,
      lastname: input.lastname,
      reciepontname: input.recipientname,
      reciepontlastaname: input.recipientlastaname,
      percal: input.recipientpercalid,
      rank: input.rank,
      ismale: input.ismale,
      uniformIds: uniformIds.map(id => ({ id })),
    },
    { cache: 'no-store' },
  )

  // Step 3: Connect the Order to its Station
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

  // Step 4: Publish the Order
  await hygraphQuery(
    `
    mutation PublishOrder($orderId: ID!) {
      publishOrder(where: { id: $orderId }, to: PUBLISHED) { id }
    }
    `,
    { orderId: createOrder.id },
    { cache: 'no-store' },
  )

  // Step 5: Publish all Uniforms
  if (uniformIds.length > 0) {
    await hygraphQuery(
      `
      mutation PublishUniforms($ids: [ID!]!) {
        publishManyUniformsConnection(where: { id_in: $ids }, to: PUBLISHED) {
          aggregate { count }
        }
      }
      `,
      { ids: uniformIds },
      { cache: 'no-store' },
    )
  }
}
