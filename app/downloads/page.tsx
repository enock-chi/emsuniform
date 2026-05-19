import { hygraphQuery } from "@/lib/hygraph";
import DownloadsClient from "./DownloadsClient";

export default async function DownloadsPage() {
  const { districts } = await hygraphQuery(`
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
  `);
  return <DownloadsClient districts={districts} />;
}
