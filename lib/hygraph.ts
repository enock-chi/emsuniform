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
