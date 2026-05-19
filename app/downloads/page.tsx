import { hygraphQuery } from "@/lib/hygraph";
import DownloadsClient from "./DownloadsClient";
import type { District } from '../components/order-form';

export default async function DownloadsPage() {
  const { districts } = await hygraphQuery<{ districts: District[] }>(`
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
            rank
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
  `);
  return <DownloadsClient districts={districts} />;
}
