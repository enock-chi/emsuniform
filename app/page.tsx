import { hygraphQuery } from '@/lib/hygraph'
import OrderForm, { type District } from '@/app/components/order-form'

// Toggle this to true to enable maintenance mode
const MAINTENANCE_MODE = false;

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
  if (MAINTENANCE_MODE) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <main
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: '#fff',
            color: '#007A3D',
            borderRadius: '16px',
            margin: '40px auto',
            maxWidth: '480px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '2.5px solid #007A3D',
            padding: '48px 32px',
          }}
        >
          <h1 style={{ color: '#fff', background: '#007A3D', padding: '10px 28px', borderRadius: 10, marginBottom: 18, fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>Maintenance Break</h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: '#007A3D', marginBottom: 0 }}>
            The site is currently undergoing scheduled maintenance.<br />
            Please check back in 30 minutes to 1 hour.
          </p>
        </main>
      </div>
    );
  }
  const districts = await getDistricts()
  return <OrderForm districts={districts} />
}
