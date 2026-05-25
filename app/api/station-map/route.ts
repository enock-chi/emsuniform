import { buildStationMap } from '@/lib/hygraph'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Starting to build station map...')
    const stationMap = await buildStationMap()
    console.log('Built station map successfully')
    console.log('Built station map:', stationMap)
    console.log('Station map entries:', Object.entries(stationMap).map(([id, entry]) => ({ id, stationName: entry.stationName, districtName: entry.districtName, childStations: Object.keys(entry.stations || {}).length })))
    return Response.json({ stationMap }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Failed to build station map:', errorMessage)
    console.error('Full error:', error)
    return Response.json(
      { error: 'Failed to fetch station map', details: errorMessage },
      { status: 500 }
    )
  }
}
