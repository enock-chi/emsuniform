import { hygraphQuery } from '@/lib/hygraph'
import OrdersView, { type OrdersData } from '@/app/components/orders-view'

export const dynamic = 'force-dynamic'

async function getOrdersData(): Promise<OrdersData> {
  const { districts } = await hygraphQuery<{ districts: OrdersData['districts'] }>(`
    query {
      districts(first: 100) {
        id
        name
        stattions(first: 100) {
          id
          name
          orders(first: 1000) {
            id
            firstname
            lastname
            recipientname
            recipientlastaname
            percal
            ismale
            createdAt
            uniforms {
              id
              name
              size
              quantity
            }
          }
        }
      }
    }
  `)
  return { districts }
}

export default async function OrdersPage() {
  const data = await getOrdersData()
  return <OrdersView data={data} />
}
