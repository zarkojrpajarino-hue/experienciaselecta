import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema for incoming token
const tokenSchema = z.object({
  token: z.string().uuid('Invalid token format - must be a valid UUID')
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate incoming request body
    const requestData = await req.json();
    const validationResult = tokenSchema.safeParse(requestData);

    if (!validationResult.success) {
      console.log('Invalid token format:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid token format',
          details: validationResult.error.errors[0]?.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { token } = validationResult.data;
    console.log('Validating login token:', token);

    // Crear cliente Supabase con service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar el token en la base de datos
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('login_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (tokenError) {
      console.error('Error fetching token:', tokenError);
      throw tokenError;
    }

    if (!tokenData) {
      console.log('Token not found');
      return new Response(
        JSON.stringify({ valid: false, error: 'Token not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Verificar si el token ya fue usado
    if (tokenData.used) {
      console.log('Token already used');
      return new Response(
        JSON.stringify({ valid: false, error: 'Token already used' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Verificar si el token ha expirado
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('Token expired');
      return new Response(
        JSON.stringify({ valid: false, error: 'Token expired' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Generar un token de sesión para el usuario usando Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: tokenData.user_email,
    });

    if (authError || !authData) {
      console.error('Error generating auth link:', authError);
      throw authError;
    }

    console.log('Auth link generated successfully');

    // Marcar el token como usado
    const { error: updateError } = await supabaseAdmin
      .from('login_tokens')
      .update({
        used: true
      })
      .eq('token', token);

    if (updateError) {
      console.error('Error marking token as used:', updateError);
      // No lanzamos error aquí para no bloquear el login
    }

    // Retornar información del usuario y la URL de autenticación
    console.log('Login successful for user:', tokenData.user_email);

    return new Response(
      JSON.stringify({
        valid: true,
        user_id: tokenData.user_id,
        user_email: tokenData.user_email,
        hashed_token: authData.properties.hashed_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in validate-login-token:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
