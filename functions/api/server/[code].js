export async function onRequestGet(context) {
  const code = context.params.code?.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (!code) {
    return Response.json({ error: 'A server code is required.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${code}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Nodewatch/1.0'
      }
    })

    if (!upstream.ok) {
      return Response.json({ error: 'FiveM server not found.' }, { status: upstream.status })
    }

    const data = await upstream.json()
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=60'
      }
    })
  } catch {
    return Response.json({ error: 'FiveM service unavailable.' }, { status: 502 })
  }
}
