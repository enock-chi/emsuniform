const ENDPOINT = process.env.HYGRAPH_ENDPOINT!
const TOKEN = process.env.HYGRAPH_TOKEN!

if (!ENDPOINT || !TOKEN) {
  throw new Error('Missing HYGRAPH_ENDPOINT or HYGRAPH_TOKEN environment variables.')
}

/**
 * Execute a GraphQL query against the Hygraph Content API.
 *
 * @example
 * const { posts } = await hygraphQuery<{ posts: Post[] }>(`
 *   query {
 *     posts { id title }
 *   }
 * `)
 */
export async function hygraphQuery<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
    // By default cache responses on the server; callers can override.
    next: { revalidate: 60 },
    ...options,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Hygraph request failed: ${res.status} ${res.statusText} — ${body}`)
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(json.errors.map(e => e.message).join('\n'))
  }

  return json.data as T
}

// ─── Station mapping query ────────────────────────────────────────────────────

export interface StationMapEntry {
  stationName: string
  districtName: string
  stations?: Record<string, { stationName: string; districtName: string }>
}

/**
 * Fetch all districts and stations from Hygraph and build a mapping.
 * Returns a Record<stationId, StationMapEntry> suitable for lookups.
 * Also includes district entries with nested stations.
 */
export async function buildStationMap(): Promise<Record<string, StationMapEntry>> {
  // Query districts and try to access their stations relationship
  const query = `
    query {
      districts(first: 100) {
        id
        name
        stattions(first: 1000) {
          id
          name
        }
      }
    }
  `

  interface HygraphStation {
    id: string
    name: string
  }

  interface HygraphDistrict {
    id: string
    name: string
    stattions: HygraphStation[]
  }

  try {
    const result = await hygraphQuery<{
      districts: HygraphDistrict[]
    }>(query, undefined, { next: { revalidate: 3600 } }) // Cache for 1 hour

    const districts = result.districts || []

    const map: Record<string, StationMapEntry> = {}

    // Build map with proper district relationships
    for (const district of districts) {
      const stationsObj: Record<string, { stationName: string; districtName: string }> = {}

      // Add each station under this district
      const districtStations = district.stattions || []
      for (const station of districtStations) {
        map[station.id] = {
          stationName: station.name,
          districtName: district.name,
        }

        stationsObj[station.id] = {
          stationName: station.name,
          districtName: district.name,
        }
      }

      // Add district parent entry with nested stations
      map[district.id] = {
        stationName: district.name,
        districtName: district.name,
        stations: stationsObj,
      }
    }

    console.log('Built station map with', Object.keys(map).length, 'entries')
    return map
  } catch (error) {
    console.error('Error building station map from Hygraph:', error)
    throw error
  }
}
