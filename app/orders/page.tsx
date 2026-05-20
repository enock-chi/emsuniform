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
  // Fetch orders from the new server API route (use relative URL for internal API)
  const res = await fetch('http://localhost:3000/api/orders-redis-server', { cache: 'no-store' });
  const data = await res.json();
  console.log('[OrdersPage] API response:', data);
  const { orders } = data;
  return <OrdersView orders={orders || []} />
}
