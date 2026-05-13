import { hygraphQuery } from '@/lib/hygraph'
import OrderForm, { type District } from '@/app/components/order-form'

async function getDistricts(): Promise<District[]> {
  const { districts } = await hygraphQuery<{ districts: District[] }>(`
    query {
      districts(first: 100) {
        id
        name
        stattions(first: 100) {
          id
          name
        }
      }
    }
  `)
  return districts
}

export default async function Home() {
  const districts = await getDistricts()
  return <OrderForm districts={districts} />
}
