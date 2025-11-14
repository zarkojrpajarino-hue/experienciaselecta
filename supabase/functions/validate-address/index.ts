import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { address } = await req.json()

    if (!address) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Dirección requerida' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Google Maps Geocoding API
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured')
      // Fallback: validación básica pasó, aceptamos la dirección
      return new Response(
        JSON.stringify({ 
          valid: true, 
          confidence: 'low',
          message: 'Validación básica (API no configurada)' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      
      // Determinar nivel de confianza basado en el tipo de resultado
      const types = result.types || []
      let confidence: 'high' | 'medium' | 'low' = 'medium'
      
      if (types.includes('street_address')) {
        confidence = 'high'
      } else if (types.includes('route') || types.includes('premise')) {
        confidence = 'medium'
      } else {
        confidence = 'low'
      }

      return new Response(
        JSON.stringify({
          valid: true,
          confidence,
          normalized: {
            formatted_address: result.formatted_address,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            place_id: result.place_id
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'No se pudo verificar la dirección. Por favor, revisa que sea correcta.',
          confidence: 'low'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Error al validar dirección' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
