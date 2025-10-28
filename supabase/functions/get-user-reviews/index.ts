import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const userEmail = (userData.user.email || '').toLowerCase()

    const body = await req.json().catch(() => ({} as any))
    const {
      basket_name,
      basket_category,
      min_rating,
      from_date,
      to_date,
      limit,
      offset,
    } = body || {}

    const baseUrl = 'https://qktosxxluytztxhhupya.supabase.co/functions/v1/get-completed-reviews'
    const url = new URL(baseUrl)

    if (basket_name) url.searchParams.set('basket_name', String(basket_name))
    if (basket_category) url.searchParams.set('basket_category', String(basket_category))
    if (min_rating) url.searchParams.set('min_rating', String(min_rating))
    if (from_date) url.searchParams.set('from_date', String(from_date))
    if (to_date) url.searchParams.set('to_date', String(to_date))
    if (limit) url.searchParams.set('limit', String(limit))
    if (offset) url.searchParams.set('offset', String(offset))

    const shopApiKey = Deno.env.get('SHOP_API_KEY')
    if (!shopApiKey) {
      return new Response(JSON.stringify({ error: 'SHOP_API_KEY not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('[get-user-reviews] URL:', url.toString(), 'email:', userEmail)

    const remoteRes = await fetch(url.toString(), {
      headers: { 'x-api-key': shopApiKey },
    })

    if (!remoteRes.ok) {
      const text = await remoteRes.text()
      console.error('[get-user-reviews] Remote error:', remoteRes.status, text)
      return new Response(JSON.stringify({ error: 'Failed to fetch remote reviews', details: text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      })
    }

    const remoteJson = await remoteRes.json()
    const all = Array.isArray(remoteJson?.data) ? remoteJson.data : []

    const emailMatch = (val: any) => (String(val || '').toLowerCase() === userEmail)

    const filtered = all.filter((r: any) =>
      emailMatch(r?.user_email) || emailMatch(r?.email) || emailMatch(r?.user?.email)
    )

    console.log(`[get-user-reviews] ${userEmail} -> ${filtered.length} reviews`)

    return new Response(
      JSON.stringify({ data: filtered, count: filtered.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (e: any) {
    console.error('[get-user-reviews] Unexpected error:', e?.message)
    return new Response(
      JSON.stringify({ error: e?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})