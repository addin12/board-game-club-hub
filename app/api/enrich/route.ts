export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36'

interface GeekImages {
  thumb?: string
  previewthumb?: string
  square200?: string
  original?: string
}

// Given a list of BGG object ids, return { id: { thumbnail, image } } using the
// public geekdo JSON API (same source the scraper uses). Best-effort: ids that
// fail are simply omitted, so the client falls back to a placeholder.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawIds: unknown[] = Array.isArray(body?.ids) ? (body.ids as unknown[]) : []
    const ids: string[] = [...new Set(rawIds.filter((x): x is string => typeof x === 'string'))].slice(0, 300)

    const out: Record<string, { thumbnail: string; image: string }> = {}

    async function fetchOne(id: string) {
      try {
        const res = await fetch(`https://api.geekdo.com/api/geekitems?objectid=${id}&objecttype=thing`, {
          headers: { 'User-Agent': UA, Accept: 'application/json' },
        })
        if (!res.ok) return
        const img: GeekImages = (await res.json())?.item?.images ?? {}
        const thumbnail = img.previewthumb || img.square200 || img.thumb
        if (thumbnail) out[id] = { thumbnail, image: img.original || thumbnail }
      } catch {
        /* ignore individual failures */
      }
    }

    // Fetch in small parallel batches to stay polite to the API.
    for (let i = 0; i < ids.length; i += 12) {
      await Promise.all(ids.slice(i, i + 12).map(fetchOne))
    }

    return Response.json(out)
  } catch (error) {
    console.error('[POST /api/enrich]', error)
    return Response.json({}, { status: 200 })
  }
}
