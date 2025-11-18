import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema for input
const discountValidationSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(50, 'Code too long'),
  user_email: z.string().trim().email('Invalid email format').max(255, 'Email too long'),
  basket_name: z.string().trim().min(1, 'Basket name required').max(200, 'Basket name too long'),
  purchase_amount: z.number().positive('Amount must be positive').finite().max(100000, 'Amount exceeds maximum')
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎫 validate-discount-code: Starting validation');
    
    const requestBody = await req.json();

    // Validate input with Zod
    const validationResult = discountValidationSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('❌ Input validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Formato de datos inválido',
          details: validationResult.error.errors.map(e => e.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code, user_email, basket_name, purchase_amount } = validationResult.data;

    console.log('📋 Validation params:', { 
      code, 
      user_email, 
      basket_name, 
      purchase_amount 
    });

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
