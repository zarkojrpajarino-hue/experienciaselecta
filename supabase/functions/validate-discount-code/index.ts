import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎫 validate-discount-code: Starting validation');
    
    const { code, user_email, basket_name, purchase_amount } = await req.json();

    console.log('📋 Validation params:', { 
      code, 
      user_email, 
      basket_name, 
      purchase_amount 
    });

    // Validate required fields
    if (!code || !user_email || !basket_name || purchase_amount === undefined) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Faltan parámetros requeridos' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function
    console.log('🔍 Calling validate_discount_code function');
    const { data, error } = await supabase.rpc('validate_discount_code', {
      p_code: code.toUpperCase(),
      p_user_email: user_email,
      p_basket_name: basket_name,
      p_purchase_amount: purchase_amount
    });

    if (error) {
      console.error('❌ Database function error:', error);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Error al validar el código' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('✅ Validation result:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Error inesperado al validar el código' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
